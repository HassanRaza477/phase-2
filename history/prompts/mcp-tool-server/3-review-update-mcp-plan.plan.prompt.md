---
id: 3
title: "Review And Update MCP Tool Server Plan"
stage: plan
date_iso: "2026-02-22"
surface: "agent"
model: "Qwen"
feature: "mcp-tool-server"
branch: "001-mcp-tool-server"
user: "HASAN RAZA"
command: "/sp.plan (review and update)"
labels: ["plan", "mcp-server", "review", "backend-analysis", "phase-iii"]
links:
  spec: "specs/001-mcp-tool-server/spec.md"
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "specs/001-mcp-tool-server/plan.md"
  - "specs/001-mcp-tool-server/research.md"
  - "specs/001-mcp-tool-server/data-model.md"
  - "specs/001-mcp-tool-server/database-schema.md"
tests_yaml: []
---

# Review and Update MCP Tool Server Plan

## User Input

```
review backend and frontend folder and update planning /sp.plan
```

## Response Summary

Reviewed the existing backend and frontend folder structures and updated the MCP Tool Server implementation plan to align with the actual codebase.

### Backend Analysis

**Existing Structure** (`backend/`):
- `src/api/` - REST API routes (auth.py, tasks.py)
- `src/core/` - Configuration and security utilities
- `src/db/` - Database connection (synchronous SQLAlchemy)
- `src/models/` - SQLAlchemy models (User, Task) and Pydantic schemas
- `src/services/` - Business logic (auth_service.py)
- `src/main.py` - FastAPI application entry point

**Key Findings**:
1. Uses **synchronous** SQLAlchemy sessions (not async)
2. JWT verification via `AuthService.get_current_user()` (not direct token decoding)
3. Task model has: id, title, description, completed, created_at, updated_at, user_id
4. Task model does NOT have: due_date, completed_at fields
5. Existing API uses HTTPBearer for token extraction

### Frontend Analysis

**Existing Structure** (`frontend/todo-app/`):
- Next.js 16.1.6 with App Router
- React 19.2.3
- TypeScript
- Tailwind CSS
- Dependencies: axios, lucide-react, radix-ui, react-hot-toast

**Key Findings**:
1. Modern Next.js setup with App Router architecture
2. No MCP client integration yet (out of scope for this phase)
3. Frontend will be updated in subsequent phase to integrate with AI chat layer

### Plan Updates Made

**1. Technical Context** (`plan.md`):
- Updated dependencies to reflect existing packages (SQLAlchemy 2.0.23, python-jose 3.3.0, passlib 1.7.4)
- Added constraint: "Must integrate with existing SQLAlchemy sync session pattern"
- Added constraint: "Must reuse existing User/Task models and AuthService"

**2. Project Structure** (`plan.md`):
- Updated to show actual existing directory structure
- Added references to specific existing files:
  - `backend/src/models/models.py` (User, Task models)
  - `backend/src/db/database.py` (sync session)
  - `backend/src/services/auth_service.py` (AuthService)
- Added IMPORTANT note: "Existing code uses synchronous SQLAlchemy sessions (not async)"

**3. Research Updates** (`research.md`):
- Changed JWT verification to use `AuthService.get_current_user()` pattern
- Updated database connection to use sync session from `backend/src/db/database.py`
- Added implementation examples matching existing code patterns

**4. Data Model Updates** (`data-model.md`):
- Updated Task entity to reflect actual SQLAlchemy model (not SQLModel)
- Removed `due_date` and `completed_at` fields (not in existing schema)
- Updated field constraints: title max 255 chars (not 500)
- Updated AddTaskInput and UpdateTaskInput schemas to remove due_date
- Updated TaskData output schema to remove due_date and completed_at

**5. New File** (`database-schema.md`):
- Documented existing database schema
- Gap analysis: existing schema supports all MCP tool operations
- Conclusion: No migrations required

### Schema Compatibility

| Field | MCP Required | Existing DB | Status |
|-------|--------------|-------------|--------|
| tasks.id | ✅ | ✅ | OK |
| tasks.title | ✅ | ✅ | OK (255 chars) |
| tasks.description | ✅ | ✅ | OK (Text) |
| tasks.completed | ✅ | ✅ | OK (Boolean) |
| tasks.user_id | ✅ | ✅ | OK (ForeignKey) |
| tasks.created_at | ✅ | ✅ | OK |
| tasks.updated_at | ✅ | ✅ | OK |
| due_date | ❌ Removed | ❌ N/A | NOT NEEDED |
| completed_at | ❌ Removed | ❌ N/A | NOT NEEDED |

**Result**: ✅ Existing schema fully compatible - no migrations needed

### Critical Implementation Notes

1. **Use synchronous sessions**: Existing code uses `SessionLocal()` not `async_session()`
2. **Reuse AuthService**: Don't create new JWT verification logic
3. **Match existing patterns**: Follow patterns from `backend/src/api/tasks.py`
4. **No due_date support**: Removed from spec to align with existing schema
5. **HTTPBearer for auth**: Same as existing API endpoints

## Outcome

Plan updated to align with actual codebase. All design artifacts now reflect:
- Synchronous SQLAlchemy pattern
- Existing AuthService for JWT verification
- Actual Task model fields (no due_date/completed_at)
- Existing directory structure
- Reusable database connection

Implementation can proceed with accurate technical context. Next step: Run `/sp.tasks` to create implementation tasks.
