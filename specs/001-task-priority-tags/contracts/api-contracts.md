# API Contracts: Task Priorities and Tags

**Feature**: 001-task-priority-tags
**Date**: 2026-03-10
**Source**: Derived from spec.md Functional Requirements

---

## Overview

This document defines the updated API contracts for task endpoints with priority and tags support. All endpoints require JWT authentication and maintain backward compatibility.

---

## Updated Endpoints

### POST /api/tasks

**Purpose**: Create a new task with optional priority and tags

**Request Body**:
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string (optional)",
  "priority": "high|medium|low (optional, default: medium)",
  "tags": ["string"] (optional, max 10 tags, max 50 chars each)
}
```

**Example Request**:
```json
{
  "title": "Complete project proposal",
  "description": "Finish the Q2 project proposal document",
  "priority": "high",
  "tags": ["work", "urgent", "q2"]
}
```

**Success Response (201 Created)**:
```json
{
  "id": 123,
  "title": "Complete project proposal",
  "description": "Finish the Q2 project proposal document",
  "priority": "high",
  "tags": ["work", "urgent", "q2"],
  "completed": false,
  "created_at": "2026-03-10T14:30:00Z",
  "updated_at": "2026-03-10T14:30:00Z",
  "user_id": 456
}
```

**Error Responses**:

**400 Bad Request - Invalid Priority**:
```json
{
  "success": false,
  "code": "INVALID_PRIORITY",
  "message": "Priority must be 'high', 'medium', or 'low'"
}
```

**400 Bad Request - Too Many Tags**:
```json
{
  "success": false,
  "code": "TOO_MANY_TAGS",
  "message": "Maximum 10 tags allowed"
}
```

**400 Bad Request - Tag Too Long**:
```json
{
  "success": false,
  "code": "TAG_TOO_LONG",
  "message": "Each tag must be 50 characters or less"
}
```

---

### PUT /api/tasks/{task_id}

**Purpose**: Update an existing task including priority and tags

**Request Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "priority": "high|medium|low (optional)",
  "tags": ["string"] (optional),
  "completed": "boolean (optional)"
}
```

**Example Request - Update Priority**:
```json
{
  "priority": "high"
}
```

**Example Request - Update Tags**:
```json
{
  "tags": ["work", "personal", "urgent"]
}
```

**Example Request - Update Multiple Fields**:
```json
{
  "title": "Updated title",
  "priority": "medium",
  "tags": ["updated", "tags"]
}
```

**Success Response (200 OK)**:
```json
{
  "id": 123,
  "title": "Updated title",
  "description": "Original description",
  "priority": "medium",
  "tags": ["updated", "tags"],
  "completed": false,
  "created_at": "2026-03-10T14:30:00Z",
  "updated_at": "2026-03-10T15:00:00Z",
  "user_id": 456
}
```

**Error Responses**:

**404 Not Found - Task Not Found**:
```json
{
  "success": false,
  "code": "TASK_NOT_FOUND",
  "message": "Task with ID 123 was not found"
}
```

**403 Forbidden - Task Belongs to Another User**:
```json
{
  "success": false,
  "code": "ACCESS_DENIED",
  "message": "You do not have access to this task"
}
```

---

### GET /api/tasks

**Purpose**: List all tasks for authenticated user with optional filtering by priority and tags

**Query Parameters**:
- `priority` (optional): Filter by priority level ('high', 'medium', 'low')
- `tag` (optional): Filter by tag (can be specified multiple times for AND logic)
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Maximum results (default: 100, max: 1000)

**Example Requests**:

Filter by priority:
```
GET /api/tasks?priority=high
```

Filter by single tag:
```
GET /api/tasks?tag=work
```

Filter by multiple tags (AND logic):
```
GET /api/tasks?tag=work&tag=urgent
```

Combined filters:
```
GET /api/tasks?priority=high&tag=work&tag=urgent
```

**Success Response (200 OK)**:
```json
[
  {
    "id": 123,
    "title": "High priority task",
    "description": "Description",
    "priority": "high",
    "tags": ["work", "urgent"],
    "completed": false,
    "created_at": "2026-03-10T14:30:00Z",
    "updated_at": "2026-03-10T14:30:00Z",
    "user_id": 456
  },
  {
    "id": 124,
    "title": "Another task",
    "description": "Another description",
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

---

### GET /api/tasks/{task_id}

**Purpose**: Get a specific task by ID with priority and tags

**Success Response (200 OK)**:
```json
{
  "id": 123,
  "title": "Task title",
  "description": "Task description",
  "priority": "high",
  "tags": ["work", "urgent"],
  "completed": false,
  "created_at": "2026-03-10T14:30:00Z",
  "updated_at": "2026-03-10T14:30:00Z",
  "user_id": 456
}
```

---

### DELETE /api/tasks/{task_id}

**Purpose**: Delete a task (no changes to response)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task 'Task title' deleted successfully",
  "deleted_task_id": 123
}
```

---

### PATCH /api/tasks/{task_id}/toggle

**Purpose**: Toggle task completion status (no changes to response)

**Success Response (200 OK)**:
```json
{
  "id": 123,
  "title": "Task title",
  "description": "Task description",
  "priority": "high",
  "tags": ["work", "urgent"],
  "completed": true,
  "created_at": "2026-03-10T14:30:00Z",
  "updated_at": "2026-03-10T15:00:00Z",
  "user_id": 456
}
```

---

## Frontend Integration Examples

### Creating a Task with Priority and Tags

```typescript
// TypeScript example
const createTask = async () => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'New task',
      priority: 'high',
      tags: ['work', 'urgent'],
    }),
  });
  
  const task = await response.json();
  // task.priority === 'high'
  // task.tags === ['work', 'urgent']
};
```

### Filtering Tasks

```typescript
// Filter by priority
const getHighPriorityTasks = async () => {
  const response = await fetch('/api/tasks?priority=high');
  const tasks = await response.json();
  return tasks;
};

// Filter by tag
const getWorkTasks = async () => {
  const response = await fetch('/api/tasks?tag=work');
  const tasks = await response.json();
  return tasks;
};

// Filter by priority and multiple tags
const getUrgentWorkTasks = async () => {
  const response = await fetch('/api/tasks?priority=high&tag=work&tag=urgent');
  const tasks = await response.json();
  return tasks;
};
```

### Updating Task Priority

```typescript
const updatePriority = async (taskId: number, newPriority: string) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      priority: newPriority,
    }),
  });
  
  const task = await response.json();
  return task;
};
```

### Updating Task Tags

```typescript
const updateTags = async (taskId: number, newTags: string[]) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      tags: newTags,
    }),
  });
  
  const task = await response.json();
  return task;
};
```

---

## Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_PRIORITY | 400 | Priority value not in ['high', 'medium', 'low'] |
| TOO_MANY_TAGS | 400 | More than 10 tags provided |
| TAG_TOO_LONG | 400 | Tag exceeds 50 character limit |
| TASK_NOT_FOUND | 404 | Task ID does not exist |
| ACCESS_DENIED | 403 | Task belongs to another user |
| INVALID_TOKEN | 401 | JWT token invalid or expired |

---

## Validation Rules Summary

### Priority Validation
- Must be one of: 'high', 'medium', 'low'
- Case-sensitive (must be lowercase)
- Default: 'medium' if not provided
- Stored as VARCHAR in database

### Tags Validation
- Maximum 10 tags per task
- Maximum 50 characters per tag
- No duplicate tags (case-insensitive deduplication)
- Whitespace trimmed automatically
- Empty tags rejected
- Stored as ARRAY in PostgreSQL

### User Isolation
- All operations scoped to authenticated user
- Cannot view/update/delete other users' tasks
- 403 Forbidden if user ID mismatch

---

## Backward Compatibility

### Existing Tasks
- All existing tasks automatically get priority='medium' via migration
- All existing tasks get tags=[] (empty array) via migration
- Existing API clients continue to work without changes
- New fields are optional in create/update operations

### API Response Changes
- All task responses now include `priority` and `tags` fields
- Existing clients can ignore these fields
- No breaking changes to existing response structure

---

## Notes

- All timestamps in ISO 8601 format
- All IDs are integers
- Tags array order is preserved (first added = first in array)
- Duplicate detection is case-insensitive
- Filtering uses AND logic for multiple tags
- Empty filter returns all tasks
