# Tasks: Task Priorities and Tags

**Input**: Design documents from `/specs/001-task-priority-tags/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification or if user requests TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/todo-app/` at repository root
- Paths shown assume Next.js App Router and FastAPI structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure

- [X] T001 Verify existing task model at backend/src/models/task.py
- [X] T002 [P] Verify existing task schemas at backend/src/models/schemas.py
- [X] T003 [P] Verify existing tasks API at backend/src/api/tasks.py
- [X] T004 [P] Create database migration directory: backend/migrations/
- [X] T005 Create frontend components directory: frontend/todo-app/app/components/task/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create database migration: backend/migrations/003_add_priority_tags_to_tasks.sql
  - Add priority column (VARCHAR(20), default 'medium', NOT NULL)
  - Add tags column (ARRAY(VARCHAR(50)), default [])
  - Add CHECK constraint for priority values
  - Create indexes on priority and tags
- [X] T007 [P] Update Task model: backend/src/models/task.py
  - Add priority field with default value
  - Add tags field as ARRAY column
  - Add CheckConstraint for priority validation
- [X] T008 [P] Update Pydantic schemas: backend/src/models/schemas.py
  - Add priority and tags fields to TaskCreate schema
  - Add priority and tags fields to TaskUpdate schema
  - Add priority and tags fields to TaskResponse schema
  - Add field validators for priority and tags
- [X] T009 Update database: Run migration on Neon PostgreSQL

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Assign Priority to Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can assign priority levels (high, medium, low) to tasks when creating or editing them

**Independent Test**: Can be fully tested by creating a task with a priority level and verifying it displays correctly with a priority badge in the task list.

### Implementation for User Story 1

- [X] T010 [P] [US1] Update POST /api/tasks endpoint: backend/src/api/tasks.py
  - Accept priority field in request body
  - Validate priority value (high/medium/low)
  - Store priority in database
  - Return priority in response
- [X] T011 [P] [US1] Update PUT /api/tasks/{id} endpoint: backend/src/api/tasks.py
  - Accept priority field for updates
  - Validate and update priority
  - Return updated priority in response
- [X] T012 [P] [US1] Create PriorityBadge component: frontend/todo-app/app/components/task/PriorityBadge.tsx
  - Display priority as colored badge
  - Red for high, yellow for medium, green for low
  - Include text label for accessibility
- [X] T013 [P] [US1] Create PrioritySelector component: frontend/todo-app/app/components/task/PrioritySelector.tsx
  - Dropdown select with three options
  - Controlled component with value prop
  - onChange handler for parent component
- [X] T014 [US1] Update Task type definition: frontend/todo-app/types/index.ts
  - Add priority field: 'high' | 'medium' | 'low'
  - Update TaskCreate interface
- [X] T015 [US1] Update task creation form: frontend/todo-app/app/dashboard/page.tsx
  - Add PrioritySelector to form
  - Include priority in API request
  - Handle default value (medium)
- [X] T016 [US1] Update task edit form: frontend/todo-app/app/dashboard/page.tsx
  - Add PrioritySelector for editing
  - Load current priority value
  - Update priority on save
- [X] T017 [US1] Display priority badges in task list: frontend/todo-app/app/dashboard/page.tsx
  - Render PriorityBadge on each task card
  - Position next to task title
  - Ensure responsive layout

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- User can create task with priority
- Priority displays as colored badge
- Priority can be updated
- Default priority is medium

---

## Phase 4: User Story 2 - Add Tags to Tasks (Priority: P2)

**Goal**: Users can attach one or more tags to tasks for better organization

**Independent Test**: Can be tested by creating a task with multiple tags and verifying all tags are displayed and can be used for filtering.

### Implementation for User Story 2

- [X] T018 [P] [US2] Update POST /api/tasks endpoint: backend/src/api/tasks.py
  - Accept tags array in request body
  - Validate tags (max 10, max 50 chars each)
  - Remove duplicates automatically
  - Store tags in database
  - Return tags in response
- [X] T019 [P] [US2] Update PUT /api/tasks/{id} endpoint: backend/src/api/tasks.py
  - Accept tags array for updates
  - Validate and update tags
  - Return updated tags in response
- [X] T020 [P] [US2] Create TagBadge component: frontend/todo-app/app/components/task/TagBadge.tsx
  - Display tag as rounded badge
  - Gray background with dark text
  - Small font size (text-xs)
- [X] T021 [P] [US2] Create TagsInput component: frontend/todo-app/app/components/task/TagsInput.tsx
  - Multi-tag input with Enter key to add
  - Display existing tags as badges
  - Remove tag on click
  - Validate max 10 tags
  - Prevent duplicates
- [X] T022 [US1] Update Task type definition: frontend/todo-app/types/index.ts
  - Add tags field: string[]
  - Update TaskCreate interface
- [X] T023 [US2] Update task creation form: frontend/todo-app/app/dashboard/page.tsx
  - Add TagsInput to form
  - Include tags in API request
  - Handle empty tags array
- [X] T024 [US2] Update task edit form: frontend/todo-app/app/dashboard/page.tsx
  - Add TagsInput for editing
  - Load current tags
  - Update tags on save
- [X] T025 [US2] Display tag badges in task list: frontend/todo-app/app/dashboard/page.tsx
  - Render all tags (up to 10) as badges
  - Wrap in flex container
  - Show "+X more" if more than 3 tags (optional)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- User can create task with tags
- All tags display as badges
- Tags can be added/removed
- Validation prevents duplicates and enforces limits

---

## Phase 5: User Story 3 - Filter Tasks by Priority and Tags (Priority: P3)

**Goal**: Users can filter their task list by priority level and/or tags

**Independent Test**: Can be tested by applying filters and verifying only matching tasks are displayed.

### Implementation for User Story 3

- [X] T026 [P] [US3] Update GET /api/tasks endpoint: backend/src/api/tasks.py
  - Accept priority query parameter
  - Accept tag query parameter (multiple allowed)
  - Build dynamic query with filters
  - Return filtered task list
- [X] T027 [P] [US3] Create PriorityFilter component: frontend/todo-app/app/components/task/PriorityFilter.tsx
  - Dropdown with "All Priorities" + three options
  - Controlled component
  - onChange triggers filter update
- [X] T028 [P] [US3] Create TagFilter component: frontend/todo-app/app/components/task/TagFilter.tsx
  - Input field for tag filter
  - Optional: autocomplete from existing tags
  - Controlled component
- [X] T029 [US3] Add filter state to dashboard: frontend/todo-app/app/dashboard/page.tsx
  - State for filterPriority
  - State for filterTag
  - Update filters on change
- [X] T030 [US3] Implement filter logic: frontend/todo-app/app/dashboard/page.tsx
  - Call API with filter query parameters
  - Re-fetch tasks when filters change
  - Clear filters button
- [X] T031 [US3] Display active filters: frontend/todo-app/app/dashboard/page.tsx
  - Show which filters are active
  - Visual indicator of filtered state
  - Easy way to clear all filters
- [X] T032 [US3] Handle empty results: frontend/todo-app/app/dashboard/page.tsx
  - Show empty state message
  - Suggest clearing filters
  - Maintain helpful tone

**Checkpoint**: All user stories should now be independently functional
- Filter by priority works
- Filter by tag works
- Combined filters work (AND logic)
- Empty results handled gracefully

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T033 [P] Add comprehensive error handling: backend/src/api/tasks.py
  - Specific error codes for validation errors
  - User-friendly error messages
  - Log validation failures
- [ ] T034 [P] Add backend unit tests: backend/tests/unit/test_priority_tags.py
  - Test priority validation
  - Test tags validation
  - Test filtering logic
- [ ] T035 [P] Add integration tests: backend/tests/integration/test_tasks_api.py
  - Test create task with priority and tags
  - Test update priority and tags
  - Test filtering by priority and tags
- [ ] T036 [P] Add frontend component tests: frontend/todo-app/__tests__/components/
  - Test PriorityBadge rendering
  - Test TagsInput functionality
  - Test filter components
- [ ] T037 [P] Add responsive design checks: frontend/todo-app/app/dashboard/page.tsx
  - Test on mobile (320px width)
  - Test on tablet (768px width)
  - Test on desktop (1920px width)
- [ ] T038 [P] Add accessibility features: frontend/todo-app/app/components/task/
  - ARIA labels on badges
  - Keyboard navigation for tag removal
  - Color contrast meets WCAG AA
- [ ] T039 Documentation: Update backend README: backend/README.md
  - Document priority and tags fields
  - Document filtering query parameters
  - Add example requests
- [ ] T040 Documentation: Update frontend README: frontend/todo-app/README.md
  - Document new components
  - Document usage examples
  - Add screenshots
- [ ] T041 [P] Performance optimization: backend/src/api/tasks.py
  - Verify indexes are used
  - Test with large task lists
  - Optimize filter queries if needed
- [ ] T042 [P] Code cleanup: All files
  - Remove console.log statements
  - Fix ESLint warnings
  - Format code with Prettier
- [ ] T043 [P] TypeScript type checking: Frontend
  - Run tsc --noEmit
  - Fix all type errors
  - Ensure strict mode enabled

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

- Backend endpoints before frontend components
- Components before integration
- Integration before polish

### Parallel Opportunities

- **Phase 1**: T001, T002, T003, T004, T005 can all run in parallel
- **Phase 2**: T006, T007, T008 can run in parallel (different files)
- **Phase 3 (US1)**: T010, T011, T012, T013 can run in parallel; T014-T017 depend on components
- **Phase 4 (US2)**: T018, T019, T020, T021 can run in parallel; T022-T025 depend on components
- **Phase 5 (US3)**: T026, T027, T028 can run in parallel; T029-T032 depend on filter logic
- **Phase 6**: T033, T034, T035, T036, T037, T038 can all run in parallel (different test files)

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1:

# Task: Update POST endpoint in backend/src/api/tasks.py
# Task: Update PUT endpoint in backend/src/api/tasks.py
# Task: Create PriorityBadge in frontend/todo-app/app/components/task/PriorityBadge.tsx
# Task: Create PrioritySelector in frontend/todo-app/app/components/task/PrioritySelector.tsx

# These can all be done in parallel (different files, no dependencies)
# Then integrate components in dashboard (depends on all components complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T009) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T010-T017)
4. **STOP and VALIDATE**: Test priority creation and display
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish features → Test → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (priority backend + frontend)
   - Developer B: User Story 2 (tags backend + frontend)
   - Developer C: User Story 3 (filtering backend + frontend)
3. Stories complete and integrate independently
4. Team completes Polish features together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Task Summary

- **Total Tasks**: 43
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (US1 - Priority)**: 8 tasks
- **Phase 4 (US2 - Tags)**: 8 tasks
- **Phase 5 (US3 - Filtering)**: 7 tasks
- **Phase 6 (Polish)**: 11 tasks

## Independent Test Criteria

- **User Story 1**: Create task with "high" priority → Verify red badge displays → Update to "low" → Verify green badge displays
- **User Story 2**: Create task with tags ["work", "urgent"] → Verify both tags display → Try to add duplicate → Verify prevented
- **User Story 3**: Filter by "high" priority → Verify only high priority tasks shown → Add tag filter → Verify both filters apply

---

## Quick Start

```bash
# 1. Run database migration
cd backend
psql $DATABASE_URL -f migrations/002_add_priority_tags_to_tasks.sql

# 2. Start backend
uvicorn src.main:app --reload

# 3. Start frontend
cd ../frontend/todo-app
npm run dev

# 4. Test priority feature
# Navigate to dashboard, create task, select priority

# 5. Test tags feature
# Add tags to task, verify display

# 6. Test filtering
# Apply filters, verify results
```
