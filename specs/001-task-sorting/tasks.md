# Tasks: Task Sorting

**Input**: Design documents from `/specs/001-task-sorting/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, contracts/, quickstart.md

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

- [X] T001 Verify existing tasks API at backend/src/api/tasks.py
- [X] T002 [P] Verify existing Task model at backend/src/models/task.py
- [X] T003 [P] Verify database has all sortable columns (due_date, priority, title, created_at)
- [X] T004 Create frontend sort component directory: frontend/todo-app/app/components/task/ (if not exists)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Define sort option enum: backend/src/api/tasks.py
  - Create VALID_SORTS list: ["due_date", "priority", "alphabetical", "created_at"]
  - Define DEFAULT_SORT = "created_at"
- [X] T006 [P] Define SortOption type: frontend/todo-app/types/index.ts
  - Create type: `type SortOption = 'due_date' | 'priority' | 'alphabetical' | 'created_at'`
  - Export type for use in components

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Sort Tasks by Different Criteria (Priority: P1) 🎯 MVP

**Goal**: Users can sort their task list by due date, priority, title, and creation date

**Independent Test**: Can be fully tested by selecting a sort option and verifying that tasks are displayed in the correct order.

### Implementation for User Story 1

- [X] T007 [P] [US1] Add sort query parameter to GET /api/tasks: backend/src/api/tasks.py
  - Add sort parameter with default value
  - Validate sort parameter against VALID_SORTS enum
  - Default to created_at for invalid/missing values
- [X] T008 [P] [US1] Implement due_date sorting logic: backend/src/api/tasks.py
  - Use SQL ORDER BY due_date ASC NULLS LAST
  - Apply secondary sort by created_at DESC
  - Combine with existing search and filter logic
- [X] T009 [P] [US1] Implement priority sorting logic: backend/src/api/tasks.py
  - Use SQL CASE statement for priority order (high=1, medium=2, low=3)
  - Apply secondary sort by created_at DESC
  - Combine with existing search and filter logic
- [X] T010 [P] [US1] Implement alphabetical sorting logic: backend/src/api/tasks.py
  - Use SQL ORDER BY title ASC
  - Apply secondary sort by created_at DESC
  - Combine with existing search and filter logic
- [X] T011 [P] [US1] Implement created_at sorting logic: backend/src/api/tasks.py
  - Use SQL ORDER BY created_at DESC
  - This is the default sort
  - Combine with existing search and filter logic
- [X] T012 [P] [US1] Create SortSelector component: frontend/todo-app/app/components/task/SortSelector.tsx
  - Dropdown select with 4 options (Due Date, Priority, Alphabetical, Recently Created)
  - Controlled component with value prop
  - onChange handler for parent component
  - Include icons/emojis for visual clarity
  - Responsive design
- [X] T013 [US1] Integrate SortSelector in dashboard: frontend/todo-app/app/dashboard/page.tsx
  - Add SortSelector component to page
  - Add sort state (useState)
  - Pass sort value to API call
  - Update results when sort changes
- [X] T014 [US1] Display current sort option: frontend/todo-app/app/dashboard/page.tsx
  - Highlight selected sort option in dropdown
  - Visual indication of active sort

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- User can select sort option from dropdown
- Results update dynamically when sort changes
- All 4 sort options work correctly
- Default sort is created_at (newest first)

---

## Phase 4: User Story 2 - Sort Control and Persistence (Priority: P2)

**Goal**: Users can easily access and change the sort option, and preference is maintained during session

**Independent Test**: Can be tested by selecting a sort option, navigating away and back, and verifying the sort preference is maintained.

### Implementation for User Story 2

- [X] T015 [P] [US2] Implement sort state persistence: frontend/todo-app/app/dashboard/page.tsx
  - Maintain sort state in React useState
  - State persists during component lifecycle
  - Reset to default on page refresh
- [X] T016 [P] [US2] Handle invalid sort parameters: backend/src/api/tasks.py
  - Validate sort parameter on backend
  - Default to created_at for invalid values
  - Optional: log invalid sort parameters for monitoring
- [X] T017 [US2] Combine sort with search and filters: backend/src/api/tasks.py
  - Ensure sort works with existing search functionality
  - Ensure sort works with existing filter functionality
  - Test combined queries with all parameters
- [X] T018 [US2] Combine sort with search and filters: frontend/todo-app/app/dashboard/page.tsx
  - Update API call to include sort with other filters
  - Ensure sort state works with filter state
  - Test UI with all filters and sort active
- [X] T019 [US2] Handle empty task list: frontend/todo-app/app/dashboard/page.tsx
  - Show empty state message when no tasks
  - Sort selector still visible and functional
  - Helpful message suggesting to create tasks
- [X] T020 [US2] Handle null due dates: backend/src/api/tasks.py
  - Use NULLS LAST for due_date sorting
  - Tasks without due dates appear at end
  - Verify in database query

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Sort control is accessible and intuitive
- Sort preference persists during session
- Invalid parameters handled gracefully
- Sort works with all existing features

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T021 [P] Add comprehensive error handling: backend/src/api/tasks.py
  - Specific error codes for validation errors
  - User-friendly error messages
  - Log invalid sort parameters
- [ ] T022 [P] Add backend unit tests: backend/tests/unit/test_sorting.py
  - Test each sort option
  - Test default sort for missing parameter
  - Test default sort for invalid parameter
  - Test sort with null due dates
  - Test secondary sort for equal values
- [ ] T023 [P] Add integration tests: backend/tests/integration/test_tasks_api.py
  - Test sorting with search
  - Test sorting with filters
  - Test sorting with combined parameters
  - Test sort performance with large datasets
- [ ] T024 [P] Add frontend component tests: frontend/todo-app/__tests__/components/
  - Test SortSelector rendering
  - Test SortSelector functionality
  - Test sort state management
  - Test sort with filters
- [ ] T025 [P] Add responsive design checks: frontend/todo-app/app/components/task/SortSelector.tsx
  - Test on mobile (320px width)
  - Test on tablet (768px width)
  - Test on desktop (1920px width)
  - Ensure dropdown works on all screen sizes
- [ ] T026 [P] Add accessibility features: frontend/todo-app/app/components/task/SortSelector.tsx
  - ARIA labels on dropdown
  - Keyboard navigation support
  - Color contrast meets WCAG AA
  - Screen reader friendly
- [ ] T027 Documentation: Update backend README: backend/README.md
  - Document sort query parameter
  - Document valid sort values
  - Document default sort behavior
  - Add example requests
- [ ] T028 Documentation: Update frontend README: frontend/todo-app/README.md
  - Document SortSelector component
  - Document sort state management
  - Document usage examples
  - Add screenshots
- [ ] T029 [P] Performance optimization: backend/src/api/tasks.py
  - Verify indexes are used (EXPLAIN ANALYZE)
  - Test with large task lists (1000+ tasks)
  - Optimize query if needed
  - Verify secondary sort performance
- [ ] T030 [P] Code cleanup: All files
  - Remove console.log statements
  - Fix ESLint warnings
  - Format code with Prettier
  - Remove unused imports
- [ ] T031 [P] TypeScript type checking: Frontend
  - Run tsc --noEmit
  - Fix all type errors
  - Ensure strict mode enabled
  - Add types for sort state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1

### Within Each User Story

- Backend endpoints before frontend components
- Components before integration
- Integration before polish

### Parallel Opportunities

- **Phase 1**: T001, T002, T003, T004 can all run in parallel
- **Phase 2**: T005, T006 can run in parallel (different files)
- **Phase 3 (US1)**: T007, T008, T009, T010, T011, T012 can all run in parallel; T013-T014 depend on components
- **Phase 4 (US2)**: T015, T016 can run in parallel; T017-T020 depend on integration
- **Phase 5**: T021, T022, T023, T024, T025, T026 can all run in parallel (different test files)

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1:

# Task: Add sort query parameter in backend/src/api/tasks.py
# Task: Implement due_date sorting logic in backend/src/api/tasks.py
# Task: Implement priority sorting logic in backend/src/api/tasks.py
# Task: Implement alphabetical sorting logic in backend/src/api/tasks.py
# Task: Implement created_at sorting logic in backend/src/api/tasks.py
# Task: Create SortSelector component in frontend/todo-app/app/components/task/SortSelector.tsx

# These can all be done in parallel (different files, no dependencies)
# Then integrate SortSelector in dashboard (depends on all components complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T006) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T007-T014)
4. **STOP and VALIDATE**: Test all 4 sort options
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Polish features → Test → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend sorting logic)
   - Developer B: User Story 1 (frontend SortSelector component)
   - Developer C: User Story 2 (integration with search/filters)
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

- **Total Tasks**: 31
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (US1 - Sort Options)**: 8 tasks
- **Phase 4 (US2 - Control & Persistence)**: 6 tasks
- **Phase 5 (Polish)**: 11 tasks

## Independent Test Criteria

- **User Story 1**: Select "Due Date" sort → Verify tasks ordered by due date (earliest first, nulls last); Select "Priority" sort → Verify tasks ordered high to low; Select "Alphabetical" → Verify A-Z order; Select "Recently Created" → Verify newest first
- **User Story 2**: Select sort option → Refresh page → Verify sort resets to default; Select sort → Apply filter → Verify both work together; Pass invalid sort param → Verify defaults to created_at

---

## Quick Start

```bash
# 1. Verify database has sortable columns
psql $DATABASE_URL -c "\d tasks"

# 2. Start backend
cd backend
uvicorn src.main:app --reload

# 3. Start frontend
cd ../frontend/todo-app
npm run dev

# 4. Test sorting functionality
# Navigate to dashboard, select different sort options

# 5. Test combined with search and filters
# Apply search, filters, and sort together
```
