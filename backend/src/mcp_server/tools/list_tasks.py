"""
List Tasks MCP Tool

Retrieves all tasks belonging to the authenticated user with optional status filtering.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.models import Task
from src.mcp_server.schemas.responses import TaskData, ListTasksResponse, ErrorResponse
from src.mcp_server.server import mcp_server

logger = logging.getLogger(__name__)


def list_tasks(
    task_id: int | None = None, 
    filter: dict | None = None, 
    status: str | None = None, 
    user_id: int = None, 
    db: Session = None
) -> dict:
    """
    List tasks or get a specific task owned by the authenticated user.
    """
    try:
        if user_id is None:
            return ListTasksResponse(success=False, error=ErrorResponse(code="UNAUTHORIZED", message="User authentication required")).model_dump(mode='json')
        
        # Build query
        query = select(Task).where(Task.user_id == user_id)
        
        # Determine status filter
        effective_status = status
        if filter and 'status' in filter:
            effective_status = filter['status']

        # Apply filters
        if task_id is not None:
            query = query.where(Task.id == task_id)
        else:
            if effective_status == "active" or effective_status == "pending":
                query = query.where(Task.completed == False)
            elif effective_status == "completed":
                query = query.where(Task.completed == True)
            
            if filter:
                if 'priority' in filter:
                    query = query.where(Task.priority == filter['priority'])
                # due_date filter could be added here if needed
        
        result = db.execute(query)
        tasks = result.scalars().all()
        
        if task_id is not None and not tasks:
            return ListTasksResponse(
                success=False,
                error=ErrorResponse(
                    code="TASK_NOT_FOUND",
                    message=f"Task with ID {task_id} not found"
                )
            ).model_dump(mode='json')
        
        # Convert to response format
        task_data_list = [
            TaskData(
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
            for task in tasks
        ]
        
        return ListTasksResponse(success=True, data=task_data_list).model_dump(mode='json')
    
    except Exception as e:
        logger.error(f"Error listing tasks: {str(e)}", exc_info=True)
        return ListTasksResponse(
            success=False,
            error=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to list tasks due to a database error"
            )
        ).model_dump(mode='json')


# Register tool with MCP server
mcp_server.register_tool("list_tasks", list_tasks)
