# Tasks: Task Search and Filtering

**Input**: Design documents from `/specs/001-task-search-filter/`
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
- [X] T003 [P] Verify database has priority and tags columns (from previous migration)
- [X] T004 Create frontend filter components directory: frontend/todo-app/app/components/task/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Update GET /api/tasks endpoint signature: backend/src/api/tasks.py
  - Add search query parameter (Optional[str], max_length=100)
  - Add status query parameter (Optional[str])
  - Add priority query parameter (Optional[str])
  - Add tag query parameter (Optional[List[str]])
  - Keep existing authentication dependency
- [X] T006 [P] Implement search query validation: backend/src/api/tasks.py
  - Trim whitespace from search query
  - Validate max length (100 characters)
  - Escape special SQL characters (%, _, \)
  - Return 400 error if invalid
- [X] T007 [P] Implement filter value validation: backend/src/api/tasks.py
  - Validate status: must be 'completed' or 'pending'
  - Validate priority: must be 'high', 'medium', or 'low'
  - Return 400 error for invalid values

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search Tasks by Keyword (Priority: P1) 🎯 MVP

**Goal**: Users can search for tasks by entering keywords that match task titles or descriptions

**Independent Test**: Can be fully tested by entering a search keyword and verifying that only tasks with matching titles or descriptions are displayed.

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement search query logic: backend/src/api/tasks.py
  - Use SQL ILIKE for case-insensitive substring matching
  - Search both title and description fields (OR logic)
  - Combine with user_id filter (AND logic)
  - Use parameterized queries to prevent SQL injection
- [X] T009 [P] [US1] Create SearchBar component: frontend/todo-app/app/components/task/SearchBar.tsx
  - Text input field with placeholder "Search tasks..."
  - Controlled component with value prop
  - onChange handler for parent component
  - Clear button (X) when value exists
  - Max length 100 characters
  - Debounced input (optional, 300ms)
- [X] T010 [US1] Integrate SearchBar in dashboard: frontend/todo-app/app/dashboard/page.tsx
  - Add SearchBar component to page
  - Add search state (useState)
  - Pass search value to API call
  - Update results when search changes
- [X] T011 [US1] Implement empty search state: frontend/todo-app/app/dashboard/page.tsx
  - Show all tasks when search is empty
  - Clear search on X button click
  - Maintain focus after clear

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- User can type search keyword
- Results update dynamically
- Case-insensitive matching works
- Empty search shows all tasks

---

## Phase 4: User Story 2 - Filter Tasks by Attributes (Priority: P2)

**Goal**: Users can filter their task list by status, priority, and tags

**Independent Test**: Can be tested by applying one or more filters and verifying only tasks matching all filter criteria are displayed.

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement status filter logic: backend/src/api/tasks.py
  - Filter by completed status (True/False)
  - Map 'completed' to True, 'pending' to False
  - Combine with other filters (AND logic)
- [X] T013 [P] [US2] Implement priority filter logic: backend/src/api/tasks.py
  - Filter by exact priority match
  - Combine with other filters (AND logic)
- [X] T014 [P] [US2] Implement tag filter logic: backend/src/api/tasks.py
  - Use PostgreSQL ANY() operator for array membership
  - Support multiple tag filters (AND logic)
  - Combine with other filters (AND logic)
- [X] T015 [P] [US2] Create StatusFilter component: frontend/todo-app/app/components/task/StatusFilter.tsx
  - Dropdown select with options: All Status, Pending, Completed
  - Controlled component with value prop
  - onChange handler for parent component
- [X] T016 [P] [US2] Create PriorityFilter component: frontend/todo-app/app/components/task/PriorityFilter.tsx
  - Dropdown select with options: All Priorities, High, Medium, Low
  - Include emoji indicators (🔴🟡🟢)
  - Controlled component with value prop
  - onChange handler for parent component
- [X] T017 [P] [US2] Create TagFilter component: frontend/todo-app/app/components/task/TagFilter.tsx
  - Dropdown or input for tag selection
  - Optional: autocomplete from existing tags
  - Controlled component with value prop
  - onChange handler for parent component
- [X] T018 [US2] Integrate filter components in dashboard: frontend/todo-app/app/dashboard/page.tsx
  - Add StatusFilter, PriorityFilter, TagFilter components
  - Add filter state for each filter
  - Pass filter values to API call
  - Update results when filters change
- [X] T019 [US2] Implement AND logic for multiple filters: frontend/todo-app/app/dashboard/page.tsx
  - Combine all filter values in API call
  - All filters must match (AND logic)
  - Update results dynamically

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- User can filter by status
- User can filter by priority
- User can filter by tags
- Multiple filters combine with AND logic

---

## Phase 5: User Story 3 - Combined Search and Filtering (Priority: P3)

**Goal**: Users can combine keyword search with attribute filters to precisely locate tasks

**Independent Test**: Can be tested by applying search keyword and multiple filters simultaneously, verifying only tasks matching all criteria are displayed.

### Implementation for User Story 3

- [X] T020 [P] [US3] Combine search and filters in API: backend/src/api/tasks.py
  - Build dynamic WHERE clause with all parameters
  - Search + all filters use AND logic
  - Maintain parameterized queries
  - Sort by created_at DESC
- [X] T021 [P] [US3] Create FilterBar component: frontend/todo-app/app/components/task/FilterBar.tsx
  - Combines all filter components
  - Displays active filter count
  - Provides "Clear All" button
- [X] T022 [US3] Implement clear all functionality: frontend/todo-app/app/dashboard/page.tsx
  - Clear all filters with one action
  - Reset all state to defaults
  - Re-fetch all tasks
- [X] T023 [US3] Display active filter count: frontend/todo-app/app/dashboard/page.tsx
  - Show number of active filters
  - Visual indicator (badge or text)
  - Update dynamically
- [X] T024 [US3] Implement empty results state: frontend/todo-app/app/dashboard/page.tsx
  - Show helpful message when no tasks match
  - Suggest clearing filters
  - Provide "Clear All Filters" button
- [X] T025 [US3] Maintain filter state during session: frontend/todo-app/app/dashboard/page.tsx
  - Filters persist during page session
  - Optional: persist in localStorage (enhancement)
  - Reset on page refresh

**Checkpoint**: All user stories should now be independently functional
- Search and filters work together
- AND logic applies to all criteria
- Clear all works correctly
- Empty state displays properly

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T026 [P] Add comprehensive error handling: backend/src/api/tasks.py
  - Specific error codes for validation errors
  - User-friendly error messages
  - Log validation failures
- [ ] T027 [P] Add backend unit tests: backend/tests/unit/test_search_filter.py
  - Test search query validation
  - Test filter validation
  - Test combined search and filters
  - Test user isolation
- [ ] T028 [P] Add integration tests: backend/tests/integration/test_tasks_api.py
  - Test search functionality
  - Test individual filters
  - Test combined filters
  - Test empty results
- [ ] T029 [P] Add frontend component tests: frontend/todo-app/__tests__/components/
  - Test SearchBar rendering and functionality
  - Test StatusFilter rendering and functionality
  - Test PriorityFilter rendering and functionality
  - Test TagFilter rendering and functionality
  - Test FilterBar rendering and functionality
- [ ] T030 [P] Add responsive design checks: frontend/todo-app/app/dashboard/page.tsx
  - Test on mobile (320px width)
  - Test on tablet (768px width)
  - Test on desktop (1920px width)
  - Ensure filters wrap properly on small screens
- [ ] T031 [P] Add accessibility features: frontend/todo-app/app/components/task/
  - ARIA labels on search input
  - ARIA labels on filter dropdowns
  - Keyboard navigation for all controls
  - Color contrast meets WCAG AA
- [ ] T032 Documentation: Update backend README: backend/README.md
  - Document search query parameter
  - Document filter query parameters
  - Add example requests
  - Document validation rules
- [ ] T033 Documentation: Update frontend README: frontend/todo-app/README.md
  - Document SearchBar component
  - Document filter components
  - Document usage examples
  - Add screenshots
- [ ] T034 [P] Performance optimization: backend/src/api/tasks.py
  - Verify indexes are used (EXPLAIN ANALYZE)
  - Test with large task lists (1000+ tasks)
  - Optimize query if needed
  - Add query result caching (optional)
- [ ] T035 [P] Code cleanup: All files
  - Remove console.log statements
  - Fix ESLint warnings
  - Format code with Prettier
  - Remove unused imports
- [ ] T036 [P] TypeScript type checking: Frontend
  - Run tsc --noEmit
  - Fix all type errors
  - Ensure strict mode enabled
  - Add types for filter state

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

- **Phase 1**: T001, T002, T003, T004 can all run in parallel
- **Phase 2**: T005, T006, T007 can all run in parallel (same file, different parameters)
- **Phase 3 (US1)**: T008, T009 can run in parallel; T010-T011 depend on components
- **Phase 4 (US2)**: T012, T013, T014, T015, T016, T017 can all run in parallel; T018-T019 depend on components
- **Phase 5 (US3)**: T020, T021 can run in parallel; T022-T025 depend on integration
- **Phase 6**: T026, T027, T028, T029, T030, T031 can all run in parallel (different test files)

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1:

# Task: Implement search query logic in backend/src/api/tasks.py
# Task: Create SearchBar component in frontend/todo-app/app/components/task/SearchBar.tsx

# These can all be done in parallel (different files, no dependencies)
# Then integrate SearchBar in dashboard (depends on both complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T008-T011)
4. **STOP and VALIDATE**: Test keyword search functionality
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
   - Developer A: User Story 1 (search backend + frontend)
   - Developer B: User Story 2 (filters backend + frontend)
   - Developer C: User Story 3 (combined logic + UI integration)
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

- **Total Tasks**: 36
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (US1 - Search)**: 4 tasks
- **Phase 4 (US2 - Filters)**: 8 tasks
- **Phase 5 (US3 - Combined)**: 6 tasks
- **Phase 6 (Polish)**: 11 tasks

## Independent Test Criteria

- **User Story 1**: Search for "meeting" → Verify only tasks with "meeting" in title/description shown
- **User Story 2**: Filter by status "completed" → Verify only completed tasks shown; Filter by priority "high" → Verify only high priority shown
- **User Story 3**: Search "project" + filter by "high" priority → Verify only high priority tasks with "project" shown; Clear all → Verify all tasks shown

---

## Quick Start

```bash
# 1. Verify database has required columns
psql $DATABASE_URL -c "\d tasks"

# 2. Start backend
cd backend
uvicorn src.main:app --reload

# 3. Start frontend
cd ../frontend/todo-app
npm run dev

# 4. Test search functionality
# Navigate to dashboard, type search keyword

# 5. Test filter functionality
# Apply status, priority, and tag filters

# 6. Test combined search and filters
# Use search + multiple filters together
```
