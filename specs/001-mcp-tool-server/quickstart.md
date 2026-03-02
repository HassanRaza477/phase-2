# Quickstart: MCP Tool Server

**Feature**: MCP Tool Server  
**Branch**: `001-mcp-tool-server`  
**Date**: 2026-02-22  
**Purpose**: Get started with MCP tool development and testing

---

## Prerequisites

- Python 3.11 or higher
- Existing backend setup (FastAPI, SQLModel, Neon PostgreSQL)
- JWT authentication configured
- Node.js with OpenAI Agents SDK (for AI agent integration)

---

## Step 1: Install Dependencies

Add required dependencies to `backend/requirements.txt`:

```bash
# MCP SDK (Official)
mcp-sdk>=1.0.0

# Testing (if not already installed)
pytest>=7.4.3
pytest-asyncio>=0.21.1
httpx>=0.25.2
```

Install:

```bash
cd backend
pip install -r requirements.txt
```

---

## Step 2: Configure Environment Variables

Add to `backend/.env`:

```bash
# MCP Server Configuration
MCP_SERVER_NAME=todo-mcp-server
MCP_SERVER_VERSION=1.0.0

# Database (should already be configured)
DATABASE_URL=postgresql+psycopg://user:password@neon-host/dbname

# JWT Authentication (should already be configured)
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
```

---

## Step 3: Project Structure

Create the MCP server module structure:

```text
backend/src/
├── mcp_server/
│   ├── __init__.py
│   ├── server.py           # MCP server initialization
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt_verifier.py # JWT verification for MCP
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── add_task.py
│   │   ├── list_tasks.py
│   │   ├── update_task.py
│   │   ├── complete_task.py
│   │   └── delete_task.py
│   └── schemas/
│       ├── __init__.py
│       ├── requests.py     # Tool input schemas
│       └── responses.py    # Tool output schemas
```

---

## Step 4: Create Tool Schemas

**File**: `backend/src/mcp_server/schemas/requests.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class AddTaskInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=2000)
    due_date: datetime | None = Field(default=None)

class UpdateTaskInput(BaseModel):
    task_id: int = Field(...)
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=2000)
    due_date: datetime | None = Field(default=None)

class CompleteTaskInput(BaseModel):
    task_id: int = Field(...)

class DeleteTaskInput(BaseModel):
    task_id: int = Field(...)

class ListTasksInput(BaseModel):
    status: Literal["active", "completed"] | None = Field(default=None)
```

**File**: `backend/src/mcp_server/schemas/responses.py`

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: dict = Field(default_factory=dict)

class TaskData(BaseModel):
    task_id: int
    title: str
    description: str | None
    due_date: datetime | None
    completed: bool
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    user_id: int

class ToolResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: ErrorResponse | None = None
```

---

## Step 5: Implement JWT Verification

**File**: `backend/src/mcp_server/auth/jwt_verifier.py`

```python
from fastapi import Header, HTTPException, status
from src.core.security import verify_token

async def get_current_user(authorization: str = Header(...)) -> int:
    """
    Extract and verify JWT from Authorization header.
    Returns user_id from token payload.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Missing or invalid authorization header"}
        )
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "UNAUTHORIZED", "message": "Invalid token payload"}
            )
        
        return user_id
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": f"Token verification failed: {str(e)}"}
        )
```

---

## Step 6: Implement MCP Tools

**File**: `backend/src/mcp_server/tools/add_task.py`

```python
from mcp import server
from src.mcp_server.schemas.requests import AddTaskInput
from src.mcp_server.schemas.responses import ToolResponse, TaskData
from src.models.task import Task
from src.database_setup import get_async_session
import logging

logger = logging.getLogger(__name__)

@server.tool()
async def add_task(title: str, description: str | None = None, due_date: str | None = None, user_id: int) -> dict:
    """
    Create a new task owned by the authenticated user.
    
    Args:
        title: Task title (1-500 characters)
        description: Optional detailed description (max 2000 chars)
        due_date: Optional due date in ISO 8601 format
        user_id: Authenticated user ID (from JWT, not from client)
    
    Returns:
        ToolResponse with created task data or error
    """
    try:
        # Validate title
        if not title or len(title) < 1:
            return ToolResponse(
                success=False,
                error={"code": "INVALID_INPUT", "message": "Title is required", "details": {"field": "title"}}
            ).model_dump()
        
        async with get_async_session() as session:
            task = Task(
                title=title,
                description=description,
                due_date=due_date,
                user_id=user_id,
                completed=False
            )
            
            session.add(task)
            await session.commit()
            await session.refresh(task)
            
            task_data = TaskData(
                task_id=task.id,
                title=task.title,
                description=task.description,
                due_date=task.due_date,
                completed=task.completed,
                completed_at=task.completed_at,
                created_at=task.created_at,
                updated_at=task.updated_at,
                user_id=task.user_id
            )
            
            logger.info(f"Task created: task_id={task.id}, user_id={user_id}")
            
            return ToolResponse(success=True, data=task_data).model_dump()
    
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return ToolResponse(
            success=False,
            error={"code": "DATABASE_ERROR", "message": "Failed to create task"}
        ).model_dump()
```

**File**: `backend/src/mcp_server/tools/list_tasks.py`

```python
from mcp import server
from src.mcp_server.schemas.responses import ToolResponse, TaskData
from src.models.task import Task
from src.database_setup import get_async_session
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

@server.tool()
async def list_tasks(status: str | None = None, user_id: int) -> dict:
    """
    List all tasks owned by the authenticated user.
    
    Args:
        status: Optional filter - "active", "completed", or None for all
        user_id: Authenticated user ID (from JWT)
    
    Returns:
        ToolResponse with list of tasks or error
    """
    try:
        async with get_async_session() as session:
            query = select(Task).where(Task.user_id == user_id)
            
            if status == "active":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)
            
            result = await session.execute(query)
            tasks = result.scalars().all()
            
            task_data_list = [
                TaskData(
                    task_id=task.id,
                    title=task.title,
                    description=task.description,
                    due_date=task.due_date,
                    completed=task.completed,
                    completed_at=task.completed_at,
                    created_at=task.created_at,
                    updated_at=task.updated_at,
                    user_id=task.user_id
                )
                for task in tasks
            ]
            
            return ToolResponse(success=True, data=task_data_list).model_dump()
    
    except Exception as e:
        logger.error(f"Error listing tasks: {str(e)}")
        return ToolResponse(
            success=False,
            error={"code": "DATABASE_ERROR", "message": "Failed to list tasks"}
        ).model_dump()
```

**File**: `backend/src/mcp_server/tools/update_task.py`

```python
from mcp import server
from src.mcp_server.schemas.requests import UpdateTaskInput
from src.mcp_server.schemas.responses import ToolResponse, TaskData
from src.models.task import Task
from src.database_setup import get_async_session
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

@server.tool()
async def update_task(task_id: int, title: str | None = None, description: str | None = None, due_date: str | None = None, user_id: int) -> dict:
    """
    Update an existing task's properties.
    
    Args:
        task_id: ID of task to update
        title: Optional new title
        description: Optional new description
        due_date: Optional new due date
        user_id: Authenticated user ID (from JWT)
    
    Returns:
        ToolResponse with updated task data or error
    """
    try:
        async with get_async_session() as session:
            query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            result = await session.execute(query)
            task = result.scalar_one_or_none()
            
            if not task:
                return ToolResponse(
                    success=False,
                    error={"code": "TASK_NOT_FOUND", "message": f"Task with ID {task_id} was not found"}
                ).model_dump()
            
            # Update fields if provided
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if due_date is not None:
                task.due_date = due_date
            
            await session.commit()
            await session.refresh(task)
            
            task_data = TaskData(
                task_id=task.id,
                title=task.title,
                description=task.description,
                due_date=task.due_date,
                completed=task.completed,
                completed_at=task.completed_at,
                created_at=task.created_at,
                updated_at=task.updated_at,
                user_id=task.user_id
            )
            
            logger.info(f"Task updated: task_id={task.id}, user_id={user_id}")
            
            return ToolResponse(success=True, data=task_data).model_dump()
    
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        return ToolResponse(
            success=False,
            error={"code": "DATABASE_ERROR", "message": "Failed to update task"}
        ).model_dump()
```

**File**: `backend/src/mcp_server/tools/complete_task.py`

```python
from mcp import server
from src.mcp_server.schemas.responses import ToolResponse, TaskData
from src.models.task import Task
from src.database_setup import get_async_session
from sqlalchemy import select
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@server.tool()
async def complete_task(task_id: int, user_id: int) -> dict:
    """
    Toggle task completion status.
    
    Args:
        task_id: ID of task to complete
        user_id: Authenticated user ID (from JWT)
    
    Returns:
        ToolResponse with updated task data or error
    """
    try:
        async with get_async_session() as session:
            query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            result = await session.execute(query)
            task = result.scalar_one_or_none()
            
            if not task:
                return ToolResponse(
                    success=False,
                    error={"code": "TASK_NOT_FOUND", "message": f"Task with ID {task_id} was not found"}
                ).model_dump()
            
            # Toggle completion status
            task.completed = not task.completed
            task.completed_at = datetime.utcnow() if task.completed else None
            task.updated_at = datetime.utcnow()
            
            await session.commit()
            await session.refresh(task)
            
            task_data = TaskData(
                task_id=task.id,
                title=task.title,
                description=task.description,
                due_date=task.due_date,
                completed=task.completed,
                completed_at=task.completed_at,
                created_at=task.created_at,
                updated_at=task.updated_at,
                user_id=task.user_id
            )
            
            logger.info(f"Task completed toggled: task_id={task.id}, completed={task.completed}, user_id={user_id}")
            
            return ToolResponse(success=True, data=task_data).model_dump()
    
    except Exception as e:
        logger.error(f"Error toggling task completion: {str(e)}")
        return ToolResponse(
            success=False,
            error={"code": "DATABASE_ERROR", "message": "Failed to update task completion"}
        ).model_dump()
```

**File**: `backend/src/mcp_server/tools/delete_task.py`

```python
from mcp import server
from src.mcp_server.schemas.responses import ToolResponse
from src.models.task import Task
from src.database_setup import get_async_session
from sqlalchemy import select
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@server.tool()
async def delete_task(task_id: int, user_id: int) -> dict:
    """
    Permanently delete a task.
    
    Args:
        task_id: ID of task to delete
        user_id: Authenticated user ID (from JWT)
    
    Returns:
        ToolResponse with deletion confirmation or error
    """
    try:
        async with get_async_session() as session:
            query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            result = await session.execute(query)
            task = result.scalar_one_or_none()
            
            if not task:
                return ToolResponse(
                    success=False,
                    error={"code": "TASK_NOT_FOUND", "message": f"Task with ID {task_id} was not found"}
                ).model_dump()
            
            # Store task info before deletion
            task_title = task.title
            task_id_deleted = task.id
            
            await session.delete(task)
            await session.commit()
            
            logger.info(f"Task deleted: task_id={task_id_deleted}, user_id={user_id}")
            
            return ToolResponse(
                success=True,
                data={
                    "deleted_task_id": task_id_deleted,
                    "title": task_title,
                    "deleted_at": datetime.utcnow().isoformat()
                }
            ).model_dump()
    
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        return ToolResponse(
            success=False,
            error={"code": "DATABASE_ERROR", "message": "Failed to delete task"}
        ).model_dump()
```

---

## Step 7: Initialize MCP Server

**File**: `backend/src/mcp_server/server.py`

```python
from mcp import server
from .tools import add_task, list_tasks, update_task, complete_task, delete_task

# Create MCP server instance
mcp_server = server.Server(name="todo-mcp-server", version="1.0.0")

# Tools are automatically registered via @server.tool() decorator
```

**File**: `backend/src/mcp_server/__init__.py`

```python
from .server import mcp_server

__all__ = ["mcp_server"]
```

**File**: `backend/src/mcp_server/tools/__init__.py`

```python
from . import add_task
from . import list_tasks
from . import update_task
from . import complete_task
from . import delete_task

__all__ = ["add_task", "list_tasks", "update_task", "complete_task", "delete_task"]
```

---

## Step 8: Integrate with FastAPI

**File**: `backend/src/main.py` (add to existing)

```python
from fastapi import FastAPI
from src.mcp_server import mcp_server

app = FastAPI()

# Existing routes...

# MCP Server endpoint
@app.post("/mcp/invoke/{tool_name}")
async def invoke_mcp_tool(tool_name: str, request: dict, user_id: int = Depends(get_current_user)):
    """
    Invoke an MCP tool with authenticated user context.
    """
    # Tool invocation logic here
    pass
```

---

## Step 9: Test Tools

Run tests:

```bash
cd backend
pytest tests/mcp_server/ -v
```

Example test:

**File**: `backend/tests/mcp_server/test_tools/test_add_task.py`

```python
import pytest
from src.mcp_server.tools.add_task import add_task

@pytest.mark.asyncio
async def test_add_task_success(test_user_id):
    result = await add_task(
        title="Test task",
        description="Test description",
        due_date=None,
        user_id=test_user_id
    )
    
    assert result["success"] is True
    assert result["data"]["title"] == "Test task"
    assert result["data"]["user_id"] == test_user_id
```

---

## Example Tool Invocations

### Create a Task

```json
POST /mcp/invoke/add_task
Authorization: Bearer <JWT>

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "due_date": "2026-02-25T18:00:00Z"
}
```

### List All Tasks

```json
POST /mcp/invoke/list_tasks
Authorization: Bearer <JWT>

{}
```

### Update a Task

```json
POST /mcp/invoke/update_task
Authorization: Bearer <JWT>

{
  "task_id": 123,
  "title": "Buy organic groceries"
}
```

### Complete a Task

```json
POST /mcp/invoke/complete_task
Authorization: Bearer <JWT>

{
  "task_id": 123
}
```

### Delete a Task

```json
POST /mcp/invoke/delete_task
Authorization: Bearer <JWT>

{
  "task_id": 123
}
```

---

## Troubleshooting

### Issue: "UNAUTHORIZED" error

**Solution**: Verify JWT token is valid and not expired. Check `JWT_SECRET_KEY` in `.env`.

### Issue: "TASK_NOT_FOUND" for existing task

**Solution**: Ensure task is owned by authenticated user. Cross-user access is blocked by design.

### Issue: Database connection errors

**Solution**: Verify `DATABASE_URL` in `.env` points to valid Neon PostgreSQL instance.

---

## Next Steps

1. Implement remaining tools (update_task, complete_task, delete_task)
2. Write comprehensive tests for each tool
3. Integrate with AI agent layer
4. Add structured logging for observability

---

## Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Spec: MCP Tool Server](../spec.md)
- [Plan: MCP Tool Server](../plan.md)
- [Data Model](../data-model.md)
- [Tool Contracts](../contracts/mcp-tools.yaml)
