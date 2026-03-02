# Research: AI Agent Chat Endpoint

**Feature**: 001-ai-agent-chat
**Date**: 2026-02-23
**Purpose**: Resolve technical unknowns and establish best practices for AI agent chat implementation

---

## Decision 1: OpenAI Agents SDK Integration Pattern

**Decision**: Use OpenAI Agents SDK with function calling to map agent decisions to MCP tool invocations

**Rationale**: 
- OpenAI Agents SDK provides built-in support for tool/function calling
- Agent can automatically select appropriate tools based on natural language intent
- Structured tool definitions ensure deterministic behavior
- SDK handles conversation management and tool result integration

**Alternatives Considered**:
- **Direct API calls to OpenAI**: Would require manual prompt engineering for tool selection, less reliable
- **LangChain**: More complex, adds unnecessary abstraction layer
- **Custom agent implementation**: Violates reproducibility principle, reinvents proven patterns

**Implementation Approach**:
- Define MCP tools as OpenAI functions with explicit schemas
- Agent receives conversation history + available tools
- Agent returns tool selection with parameters in structured format
- Backend executes tool and returns result to agent for response generation

---

## Decision 2: MCP Tool Integration Architecture

**Decision**: MCP tools operate as server-side functions invoked by the backend, not as external MCP server

**Rationale**:
- Existing MCP tools (from spec 001-mcp-tool-server) are Python functions
- Direct function invocation reduces latency and complexity
- Maintains full control over tool execution and error handling
- Aligns with stateless server architecture

**Alternatives Considered**:
- **External MCP server via MCP protocol**: Adds network overhead, unnecessary for single-backend deployment
- **MCP server as separate microservice**: Over-engineering for current scale

**Implementation Approach**:
- Import MCP tool functions into backend
- Wrap tools with validation and user ownership checks
- Expose tools to agent via OpenAI function calling schema
- Log all tool invocations with parameters and results

---

## Decision 3: JWT Verification with Better Auth

**Decision**: Verify JWT tokens using Better Auth's shared secret key in backend

**Rationale**:
- Better Auth issues JWT tokens with configurable secret
- Backend can verify tokens independently without calling auth service
- Stateless verification aligns with stateless architecture
- Fast JWT verification using PyJWT library

**Alternatives Considered**:
- **Session-based auth via database lookup**: Requires database call for every request, slower
- **OAuth2 introspection endpoint**: Adds external dependency, slower
- **Better Auth SDK for Python**: May not be available, direct JWT verification more reliable

**Implementation Approach**:
- Extract JWT secret from environment variables (shared with Better Auth)
- Use PyJWT to decode and verify token signature
- Extract user_id from token claims
- Validate user_id matches request path parameter
- Return 401/403 for invalid or mismatched tokens

---

## Decision 4: Conversation Context Reconstruction

**Decision**: Reconstruct conversation context by querying Message table for each request

**Rationale**:
- Aligns with stateless server architecture (Constitution Gate 8)
- Conversations survive server restarts
- No in-memory caching required
- Each request independently executable

**Alternatives Considered**:
- **In-memory conversation cache**: Violates stateless architecture, loses data on restart
- **Redis session storage**: Adds external dependency, unnecessary complexity
- **Client-side context management**: Security risk, client could manipulate context

**Implementation Approach**:
- Query Message table for all messages in conversation (ordered by timestamp)
- Format messages as array: [{role: "user", content: "..."}, {role: "assistant", content: "..."}]
- Include system prompt defining agent behavior and available tools
- Limit context to last N messages if token limit exceeded (configurable, default 50 messages)

---

## Decision 5: Message and Conversation Data Model

**Decision**: Use separate Conversation and Message tables with foreign key relationships

**Rationale**:
- Clear separation of conversation metadata from individual messages
- Efficient querying of conversation history
- Supports multiple conversations per user
- Enables conversation-level operations (delete, archive)

**Alternatives Considered**:
- **Single Message table with conversation_id**: Works but lacks conversation metadata (created_at, last_message_at)
- **JSONB column for message history**: Harder to query individual messages, violates normalization

**Schema Design**:
```sql
Conversation:
  - id (UUID, primary key)
  - user_id (UUID, foreign key to User)
  - created_at (timestamp)
  - updated_at (timestamp)
  - is_deleted (boolean, for soft delete)

Message:
  - id (UUID, primary key)
  - conversation_id (UUID, foreign key to Conversation)
  - role (enum: user, assistant, system)
  - content (text)
  - tool_calls (JSONB, optional - stores tool invocation details)
  - created_at (timestamp)
```

---

## Decision 6: Error Handling Strategy

**Decision**: Return structured JSON error responses with HTTP status codes and actionable messages

**Rationale**:
- Clear error communication improves user experience
- Structured format enables frontend error handling
- HTTP status codes provide machine-readable error categories

**Error Categories**:
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User ID mismatch (token user ≠ path user)
- **404 Not Found**: Conversation ID does not exist
- **400 Bad Request**: Invalid message format, empty message
- **500 Internal Server Error**: MCP tool failure, database error
- **503 Service Unavailable**: AI agent timeout, external service failure

**Implementation Approach**:
- Define custom exception classes for each error type
- Global exception handler in FastAPI
- Log detailed errors server-side, return user-friendly messages to client
- Include error code for frontend reference

---

## Decision 7: Conversation Retention and Cleanup

**Decision**: Retain conversations for 1 year with automatic cleanup job and user manual deletion

**Rationale**:
- Balances user value (long-term history) with storage costs
- Meets specification requirement (FR-013)
- User manual deletion provides control over their data
- Automatic cleanup prevents unbounded storage growth

**Implementation Approach**:
- Add `expires_at` column to Conversation table (created_at + 1 year)
- Daily background job deletes conversations where expires_at < NOW()
- User can manually delete conversation via DELETE /api/{user_id}/conversations/{conversation_id}
- Soft delete flag (is_deleted) for audit trail, hard delete after 30 days

---

## Decision 8: Agent System Prompt Design

**Decision**: Use structured system prompt that defines agent role, available tools, and response format

**Rationale**:
- Clear instructions ensure consistent agent behavior
- Tool definitions enable accurate function calling
- Response format specification ensures parseable output

**System Prompt Structure**:
```
You are a helpful todo assistant that helps users manage their tasks through natural language.

Available Tools:
- create_task(title, description, due_date, priority)
- update_task(task_id, title, description, due_date, priority)
- delete_task(task_id)
- list_tasks(filter)
- get_task(task_id)

Rules:
- Always confirm task creation with title and due date
- Ask clarifying questions if user intent is ambiguous
- Never access tasks belonging to other users
- Use tools for all task operations, do not make assumptions

Response Format:
- Provide natural language responses
- Include tool call results in responses when relevant
```

---

## Decision 9: Token Limit Management

**Decision**: Implement sliding window context with configurable message limit

**Rationale**:
- OpenAI models have token limits (e.g., GPT-4: 8K tokens)
- Long conversations exceed token limits
- Sliding window preserves recent context while staying within limits

**Implementation Approach**:
- Default limit: 50 messages (25 user + 25 assistant turns)
- If conversation exceeds limit, use most recent N messages
- Optionally summarize old conversations (future enhancement)
- Return warning if context was truncated

---

## Decision 10: Testing Strategy

**Decision**: Use pytest for unit, integration, and contract testing

**Rationale**:
- Python standard testing framework
- Supports async testing for FastAPI
- Rich ecosystem of plugins (pytest-asyncio, pytest-mock)

**Test Categories**:
- **Unit Tests**: Test individual functions (JWT verification, message formatting)
- **Integration Tests**: Test chat endpoint with mock agent and MCP tools
- **Contract Tests**: Verify API request/response schemas
- **End-to-End Tests**: Test full conversation flow with real agent (staging only)

---

## Summary of Technology Choices

| Component | Choice | Justification |
|-----------|--------|---------------|
| Language | Python 3.11 | FastAPI compatibility, existing backend |
| Web Framework | FastAPI | Async support, automatic OpenAPI docs |
| AI SDK | OpenAI Agents SDK | Built-in function calling, reliable |
| Database ORM | SQLModel | Type-safe, existing project standard |
| Auth | Better Auth (JWT) | Existing auth system, stateless |
| Testing | pytest | Python standard, async support |
| Deployment | Docker | Existing project infrastructure |

---

## Open Questions for Phase 1

1. **MCP Tool Schemas**: Need exact function signatures from existing MCP tool server
2. **JWT Secret Configuration**: Need to confirm environment variable name in existing backend
3. **Database Migration Strategy**: Need to coordinate with existing migration system
4. **Agent Model Selection**: Which OpenAI model to use (GPT-4, GPT-3.5-turbo)?
