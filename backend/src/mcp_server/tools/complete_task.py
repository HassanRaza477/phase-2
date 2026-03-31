"""
Complete Task MCP Tool

Toggles a task's completion status (complete ↔ incomplete).
Validates user ownership before allowing changes.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from ...models import Task
from ..schemas.responses import TaskData, CompleteTaskResponse, ErrorResponse
from ..server import mcp_server

logger = logging.getLogger(__name__)


def complete_task(task_id: int, user_id: int = None, db: Session = None) -> dict:
    """
    Toggle a task's completion status.
    
    Args:
        task_id: ID of the task to toggle
        user_id: Authenticated user ID (from JWT)
        db: Database session
        
    Returns:
        dict: Structured response with updated task data or error
    """
    try:
        # Validate user_id (must be provided from JWT)
        if user_id is None:
            logger.error("user_id is None - JWT verification failed")
            return CompleteTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="UNAUTHORIZED",
                    message="User authentication required"
                )
            ).model_dump(mode='json')
        
        # Validate task_id
        if task_id is None:
            return CompleteTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="INVALID_INPUT",
                    message="task_id is required",
                    details={"field": "task_id", "reason": "required"}
                )
            ).model_dump(mode='json')
        
        # Find task with ownership check (CRITICAL for security)
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            logger.warning(f"Task not found or user lacks ownership: task_id={task_id}, user_id={user_id}")
            return CompleteTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="TASK_NOT_FOUND",
                    message=f"Task with ID {task_id} was not found",
                    details={"task_id": task_id}
                )
            ).model_dump(mode='json')
        
        # Toggle completion status (idempotent operation)
        old_status = task.completed
        task.completed = not task.completed
        
        # Set or clear completed_at timestamp
        if task.completed:
            task.completed_at = datetime.utcnow()
            logger.info(f"Task completed: task_id={task.id}, user_id={user_id}")
        else:
            task.completed_at = None
            logger.info(f"Task reopened: task_id={task.id}, user_id={user_id}")
        
        # Update timestamp
        task.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(task)
        
        # Build response data
        task_data = TaskData(
            task_id=task.id,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            priority=task.priority,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at,
            user_id=task.user_id
        )
        
        logger.info(
            f"Task completion toggled: task_id={task.id}, "
            f"old_status={old_status}, new_status={task.completed}"
        )
        
        return CompleteTaskResponse(success=True, data=task_data).model_dump()
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error toggling task completion: {str(e)}", exc_info=True)
        return CompleteTaskResponse(
            success=False,
            error=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to update task completion due to a database error"
            )
        ).model_dump(mode='json')


# Register tool with MCP server
mcp_server.register_tool("complete_task", complete_task)
