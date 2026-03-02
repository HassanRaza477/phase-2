# MCP Tool Server

Stateless Model Context Protocol (MCP) server for task management operations.

## Overview

This module provides MCP tools that allow AI agents to manage tasks through a standardized protocol. All tools enforce strict user ownership and return structured JSON responses.

## Available Tools

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `add_task` | Create a new task | title, description (optional) | Created task data |
| `list_tasks` | List user's tasks | status filter (optional) | Array of tasks |
| `update_task` | Update task details | task_id, title/description (optional) | Updated task data |
| `complete_task` | Toggle task completion | task_id | Updated task data |
| `delete_task` | Delete a task | task_id | Deletion confirmation |

## Architecture

```
mcp_server/
├── __init__.py          # Module exports
├── server.py            # MCP server initialization
├── auth/
│   ├── __init__.py
│   └── jwt_verifier.py  # JWT verification (reuses AuthService)
├── schemas/
│   ├── __init__.py
│   ├── requests.py      # Tool input schemas
│   └── responses.py     # Tool output schemas
└── tools/
    ├── __init__.py
    ├── add_task.py
    ├── list_tasks.py
    ├── update_task.py
    ├── complete_task.py
    └── delete_task.py
```

## Key Design Principles

### 1. Stateless Design
- No in-memory session state
- Each request independently executable
- All context from JWT or database

### 2. User Ownership Enforcement
- `user_id` extracted from JWT (never from client input)
- All database queries filter by `user_id`
- Cross-user access impossible

### 3. Structured Responses
All tools return consistent JSON format:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Error Response**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

### 4. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Validation failed |
| `UNAUTHORIZED` | 401 | JWT missing/invalid |
| `TASK_NOT_FOUND` | 404 | Task doesn't exist or wrong owner |
| `DATABASE_ERROR` | 500 | Database operation failed |

## API Endpoints

### List Available Tools

```http
GET /mcp/tools
```

**Response**:
```json
{
  "tools": ["add_task", "list_tasks", "update_task", "complete_task", "delete_task"],
  "server": "todo-mcp-server",
  "version": "1.0.0"
}
```

### Invoke a Tool

```http
POST /mcp/invoke/{tool_name}
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "arguments": {
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }
}
```

**Example: Create Task**
```bash
curl -X POST http://localhost:8000/mcp/invoke/add_task \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"title": "Buy groceries", "description": "Milk, eggs, bread"}}'
```

**Example: List Tasks**
```bash
curl -X POST http://localhost:8000/mcp/invoke/list_tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"status": "active"}}'
```

**Example: Update Task**
```bash
curl -X POST http://localhost:8000/mcp/invoke/update_task \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"task_id": 123, "title": "Buy organic groceries"}}'
```

**Example: Complete Task**
```bash
curl -X POST http://localhost:8000/mcp/invoke/complete_task \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"task_id": 123}}'
```

**Example: Delete Task**
```bash
curl -X POST http://localhost:8000/mcp/invoke/delete_task \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"task_id": 123}}'
```

## Implementation Details

### Synchronous Database Sessions

This module uses **synchronous** SQLAlchemy sessions to match the existing backend pattern:

```python
from sqlalchemy.orm import Session
from src.db.database import get_db

def my_tool(user_id: int, db: Session):
    # Use db session synchronously
    task = Task(title="...", user_id=user_id)
    db.add(task)
    db.commit()
    db.refresh(task)
```

### JWT Verification

JWT verification reuses the existing `AuthService`:

```python
from src.mcp_server.auth.jwt_verifier import get_current_user_id

# Used as FastAPI dependency
user_id: int = Depends(get_current_user_id)
```

### Logging

All tool invocations are logged:

```python
logger.info(f"Task created: task_id={task.id}, user_id={user_id}")
```

## Testing

Run tests with pytest:

```bash
cd backend
pytest tests/mcp_server/ -v
```

## Dependencies

- FastAPI 0.104.1+
- SQLAlchemy 2.0.23+
- Pydantic 2.5.0+
- python-jose (JWT)
- passlib (password hashing)

## Security Considerations

1. **Never trust client-provided user_id** - Always extract from JWT
2. **Always filter by user_id** - All database queries must include ownership check
3. **Same error for "not found" and "wrong owner"** - Prevents information disclosure
4. **Structured logging** - Log all tool invocations for audit trails
5. **No sensitive data in logs** - Don't log task content or tokens

## License

Part of the Task Manager API project.
