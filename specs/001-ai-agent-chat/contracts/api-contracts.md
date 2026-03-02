# API Contracts: AI Agent Chat Endpoint

**Feature**: 001-ai-agent-chat
**Date**: 2026-02-23
**Source**: Derived from spec.md Functional Requirements

---

## Overview

This document defines the REST API contracts for the AI Agent Chat Endpoint. All endpoints require JWT authentication and follow RESTful conventions.

**Base Path**: `/api`

**Authentication**: Bearer token (JWT) in Authorization header

**Content Type**: `application/json`

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**HTTP Status Codes**:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: User ID mismatch
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: External service unavailable

---

## Endpoints

### POST /api/{user_id}/chat

**Purpose**: Send a message to the AI agent and receive a response

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (UUID): User identifier (must match JWT token subject)

**Request Body**:
```json
{
  "message": "string (required, non-empty)",
  "conversation_id": "uuid (optional, for continuing existing conversation)"
}
```

**Request Body Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000,
      "description": "User's natural language message"
    },
    "conversation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Existing conversation ID (omit for new conversation)"
    }
  },
  "required": ["message"]
}
```

**Success Response (200 OK)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "response": "I've created a task 'Buy groceries' due tomorrow. Is there anything else you'd like me to help with?",
  "tool_calls": [
    {
      "tool_id": "call_123",
      "tool_name": "create_task",
      "arguments": {
        "title": "Buy groceries",
        "due_date": "2026-02-24"
      },
      "result": {
        "task_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "title": "Buy groceries",
        "created": true
      },
      "success": true
    }
  ],
  "created_at": "2026-02-23T14:30:00Z"
}
```

**Response Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "conversation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Conversation ID (new or existing)"
    },
    "message_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the created message"
    },
    "response": {
      "type": "string",
      "description": "Agent's natural language response"
    },
    "tool_calls": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tool_id": {"type": "string"},
          "tool_name": {"type": "string"},
          "arguments": {"type": "object"},
          "result": {"type": "object"},
          "success": {"type": "boolean"},
          "error": {"type": "string"}
        }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["conversation_id", "response", "created_at"]
}
```

**Error Responses**:

**400 Bad Request** - Empty message:
```json
{
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message cannot be empty",
    "details": {
      "field": "message",
      "constraint": "minLength"
    }
  }
}
```

**401 Unauthorized** - Invalid JWT:
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token"
  }
}
```

**403 Forbidden** - User ID mismatch:
```json
{
  "error": {
    "code": "USER_ID_MISMATCH",
    "message": "Authenticated user does not match request path"
  }
}
```

**404 Not Found** - Conversation not found:
```json
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "The specified conversation does not exist"
  }
}
```

**500 Internal Server Error** - Agent error:
```json
{
  "error": {
    "code": "AGENT_ERROR",
    "message": "Failed to process message: AI agent timeout"
  }
}
```

---

### GET /api/{user_id}/conversations

**Purpose**: List all conversations for the authenticated user

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (UUID): User identifier

**Query Parameters**:
- `limit` (integer, optional): Number of conversations to return (default: 20, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Success Response (200 OK)**:
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-02-20T10:00:00Z",
      "updated_at": "2026-02-23T14:30:00Z",
      "message_count": 15,
      "last_message_preview": "I've created a task 'Buy groceries' due tomorrow."
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

**Response Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "conversations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "created_at": {"type": "string", "format": "date-time"},
          "updated_at": {"type": "string", "format": "date-time"},
          "message_count": {"type": "integer"},
          "last_message_preview": {"type": "string"}
        }
      }
    },
    "total": {"type": "integer"},
    "limit": {"type": "integer"},
    "offset": {"type": "integer"}
  },
  "required": ["conversations", "total", "limit", "offset"]
}
```

---

### GET /api/{user_id}/conversations/{conversation_id}

**Purpose**: Get a specific conversation with its messages

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (UUID): User identifier
- `conversation_id` (UUID): Conversation identifier

**Query Parameters**:
- `limit` (integer, optional): Number of messages to return (default: 50, max: 100)

**Success Response (200 OK)**:
```json
{
  "conversation": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-02-20T10:00:00Z",
    "updated_at": "2026-02-23T14:30:00Z"
  },
  "messages": [
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "role": "user",
      "content": "Add a task to buy groceries tomorrow",
      "created_at": "2026-02-23T14:30:00Z"
    },
    {
      "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      "role": "assistant",
      "content": "I've created a task 'Buy groceries' due tomorrow.",
      "tool_calls": [
        {
          "tool_name": "create_task",
          "arguments": {"title": "Buy groceries", "due_date": "2026-02-24"},
          "success": true
        }
      ],
      "created_at": "2026-02-23T14:30:01Z"
    }
  ],
  "total_messages": 2
}
```

---

### DELETE /api/{user_id}/conversations/{conversation_id}

**Purpose**: Delete a conversation (soft delete)

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (UUID): User identifier
- `conversation_id` (UUID): Conversation identifier

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Error Responses**:

**404 Not Found** - Conversation not found:
```json
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "The specified conversation does not exist"
  }
}
```

---

## Authentication Flow

1. **Frontend**: User logs in via Better Auth
2. **Better Auth**: Issues JWT token with user_id in subject claim
3. **Frontend**: Includes token in Authorization header: `Bearer <token>`
4. **Backend**: Verifies JWT signature using shared secret
5. **Backend**: Extracts user_id from token subject claim
6. **Backend**: Validates user_id matches request path parameter
7. **Backend**: Processes request if validation passes

**JWT Token Structure**:
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "iat": 1708700000,
  "exp": 1708786400
}
```

**Verification Steps**:
1. Verify token signature using shared secret (HS256 algorithm)
2. Check token expiration (exp claim)
3. Extract user_id from subject (sub claim)
4. Compare with path parameter user_id
5. Return 401 or 403 if validation fails

---

## MCP Tool Contracts

### Tool: create_task

**Purpose**: Create a new todo task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "title": {"type": "string", "minLength": 1, "maxLength": 200},
    "description": {"type": "string", "maxLength": 1000},
    "due_date": {"type": "string", "format": "date"},
    "priority": {"type": "string", "enum": ["low", "medium", "high"]}
  },
  "required": ["title"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"},
    "title": {"type": "string"},
    "created": {"type": "boolean"}
  }
}
```

---

### Tool: update_task

**Purpose**: Update an existing todo task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"},
    "title": {"type": "string", "maxLength": 200},
    "description": {"type": "string", "maxLength": 1000},
    "due_date": {"type": "string", "format": "date"},
    "priority": {"type": "string", "enum": ["low", "medium", "high"]}
  },
  "required": ["task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"},
    "updated": {"type": "boolean"}
  }
}
```

---

### Tool: delete_task

**Purpose**: Delete a todo task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"}
  },
  "required": ["task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"},
    "deleted": {"type": "boolean"}
  }
}
```

---

### Tool: list_tasks

**Purpose**: List tasks with optional filters

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "filter": {
      "type": "object",
      "properties": {
        "due_date": {"type": "string", "format": "date"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
        "status": {"type": "string", "enum": ["pending", "completed"]}
      }
    }
  }
}
```

**Output Schema**:
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "task_id": {"type": "string", "format": "uuid"},
      "title": {"type": "string"},
      "description": {"type": "string"},
      "due_date": {"type": "string", "format": "date"},
      "priority": {"type": "string"},
      "completed": {"type": "boolean"}
    }
  }
}
```

---

### Tool: get_task

**Purpose**: Get details of a specific task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"}
  },
  "required": ["task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {"type": "string", "format": "uuid"},
    "title": {"type": "string"},
    "description": {"type": "string"},
    "due_date": {"type": "string", "format": "date"},
    "priority": {"type": "string"},
    "completed": {"type": "boolean"},
    "created_at": {"type": "string", "format": "date-time"},
    "updated_at": {"type": "string", "format": "date-time"}
  }
}
```

---

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at `/openapi.json` when the FastAPI application is running.

**Swagger UI**: `http://localhost:8000/docs`

**ReDoc**: `http://localhost:8000/redoc`
