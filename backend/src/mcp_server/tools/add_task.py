"""
Add Task MCP Tool

Creates a new task owned by the authenticated user.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from src.models import Task
from src.mcp_server.schemas.responses import TaskData, AddTaskResponse, ErrorResponse
from src.mcp_server.server import mcp_server

logger = logging.getLogger(__name__)


def add_task(
    title: str, 
    description: str | None = None, 
    due_date: str | None = None, 
    priority: str | None = "medium", 
    user_id: int = None, 
    db: Session = None
) -> dict:
    """
    Create a new task owned by the authenticated user.
    """
    try:
        # Date parsing
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except ValueError:
                logger.warning(f"Failed to parse due_date: {due_date}")
        
        # Validate title (required)
        if not title or len(title.strip()) == 0:
            return AddTaskResponse(
                success=False,
                error=ErrorResponse(
                    code="INVALID_INPUT",
                    message="Title is required and cannot be empty",
                    details={"field": "title", "reason": "required"}
                )
            ).model_dump(mode='json')
        
        # ... (ownership check as before)
        if user_id is None:
            return AddTaskResponse(success=False, error=ErrorResponse(code="UNAUTHORIZED", message="User authentication required")).model_dump(mode='json')

        # Create task
        task = Task(
            title=title.strip(),
            description=description,
            due_date=parsed_due_date,
            priority=priority or "medium",
            user_id=user_id,
            completed=False
        )
        
        db.add(task)
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
        
        return AddTaskResponse(success=True, data=task_data).model_dump(mode='json')
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating task: {str(e)}", exc_info=True)
        return AddTaskResponse(
            success=False,
            error=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to create task due to a database error"
            )
        ).model_dump()


# Register tool with MCP server
mcp_server.register_tool("add_task", add_task)
