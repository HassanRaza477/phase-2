# Research: MCP Tool Server Implementation

**Feature**: MCP Tool Server  
**Branch**: `001-mcp-tool-server`  
**Date**: 2026-02-22  
**Purpose**: Resolve all technical unknowns and document implementation decisions

---

## Decision 1: MCP SDK Selection and Integration

**What was chosen**: Official MCP SDK (Model Context Protocol)

**Why chosen**: 
- Mandated by constitution (AI Architecture Constraints: "MCP server must use Official MCP SDK")
- Provides standardized tool definition patterns
- Ensures compatibility with AI agent ecosystems
- Supports structured tool schemas and validation

**Alternatives considered**:
- Custom FastAPI endpoints: Rejected because constitution requires Official MCP SDK
- LangChain tools: Rejected due to coupling with specific AI framework; violates separation concerns

**Implementation pattern**:
- MCP server runs as separate module within FastAPI application
- Tools registered using MCP SDK decorators
- Server exposes tools via standard MCP protocol endpoints

---

## Decision 2: FastAPI + MCP SDK Integration Architecture

**What was chosen**: MCP server integrated as FastAPI sub-application

**Why chosen**:
- Reuses existing FastAPI infrastructure (middleware, error handling, CORS)
- Shares database connection pool with existing API
- Enables unified JWT authentication middleware
- Simplifies deployment (single backend service)

**Alternatives considered**:
- Separate MCP server process: Rejected due to operational complexity; violates "independently deployable" principle (would require coordinated deployments)
- MCP as FastAPI middleware: Rejected because MCP SDK manages its own request lifecycle

**Request/response flow**:
1. AI agent sends MCP tool invocation request to FastAPI endpoint
2. FastAPI JWT middleware extracts and verifies token
3. MCP server receives request with authenticated user context
4. Tool executes with user_id from token (not from request body)
5. Structured JSON response returned to AI agent

---

## Decision 3: JWT Verification in MCP Context

**What was chosen**: Extract JWT from Authorization header, verify using `AuthService.get_current_user()` from `backend/src/services/auth_service.py`

**Why chosen**:
- Consistent with existing authentication patterns in `backend/src/api/tasks.py`
- Reuses battle-tested `AuthService` with existing JWT verification logic
- No sensitive secrets exposed to agent context (AI Security Standards)
- User identity derived from token, never trusted from client input

**Integration points**:
- HTTPBearer for token extraction (same as existing API)
- `AuthService.get_current_user()` for verification
- Pass `user_id` to tool execution context (not exposed in tool schemas)

**Token propagation**:
```
AI Agent → Authorization: Bearer <JWT> → FastAPI → AuthService.get_current_user() → user_id → MCP Tool
```

**Implementation** (matching existing pattern):
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.services.auth_service import AuthService
from src.db.database import get_db

security = HTTPBearer()

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    token = credentials.credentials
    user = AuthService.get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user.id
```

---

## Decision 4: Structured Error Handling Pattern

**What was chosen**: Standardized JSON error responses with error codes

**Why chosen**:
- Required by constitution (Tool Design Standards: "Tool errors must return structured failure responses")
- Enables AI agent to handle errors programmatically
- Consistent with REST API conventions

**Error response format**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID 123 was not found",
    "details": {}
  }
}
```

**Error codes**:
- `INVALID_INPUT`: Validation failed (400)
- `TASK_NOT_FOUND`: Task doesn't exist or user lacks ownership (404)
- `UNAUTHORIZED`: JWT missing or invalid (401)
- `FORBIDDEN`: User owns task but operation not allowed (403)
- `DATABASE_ERROR`: Database operation failed (500)

**Validation pattern**:
- Pydantic schemas validate input before tool execution
- Validation errors return `INVALID_INPUT` with field-specific details
- Custom validation in tool logic for business rules (e.g., ownership)

---

## Decision 5: Database Connection Management

**What was chosen**: Reuse existing SQLAlchemy sync session from `backend/src/db/database.py`

**Why chosen**:
- Existing connection pooling configured for Neon Serverless PostgreSQL
- **CRITICAL**: Existing codebase uses synchronous sessions (not async) - must follow same pattern
- Stateless design: each request creates new session, closes after completion
- No in-memory session state (Constitution Principle IX)
- Consistent with existing API patterns

**Sync pattern** (matching existing code):
```python
from src.db.database import get_db

def add_task_tool(title: str, user_id: int):
    db = next(get_db())
    try:
        task = Task(title=title, user_id=user_id)
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    finally:
        db.close()
```

**Transaction management**:
- Each tool invocation is a single transaction
- Rollback on error (no partial updates)
- Commit only after successful completion

---

## Decision 6: Tool Schema Design

**What was chosen**: Pydantic v2 schemas for input/output validation

**Why chosen**:
- Type safety and automatic validation
- Integration with FastAPI and MCP SDK
- Clear documentation of required vs optional fields
- Automatic OpenAPI schema generation

**Input schema pattern**:
```python
from pydantic import BaseModel, Field

class AddTaskInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=2000)
    due_date: datetime | None = Field(default=None)
```

**Output schema pattern**:
```python
class TaskResponse(BaseModel):
    task_id: int
    title: str
    description: str | None
    due_date: datetime | None
    completed: bool
    created_at: datetime
    updated_at: datetime
```

**User ownership enforcement**:
- `user_id` NOT in tool input schemas
- Extracted from JWT and injected into tool execution
- All database queries filter by `user_id`

---

## Decision 7: Stateless Server Design

**What was chosen**: No in-memory state; all context from database or JWT

**Why chosen**:
- Required by constitution (Principle IX: "No in-memory session state permitted")
- Enables horizontal scaling (multiple server instances)
- Survives server restarts without data loss
- Each request independently executable

**Implementation rules**:
- No global variables storing conversation state
- No class-level attributes for session data
- All state in database (tasks, conversations)
- All context from JWT or database queries

**Request independence**:
```
Request N: [JWT + Tool Invocation] → Reconstruct context from DB → Execute → Response
Request N+1: [JWT + Tool Invocation] → Reconstruct context from DB → Execute → Response
```

No dependency on previous requests.

---

## Decision 8: Testing Strategy

**What was chosen**: pytest with async support, categorized tests

**Why chosen**:
- Industry standard for Python testing
- Supports async/await natively with pytest-asyncio
- Integrates with existing backend test structure

**Test categories**:

1. **Unit Tests** (per tool):
   - Test tool logic in isolation
   - Mock database session
   - Validate input/output schemas

2. **Integration Tests**:
   - Test full tool invocation flow
   - Real database (test database)
   - JWT authentication

3. **Contract Tests**:
   - Validate tool schemas match specification
   - Verify response formats

4. **Security Tests**:
   - Cross-user access prevention
   - JWT validation
   - Input validation

**Test database**:
- Separate test database on Neon
- Reset before each test session
- Foreign key constraints disabled for test isolation

---

## Decision 9: Logging and Observability

**What was chosen**: Python logging with structured JSON output

**Why chosen**:
- Required by constitution (AI Security Standards: "Tool calls must be logged and traceable")
- Enables debugging and audit trails
- No sensitive data in logs

**Log format**:
```json
{
  "timestamp": "2026-02-22T10:30:00Z",
  "level": "INFO",
  "event": "tool_invoked",
  "tool_name": "add_task",
  "user_id": 123,
  "task_id": 456,
  "success": true,
  "duration_ms": 45
}
```

**Logged events**:
- Tool invocation (name, user_id, timestamp)
- Tool result (success/failure, duration)
- Validation errors (field, reason)
- Authentication failures (reason, no user data)

**NOT logged**:
- Task content (title, description)
- JWT tokens
- Passwords or secrets

---

## Resolved Clarifications

All technical unknowns from Technical Context resolved:

| Unknown | Resolution |
|---------|-----------|
| MCP SDK version | Official MCP SDK (latest stable) |
| FastAPI integration | MCP server as FastAPI sub-application |
| JWT verification | Reuse existing `verify_token` from `core/security.py` |
| Error format | Standardized JSON with error codes |
| Database sessions | Reuse existing async session from `database_setup.py` |
| Tool schemas | Pydantic v2 with validation |
| State management | Fully stateless; no in-memory state |
| Testing framework | pytest + pytest-asyncio |
| Logging | Structured JSON logging |

---

## Next Steps

1. Create `data-model.md` with entity definitions and schemas
2. Generate OpenAPI-style tool contracts in `contracts/`
3. Write `quickstart.md` with setup instructions
4. Update agent context with new dependencies
