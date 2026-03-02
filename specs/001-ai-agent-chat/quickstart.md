# Quickstart: AI Agent Chat Endpoint

**Feature**: 001-ai-agent-chat
**Date**: 2026-02-23
**Audience**: Developers implementing the chat endpoint

---

## Overview

This guide walks you through setting up and testing the AI Agent Chat Endpoint. By the end, you'll have a working chat endpoint that processes natural language messages and invokes MCP tools.

---

## Prerequisites

- Python 3.11 installed
- FastAPI backend running (from existing multi-user todo app)
- Neon Serverless PostgreSQL database configured
- Better Auth configured with JWT secret
- OpenAI API key

---

## Step 1: Install Dependencies

Add required packages to `backend/requirements.txt`:

```txt
openai>=1.0.0
pyjwt>=2.8.0
```

Install:

```bash
cd backend
pip install -r requirements.txt
```

---

## Step 2: Configure Environment Variables

Add to `backend/.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# JWT Secret (must match Better Auth secret)
JWT_SECRET_KEY=your-shared-secret-key-here
JWT_ALGORITHM=HS256

# Database (existing)
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

---

## Step 3: Create Database Tables

Run the migration SQL (from `data-model.md`):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Conversation table
CREATE TABLE IF NOT EXISTS conversation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create Message table
CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversation(user_id);
CREATE INDEX idx_conversations_expires_at ON conversation(expires_at) WHERE is_deleted = FALSE;
CREATE INDEX idx_conversations_user_updated ON conversation(user_id, updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON message(conversation_id);
CREATE INDEX idx_messages_conversation_created ON message(conversation_id, created_at ASC);
```

---

## Step 4: Implement Chat Endpoint

Create `backend/src/api/chat.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from datetime import datetime
from uuid import UUID
import jwt
import os
from typing import Optional, List, Dict, Any

from backend.src.db.database import get_session
from backend.src.models.conversation import Conversation
from backend.src.models.message import Message
from backend.src.agent.agent import process_agent_message
from backend.src.mcp_server.tools import create_task, update_task, delete_task, list_tasks, get_task

router = APIRouter(prefix="/api", tags=["chat"])

def verify_jwt(authorization: Optional[str] = Header(None)) -> UUID:
    """Verify JWT token and extract user_id"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "")
    secret = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        user_id = UUID(payload["sub"])
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except (KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token format")

@router.post("/{user_id}/chat")
async def chat(
    user_id: UUID,
    message: str,
    conversation_id: Optional[UUID] = None,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """
    Send a message to the AI agent and receive a response.
    
    - **user_id**: User identifier (must match JWT token)
    - **message**: Natural language message
    - **conversation_id**: Optional existing conversation ID
    """
    # Verify JWT and validate user
    authenticated_user_id = verify_jwt(authorization)
    if authenticated_user_id != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    
    # Validate message
    if not message or not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Get or create conversation
    if conversation_id:
        conversation = session.get(Conversation, conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        conversation_id = conversation.id
    
    # Store user message
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=message
    )
    session.add(user_message)
    session.commit()
    
    # Get conversation history
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(50)
    ).all()
    
    # Format messages for agent
    message_history = [
        {"role": msg.role, "content": msg.content, "tool_calls": msg.tool_calls}
        for msg in messages
    ]
    
    # Process with agent
    try:
        agent_response = await process_agent_message(
            message_history=message_history,
            user_id=user_id,
            session=session
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
    
    # Store agent response
    assistant_message = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=agent_response["response"],
        tool_calls=agent_response.get("tool_calls")
    )
    session.add(assistant_message)
    session.commit()
    
    return {
        "conversation_id": str(conversation_id),
        "message_id": str(assistant_message.id),
        "response": agent_response["response"],
        "tool_calls": agent_response.get("tool_calls", []),
        "created_at": assistant_message.created_at.isoformat()
    }

@router.get("/{user_id}/conversations")
async def list_conversations(
    user_id: UUID,
    limit: int = 20,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """List all conversations for the authenticated user"""
    authenticated_user_id = verify_jwt(authorization)
    if authenticated_user_id != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    
    conversations = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id, Conversation.is_deleted == False)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    total = session.exec(
        select(Conversation.id)
        .where(Conversation.user_id == user_id, Conversation.is_deleted == False)
    ).count()
    
    return {
        "conversations": [
            {
                "id": str(c.id),
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
                "message_count": len(c.messages),
                "last_message_preview": c.messages[-1].content[:100] if c.messages else ""
            }
            for c in conversations
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.delete("/{user_id}/conversations/{conversation_id}")
async def delete_conversation(
    user_id: UUID,
    conversation_id: UUID,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Delete a conversation (soft delete)"""
    authenticated_user_id = verify_jwt(authorization)
    if authenticated_user_id != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.is_deleted = True
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    session.commit()
    
    return {"success": True, "message": "Conversation deleted successfully"}
```

---

## Step 5: Implement Agent Logic

Create `backend/src/agent/agent.py`:

```python
from openai import OpenAI
import os
from typing import List, Dict, Any
from sqlmodel import Session

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Define MCP tools for OpenAI
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new todo task",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description"},
                    "due_date": {"type": "string", "format": "date", "description": "Due date (YYYY-MM-DD)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]}
                },
                "required": ["title"]
            }
        }
    },
    # Add other tools (update_task, delete_task, list_tasks, get_task)
]

SYSTEM_PROMPT = """
You are a helpful todo assistant that helps users manage their tasks through natural language.

Available Tools:
- create_task(title, description, due_date, priority)
- update_task(task_id, title, description, due_date, priority)
- delete_task(task_id)
- list_tasks(filter)
- get_task(task_id)

Rules:
- Always confirm task creation with title and due date
- Ask clarifying questions if user intent is ambiguous
- Never access tasks belonging to other users
- Use tools for all task operations, do not make assumptions

Response Format:
- Provide natural language responses
- Include tool call results in responses when relevant
"""

async def process_agent_message(
    message_history: List[Dict[str, Any]],
    user_id: str,
    session: Session
) -> Dict[str, Any]:
    """
    Process message with OpenAI agent and execute tool calls.
    
    Returns:
        dict: {
            "response": str,
            "tool_calls": list
        }
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + message_history
    
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
        messages=messages,
        tools=TOOLS,
        tool_choice="auto"
    )
    
    assistant_message = response.choices[0].message
    tool_calls = []
    
    # Process tool calls
    if assistant_message.tool_calls:
        for tool_call in assistant_message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            
            # Execute tool
            try:
                if function_name == "create_task":
                    result = await create_task(
                        user_id=user_id,
                        session=session,
                        **function_args
                    )
                    tool_calls.append({
                        "tool_id": tool_call.id,
                        "tool_name": function_name,
                        "arguments": function_args,
                        "result": result,
                        "success": True
                    })
                # Handle other tools...
            except Exception as e:
                tool_calls.append({
                    "tool_id": tool_call.id,
                    "tool_name": function_name,
                    "arguments": function_args,
                    "error": str(e),
                    "success": False
                })
    
    return {
        "response": assistant_message.content,
        "tool_calls": tool_calls
    }
```

---

## Step 6: Register Router

Update `backend/src/main.py`:

```python
from fastapi import FastAPI
from backend.src.api.chat import router as chat_router

app = FastAPI()

app.include_router(chat_router)
```

---

## Step 7: Test the Endpoint

### Get JWT Token

First, log in via Better Auth to get a JWT token.

### Test Chat Endpoint

```bash
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'
```

Expected response:

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "response": "I've created a task 'Buy groceries' due tomorrow.",
  "tool_calls": [
    {
      "tool_id": "call_123",
      "tool_name": "create_task",
      "arguments": {
        "title": "Buy groceries",
        "due_date": "2026-02-24"
      },
      "result": {
        "task_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "title": "Buy groceries",
        "created": true
      },
      "success": true
    }
  ],
  "created_at": "2026-02-23T14:30:00Z"
}
```

### Test Conversation Continuity

```bash
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Change the due date to Friday",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

## Step 8: Verify Database

Check conversations and messages:

```sql
SELECT * FROM conversation WHERE user_id = '{user_id}';
SELECT * FROM message WHERE conversation_id = '{conversation_id}';
```

---

## Troubleshooting

### 401 Unauthorized
- Verify JWT token is valid and not expired
- Check JWT_SECRET_KEY matches Better Auth secret

### 403 Forbidden
- Ensure authenticated user_id matches request path user_id

### 500 Agent Error
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI service status

### Tool Calls Not Executing
- Verify MCP tools are imported and accessible
- Check tool function signatures match OpenAI schema

---

## Next Steps

- Implement additional MCP tools
- Add conversation summarization for long histories
- Add streaming responses for better UX
- Implement rate limiting
- Add monitoring and logging
