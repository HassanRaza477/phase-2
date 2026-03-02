"""
Update Task MCP Tool

Updates an existing task's title and/or description.
Validates user ownership before allowing updates.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.models import Task
from src.mcp_server.schemas.responses import TaskData, UpdateTaskResponse, ErrorResponse
from src.mcp_server.server import mcp_server

logger = logging.getLogger(__name__)


def update_task(
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    due_date: str | None = None,
    priority: str | None = None,
    user_id: int = None,
    db: Session = None
) -> dict:
    """
    Update an existing task's properties.
    """
    try:
        # Date parsing
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except ValueError:
                logger.warning(f"Failed to parse due_date: {due_date}")

        # Validate user_id
        if user_id is None:
            return UpdateTaskResponse(success=False, error=ErrorResponse(code="UNAUTHORIZED", message="User authentication required")).model_dump(mode='json')
        
        # Find task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = db.execute(query)
        task = result.scalar_one_or_none()
        
        if not task:
            return UpdateTaskResponse(success=False, error=ErrorResponse(code="TASK_NOT_FOUND", message=f"Task with ID {task_id} not found")).model_dump(mode='json')
        
        if title is not None:
            task.title = title.strip()
        if description is not None:
            task.description = description
        if due_date is not None:
            task.due_date = parsed_due_date
        if priority is not None:
            task.priority = priority
            
        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)
        
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
        return UpdateTaskResponse(success=True, data=task_data).model_dump(mode='json')
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {str(e)}", exc_info=True)
        return UpdateTaskResponse(
            success=False,
            error=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to update task due to a database error"
            )
        ).model_dump(mode='json')


# Register tool with MCP server
mcp_server.register_tool("update_task", update_task)
