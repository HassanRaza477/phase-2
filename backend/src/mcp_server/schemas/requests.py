"""
MCP Tool Input Schemas

Pydantic schemas for validating MCP tool input parameters.
Note: user_id is NOT included in any schema - it is extracted from JWT token.
"""

from pydantic import BaseModel, Field
from typing import Literal


class AddTaskInput(BaseModel):
    """Input schema for add_task tool."""
    
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Task title (1-255 characters)"
    )
    description: str | None = Field(
        default=None,
        description="Optional detailed task description"
    )


class UpdateTaskInput(BaseModel):
    """Input schema for update_task tool."""
    
    task_id: int = Field(
        ...,
        description="ID of the task to update"
    )
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="New title (optional)"
    )
    description: str | None = Field(
        default=None,
        description="New description (optional)"
    )


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task tool."""
    
    task_id: int = Field(
        ...,
        description="ID of the task to toggle completion"
    )


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task tool."""
    
    task_id: int = Field(
        ...,
        description="ID of the task to delete"
    )


class ListTasksInput(BaseModel):
    """Input schema for list_tasks tool."""
    
    status: Literal["active", "completed"] | None = Field(
        default=None,
        description="Filter by status: 'active', 'completed', or None for all"
    )
