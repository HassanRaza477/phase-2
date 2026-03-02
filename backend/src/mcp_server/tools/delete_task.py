"""
Delete Task MCP Tool

Permanently deletes a task.
Validates user ownership before allowing deletion.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.models import Task
from src.mcp_server.schemas.responses import DeleteTaskResponse, ErrorResponse
from src.mcp_server.server import mcp_server

logger = logging.getLogger(__name__)


def delete_task(task_id: int, user_id: int = None, db: Session = None) -> dict:
    """
    Permanently delete a task.
    
    Args:
        task_id: ID of the task to delete
        user_id: Authenticated user ID (from JWT)
        db: Database session
        
    Returns:
        dict: Structured response with deletion confirmation or error
    """
    try:
        # Validate user_id (must be provided from JWT)
        if user_id is None:
            logger.error("user_id is None - JWT verification failed")
            return DeleteTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="UNAUTHORIZED",
                    message="User authentication required"
                )
            ).model_dump()
        
        # Validate task_id
        if task_id is None:
            return DeleteTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="INVALID_INPUT",
                    message="task_id is required",
                    details={"field": "task_id", "reason": "required"}
                )
            ).model_dump()
        
        # Find task with ownership check (CRITICAL for security)
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            logger.warning(f"Task not found or user lacks ownership: task_id={task_id}, user_id={user_id}")
            return DeleteTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="TASK_NOT_FOUND",
                    message=f"Task with ID {task_id} was not found",
                    details={"task_id": task_id}
                )
            ).model_dump()
        
        # Store task info before deletion
        task_id_deleted = task.id
        task_title = task.title
        
        # Delete task
        db.delete(task)
        db.commit()
        
        logger.info(f"Task deleted: task_id={task_id_deleted}, user_id={user_id}, title='{task_title[:50]}'")
        
        # Build response data
        response_data = {
            "deleted_task_id": task_id_deleted,
            "title": task_title,
            "deleted_at": datetime.utcnow().isoformat()
        }
        
        return DeleteTaskResponse(success=True, data=response_data).model_dump()
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting task: {str(e)}", exc_info=True)
        return DeleteTaskResponse(
            success=False,
            error=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to delete task due to a database error"
            )
        ).model_dump()


# Register tool with MCP server
mcp_server.register_tool("delete_task", delete_task)
