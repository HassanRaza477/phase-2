# Implementation Plan: AI Agent Chat Endpoint

**Branch**: `001-ai-agent-chat` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-agent-chat/spec.md`

## Summary

Build a stateless chat endpoint that enables users to interact with a todo application through natural language. The system uses OpenAI Agents SDK to interpret user intent, invokes MCP tools for task operations, and persists all conversation history to a PostgreSQL database. Each request reconstructs conversation context from the database, ensuring stateless operation and conversation continuity across server restarts.

## Technical Context

**Language/Version**: Python 3.11
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, SQLModel, Better Auth (JWT verification)
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest
**Target Platform**: Linux server (Docker containerized)
**Project Type**: backend (API endpoint for existing multi-user todo web application)
**Performance Goals**: 100 concurrent chat requests, p95 response time <5 seconds
**Constraints**: Stateless architecture (no in-memory session state), JWT authentication required, MCP tool integration
**Scale/Scope**: 10k users, single chat endpoint with MCP tool orchestration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Spec-First Engineering ✅
- Implementation follows approved specification (spec.md created and validated)
- All requirements traced to user stories and success criteria

### Gate 2: Deterministic Generation ✅
- Agent behavior determined by prompts and MCP tool definitions
- Same conversation history + input yields identical tool selections

### Gate 3: Security by Design ✅
- JWT authentication required at chat endpoint
- User identity derived from verified token, not client input
- MCP tools enforce user ownership at database query level

### Gate 4: Separation of Concerns ✅
- Chat endpoint decoupled from frontend
- AI layer separate from business logic (MCP tools encapsulate data operations)
- Clear interfaces: endpoint → agent → MCP tools → database

### Gate 5: Reproducibility ✅
- Stateless server: each request independently executable
- Conversation context reconstructed from database
- No in-memory session state

### Gate 6: Traceability ✅
- All features map to spec requirements (FR-001 through FR-013)
- Clear lineage from user stories to implementation

### Gate 7: Tool-First AI Design ✅
- LLM acts only through defined MCP tools
- No direct database access by agent
- All AI operations route through explicit tool contracts

### Gate 8: Stateless Server Architecture ✅
- No in-memory session state
- All conversation context persists via database
- Each request independently executable and reconstructible

### Gate 9: Strict User Isolation ✅
- AI cannot access cross-user data
- All tool invocations enforce user ownership
- Conversation records scoped by authenticated user

### Gate 10: No Hidden Side Effects ✅
- All AI operations occur exclusively through MCP tools
- All tool calls logged and traceable
- No side effects outside declared tool scope

**GATE STATUS**: All gates pass. Proceeding to Phase 0 research.

## Phase 0: Research

**Status**: ✅ Complete

**Artifacts**:
- `research.md` - All technical unknowns resolved

**Key Decisions**:
1. OpenAI Agents SDK with function calling for tool invocation
2. MCP tools as direct Python functions (not external server)
3. JWT verification using PyJWT with shared secret
4. Conversation context reconstructed from database per request
5. Separate Conversation and Message tables
6. Structured JSON error responses with HTTP status codes
7. 1-year retention with automatic cleanup and user manual deletion
8. Structured system prompt for agent behavior
9. Sliding window context (50 messages default)
10. pytest for all testing categories

All constitution gates re-validated post-research. No violations.

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Artifacts**:
- `data-model.md` - Conversation and Message entity definitions with SQLModel models
- `contracts/api-contracts.md` - REST API contracts for chat endpoint
- `quickstart.md` - Implementation guide with code examples

**Data Model Summary**:
- **Conversation**: Stores conversation metadata (user_id, timestamps, expiration)
- **Message**: Stores individual messages (role, content, tool_calls)
- Indexes optimized for user-scoped queries and conversation history retrieval
- Triggers automatically update conversation updated_at on message insert

**API Contracts Summary**:
- **POST /api/{user_id}/chat**: Send message, receive agent response
- **GET /api/{user_id}/conversations**: List user conversations
- **GET /api/{user_id}/conversations/{conversation_id}**: Get conversation with messages
- **DELETE /api/{user_id}/conversations/{conversation_id}**: Soft delete conversation
- All endpoints require JWT authentication
- MCP tool contracts defined for create_task, update_task, delete_task, list_tasks, get_task

**Constitution Re-Check Post-Design**:

### Gate 1: Spec-First Engineering ✅
- Design derived from approved spec.md
- All requirements traced to implementation artifacts

### Gate 2: Deterministic Generation ✅
- Agent behavior determined by system prompt and tool definitions
- API contracts ensure consistent request/response format

### Gate 3: Security by Design ✅
- JWT verification at endpoint level
- User ownership enforced in all database queries
- MCP tools validate user_id before execution

### Gate 4: Separation of Concerns ✅
- Chat endpoint separate from MCP tools
- Agent logic isolated in agent.py
- Data models separate from business logic

### Gate 5: Reproducibility ✅
- Stateless design documented
- Context reconstruction from database specified
- No in-memory state in design

### Gate 6: Traceability ✅
- FR-001 → POST /api/{user_id}/chat
- FR-002 → Context reconstruction query
- FR-003 → Agent message forwarding
- FR-004 → MCP tool mapping
- FR-005 → Message persistence
- FR-006 → Structured JSON response
- FR-007/008 → JWT verification
- FR-009 → Error handling
- FR-010 → Stateless architecture
- FR-011/012 → Conversation persistence
- FR-013 → 1-year retention

### Gate 7: Tool-First AI Design ✅
- MCP tools defined with explicit schemas
- Agent invokes tools via function calling
- No direct database access by agent

### Gate 8: Stateless Server Architecture ✅
- Database-backed conversation storage
- No in-memory session state
- Each request independently executable

### Gate 9: Strict User Isolation ✅
- All queries filtered by user_id
- JWT validation ensures user identity
- Foreign key constraints enforce ownership

### Gate 10: No Hidden Side Effects ✅
- All tool calls logged in tool_calls JSONB
- Tool execution explicit in agent.py
- No side effects outside tool scope

**GATE STATUS**: All gates pass post-design. Ready for Phase 2 (Tasks).

## Phase 2: Tasks

**Status**: ⏳ Pending

**Next Command**: `/sp.tasks` to break implementation into testable tasks

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-agent-chat/
├── spec.md                  # Feature specification
├── plan.md                  # This implementation plan
├── research.md              # Phase 0: Technical decisions
├── data-model.md            # Phase 1: Database schema
├── quickstart.md            # Phase 1: Implementation guide
├── contracts/
│   └── api-contracts.md     # Phase 1: REST API contracts
└── checklists/
    └── requirements.md      # Spec quality checklist
```

### Source Code (backend)

```text
backend/
├── src/
│   ├── api/
│   │   └── chat.py          # Chat endpoint implementation
│   ├── agent/
│   │   ├── agent.py         # OpenAI agent logic
│   │   └── prompts.py       # System prompts
│   ├── models/
│   │   ├── conversation.py  # SQLModel for Conversation
│   │   └── message.py       # SQLModel for Message
│   ├── services/
│   │   ├── auth.py          # JWT verification
│   │   └── cleanup.py       # Conversation cleanup job
│   └── mcp_server/
│       └── tools.py         # MCP tool implementations
├── tests/
│   ├── unit/
│   │   ├── test_auth.py
│   │   └── test_agent.py
│   ├── integration/
│   │   └── test_chat_endpoint.py
│   └── contract/
│       └── test_api_schemas.py
└── migrations/
    └── 001_create_chat_tables.sql
```

**Structure Decision**: Backend API endpoint for existing multi-user todo web application. The backend/ directory structure is used with new modules for chat API, agent logic, and conversation models.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
