# Implementation Plan: Task Search and Filtering

**Branch**: `001-task-search-filter` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-search-filter/spec.md`

## Summary

Enable users to quickly locate tasks by adding search and filtering capabilities to the Todo application. The implementation extends the task listing API with query parameters for keyword search, status filter, priority filter, and tag filter. The frontend UI is updated with search input and filter dropdowns that dynamically update the task list. All operations maintain user isolation and JWT authentication.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.11 (Backend)
**Primary Dependencies**: 
- Backend: FastAPI, SQLModel, Neon PostgreSQL
- Frontend: Next.js 16+, React 18+, Tailwind CSS 4.x
**Storage**: Neon Serverless PostgreSQL (existing database with priority and tags columns)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (desktop and mobile responsive)
**Project Type**: Full-stack web application enhancement
**Performance Goals**: 
- Search results displayed within 1 second for 100% of queries
- Filter operations complete within 1 second for 100% of changes
- Support 100+ concurrent users
**Constraints**: 
- Search limited to 100 characters
- Case-insensitive substring matching
- JWT authentication required for all operations
- User isolation enforced at database level
- Multiple filters use AND logic
**Scale/Scope**: Enhancement to existing multi-user todo application with priority and tags support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Spec-First Engineering ✅
- Implementation follows approved specification (spec.md created and validated)
- All requirements traced to user stories (3 stories, 16 functional requirements)

### Gate 2: Deterministic Generation ✅
- Search and filter behavior determined by explicit validation rules
- API contracts ensure consistent request/response format
- Same search query yields identical results

### Gate 3: Security by Design ✅
- JWT authentication required for all task operations
- User identity derived from verified token
- Task ownership enforced at database query level
- Search and filters scoped to authenticated user only

### Gate 4: Separation of Concerns ✅
- Backend handles search/filter query building and database queries
- Frontend handles UI display and user interaction
- Clear interfaces: UI components → API service → backend endpoints → database

### Gate 5: Reproducibility ✅
- Component rendering deterministic based on state
- Search and filter state persists during session
- No reliance on ephemeral client-side state for critical data

### Gate 6: Traceability ✅
- All features map to spec requirements (FR-001 through FR-016)
- Clear lineage from user stories to components and endpoints

### Gate 7: Tool-First AI Design ✅
- N/A - This feature does not involve AI agent functionality
- Standard CRUD operations through defined API endpoints

### Gate 8: Stateless Server Architecture ✅
- Backend remains stateless
- All task data stored in database
- Each API request includes authentication and is independently executable

### Gate 9: Strict User Isolation ✅
- JWT ensures user identity
- All task queries filtered by user_id
- No cross-user task access possible

### Gate 10: No Hidden Side Effects ✅
- All API calls explicit and traceable
- No side effects outside declared search/filter operations
- State changes visible through React state management

**GATE STATUS**: All gates pass. Proceeding to Phase 0 research.

## Phase 0: Research

**Status**: ✅ Complete

**Artifacts**:
- `research.md` - All technical decisions resolved

**Key Decisions**:
1. Search implemented using SQL ILIKE for case-insensitive substring matching
2. Filters implemented as dynamic WHERE clauses in SQL query
3. Multiple filters combined with AND logic
4. Search query limited to 100 characters, trimmed whitespace
5. Special characters escaped to prevent SQL injection
6. Results sorted by created_at descending (most recent first)
7. Empty search shows all tasks (no implicit filtering)
8. Filter state maintained in React state (not persisted)
9. PostgreSQL indexes on status, priority, and tags for query performance
10. Frontend uses controlled components for search and filters

All constitution gates re-validated post-research. No violations.

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Artifacts**:
- `data-model.md` - Search and filter query patterns
- `contracts/api-contracts.md` - Updated GET /api/tasks endpoint with query parameters
- `quickstart.md` - Implementation guide with code examples

**Data Model Summary**:
- **Task**: Existing model with search on title/description fields
- **Search Query**: String (max 100 chars), case-insensitive ILIKE matching
- **Filters**: status (completed/pending), priority (high/medium/low), tag (string match in array)
- Query combines search + filters with AND logic

**API Contract Summary**:
- **GET /api/tasks**: Accepts query parameters: search, status, priority, tag
- Query parameters are optional and composable
- Response includes filtered task list
- Empty array returned when no matches

**Constitution Re-Check Post-Design**:

### Gate 1: Spec-First Engineering ✅
- Design derived from approved spec.md
- All requirements traced to API contracts and UI components

### Gate 2: Deterministic Generation ✅
- Component props and state clearly defined
- API contracts ensure consistent behavior

### Gate 3: Security by Design ✅
- Search and filter validated server-side
- User ownership enforced on all operations
- No client-side trust for validation

### Gate 4: Separation of Concerns ✅
- Backend: query building, database queries
- Frontend: UI display, user input
- Clear separation of concerns maintained

### Gate 5: Reproducibility ✅
- Component rendering based on props/state only
- No random or non-deterministic behavior

### Gate 6: Traceability ✅
- FR-001 to FR-005 → search input and matching
- FR-006 to FR-010 → filter controls and AND logic
- FR-011 to FR-016 → UI updates and user isolation

### Gate 7: Tool-First AI Design ✅
- N/A - No AI involvement

### Gate 8: Stateless Server Architecture ✅
- Backend stateless
- All data in database

### Gate 9: Strict User Isolation ✅
- JWT ensures user identity
- No cross-user access

### Gate 10: No Hidden Side Effects ✅
- All operations explicit
- State changes through API

**GATE STATUS**: All gates pass post-design. Ready for Phase 2 (Tasks).

## Phase 2: Tasks

**Status**: ⏳ Pending

**Next Command**: `/sp.tasks` to break implementation into testable tasks

## Project Structure

### Documentation (this feature)

```text
specs/001-task-search-filter/
├── spec.md                  # Feature specification
├── plan.md                  # This implementation plan
├── research.md              # Phase 0: Technical decisions
├── data-model.md            # Phase 1: Search and filter query patterns
├── quickstart.md            # Phase 1: Implementation guide
├── contracts/
│   └── api-contracts.md     # Phase 1: API contracts
└── checklists/
    └── requirements.md      # Spec quality checklist
```

### Source Code Changes

**Backend**:
```text
backend/src/
├── api/
│   └── tasks.py             # Updated GET /api/tasks with query parameters
└── migrations/
    └── (existing - no new migration needed)
```

**Frontend**:
```text
frontend/todo-app/
├── app/
│   └── dashboard/
│       └── page.tsx         # Updated with search input and filter dropdowns
├── components/
│   └── task/
│       ├── SearchBar.tsx         # New component
│       ├── StatusFilter.tsx      # New component
│       ├── PriorityFilter.tsx    # New component
│       ├── TagFilter.tsx         # New component
│       └── FilterBar.tsx         # New component (combines all filters)
└── types/
    └── index.ts             # No changes (using existing Task type)
```

**Structure Decision**: Minimal invasive changes - only update existing files and add necessary new components. No database schema changes required (uses existing columns).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations - all gates passed | N/A |
