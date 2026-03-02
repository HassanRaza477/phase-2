# Implementation Plan: MCP Tool Server

**Branch**: `001-mcp-tool-server` | **Date**: 2026-02-22 | **Spec**: [specs/001-mcp-tool-server/spec.md](../spec.md)
**Input**: MCP Tool Server Implementation - Phase 1: Project Setup, Phase 2: Define Tool Schemas, Phase 3: Implement Tools, Phase 4: Error Handling, Phase 5: Testing, Phase 6: Documentation

## Summary

Build a stateless MCP (Model Context Protocol) tool server that exposes task management operations as structured tools for AI agent consumption. The server provides five core tools (add_task, list_tasks, update_task, complete_task, delete_task) with strict user ownership enforcement, input validation, and structured JSON responses. All operations persist to Neon Serverless PostgreSQL using SQLModel ORM.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: 
- FastAPI 0.104.1 (existing)
- Official MCP SDK (new)
- SQLAlchemy 2.0.23 (existing - sync session)
- python-jose 3.3.0 (existing - JWT)
- passlib 1.7.4 (existing - password hashing)
- psycopg2-binary 2.9.9 (existing)
**Storage**: Neon Serverless PostgreSQL (existing database with `users` and `tasks` tables)
**Testing**: pytest 7.4.3, pytest-asyncio 0.21.1, httpx 0.25.2 (for API testing)
**Target Platform**: Server-side backend service (Linux/Windows/Docker)
**Project Type**: Web application - backend API layer (MCP server)
**Performance Goals**: 
- Tool invocation latency <200ms p95 (excluding database latency)
- Support 100+ concurrent tool invocations
- Zero cross-user data access incidents
**Constraints**: 
- Stateless design (no in-memory session state)
- All operations must enforce user ownership
- JWT authentication required for all endpoints
- Structured JSON responses mandatory
- Must integrate with existing SQLAlchemy sync session pattern
- Must reuse existing User/Task models and AuthService
**Scale/Scope**: 
- 5 MCP tools to implement
- Single backend module (mcp_server)
- Integration with existing Task model, authentication system, and database layer

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **I. Spec-First Engineering**: Implementation follows approved spec with 5 user stories and 12 functional requirements
- [x] **II. Deterministic Generation**: Tool schemas and responses are explicitly defined; same inputs yield same outputs
- [x] **III. Security by Design**: JWT authentication, user ownership enforcement at database level
- [x] **IV. Separation of Concerns**: MCP server is modular, separate from existing API layer
- [x] **V. Reproducibility**: Stateless design ensures identical behavior across requests
- [x] **VI. Traceability**: Each tool maps to specific functional requirements (FR-001 through FR-012)

### AI Layer Principles Compliance

- [x] **VII. Tool-First AI Design**: All AI operations route through explicitly defined MCP tools; no direct DB access
- [x] **VIII. Deterministic Tool Contracts**: Each tool has explicit input/output schemas with validation
- [x] **IX. Stateless Server Architecture**: No in-memory session state; each request independently executable
- [x] **X. Conversation Persistence**: Out of scope for this feature (handled by AI chat layer)
- [x] **XI. Strict User Isolation**: All tools enforce user ownership at database query level
- [x] **XII. Separation of AI Reasoning**: MCP tools encapsulate business logic; no hidden rules in prompts
- [x] **XIII. Reproducibility**: Tool behavior determined by schemas and implementation, not prompts
- [x] **XIV. No Hidden Side Effects**: All operations occur through tools; structured responses for all cases

### Security Standards Compliance

- [x] **JWT Authentication**: All MCP endpoints require valid JWT
- [x] **User Identity from Token**: user_id derived from verified token, never from client input
- [x] **Task Ownership Enforcement**: Database queries filter by authenticated user_id
- [x] **No Hardcoded Secrets**: Environment variables for all sensitive configuration

### AI Security Standards Compliance

- [x] **Chat Endpoint JWT**: MCP server requires JWT authentication
- [x] **MCP Tools Require user_id**: Extracted from token, not from tool invocation
- [x] **Agent Cannot Accept user_id**: Tool schemas do not expose user_id as input parameter
- [x] **Cross-User Execution Impossible**: Ownership enforced at query level
- [x] **No Direct DB Modification**: All operations through MCP tools only
- [x] **Tool Calls Traceable**: Structured logging for all tool invocations
- [x] **No In-Memory State**: Stateless design enforced

### Architecture Constraints Compliance

- [x] **Independent Deployability**: MCP server is separate module within backend
- [x] **Stateless Design**: No session state, no global variables
- [x] **Neon PostgreSQL Only**: Uses existing database connection
- [x] **FastAPI Framework**: Consistent with existing backend
- [x] **Horizontal Scaling**: Stateless design supports multiple instances

### Tool Design Standards Compliance

- [x] **Tool Declaration**: Each tool declares name, purpose, input schema, output schema
- [x] **Structured JSON**: All responses follow consistent success/error format
- [x] **Scoped Operations**: Tools perform only declared operations

**GATE RESULT**: ✅ PASS - All constitution principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-tool-server/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── mcp-tools.yaml   # OpenAPI-style tool schemas
│   └── responses.yaml   # Response format contracts
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── mcp_server/              # NEW: MCP tool server module
│   │   ├── __init__.py
│   │   ├── server.py            # MCP server initialization
│   │   ├── tools/               # MCP tool implementations
│   │   │   ├── __init__.py
│   │   │   ├── add_task.py
│   │   │   ├── list_tasks.py
│   │   │   ├── update_task.py
│   │   │   ├── complete_task.py
│   │   │   └── delete_task.py
│   │   ├── schemas/             # Pydantic schemas for tools
│   │   │   ├── __init__.py
│   │   │   ├── requests.py      # Tool input schemas
│   │   │   └── responses.py     # Tool output schemas
│   │   └── auth/                # JWT verification for MCP
│   │       ├── __init__.py
│   │       └── jwt_verifier.py  # Reuses AuthService
│   ├── api/                     # Existing REST API (unchanged)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── deps.py
│   │   └── tasks.py
│   ├── core/                    # Existing core utilities
│   │   ├── __init__.py
│   │   └── security.py
│   ├── db/                      # Existing database layer
│   │   ├── __init__.py
│   │   └── database.py
│   ├── models/                  # Existing models
│   │   ├── __init__.py
│   │   ├── models.py            # User, Task models
│   │   └── schemas.py           # Pydantic schemas
│   ├── services/                # Existing services
│   │   ├── __init__.py
│   │   └── auth_service.py
│   └── main.py                  # FastAPI app (add MCP routes)
└── tests/
    ├── mcp_server/              # NEW: MCP server tests
    │   ├── __init__.py
    │   ├── test_tools/          # Tool-specific tests
    │   │   ├── test_add_task.py
    │   │   ├── test_list_tasks.py
    │   │   ├── test_update_task.py
    │   │   ├── test_complete_task.py
    │   │   └── test_delete_task.py
    │   ├── test_auth.py         # JWT verification tests
    │   └── test_integration.py  # End-to-end tests
    ├── api/                     # Existing API tests
    └── conftest.py              # Test fixtures (add MCP fixtures)
```

**Structure Decision**: 
- MCP server implemented as separate module under `backend/src/mcp_server/`
- Maintains separation from existing REST API (`backend/src/api/`)
- Reuses existing models (`backend/src/models/models.py`), database connection (`backend/src/db/database.py`), and authentication (`backend/src/services/auth_service.py`)
- Tools organized in dedicated `tools/` subdirectory for modularity
- Schemas separated into requests/responses for clarity
- **IMPORTANT**: Existing code uses synchronous SQLAlchemy sessions (not async) - MCP tools must follow same pattern

## Complexity Tracking

No constitution violations. All complexity justified by requirements:

- **MCP SDK Integration**: Required by constitution (AI Architecture Constraints)
- **Separate Module Structure**: Required for separation of concerns and modularity
- **JWT Verification Layer**: Required by AI Security Standards

## Phase 0: Research Plan

### Research Tasks

1. **MCP SDK Integration Pattern**
   - Research Official MCP SDK documentation and integration patterns
   - Identify required decorators, tool registration, and server lifecycle
   - Document best practices for stateless MCP server design

2. **FastAPI + MCP SDK Compatibility**
   - Research integration patterns for MCP SDK with FastAPI
   - Identify if MCP server runs as FastAPI middleware or separate endpoint
   - Document request/response flow for MCP tool invocations

3. **JWT Verification in MCP Context**
   - Research how to extract and verify JWT in MCP tool invocations
   - Identify integration points with existing authentication system
   - Document token propagation from AI layer to MCP tools

4. **Structured Error Handling Patterns**
   - Research MCP SDK error handling conventions
   - Document standard error response format for tools
   - Identify validation patterns for tool input schemas

5. **Database Connection Management**
   - Research database connection pooling for stateless MCP server
   - Document best practices for async database operations with SQLModel
   - Identify transaction management patterns for tool operations

**Output**: `research.md` with all findings and resolved clarifications

## Phase 1: Design Deliverables

### data-model.md

- **Task Entity**: Reuse existing Task model from `backend/src/models/task.py`
- **Tool Input Schemas**: Pydantic models for each tool's input parameters
- **Tool Output Schemas**: Pydantic models for structured responses
- **Error Schema**: Standardized error response format

### contracts/mcp-tools.yaml

OpenAPI-style specifications for all 5 tools:
- `add_task`: Input (title, description?, due_date?), Output (task_id, status, title)
- `list_tasks`: Input (status filter?), Output (list of tasks)
- `update_task`: Input (task_id, title?, description?, due_date?), Output (updated task)
- `complete_task`: Input (task_id), Output (completed task)
- `delete_task`: Input (task_id), Output (deleted task info)

### contracts/responses.yaml

Standardized response formats:
- Success response structure
- Error response structure with error codes
- Validation error format

### quickstart.md

- MCP server setup instructions
- Environment variable configuration
- Tool invocation examples
- Testing instructions

### Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType qwen` to add:
- Official MCP SDK
- pytest-asyncio
- httpx (for async testing)

## Constitution Check (Post-Design)

After Phase 1 design artifacts are created, re-validate:
- [ ] All tool schemas explicitly define inputs/outputs (Principle VIII)
- [ ] No user_id exposed in tool input schemas (AI Security Standards)
- [ ] Error responses follow structured format (Tool Design Standards)
- [ ] Database operations use existing SQLModel patterns (Quality Standards)

## Next Steps

After this plan is complete:
1. Run `/sp.tasks` to break implementation into testable tasks
2. Implement tools following task order (Foundation → Tools → Testing)
3. Validate each tool against constitution principles during implementation
