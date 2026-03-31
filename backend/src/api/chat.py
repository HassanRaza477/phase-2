from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime
import logging

from ..db.database import get_db
from ..models import Conversation, Message, User
from ..services.auth_service import AuthService
from ..agent.agent import process_agent_message
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter(tags=["Chat"])

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Verify JWT token and return the current user."""
    token = credentials.credentials
    user = AuthService.get_current_user(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "code": "INVALID_TOKEN",
                "message": "Invalid or expired authentication token. Please log in again."
            }
        )
    return user

# ─── POST /chat ───────────────────────────────────────────────────────────────
@router.post("/chat")
async def chat(
    message: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the AI agent."""
    message_content = message.get("message", "").strip()
    conversation_id = message.get("conversation_id")

    if not message_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Message cannot be empty"}
        )

    user_id = current_user.id

    # ── Get or Create Conversation ──
    if conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        if not conversation:
            conversation_id = None
    
    if not conversation_id:
        conversation = Conversation(user_id=user_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.id

    # ── Store User Message ──
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=message_content
    )
    db.add(user_msg)
    db.commit()

    # ── Build Message History ──
    messages = db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(50)
    ).scalars().all()

    message_history = [{"role": msg.role, "content": msg.content or ""} for msg in messages]

    # ── Call AI Agent ──
    try:
        agent_response = await process_agent_message(
            message_history=message_history,
            user_id=user_id,
            db=db
        )
    except Exception as e:
        logger.error(f"Agent failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": f"AI agent error: {str(e)}"}
        )

    # ── Store Assistant Response ──
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=agent_response["response"],
        tool_calls=agent_response.get("tool_calls")
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return {
        "success": True,
        "conversation_id": str(conversation_id),
        "message_id": str(assistant_msg.id),
        "response": agent_response["response"],
        "tool_calls": agent_response.get("tool_calls", []),
        "created_at": assistant_msg.created_at.isoformat()
    }

# ─── GET /conversations ──────────────────────────────────────────────────────
@router.get("/conversations")
async def list_conversations(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    
    total = db.query(func.count(Conversation.id)).filter(
        Conversation.user_id == user_id,
        Conversation.is_deleted == False
    ).scalar()

    conversations = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.is_deleted == False
    ).order_by(Conversation.updated_at.desc()).offset(offset).limit(limit).all()

    conv_list = []
    for conv in conversations:
        last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
        conv_list.append({
            "id": str(conv.id),
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
            "last_message": last_msg.content[:100] if last_msg else ""
        })

    return {
        "success": True,
        "data": {
            "conversations": conv_list,
            "total": total
        }
    }

# ─── GET /conversations/{conversation_id} ───────────────────────────────────
@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation or conversation.is_deleted:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Conversation not found"})

    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    
    return {
        "success": True,
        "data": {
            "conversation": {
                "id": str(conversation.id),
                "created_at": conversation.created_at.isoformat()
            },
            "messages": [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "tool_calls": msg.tool_calls,
                    "created_at": msg.created_at.isoformat()
                } for msg in messages
            ]
        }
    }
