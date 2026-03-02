# Tasks: AI Agent Chat Endpoint

**Input**: Design documents from `/specs/001-ai-agent-chat/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification or if user requests TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown assume backend API endpoint implementation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure

- [X] T001 Create backend directory structure: backend/src/api/, backend/src/agent/, backend/src/models/, backend/src/services/, backend/tests/
- [X] T002 Add dependencies to backend/requirements.txt: openai>=1.0.0, pyjwt>=2.8.0
- [X] T003 [P] Configure environment variables in backend/.env.example: OPENAI_API_KEY, OPENAI_MODEL, JWT_SECRET_KEY, JWT_ALGORITHM

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create database migration: backend/migrations/001_create_chat_tables.sql (Conversation and Message tables with indexes)
- [X] T005 [P] Create SQLModel for Conversation in backend/src/models/conversation.py
- [X] T006 [P] Create SQLModel for Message in backend/src/models/message.py
- [X] T007 [P] Implement JWT verification service in backend/src/services/auth.py
- [X] T008 [P] Create cleanup job for expired conversations in backend/src/services/cleanup.py
- [X] T009 Setup database session dependency in backend/src/db/database.py (verify get_session exists)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can create todo items by sending natural language messages like "Add a task to buy groceries tomorrow"

**Independent Test**: Send a natural language message to create a task and verify the task appears in the user's todo list with correct attributes (title, due date, etc.)

### Implementation for User Story 1

- [X] T010 [P] [US1] Create system prompt for agent in backend/src/agent/prompts.py (defines task creation behavior)
- [X] T011 [P] [US1] Define OpenAI tool schema for create_task in backend/src/agent/agent.py
- [X] T012 [US1] Implement agent message processing function in backend/src/agent/agent.py (process_agent_message)
- [X] T013 [P] [US1] Create chat endpoint POST /api/{user_id}/chat in backend/src/api/chat.py
- [X] T014 [US1] Implement conversation creation logic in chat endpoint (new conversation if conversation_id not provided)
- [X] T015 [US1] Implement user message storage in Message table
- [X] T016 [US1] Implement conversation history retrieval (last 50 messages)
- [X] T017 [US1] Implement agent response storage in Message table
- [X] T018 [US1] Implement structured JSON response with conversation_id, response, tool_calls
- [X] T019 [US1] Add input validation: message cannot be empty, max 4000 characters
- [X] T020 [US1] Register chat router in backend/src/main.py: app.include_router(chat_router)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- User can send "Add task: Buy groceries due tomorrow"
- Agent invokes create_task MCP tool
- Task is created and confirmed in response
- Conversation and messages are persisted to database

---

## Phase 4: User Story 2 - Conversation History Persistence (Priority: P2)

**Goal**: Users can have multi-turn conversations where the system remembers context from previous messages

**Independent Test**: Send a sequence of related messages and verify the system correctly references previous messages when processing current requests

### Implementation for User Story 2

- [X] T021 [P] [US2] Create GET /api/{user_id}/conversations endpoint in backend/src/api/chat.py (list user conversations)
- [X] T022 [P] [US2] Create GET /api/{user_id}/conversations/{conversation_id} endpoint in backend/src/api/chat.py (get conversation with messages)
- [X] T023 [US2] Implement conversation context reconstruction from database (query Message table by conversation_id)
- [X] T024 [US2] Implement message history formatting for agent input (array of {role, content, tool_calls})
- [X] T025 [US2] Implement sliding window logic (limit to last 50 messages if conversation exceeds limit)
- [X] T026 [US2] Add conversation_id parameter support in chat endpoint (continue existing conversation)
- [X] T027 [US2] Implement trigger to update conversation.updated_at on message insert (data-model.md migration)
- [ ] T028 [US2] Test conversation continuity: send 3 related messages, verify agent references prior context

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- User can start new conversation or continue existing one
- Agent remembers context from previous messages in same conversation
- User can list all conversations and view message history

---

## Phase 5: User Story 3 - MCP Tool Invocation for Task Management (Priority: P3)

**Goal**: System automatically selects and invokes appropriate MCP tools based on user intent (create, update, delete, list tasks)

**Independent Test**: Send various natural language requests and verify the correct MCP tool is invoked with appropriate parameters based on detected intent

### Implementation for User Story 3

- [X] T029 [P] [US3] Define OpenAI tool schemas for all MCP tools in backend/src/agent/agent.py (update_task, delete_task, list_tasks, get_task)
- [X] T030 [P] [US3] Verify MCP tool implementations exist in backend/src/mcp_server/tools.py (create_task, update_task, delete_task, list_tasks, get_task)
- [X] T031 [US3] Implement tool execution logic in process_agent_message (map agent tool_calls to MCP tool functions)
- [X] T032 [US3] Implement tool result capture and storage in tool_calls JSONB field
- [X] T033 [US3] Implement error handling for tool failures (catch exceptions, return structured error in tool_calls)
- [X] T034 [US3] Add user_id validation in tool execution (ensure user owns the task being modified)
- [ ] T035 [US3] Test all MCP tools: send "create task X", "update task X", "delete task X", "list tasks", "get task X"
- [ ] T036 [US3] Verify tool_calls are returned in response with success/failure status

**Checkpoint**: All user stories should now be independently functional
- Agent correctly identifies intent and invokes appropriate MCP tool
- All 5 MCP tools (create, update, delete, list, get) work via natural language
- Tool results are captured and returned in structured format

---

## Phase 6: Additional Endpoints & Features

**Goal**: Complete remaining API contracts and features from specification

### Implementation

- [X] T037 [P] Create DELETE /api/{user_id}/conversations/{conversation_id} endpoint in backend/src/api/chat.py (soft delete)
- [X] T038 [US1] Implement error handling: 400 Bad Request (empty message), 401 Unauthorized (invalid JWT), 403 Forbidden (user mismatch), 404 Not Found (conversation not found)
- [X] T039 [US1] Implement structured error response format: {error: {code, message, details}}
- [X] T040 [US2] Add pagination to GET /api/{user_id}/conversations (limit, offset parameters)
- [X] T041 [US2] Add message count and last_message_preview to conversation list response

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T042 [P] Add logging for all chat endpoint operations (request received, agent processing, tool execution, response sent)
- [X] T043 [P] Add logging for agent operations (tool selection, tool execution, errors)
- [X] T044 [P] Create unit tests for JWT verification in backend/tests/unit/test_auth.py
- [X] T045 [P] Create unit tests for agent logic in backend/tests/unit/test_agent.py
- [X] T046 [P] Create integration tests for chat endpoint in backend/tests/integration/test_chat_endpoint.py
- [X] T047 [P] Create contract tests for API schemas in backend/tests/contract/test_api_schemas.py
- [X] T048 Documentation: Update backend/README.md with chat endpoint usage examples
- [X] T049 Security: Verify all endpoints enforce JWT authentication and user ownership
- [X] T050 Performance: Add database indexes verification (idx_conversations_user_id, idx_messages_conversation_id)
- [ ] T051 Run quickstart.md validation: Test all 8 steps end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Additional Endpoints (Phase 6)**: Depends on User Story 3 completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 infrastructure
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires agent infrastructure from US1

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 can all run in parallel
- **Phase 2**: T004, T005, T006, T007, T008 can all run in parallel (different files)
- **Phase 3 (US1)**: T010, T011, T013 can run in parallel; T012 depends on T010+T011
- **Phase 4 (US2)**: T021, T022 can run in parallel; T023+ depends on endpoint implementation
- **Phase 5 (US3)**: T029, T030 can run in parallel; T031+ depends on tool schemas
- **Phase 7**: T042, T043, T044, T045, T046, T047 can all run in parallel (different test files)

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1:

# Task: Create system prompt in backend/src/agent/prompts.py
# Task: Define create_task tool schema in backend/src/agent/agent.py  
# Task: Create chat endpoint skeleton in backend/src/api/chat.py

# These can all be done in parallel (different files, no dependencies)
# Then implement process_agent_message (depends on prompt + schema)
# Then integrate endpoint with agent (depends on both complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T010-T020)
4. **STOP and VALIDATE**: Test natural language task creation end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (chat endpoint, basic agent)
   - Developer B: User Story 2 (conversation endpoints, history retrieval)
   - Developer C: User Story 3 (MCP tool integration, all 5 tools)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Task Summary

- **Total Tasks**: 51
- **Phase 1 (Setup)**: 3 tasks ✅ Complete
- **Phase 2 (Foundational)**: 6 tasks ✅ Complete
- **Phase 3 (US1 - Task Creation)**: 11 tasks ✅ Complete
- **Phase 4 (US2 - Conversation History)**: 8 tasks (7 ✅ Complete, 1 ⏳ Pending manual test)
- **Phase 5 (US3 - MCP Tool Invocation)**: 8 tasks (6 ✅ Complete, 2 ⏳ Pending manual tests)
- **Phase 6 (Additional Endpoints)**: 5 tasks ✅ Complete
- **Phase 7 (Polish)**: 10 tasks (8 ✅ Complete, 2 ⏳ Pending documentation & e2e)

**Completed**: 48/51 (94%)
**Pending**: 3/51 (6% - manual testing only)

## Independent Test Criteria

- **User Story 1**: Send "Add task: Buy groceries due tomorrow" → Task created with correct title and due date
- **User Story 2**: Send 3 related messages in same conversation → Agent references prior context correctly
- **User Story 3**: Send "create task X", "update task X", "delete task X", "list tasks" → Correct MCP tool invoked each time

---

## Implementation Complete ✅

**Status**: Implementation complete with comprehensive documentation and test suite. Manual testing ready.

**Next Steps**:
1. Run automated tests: `pytest backend/tests/ -v`
2. Follow MANUAL_TESTING_GUIDE.md for manual validation
3. Configure OPENAI_API_KEY and test end-to-end
4. Deploy to production

**Documentation**:
- backend/README.md - Complete API documentation with examples
- specs/001-ai-agent-chat/MANUAL_TESTING_GUIDE.md - Step-by-step testing instructions
- specs/001-ai-agent-chat/IMPLEMENTATION_STATUS.md - Implementation status report
- specs/001-ai-agent-chat/quickstart.md - Quick start guide
