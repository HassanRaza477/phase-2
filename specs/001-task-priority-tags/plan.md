# Implementation Plan: Task Priorities and Tags

**Branch**: `001-task-priority-tags` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-priority-tags/spec.md`

## Summary

Extend the Todo application with task priorities and tags to enhance task organization. Users can assign priority levels (high/medium/low) and multiple tags to tasks, filter tasks by these attributes, and visualize them through badges in the UI. Implementation includes database schema updates, API endpoint modifications, and frontend UI enhancements.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.11 (Backend)
**Primary Dependencies**: 
- Backend: FastAPI, SQLModel, Neon PostgreSQL
- Frontend: Next.js 16+, React 18+, Tailwind CSS 4.x
**Storage**: Neon Serverless PostgreSQL (existing database)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (desktop and mobile responsive)
**Project Type**: Full-stack web application enhancement
**Performance Goals**: 
- Task creation with priority/tags <15 seconds
- Filter operations complete in <1 second
- Support 100+ concurrent users
**Constraints**: 
- Backward compatible with existing tasks (default priority: medium)
- Tags limited to 10 per task, 50 characters each
- JWT authentication required for all operations
- User isolation enforced at database level
**Scale/Scope**: Enhancement to existing multi-user todo application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Spec-First Engineering ✅
- Implementation follows approved specification (spec.md created and validated)
- All requirements traced to user stories (3 stories, 15 functional requirements)

### Gate 2: Deterministic Generation ✅
- Priority and tag behavior determined by explicit validation rules
- API contracts ensure consistent request/response format
- Same input yields identical task creation and filtering behavior

### Gate 3: Security by Design ✅
- JWT authentication required for all task operations
- User identity derived from verified token
- Task ownership enforced at database query level
- Priority and tags scoped to authenticated user only

### Gate 4: Separation of Concerns ✅
- Backend handles priority/tag validation and storage
- Frontend handles UI display and user interaction
- Clear interfaces: UI components → API service → backend endpoints → database

### Gate 5: Reproducibility ✅
- Component rendering deterministic based on state
- Priority and tags persist in database (survives page refresh)
- No reliance on ephemeral client-side state

### Gate 6: Traceability ✅
- All features map to spec requirements (FR-001 through FR-015)
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
- No side effects outside declared task operations
- State changes visible through React state management

**GATE STATUS**: All gates pass. Proceeding to Phase 0 research.

## Phase 0: Research

**Status**: ✅ Complete

**Artifacts**:
- `research.md` - All technical decisions resolved

**Key Decisions**:
1. Priority stored as string enum (high/medium/low) in database
2. Tags stored as ARRAY column in PostgreSQL (native array support)
3. Default priority set to "medium" for backward compatibility
4. Priority validation using Python Enum or string validation
5. Tags input as comma-separated string, parsed to array
6. Filter implemented as query parameters on GET /tasks endpoint
7. Priority badges use color coding (red=high, yellow=medium, green=low)
8. Tag badges use uniform styling (simple rounded rectangles)
9. Frontend uses controlled components for priority/tags input
10. Database migration adds nullable columns with defaults

All constitution gates re-validated post-research. No violations.

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Artifacts**:
- `data-model.md` - Updated Task model with priority and tags
- `contracts/api-contracts.md` - Updated API contracts for task endpoints
- `quickstart.md` - Implementation guide with code examples

**Data Model Summary**:
- **Task**: Added `priority` (VARCHAR, enum: high/medium/low, default: medium) and `tags` (ARRAY of VARCHAR)
- Validation: priority in [high, medium, low], tags max 10 items, max 50 chars each
- Backward compatible: existing tasks get default priority "medium"

**API Contract Summary**:
- **POST /api/tasks**: Accepts optional `priority` and `tags` fields
- **PUT /api/tasks/{id}**: Accepts optional `priority` and `tags` for update
- **GET /api/tasks**: Accepts optional `priority` and `tag` query parameters for filtering
- **GET /api/tasks/{id}**: Returns task with `priority` and `tags` fields
- All responses include `priority` and `tags` in task objects

**Constitution Re-Check Post-Design**:

### Gate 1: Spec-First Engineering ✅
- Design derived from approved spec.md
- All requirements traced to data model and API contracts

### Gate 2: Deterministic Generation ✅
- Component props and state clearly defined
- API contracts ensure consistent behavior

### Gate 3: Security by Design ✅
- Priority and tags validated server-side
- User ownership enforced on all operations
- No client-side trust for validation

### Gate 4: Separation of Concerns ✅
- Backend: validation, storage, filtering
- Frontend: UI display, user input
- Clear separation of concerns maintained

### Gate 5: Reproducibility ✅
- Component rendering based on props/state only
- No random or non-deterministic behavior

### Gate 6: Traceability ✅
- FR-001/002 → priority enum and default
- FR-003 to FR-006 → tags validation
- FR-007/008 → database and API
- FR-009/010 → UI badges
- FR-011/012 → filter controls
- FR-013/014 → update endpoints
- FR-015 → user isolation

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
specs/001-task-priority-tags/
├── spec.md                  # Feature specification
├── plan.md                  # This implementation plan
├── research.md              # Phase 0: Technical decisions
├── data-model.md            # Phase 1: Updated data model
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
├── models/
│   └── task.py              # Updated Task model with priority and tags
├── models/
│   └── schemas.py           # Updated TaskCreate, TaskUpdate, TaskResponse schemas
├── api/
│   └── tasks.py             # Updated endpoints with priority/tags support
└── migrations/
    └── 002_add_priority_tags.sql  # Database migration
```

**Frontend**:
```text
frontend/todo-app/
├── app/
│   └── dashboard/
│       └── page.tsx         # Updated task list with priority/tags badges and filters
├── components/
│   └── task/
│       ├── PrioritySelector.tsx  # New component
│       ├── TagsInput.tsx         # New component
│       ├── PriorityBadge.tsx     # New component
│       └── TagBadge.tsx          # New component
└── types/
    └── index.ts             # Updated Task type definition
```

**Structure Decision**: Minimal invasive changes - only update existing files and add necessary new components. Maintain backward compatibility with existing tasks.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations - all gates passed | N/A |
