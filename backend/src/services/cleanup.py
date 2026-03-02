"""
Conversation Cleanup Service

Provides scheduled cleanup of expired conversations.
Runs daily to remove conversations past their retention period.
"""
import logging
from datetime import datetime
from sqlmodel import Session, select
from typing import Optional

from ..models.conversation import Conversation

logger = logging.getLogger(__name__)


def cleanup_expired_conversations(session: Session) -> int:
    """
    Delete conversations that have passed their expiration date.
    
    This function should be called daily via a scheduled job or cron task.
    Only deletes conversations where is_deleted=False (not manually deleted).
    
    Args:
        session: Database session
        
    Returns:
        int: Number of conversations deleted
    """
    try:
        # Find all expired conversations
        expired_conversations = session.exec(
            select(Conversation).where(
                Conversation.expires_at < datetime.utcnow(),
                Conversation.is_deleted == False
            )
        ).all()
        
        deleted_count = 0
        for conversation in expired_conversations:
            session.delete(conversation)
            deleted_count += 1
        
        session.commit()
        
        if deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count} expired conversations")
        
        return deleted_count
        
    except Exception as e:
        logger.error(f"Error during conversation cleanup: {str(e)}", exc_info=True)
        session.rollback()
        raise


def soft_delete_conversation(session: Session, conversation_id: str, user_id: str) -> bool:
    """
    Soft delete a conversation (mark as deleted without removing from database).
    
    Args:
        session: Database session
        conversation_id: Conversation UUID
        user_id: User UUID (for ownership validation)
        
    Returns:
        bool: True if successfully deleted, False if not found
    """
    from uuid import UUID
    
    try:
        conversation = session.get(Conversation, UUID(conversation_id))
        
        if not conversation or str(conversation.user_id) != user_id:
            return False
        
        conversation.is_deleted = True
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)
        session.commit()
        
        logger.info(f"Soft deleted conversation {conversation_id} for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error soft deleting conversation: {str(e)}", exc_info=True)
        session.rollback()
        raise


def hard_delete_old_conversations(session: Session, days_old: int = 30) -> int:
    """
    Permanently delete soft-deleted conversations older than specified days.
    
    This should be run less frequently (e.g., weekly or monthly) as a
    secondary cleanup after soft deletion.
    
    Args:
        session: Database session
        days_old: Number of days since soft deletion (default: 30)
        
    Returns:
        int: Number of conversations permanently deleted
    """
    from datetime import timedelta
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        old_deleted = session.exec(
            select(Conversation).where(
                Conversation.is_deleted == True,
                Conversation.updated_at < cutoff_date
            )
        ).all()
        
        deleted_count = 0
        for conversation in old_deleted:
            session.delete(conversation)
            deleted_count += 1
        
        session.commit()
        
        if deleted_count > 0:
            logger.info(f"Permanently deleted {deleted_count} old soft-deleted conversations")
        
        return deleted_count
        
    except Exception as e:
        logger.error(f"Error during hard deletion: {str(e)}", exc_info=True)
        session.rollback()
        raise
