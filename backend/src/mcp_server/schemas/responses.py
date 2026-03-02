"""
MCP Tool Output Schemas

Pydantic schemas for structuring MCP tool responses.
All responses follow a consistent format with success, data, and error fields.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Generic, TypeVar, Optional


class ErrorResponse(BaseModel):
    """Standardized error response format."""
    
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    details: dict = Field(default_factory=dict, description="Additional error context")


class TaskData(BaseModel):
    """Standardized task representation in responses."""
    
    task_id: int
    title: str
    description: str | None
    due_date: datetime | None = None
    priority: str | None = "medium"
    completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True


# Generic response wrapper
T = TypeVar("T")


class AddTaskResponse(BaseModel):
    """Response schema for add_task tool."""
    
    success: bool = True
    data: Optional[TaskData] = None
    error: Optional[ErrorResponse] = None


class ListTasksResponse(BaseModel):
    """Response schema for list_tasks tool."""
    
    success: bool = True
    data: Optional[list[TaskData]] = None
    error: Optional[ErrorResponse] = None


class UpdateTaskResponse(BaseModel):
    """Response schema for update_task tool."""
    
    success: bool = True
    data: Optional[TaskData] = None
    error: Optional[ErrorResponse] = None


class CompleteTaskResponse(BaseModel):
    """Response schema for complete_task tool."""
    
    success: bool = True
    data: Optional[TaskData] = None
    error: Optional[ErrorResponse] = None


class DeleteTaskResponse(BaseModel):
    """Response schema for delete_task tool."""
    
    success: bool = True
    data: Optional[dict] = None
    error: Optional[ErrorResponse] = None
