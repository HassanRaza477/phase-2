# Implementation Plan: Task Sorting

**Branch**: `001-task-sorting` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-sorting/spec.md`

## Summary

Allow users to organize their tasks by sorting them using different criteria to improve usability and task management. The implementation extends the task listing API with a sort query parameter and updates the frontend UI with a sort selector dropdown. Sorting is performed at the database level for optimal performance, with user isolation maintained throughout.

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
- Sort operations complete within 1 second for 100% of requests
- Support 100+ concurrent users
- Database-level sorting for optimal performance
**Constraints**: 
- Sort parameter validation (enum values only)
- Default to creation date descending for invalid/missing values
- JWT authentication required for all operations
- User isolation enforced at database level
- Null values handled gracefully (nulls last)
**Scale/Scope**: Enhancement to existing multi-user todo application with priority, tags, search, and filter support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Spec-First Engineering ✅
- Implementation follows approved specification (spec.md created and validated)
- All requirements traced to user stories (2 stories, 14 functional requirements)

### Gate 2: Deterministic Generation ✅
- Sort behavior determined by explicit validation rules
- API contracts ensure consistent request/response format
- Same sort parameter yields identical results

### Gate 3: Security by Design ✅
- JWT authentication required for all task operations
- User identity derived from verified token
- Task ownership enforced at database query level
- Sorting scoped to authenticated user only

### Gate 4: Separation of Concerns ✅
- Backend handles sort query building and database queries
- Frontend handles UI display and user interaction
- Clear interfaces: UI components → API service → backend endpoints → database

### Gate 5: Reproducibility ✅
- Component rendering deterministic based on state
- Sort state persists during session
- No reliance on ephemeral client-side state for critical data

### Gate 6: Traceability ✅
- All features map to spec requirements (FR-001 through FR-014)
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
- No side effects outside declared sort operations
- State changes visible through React state management

**GATE STATUS**: All gates pass. Proceeding to Phase 0 research.

## Phase 0: Research

**Status**: ✅ Complete

**Artifacts**:
- `research.md` - All technical decisions resolved

**Key Decisions**:
1. Sort implemented using SQL ORDER BY clauses
2. Sort parameter validated against enum values
3. Default sort: created_at DESC (newest first)
4. Null values handled with NULLS LAST
5. Secondary sort by created_at DESC for equal values
6. Database-level sorting for performance
7. Sort state maintained in React state (session only)
8. PostgreSQL indexes optimize sort performance
9. Frontend uses controlled dropdown component
10. No database schema changes required

All constitution gates re-validated post-research. No violations.

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Artifacts**:
- `data-model.md` - Sort query patterns and SQL examples
- `contracts/api-contracts.md` - Updated GET /api/tasks endpoint with sort parameter
- `quickstart.md` - Implementation guide with code examples

**Data Model Summary**:
- **Task**: Existing model with sort on due_date, priority, title, created_at
- **Sort Options**: Enum (due_date, priority, alphabetical, created_at)
- Query combines sort with existing search/filter with proper ordering

**API Contract Summary**:
- **GET /api/tasks**: Accepts sort query parameter
- Sort values: due_date, priority, alphabetical, created_at
- Invalid/missing values default to created_at
- Response includes sorted task list

**Constitution Re-Check Post-Design**:

### Gate 1: Spec-First Engineering ✅
- Design derived from approved spec.md
- All requirements traced to API contracts and UI components

### Gate 2: Deterministic Generation ✅
- Component props and state clearly defined
- API contracts ensure consistent behavior

### Gate 3: Security by Design ✅
- Sort validated server-side
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
- FR-001 to FR-005 → sort options and control
- FR-006 to FR-008 → database sorting and validation
- FR-009 to FR-014 → UI updates and user isolation

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
specs/001-task-sorting/
├── spec.md                  # Feature specification
├── plan.md                  # This implementation plan
├── research.md              # Phase 0: Technical decisions
├── data-model.md            # Phase 1: Sort query patterns
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
│   └── tasks.py             # Updated GET /api/tasks with sort parameter
└── models/
    └── schemas.py           # Optional: SortOption enum
```

**Frontend**:
```text
frontend/todo-app/
├── app/
│   └── dashboard/
│       └── page.tsx         # Updated with sort dropdown
├── components/
│   └── task/
│       └── SortSelector.tsx # New component
└── types/
    └── index.ts             # SortOption type
```

**Structure Decision**: Minimal invasive changes - only update existing files and add SortSelector component. No database schema changes required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations - all gates passed | N/A |
