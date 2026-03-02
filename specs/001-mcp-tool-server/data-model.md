# Data Model: MCP Tool Server

**Feature**: MCP Tool Server  
**Branch**: `001-mcp-tool-server`  
**Date**: 2026-02-22  
**Purpose**: Define data entities, schemas, and validation rules

---

## Entity 1: Task (Existing - Reused)

**Location**: `backend/src/models/task.py`

**What it represents**: A unit of work owned by a user, with lifecycle states (active, completed, deleted)

### Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | `int` | Auto | Unique task identifier | Primary key, auto-increment |
| `title` | `str` | Yes | Task title/description | 1-255 characters |
| `description` | `str \| None` | No | Detailed task description | Text field (optional) |
| `completed` | `bool` | Yes | Completion status | Default: `False` |
| `created_at` | `datetime` | Auto | Creation timestamp | Auto-generated (UTC) |
| `updated_at` | `datetime` | Auto | Last update timestamp | Auto-updated on change (UTC) |
| `user_id` | `int` | Yes | Owner user ID | Foreign key to User table |

**Note**: The existing Task model does NOT have `due_date` or `completed_at` fields. These features are out of scope for MCP Tool Server (Phase III). Tools will work with existing fields only.

### Relationships

- **User → Tasks**: One-to-many (one user owns many tasks)
- **Task → User**: Many-to-one (each task owned by exactly one user)

### State Transitions

```
[Created] → [Active] → [Completed]
                ↓
           [Deleted]
```

- **Created → Active**: Initial state on creation
- **Active → Completed**: Via `complete_task` tool (sets `completed=True`, `completed_at=now()`)
- **Completed → Active**: Via `complete_task` tool again (toggle: sets `completed=False`, `completed_at=None`)
- **Any → Deleted**: Via `delete_task` tool (hard delete from database)

### Validation Rules

1. **Title required**: Cannot create task with empty or null title
2. **User ownership**: Every task must have valid `user_id`
3. **Completion timestamp**: `completed_at` must be set when `completed=True`
4. **Ownership immutability**: `user_id` cannot be changed after creation

### SQLModel Definition (Reference)

**Actual SQLAlchemy Model** (from `backend/src/models/models.py`):

```python
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    owner = relationship("User", back_populates="tasks")
```

**Note**: Model uses SQLAlchemy Core (not SQLModel). MCP tools will work with existing model directly.

---

## Entity 2: MCP Tool Input Schemas

**Location**: `backend/src/mcp_server/schemas/requests.py`

### AddTaskInput

**Purpose**: Input schema for `add_task` tool

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `title` | `str` | Yes | Task title | 1-255 chars |
| `description` | `str \| None` | No | Task description | Optional |

```python
class AddTaskInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None)
```

**Note**: No `due_date` field - not supported by existing Task model

### UpdateTaskInput

**Purpose**: Input schema for `update_task` tool

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `task_id` | `int` | Yes | Task to update | Must exist, must be owned by user |
| `title` | `str \| None` | No | New title | 1-255 chars (if provided) |
| `description` | `str \| None` | No | New description | Optional (if provided) |

```python
class UpdateTaskInput(BaseModel):
    task_id: int = Field(...)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None)
```

**Note**: No `due_date` field - not supported by existing Task model

### CompleteTaskInput

**Purpose**: Input schema for `complete_task` tool

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `task_id` | `int` | Yes | Task to complete | Must exist, must be owned by user |

```python
class CompleteTaskInput(BaseModel):
    task_id: int = Field(...)
```

### DeleteTaskInput

**Purpose**: Input schema for `delete_task` tool

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `task_id` | `int` | Yes | Task to delete | Must exist, must be owned by user |

```python
class DeleteTaskInput(BaseModel):
    task_id: int = Field(...)
```

### ListTasksInput

**Purpose**: Input schema for `list_tasks` tool

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `status` | `str \| None` | No | Filter by status | "active", "completed", or null (all) |

```python
class ListTasksInput(BaseModel):
    status: Literal["active", "completed"] | None = Field(default=None)
```

---

## Entity 3: MCP Tool Output Schemas

**Location**: `backend/src/mcp_server/schemas/responses.py`

### ToolResponse (Base)

**Purpose**: Base schema for all tool responses

```python
class ToolResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: ErrorResponse | None = None
```

### ErrorResponse

**Purpose**: Standardized error response format

| Field | Type | Description |
|-------|------|-------------|
| `code` | `str` | Machine-readable error code |
| `message` | `str` | Human-readable error message |
| `details` | `dict` | Additional error context |

```python
class ErrorResponse(BaseModel):
    code: str
    message: str
    details: dict = Field(default_factory=dict)
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Validation failed |
| `UNAUTHORIZED` | 401 | JWT missing or invalid |
| `TASK_NOT_FOUND` | 404 | Task doesn't exist or user lacks ownership |
| `FORBIDDEN` | 403 | Operation not allowed |
| `DATABASE_ERROR` | 500 | Database operation failed |

### TaskData

**Purpose**: Standardized task representation in responses

```python
class TaskData(BaseModel):
    task_id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: int
```

**Note**: No `due_date` or `completed_at` fields - not supported by existing Task model. The `user_id` is included for completeness but will always match the authenticated user.

### Specific Tool Responses

**AddTaskResponse**:
```python
class AddTaskResponse(BaseModel):
    success: bool
    data: TaskData | None
    error: ErrorResponse | None
```

**ListTasksResponse**:
```python
class ListTasksResponse(BaseModel):
    success: bool
    data: list[TaskData] | None
    error: ErrorResponse | None
```

**UpdateTaskResponse**:
```python
class UpdateTaskResponse(BaseModel):
    success: bool
    data: TaskData | None
    error: ErrorResponse | None
```

**CompleteTaskResponse**:
```python
class CompleteTaskResponse(BaseModel):
    success: bool
    data: TaskData | None
    error: ErrorResponse | None
```

**DeleteTaskResponse**:
```python
class DeleteTaskResponse(BaseModel):
    success: bool
    data: dict | None  # {"deleted_task_id": int}
    error: ErrorResponse | None
```

---

## Entity 4: JWT Payload (Existing - Referenced)

**Location**: `backend/src/core/security.py`

**What it represents**: Decoded JWT token payload from authentication system

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `int` | Authenticated user's ID |
| `email` | `str` | User's email address |
| `exp` | `int` | Token expiration timestamp |
| `iat` | `int` | Token issued-at timestamp |

### Usage in MCP Server

```python
# Extract user_id from JWT (NOT from tool input)
async def get_current_user(authorization: str = Header(...)) -> int:
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)  # From core/security.py
    return payload.get("user_id")
```

---

## Validation Rules Summary

### Input Validation

1. **Title validation** (add_task, update_task):
   - Required for add_task
   - 1-500 characters
   - Cannot be empty string

2. **Description validation**:
   - Optional for all tools
   - Max 2000 characters
   - Can be null

3. **Due date validation**:
   - Optional for all tools
   - Must be valid ISO 8601 datetime
   - Can be null

4. **Task ID validation** (update, complete, delete):
   - Required integer
   - Must reference existing task
   - Must be owned by authenticated user

### Ownership Validation

1. **All tools**: Extract `user_id` from JWT, never from input
2. **Database queries**: Always filter by `user_id`
3. **Task not found**: Return same error for "doesn't exist" and "wrong owner" (security by obscurity)

### State Validation

1. **Complete task**: Can complete already-completed task (idempotent)
2. **Update task**: Can update any field independently
3. **Delete task**: Can delete completed or active tasks

---

## Database Schema Reference

**Existing table**: `tasks` (from multi-user todo app)

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(2000),
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

**No schema changes required** - reuses existing Task model.

---

## Next Steps

1. Generate OpenAPI-style tool contracts in `contracts/mcp-tools.yaml`
2. Generate response format contracts in `contracts/responses.yaml`
3. Write `quickstart.md` with setup and usage instructions
