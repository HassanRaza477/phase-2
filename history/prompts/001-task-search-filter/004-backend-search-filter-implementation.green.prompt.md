---
id: 004
title: Backend Search Filter Implementation
stage: green
date: 2026-03-10
surface: agent
model: qwen-code
feature: 001-task-search-filter
branch: main
user: HASAN RAZA
command: Implement backend Task Search and Filtering API
labels: ["backend", "fastapi", "search", "filter", "sqlmodel"]
links:
  spec: specs/001-task-search-filter/spec.md
  ticket: specs/001-task-search-filter/tasks.md
  adr: null
  pr: null
files:
  - backend/src/api/tasks.py
tests:
  - Manual API testing required
---

## Prompt

Implement the backend portion of the Task Search and Filtering feature following the tasks.md specification.

**Context**: We're extending the Todo application with search and filtering capabilities. The backend API needs to support query parameters for keyword search, status filter, priority filter, and tag filter.

**Tasks to Complete** (from specs/001-task-search-filter/tasks.md):

**Phase 2: Foundational (Backend)**
- T005: Update GET /api/tasks endpoint signature
  - Add search query parameter (Optional[str], max_length=100)
  - Add status query parameter (Optional[str])
  - Add priority query parameter (Optional[str])
  - Add tag query parameter (Optional[List[str]])
  - Keep existing authentication dependency
- T006: Implement search query validation
  - Trim whitespace from search query
  - Validate max length (100 characters)
  - Escape special SQL characters (%, _, \)
  - Return 400 error if invalid
- T007: Implement filter value validation
  - Validate status: must be 'completed' or 'pending'
  - Validate priority: must be 'high', 'medium', or 'low'
  - Return 400 error for invalid values

**Phase 3: User Story 1 (Backend)**
- T008: Implement search query logic
  - Use SQL ILIKE for case-insensitive substring matching
  - Search both title and description fields (OR logic)
  - Combine with user_id filter (AND logic)
  - Use parameterized queries to prevent SQL injection

**Phase 4: User Story 2 (Backend)**
- T012: Implement status filter logic
  - Filter by completed status (True/False)
  - Map 'completed' to True, 'pending' to False
  - Combine with other filters (AND logic)
- T013: Implement priority filter logic
  - Filter by exact priority match
  - Combine with other filters (AND logic)
- T014: Implement tag filter logic
  - Use PostgreSQL ANY() operator for array membership
  - Support multiple tag filters (AND logic)
  - Combine with other filters (AND logic)

**Phase 5: User Story 3 (Backend)**
- T020: Combine search and filters in API
  - Build dynamic WHERE clause with all parameters
  - Search + all filters use AND logic
  - Maintain parameterized queries
  - Sort by created_at DESC

**Technical Requirements**:
- Use SQLModel for database queries
- FastAPI for API endpoints
- PostgreSQL ILIKE for case-insensitive search
- JWT authentication already in place
- User isolation must be maintained
- All filters use AND logic

**Files to Modify**:
- backend/src/api/tasks.py (MODIFY)

**Validation Rules**:
- Search: max 100 chars, trimmed, special chars escaped
- Status: 'completed' or 'pending' only
- Priority: 'high', 'medium', or 'low' only
- Tag: string matching in tags array

**Testing**:
- Test search with various keywords
- Test each filter individually
- Test combined filters
- Test user isolation (can't access other users' tasks)

Return the complete implementation code for the updated tasks.py file.

## Response snapshot

Implemented complete backend search and filtering functionality in `backend/src/api/tasks.py`:

**Key Changes:**
1. Added constants for validation (MAX_SEARCH_LENGTH=100, VALID_STATUSES, VALID_PRIORITIES)
2. Created 4 validation helper functions:
   - `validate_search_query()`: Trims, validates length, escapes SQL special characters (%, _, \)
   - `validate_status_filter()`: Maps 'completed'/'pending' to boolean
   - `validate_priority_filter()`: Validates and normalizes priority values
   - `validate_tag_filters()`: Trims and validates tag arrays
3. Updated GET /tasks endpoint with new query parameters (search, status, priority, tags)
4. Implemented dynamic WHERE clause building with AND logic
5. Used PostgreSQL ILIKE for case-insensitive search on title OR description
6. Used PostgreSQL ARRAY overlap operator (&&) for tag filtering
7. Enhanced response to include pagination and active filters info

## Outcome

- ✅ Impact: Backend API now supports comprehensive task search and filtering with proper validation, SQL injection prevention, and user isolation
- 🧪 Tests: Manual API testing required for all filter combinations
- 📁 Files: 1 file modified (backend/src/api/tasks.py)
- 🔁 Next prompts: Frontend implementation for search bar and filter components
- 🧠 Reflection: Implemented all validation helpers as pure functions for testability; used parameterized queries throughout to prevent SQL injection

## Evaluation notes (flywheel)

- Failure modes observed: None during implementation
- Graders run and results (PASS/FAIL): Not yet run
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add comprehensive unit tests for validation functions
