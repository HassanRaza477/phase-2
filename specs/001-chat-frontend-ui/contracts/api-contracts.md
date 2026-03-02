# API Contracts: Chat Frontend Integration

**Feature**: 001-chat-frontend-ui
**Date**: 2026-02-23
**Source**: Derived from backend spec (001-ai-agent-chat) and frontend requirements

---

## Overview

This document defines the API contracts between the Chat Frontend UI and the Backend Chat Endpoint. All endpoints require JWT authentication and follow RESTful conventions.

**Base URL**: `http://localhost:8000` (development)  
**Authentication**: Bearer token (JWT) in Authorization header  
**Content Type**: `application/json`

---

## Authentication

All API requests require JWT authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

The JWT token is obtained from the authentication service (Better Auth) and stored in React state after retrieval from httpOnly cookie.

---

## Endpoints

### POST /api/{user_id}/chat

**Purpose**: Send a message to the AI agent and receive a response.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (string, UUID): Authenticated user identifier

**Request Body**:
```json
{
  "message": "string (required, 1-4000 characters)",
  "conversation_id": "string (optional, UUID, for continuing existing conversation)"
}
```

**Request Example**:
```typescript
const request = {
  message: "Add a task to buy groceries tomorrow",
  conversation_id: "550e8400-e29b-41d4-a716-446655440000" // Optional
};

const response = await axios.post<ChatResponse>(
  `/api/${userId}/chat`,
  request,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);
```

**Success Response (200 OK)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "response": "I've created a task 'Buy groceries' due tomorrow.",
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

**Error Responses**:

**400 Bad Request - Empty Message**:
```json
{
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message cannot be empty"
  }
}
```

**401 Unauthorized - Invalid Token**:
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token"
  }
}
```

**403 Forbidden - User ID Mismatch**:
```json
{
  "error": {
    "code": "USER_ID_MISMATCH",
    "message": "Authenticated user does not match request path"
  }
}
```

**500 Internal Server Error - Agent Error**:
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

**Purpose**: List all conversations for the authenticated user (optional feature for conversation history selection).

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (string, UUID): Authenticated user identifier

**Query Parameters**:
- `limit` (number, optional): Number of conversations (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

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
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/{user_id}/conversations/{conversation_id}

**Purpose**: Get a specific conversation with all its messages (used to restore conversation on page load).

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id` (string, UUID): Authenticated user identifier
- `conversation_id` (string, UUID): Conversation identifier

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
          "arguments": {
            "title": "Buy groceries",
            "due_date": "2026-02-24"
          },
          "success": true
        }
      ],
      "created_at": "2026-02-23T14:30:01Z"
    }
  ],
  "total_messages": 2
}
```

**404 Not Found - Conversation Not Found**:
```json
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "The specified conversation does not exist"
  }
}
```

---

## Frontend Service Implementation

### Chat Service (chat.service.ts)

```typescript
// services/api/chat.service.ts
import axios from 'axios';
import { Message, ChatResponse, ConversationWithMessages } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ChatService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Send a message to the AI agent
   */
  async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await axios.post<ChatResponse>(
      `${API_BASE_URL}/api/${userId}/chat`,
      {
        message,
        conversation_id: conversationId,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  /**
   * Get conversation with messages
   */
  async getConversation(
    userId: string,
    conversationId: string
  ): Promise<ConversationWithMessages> {
    const response = await axios.get<ConversationWithMessages>(
      `${API_BASE_URL}/api/${userId}/conversations/${conversationId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    return response.data;
  }

  /**
   * List all conversations
   */
  async listConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ conversations: any[]; total: number }> {
    const response = await axios.get(
      `${API_BASE_URL}/api/${userId}/conversations`,
      {
        params: { limit, offset },
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    return response.data;
  }
}
```

### Error Handling

```typescript
// services/api/chat.service.ts
import { AxiosError } from 'axios';

export class ChatAPIError extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ChatAPIError';
    this.code = code;
    this.details = details;
  }
}

export function handleAPIError(error: AxiosError): never {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    throw new ChatAPIError(
      errorData.error?.code || 'UNKNOWN_ERROR',
      errorData.error?.message || 'An error occurred',
      errorData.error?.details
    );
  }
  throw new ChatAPIError('NETWORK_ERROR', 'Failed to connect to server');
}
```

---

## Usage Examples

### Sending a Message

```typescript
// In ChatPage component
const handleSendMessage = async (message: string) => {
  try {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const response = await chatService.sendMessage(
      userId,
      message,
      state.conversationId || undefined
    );

    // Update state with response
    setState(prev => ({
      ...prev,
      conversationId: response.conversation_id,
      messages: [
        ...prev.messages,
        {
          id: response.message_id,
          role: 'assistant',
          content: response.response,
          timestamp: response.created_at,
          tool_calls: response.tool_calls,
        },
      ],
      isLoading: false,
    }));
  } catch (error) {
    if (error instanceof ChatAPIError) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }
};
```

### Loading Conversation on Mount

```typescript
// In ChatPage component
useEffect(() => {
  const loadConversation = async () => {
    const savedConversationId = localStorage.getItem('chat_conversation_id');
    
    if (savedConversationId) {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const conversation = await chatService.getConversation(
          userId,
          savedConversationId
        );

        setState({
          conversationId: conversation.conversation.id,
          messages: conversation.messages,
          isLoading: false,
          error: null,
          hasLoaded: true,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load conversation',
          hasLoaded: true,
        }));
      }
    } else {
      setState(prev => ({ ...prev, hasLoaded: true }));
    }
  };

  loadConversation();
}, [userId]);
```

---

## Error Code Reference

| Code | HTTP Status | Description | User Message |
|------|-------------|-------------|--------------|
| INVALID_MESSAGE | 400 | Message is empty or too long | "Please enter a valid message" |
| INVALID_TOKEN | 401 | JWT token is invalid or expired | "Your session has expired. Please log in again." |
| USER_ID_MISMATCH | 403 | Authenticated user doesn't match path | "Access denied" |
| CONVERSATION_NOT_FOUND | 404 | Conversation ID doesn't exist | "Conversation not found" |
| AGENT_ERROR | 500 | AI agent failed to process | "Sorry, I'm having trouble processing your request. Please try again." |
| NETWORK_ERROR | - | Network connection failed | "Unable to connect. Please check your internet connection." |

---

## Best Practices

1. **Always include Authorization header** with valid JWT
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** while waiting for responses
4. **Store conversation_id** after first response for continuity
5. **Validate input** before sending (non-empty, max length)
6. **Retry logic** for transient network errors
7. **Timeout handling** for slow responses (>10 seconds)
8. **Log errors** for debugging (but don't expose to users)

---

## Testing

### Mock API Service for Testing

```typescript
// __tests__/chat.service.test.ts
import { ChatService } from '../chat.service';

const mockToken = 'test-token';
const mockUserId = 'test-user-id';

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService(mockToken);
  });

  it('should send a message and return response', async () => {
    // Mock implementation
    const mockResponse = {
      conversation_id: 'test-conversation-id',
      message_id: 'test-message-id',
      response: 'Test response',
      tool_calls: [],
      created_at: new Date().toISOString(),
    };

    // Test implementation
    // ...
  });
});
```
