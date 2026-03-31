# API Contracts: Task Search and Filtering

**Feature**: 001-task-search-filter
**Date**: 2026-03-10
**Source**: Derived from spec.md Functional Requirements

---

## Overview

This document defines the updated API contracts for the task listing endpoint with search and filtering support. All endpoints require JWT authentication and maintain user isolation.

---

## Updated Endpoint

### GET /api/tasks

**Purpose**: List all tasks for authenticated user with optional search and filtering

**Query Parameters**:
- `search` (optional): Keyword to search in task title and description (max 100 chars, case-insensitive substring match)
- `status` (optional): Filter by status - 'completed' or 'pending'
- `priority` (optional): Filter by priority - 'high', 'medium', or 'low'
- `tag` (optional): Filter by tag - matches if tag exists in task's tags array (can be specified multiple times)

**Authentication**: Required (JWT Bearer token in Authorization header)

**Example Requests**:

Search by keyword:
```
GET /api/tasks?search=meeting
```

Filter by status:
```
GET /api/tasks?status=completed
```

Filter by priority:
```
GET /api/tasks?priority=high
```

Filter by tag:
```
GET /api/tasks?tag=work
```

Combined search and multiple filters:
```
GET /api/tasks?search=project&status=pending&priority=high&tag=work
```

No filters (show all tasks):
```
GET /api/tasks
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
    "completed": true,
    "created_at": "2026-03-09T10:00:00Z",
    "updated_at": "2026-03-09T12:00:00Z",
    "user_id": 456
  }
]
```

**Empty Response (No Matching Tasks)**:
```json
[]
```

**Error Responses**:

**400 Bad Request - Invalid Search Query**:
```json
{
  "success": false,
  "code": "INVALID_SEARCH_QUERY",
  "message": "Search query exceeds maximum length of 100 characters"
}
```

**400 Bad Request - Invalid Status**:
```json
{
  "success": false,
  "code": "INVALID_STATUS",
  "message": "Status must be 'completed' or 'pending'"
}
```

**400 Bad Request - Invalid Priority**:
```json
{
  "success": false,
  "code": "INVALID_PRIORITY",
  "message": "Priority must be 'high', 'medium', or 'low'"
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

## Query Parameter Validation

### Search Parameter
- **Type**: String
- **Required**: No
- **Max Length**: 100 characters
- **Matching**: Case-insensitive substring (ILIKE)
- **Fields**: Searches both title and description
- **Whitespace**: Trimmed automatically
- **Empty**: Shows all tasks (no filtering)

### Status Parameter
- **Type**: String (enum)
- **Required**: No
- **Allowed Values**: 'completed', 'pending'
- **Matching**: Exact match
- **Empty**: No status filtering

### Priority Parameter
- **Type**: String (enum)
- **Required**: No
- **Allowed Values**: 'high', 'medium', 'low'
- **Matching**: Exact match
- **Empty**: No priority filtering

### Tag Parameter
- **Type**: String
- **Required**: No
- **Matching**: Array membership (tag IN tags)
- **Multiple**: Can be specified multiple times (AND logic)
- **Empty**: No tag filtering

---

## Frontend Integration Examples

### Search Tasks

```typescript
// Search by keyword
const searchTasks = async (keyword: string) => {
  const response = await fetch(`/api/tasks?search=${encodeURIComponent(keyword)}`);
  const tasks = await response.json();
  return tasks;
};
```

### Filter by Status

```typescript
// Filter by status
const getCompletedTasks = async () => {
  const response = await fetch('/api/tasks?status=completed');
  const tasks = await response.json();
  return tasks;
};
```

### Filter by Priority

```typescript
// Filter by priority
const getHighPriorityTasks = async () => {
  const response = await fetch('/api/tasks?priority=high');
  const tasks = await response.json();
  return tasks;
};
```

### Filter by Tag

```typescript
// Filter by tag
const getWorkTasks = async () => {
  const response = await fetch('/api/tasks?tag=work');
  const tasks = await response.json();
  return tasks;
};
```

### Combined Search and Filters

```typescript
// Combined search and multiple filters
const getFilteredTasks = async (
  search: string,
  status: string,
  priority: string,
  tag: string
) => {
  const params = new URLSearchParams();
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (tag) params.append('tag', tag);
  
  const response = await fetch(`/api/tasks?${params.toString()}`);
  const tasks = await response.json();
  return tasks;
};
```

### React Hook Example

```typescript
// Custom hook for task filtering
const useFilteredTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    tag: '',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.tag) params.append('tag', filters.tag);
      
      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, [filters]);

  return { tasks, setFilters };
};
```

---

## Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_SEARCH_QUERY | 400 | Search query exceeds 100 characters |
| INVALID_STATUS | 400 | Status value not 'completed' or 'pending' |
| INVALID_PRIORITY | 400 | Priority value not 'high', 'medium', or 'low' |
| INVALID_TOKEN | 401 | JWT token invalid or expired |
| ACCESS_DENIED | 403 | Attempt to access another user's tasks |

---

## Performance Considerations

### Indexes
- B-tree index on `status` column
- B-tree index on `priority` column
- GIN index on `tags` array column
- All queries filtered by `user_id` (already indexed)

### Query Optimization
- Use parameterized queries to prevent SQL injection
- Limit search query length to 100 characters
- Escape special characters in search query
- Use ILIKE for case-insensitive matching
- Combine filters with AND logic

### Response Time
- Target: <1 second for 100% of queries
- Indexes ensure fast filtering
- No full table scans (always filtered by user_id)

---

## Notes

- All timestamps in ISO 8601 format
- All IDs are integers
- Search is case-insensitive
- Search uses substring matching (ILIKE)
- Multiple tag filters use AND logic
- Empty search shows all tasks
- Results sorted by created_at DESC
- Only authenticated user's tasks are returned
