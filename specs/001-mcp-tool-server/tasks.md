# Tasks: MCP Tool Server

**Input**: Design documents from `/specs/001-mcp-tool-server/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature - implementation tasks only. Add tests later if needed via separate spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- MCP server module: `backend/src/mcp_server/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create MCP server module directory structure in `backend/src/mcp_server/`
- [x] T002 [P] Add MCP SDK dependency to `backend/requirements.txt`
- [x] T003 [P] Add pytest and pytest-asyncio to `backend/requirements.txt` (if not present)
- [x] T004 Create `backend/src/mcp_server/__init__.py` with module exports
- [x] T005 [P] Add MCP server configuration to `backend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create JWT verification utility in `backend/src/mcp_server/auth/jwt_verifier.py`
- [x] T007 [P] Create tool input schemas in `backend/src/mcp_server/schemas/requests.py`
- [x] T008 [P] Create tool output schemas in `backend/src/mcp_server/schemas/responses.py`
- [x] T009 Create MCP server initialization in `backend/src/mcp_server/server.py`
- [x] T010 [P] Create tools package `backend/src/mcp_server/tools/__init__.py`
- [x] T011 Configure structured logging for MCP tools in `backend/src/main.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Task via AI (Priority: P1) 🎯 MVP

**Goal**: Implement the `add_task` MCP tool that allows authenticated users to create tasks via AI

**Independent Test**: User can invoke add_task tool with title and optional description, task is created with correct ownership, verifiable through list_tasks retrieval

### Implementation for User Story 1

- [x] T012 [P] [US1] Create AddTaskInput schema in `backend/src/mcp_server/schemas/requests.py`
- [x] T013 [P] [US1] Add TaskData to output schema in `backend/src/mcp_server/schemas/responses.py`
- [x] T014 [US1] Implement add_task tool in `backend/src/mcp_server/tools/add_task.py`
- [x] T015 [US1] Add title validation (1-255 chars) in `backend/src/mcp_server/tools/add_task.py`
- [x] T016 [US1] Add user ownership enforcement in `backend/src/mcp_server/tools/add_task.py`
- [x] T017 [US1] Add structured error responses for INVALID_INPUT in `backend/src/mcp_server/tools/add_task.py`
- [x] T018 [US1] Add logging for task creation in `backend/src/mcp_server/tools/add_task.py`
- [x] T019 [US1] Register add_task tool in `backend/src/mcp_server/tools/__init__.py`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View All Tasks via AI (Priority: P1)

**Goal**: Implement the `list_tasks` MCP tool that retrieves user's tasks with optional status filter

**Independent Test**: User can invoke list_tasks tool and receives only their own tasks, with correct filtering by status (active/completed/all)

### Implementation for User Story 2

- [x] T020 [P] [US2] Create ListTasksInput schema in `backend/src/mcp_server/schemas/requests.py`
- [x] T021 [US2] Implement list_tasks tool in `backend/src/mcp_server/tools/list_tasks.py`
- [x] T022 [US2] Add status filter logic (active/completed/all) in `backend/src/mcp_server/tools/list_tasks.py`
- [x] T023 [US2] Add user ownership enforcement at query level in `backend/src/mcp_server/tools/list_tasks.py`
- [x] T024 [US2] Add structured error responses for DATABASE_ERROR in `backend/src/mcp_server/tools/list_tasks.py`
- [x] T025 [US2] Add logging for task listing in `backend/src/mcp_server/tools/list_tasks.py`
- [x] T026 [US2] Register list_tasks tool in `backend/src/mcp_server/tools/__init__.py`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Update Task Details via AI (Priority: P2)

**Goal**: Implement the `update_task` MCP tool that allows updating task title and/or description

**Independent Test**: User can invoke update_task with task_id and new title/description, task is updated only if owned by user

### Implementation for User Story 3

- [x] T027 [P] [US3] Create UpdateTaskInput schema in `backend/src/mcp_server/schemas/requests.py`
- [x] T028 [US3] Implement update_task tool in `backend/src/mcp_server/tools/update_task.py`
- [x] T029 [US3] Add task existence check with ownership validation in `backend/src/mcp_server/tools/update_task.py`
- [x] T030 [US3] Add partial update logic (only provided fields) in `backend/src/mcp_server/tools/update_task.py`
- [x] T031 [US3] Add TASK_NOT_FOUND error response in `backend/src/mcp_server/tools/update_task.py`
- [x] T032 [US3] Add logging for task updates in `backend/src/mcp_server/tools/update_task.py`
- [x] T033 [US3] Register update_task tool in `backend/src/mcp_server/tools/__init__.py`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Mark Task as Complete via AI (Priority: P2)

**Goal**: Implement the `complete_task` MCP tool that toggles task completion status

**Independent Test**: User can invoke complete_task with task_id, task completion status toggles (complete ↔ incomplete) only if owned by user

### Implementation for User Story 4

- [x] T034 [P] [US4] Create CompleteTaskInput schema in `backend/src/mcp_server/schemas/requests.py`
- [x] T035 [US4] Implement complete_task tool in `backend/src/mcp_server/tools/complete_task.py`
- [x] T036 [US4] Add task existence check with ownership validation in `backend/src/mcp_server/tools/complete_task.py`
- [x] T037 [US4] Add toggle logic (completed = !completed) in `backend/src/mcp_server/tools/complete_task.py`
- [x] T038 [US4] Add idempotent behavior test (completing already completed task) in `backend/src/mcp_server/tools/complete_task.py`
- [x] T039 [US4] Add logging for completion toggle in `backend/src/mcp_server/tools/complete_task.py`
- [x] T040 [US4] Register complete_task tool in `backend/src/mcp_server/tools/__init__.py`

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Delete Task via AI (Priority: P3)

**Goal**: Implement the `delete_task` MCP tool that permanently removes a task

**Independent Test**: User can invoke delete_task with task_id, task is permanently deleted only if owned by user, verified by subsequent list_tasks not showing it

### Implementation for User Story 5

- [x] T041 [P] [US5] Create DeleteTaskInput schema in `backend/src/mcp_server/schemas/requests.py`
- [x] T042 [US5] Implement delete_task tool in `backend/src/mcp_server/tools/delete_task.py`
- [x] T043 [US5] Add task existence check with ownership validation in `backend/src/mcp_server/tools/delete_task.py`
- [x] T044 [US5] Add deletion confirmation response in `backend/src/mcp_server/tools/delete_task.py`
- [x] T045 [US5] Add TASK_NOT_FOUND error response in `backend/src/mcp_server/tools/delete_task.py`
- [x] T046 [US5] Add logging for task deletion in `backend/src/mcp_server/tools/delete_task.py`
- [x] T047 [US5] Register delete_task tool in `backend/src/mcp_server/tools/__init__.py`

**Checkpoint**: All 5 user stories should now be independently functional

---

## Phase 8: Integration & API Exposure

**Purpose**: Expose MCP tools via FastAPI endpoints and integrate with existing backend

- [x] T048 [P] Add MCP invoke endpoint to `backend/src/main.py`
- [x] T049 [P] Add CORS configuration for MCP endpoint in `backend/src/main.py`
- [x] T050 Integrate JWT authentication with MCP endpoint in `backend/src/main.py`
- [x] T051 Add MCP server health check endpoint in `backend/src/main.py`
- [x] T052 Update API documentation (Swagger/ReDoc) with MCP endpoints

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T053 [P] Add comprehensive error handling documentation in `specs/001-mcp-tool-server/ERRORS.md`
- [ ] T054 [P] Update `specs/001-mcp-tool-server/quickstart.md` with implementation examples
- [ ] T055 Add MCP server README in `backend/src/mcp_server/README.md`
- [ ] T056 [P] Add structured logging for all tool invocations across all tools
- [ ] T057 Security review: verify all tools enforce user ownership
- [ ] T058 Performance review: verify database queries are optimized
- [ ] T059 Add MCP tool invocation examples in `specs/001-mcp-tool-server/EXAMPLES.md`
- [ ] T060 Run quickstart.md validation and update if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Integration (Phase 8)**: Depends on all user stories completion
- **Polish (Phase 9)**: Depends on all user stories completion

### User Story Dependencies

- **User Story 1 - Add Task (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 - List Tasks (P1)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 - Update Task (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 - Complete Task (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3
- **User Story 5 - Delete Task (P3)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Models/schemas marked [P] can run in parallel
- Tool implementation depends on schemas
- Validation and error handling depend on tool implementation
- Logging depends on tool implementation
- Registration depends on tool completion

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T005 can run in parallel
- **Phase 2 (Foundational)**: T006, T007, T008, T010 can run in parallel
- **Phase 3 (US1)**: T012, T013 can run in parallel
- **Phase 4 (US2)**: T020 can run in parallel
- **Phase 5 (US3)**: T027 can run in parallel
- **Phase 6 (US4)**: T034 can run in parallel
- **Phase 7 (US5)**: T041 can run in parallel
- **Phase 8 (Integration)**: T048, T049 can run in parallel
- **Phase 9 (Polish)**: T053, T054, T056, T059 can run in parallel

### With Multiple Developers

With 2 developers:
- Dev A: Phases 1-2 (Setup + Foundation)
- Dev B: Phase 3 (US1 - Add Task)
- Then: Dev A on US2, Dev B on US3 (parallel)
- Then: Dev A on US4, Dev B on US5 (parallel)
- Both: Phase 8-9 (Integration + Polish)

With 3+ developers:
- All user stories (Phases 3-7) can be implemented in parallel after Foundation

---

## Parallel Example: User Story 1

```bash
# Launch all schema tasks for User Story 1 together:
Task: "T012 [P] [US1] Create AddTaskInput schema in backend/src/mcp_server/schemas/requests.py"
Task: "T013 [P] [US1] Add TaskData to output schema in backend/src/mcp_server/schemas/responses.py"

# Then implement tool:
Task: "T014 [US1] Implement add_task tool in backend/src/mcp_server/tools/add_task.py"

# Then add validation, error handling, logging (sequential):
Task: "T015 [US1] Add title validation in backend/src/mcp_server/tools/add_task.py"
Task: "T016 [US1] Add user ownership enforcement in backend/src/mcp_server/tools/add_task.py"
Task: "T017 [US1] Add structured error responses in backend/src/mcp_server/tools/add_task.py"
Task: "T018 [US1] Add logging for task creation in backend/src/mcp_server/tools/add_task.py"

# Finally register:
Task: "T019 [US1] Register add_task tool in backend/src/mcp_server/tools/__init__.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (add_task tool)
4. **STOP and VALIDATE**: Test add_task tool independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (add_task) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (list_tasks) → Test independently → Deploy/Demo
4. Add User Story 3 (update_task) → Test independently → Deploy/Demo
5. Add User Story 4 (complete_task) → Test independently → Deploy/Demo
6. Add User Story 5 (delete_task) → Test independently → Deploy/Demo
7. Complete Integration phase → Full MCP server operational
8. Complete Polish phase → Production-ready documentation

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (add_task)
   - Developer B: User Story 2 (list_tasks)
   - Developer C: User Story 3 (update_task)
3. Continue with US4 and US5 in parallel
4. Team reconvenes for Integration phase
5. Polish phase can be distributed

---

## Task Summary

**Total Tasks**: 60

**By Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 - Add Task): 8 tasks
- Phase 4 (US2 - List Tasks): 7 tasks
- Phase 5 (US3 - Update Task): 7 tasks
- Phase 6 (US4 - Complete Task): 7 tasks
- Phase 7 (US5 - Delete Task): 7 tasks
- Phase 8 (Integration): 5 tasks
- Phase 9 (Polish): 8 tasks

**Parallel Opportunities**: 15 tasks marked with [P]

**MVP Scope**: Phases 1-3 (19 tasks) - add_task tool operational

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **IMPORTANT**: Existing code uses synchronous SQLAlchemy - all MCP tools must use `SessionLocal()` pattern from `backend/src/db/database.py`
- **IMPORTANT**: Reuse `AuthService.get_current_user()` for JWT verification - don't create new auth logic
