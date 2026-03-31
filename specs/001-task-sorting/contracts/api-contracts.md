# API Contracts: Task Sorting

**Feature**: 001-task-sorting
**Date**: 2026-03-10
**Source**: Derived from spec.md Functional Requirements

---

## Overview

This document defines the updated API contracts for the task listing endpoint with sorting support. All endpoints require JWT authentication and maintain user isolation.

---

## Updated Endpoint

### GET /api/tasks

**Purpose**: List all tasks for authenticated user with optional sorting

**Query Parameters**:
- `sort` (optional): Sort criterion - one of: 'due_date', 'priority', 'alphabetical', 'created_at'
  - Default: 'created_at' (newest first)
  - Invalid values default to 'created_at'

**Authentication**: Required (JWT Bearer token in Authorization header)

**Example Requests**:

Sort by due date:
```
GET /api/tasks?sort=due_date
```

Sort by priority:
```
GET /api/tasks?sort=priority
```

Sort alphabetically:
```
GET /api/tasks?sort=alphabetical
```

Sort by creation date (default):
```
GET /api/tasks?sort=created_at
```

No sort parameter (defaults to created_at):
```
GET /api/tasks
```

Combined with search and filters:
```
GET /api/tasks?search=project&status=pending&priority=high&sort=due_date
```

**Success Response (200 OK)**:

```json
[
  {
    "id": 123,
    "title": "Project meeting",
    "description": "Discuss project timeline",
    "priority": "high",
    "tags": ["work", "meeting"],
    "due_date": "2026-03-15T00:00:00Z",
    "completed": false,
    "created_at": "2026-03-10T14:30:00Z",
    "updated_at": "2026-03-10T14:30:00Z",
    "user_id": 456
  },
  {
    "id": 124,
    "title": "Another task",
    "description": "Some description",
    "priority": "medium",
    "tags": ["personal"],
    "due_date": null,
    "completed": true,
    "created_at": "2026-03-09T10:00:00Z",
    "updated_at": "2026-03-09T12:00:00Z",
    "user_id": 456
  }
]
```

**Empty Response (No Tasks)**:
```json
[]
```

**Error Responses**:

**400 Bad Request - Invalid Sort Parameter** (optional, defaults to created_at instead):
```json
{
  "success": false,
  "code": "INVALID_SORT_PARAMETER",
  "message": "Sort parameter must be one of: due_date, priority, alphabetical, created_at"
}
```

**401 Unauthorized - Invalid Token**:
```json
{
  "success": false,
  "code": "INVALID_TOKEN",
  "message": "Invalid or expired authentication token"
}
```

---

## Sort Parameter Validation

### Sort Values

| Value | Description | Order | Null Handling |
|-------|-------------|-------|---------------|
| `due_date` | Sort by due date | Ascending (earliest first) | NULLS LAST |
| `priority` | Sort by priority | Descending (high to low) | N/A (NOT NULL) |
| `alphabetical` | Sort by title | Ascending (A-Z) | N/A (NOT NULL) |
| `created_at` | Sort by creation date | Descending (newest first) | N/A (NOT NULL) |

### Default Behavior

- **Missing parameter**: Default to 'created_at'
- **Invalid parameter**: Default to 'created_at'
- **Empty string**: Default to 'created_at'

### Secondary Sort

All sorts use secondary sort by `created_at DESC` for deterministic ordering when primary sort values are equal.

---

## Frontend Integration Examples

### Sort Tasks

```typescript
// Sort by due date
const getSortedTasks = async (sort: string) => {
  const response = await fetch(`/api/tasks?sort=${encodeURIComponent(sort)}`);
  const tasks = await response.json();
  return tasks;
};
```

### React Hook Example

```typescript
// Custom hook for task sorting
const useSortedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sort, setSort] = useState<string>('created_at');

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch(`/api/tasks?sort=${sort}`);
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, [sort]);

  return { tasks, setSort };
};
```

### Sort Selector Component

```typescript
// Sort dropdown component
const SortSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="due_date">Due Date</option>
      <option value="priority">Priority</option>
      <option value="alphabetical">Alphabetical</option>
      <option value="created_at">Recently Created</option>
    </select>
  );
};
```

---

## Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_SORT_PARAMETER | 400 | Sort value not in allowed enum (optional, defaults instead) |
| INVALID_TOKEN | 401 | JWT token invalid or expired |
| ACCESS_DENIED | 403 | Attempt to access another user's tasks |

---

## Performance Considerations

### Indexes
- B-tree index on `due_date` column
- B-tree index on `priority` column
- B-tree index on `title` column
- B-tree index on `created_at` column (likely already exists)
- All queries filtered by `user_id` (already indexed)

### Query Optimization
- Use parameterized queries to prevent SQL injection
- Database-level sorting (no client-side sorting)
- Secondary sort ensures deterministic results
- NULLS LAST for due_date handles missing dates gracefully

### Response Time
- Target: <1 second for 100% of sort operations
- Indexes ensure fast sorting
- No full table scans (always filtered by user_id)

---

## Notes

- All timestamps in ISO 8601 format
- All IDs are integers
- Sort is case-insensitive for parameter values
- Results always include secondary sort by created_at DESC
- Only authenticated user's tasks are returned
- Sort combines with search and filter parameters
- Tasks with null due dates appear at end when sorting by due_date
