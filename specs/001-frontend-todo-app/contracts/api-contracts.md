# API Contracts: Frontend Web Application for Multi-User Todo System

## Authentication Endpoints

### POST /auth/register
Register a new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Error details"
}
```

### POST /auth/login
Authenticate user and return JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Incorrect email or password"
}
```

### GET /auth/me
Get current user information

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Task Management Endpoints

### GET /tasks
Retrieve all tasks for the authenticated user

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "is_completed": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "due_date": "2023-01-02T00:00:00Z",
    "user_id": "user-uuid-string"
  }
]
```

### POST /tasks
Create a new task for the authenticated user

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request:**
```json
{
  "title": "New task title",
  "description": "Task description",
  "due_date": "2023-01-02T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-string",
  "title": "New task title",
  "description": "Task description",
  "is_completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "due_date": "2023-01-02T00:00:00Z",
  "user_id": "user-uuid-string"
}
```

### GET /tasks/{task_id}
Retrieve a specific task by ID

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "is_completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "due_date": "2023-01-02T00:00:00Z",
  "user_id": "user-uuid-string"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Task not found"
}
```

### PUT /tasks/{task_id}
Update an existing task

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request:**
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "is_completed": true,
  "due_date": "2023-01-02T00:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "title": "Updated task title",
  "description": "Updated task description",
  "is_completed": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "due_date": "2023-01-02T00:00:00Z",
  "user_id": "user-uuid-string"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Task not found"
}
```

### PATCH /tasks/{task_id}/toggle-completion
Toggle the completion status of a task

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "is_completed": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "due_date": "2023-01-02T00:00:00Z",
  "user_id": "user-uuid-string"
}
```

### DELETE /tasks/{task_id}
Delete a specific task

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (204 No Content):**
(Empty response body)

**Response (404 Not Found):**
```json
{
  "detail": "Task not found"
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Access denied - insufficient permissions"
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Field validation error message",
      "type": "error_type"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```