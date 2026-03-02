"""
MCP Tool Schemas Package

Contains Pydantic schemas for tool input validation and response formatting.
"""

from .requests import (
    AddTaskInput,
    UpdateTaskInput,
    CompleteTaskInput,
    DeleteTaskInput,
    ListTasksInput,
)
from .responses import (
    ErrorResponse,
    TaskData,
    AddTaskResponse,
    ListTasksResponse,
    UpdateTaskResponse,
    CompleteTaskResponse,
    DeleteTaskResponse,
)

__all__ = [
    # Input schemas
    "AddTaskInput",
    "UpdateTaskInput",
    "CompleteTaskInput",
    "DeleteTaskInput",
    "ListTasksInput",
    # Output schemas
    "ErrorResponse",
    "TaskData",
    "AddTaskResponse",
    "ListTasksResponse",
    "UpdateTaskResponse",
    "CompleteTaskResponse",
    "DeleteTaskResponse",
]
