# Data Model: Chat Frontend UI

**Feature**: 001-chat-frontend-ui
**Date**: 2026-02-23
**Source**: Derived from spec.md Key Entities and Functional Requirements

---

## Overview

This document defines the TypeScript types and state models for the Chat Frontend UI. These types ensure type safety and document the data structures used throughout the chat feature.

---

## Core Types

### Message

Represents an individual chat message in the conversation.

```typescript
interface Message {
  id: string;              // Unique message identifier (UUID)
  role: 'user' | 'assistant'; // Message sender
  content: string;         // Message text content
  timestamp: string;       // ISO 8601 datetime string
  tool_calls?: ToolCall[]; // Optional tool invocation details (assistant only)
}
```

**Validation Rules**:
- `id`: Must be non-empty string
- `role`: Must be either 'user' or 'assistant'
- `content`: Must be non-empty string (max 4000 characters)
- `timestamp`: Must be valid ISO 8601 datetime
- `tool_calls`: Optional, only present for assistant messages with tool invocations

---

### ToolCall

Represents an MCP tool invocation by the AI agent.

```typescript
interface ToolCall {
  tool_id: string;         // Unique tool call identifier
  tool_name: string;       // Name of the tool (e.g., "create_task")
  arguments: Record<string, any>; // Tool arguments
  result?: Record<string, any>;   // Tool execution result
  success?: boolean;       // Whether tool execution succeeded
  error?: string;          // Error message if execution failed
}
```

---

### ChatResponse

Represents the API response from POST /api/{user_id}/chat endpoint.

```typescript
interface ChatResponse {
  conversation_id: string; // Conversation identifier (UUID)
  message_id: string;      // Created message identifier (UUID)
  response: string;        // AI agent's natural language response
  tool_calls: ToolCall[];  // List of tool invocations
  created_at: string;      // ISO 8601 datetime string
}
```

---

### ConversationListResponse

Represents the API response from GET /api/{user_id}/conversations endpoint.

```typescript
interface ConversationPreview {
  id: string;              // Conversation identifier (UUID)
  created_at: string;      // ISO 8601 datetime string
  updated_at: string;      // ISO 8601 datetime string
  message_count: number;   // Total messages in conversation
  last_message_preview: string; // Preview of last message (first 100 chars)
}

interface ConversationListResponse {
  conversations: ConversationPreview[];
  total: number;
  limit: number;
  offset: number;
}
```

---

### ConversationWithMessages

Represents the API response from GET /api/{user_id}/conversations/{id} endpoint.

```typescript
interface ConversationDetail {
  id: string;              // Conversation identifier (UUID)
  created_at: string;      // ISO 8601 datetime string
  updated_at: string;      // ISO 8601 datetime string
}

interface ConversationWithMessages {
  conversation: ConversationDetail;
  messages: Message[];
  total_messages: number;
}
```

---

## State Models

### ChatState

Represents the complete state of the chat component.

```typescript
interface ChatState {
  conversationId: string | null;  // Current conversation ID (null = new conversation)
  messages: Message[];            // Array of messages in conversation
  isLoading: boolean;             // Whether a message is being sent
  error: string | null;           // Error message if last request failed
  hasLoaded: boolean;             // Whether initial conversation has been loaded
}
```

**Initial State**:
```typescript
const initialState: ChatState = {
  conversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
};
```

**State Transitions**:

1. **LOAD_CONVERSATION_START**: `{ isLoading: true, error: null }`
2. **LOAD_CONVERSATION_SUCCESS**: `{ messages: payload, conversationId: payload.id, hasLoaded: true, isLoading: false }`
3. **LOAD_CONVERSATION_FAILURE**: `{ error: payload, isLoading: false }`
4. **SEND_MESSAGE_START**: `{ isLoading: true, error: null }`
5. **SEND_MESSAGE_SUCCESS**: `{ messages: [...messages, newMessage], conversationId: payload.conversation_id, isLoading: false }`
6. **SEND_MESSAGE_FAILURE**: `{ error: payload, isLoading: false }`
7. **CLEAR_ERROR**: `{ error: null }`
8. **RESET_CHAT**: `initialState`

---

### ChatInput State

Represents the state of the chat input component.

```typescript
interface ChatInputState {
  message: string;           // Current input text
  isSending: boolean;        // Whether send is in progress
  isDisabled: boolean;       // Whether input is disabled
}
```

**Initial State**:
```typescript
const initialState: ChatInputState = {
  message: '',
  isSending: false,
  isDisabled: false,
};
```

---

### API Request/Response Types

#### SendMessageRequest

```typescript
interface SendMessageRequest {
  message: string;           // User's message text
  conversation_id?: string;  // Optional existing conversation ID
}
```

#### ErrorResponse

```typescript
interface ErrorResponse {
  error: {
    code: string;            // Error code (e.g., "INVALID_MESSAGE")
    message: string;         // Human-readable error message
    details?: Record<string, any>; // Additional error details
  };
}
```

---

## Type Definitions File

All types should be exported from `types/chat.ts`:

```typescript
// types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  tool_id: string;
  tool_name: string;
  arguments: Record<string, any>;
  result?: Record<string, any>;
  success?: boolean;
  error?: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  response: string;
  tool_calls: ToolCall[];
  created_at: string;
}

export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

// ... export other types
```

---

## Component Props Types

### ChatPage Props

```typescript
interface ChatPageProps {
  userId: string;            // Authenticated user ID
  initialConversationId?: string; // Optional: load existing conversation
}
```

### MessageList Props

```typescript
interface MessageListProps {
  messages: Message[];       // Array of messages to display
  isLoading: boolean;        // Show loading indicator
  conversationId: string | null; // Current conversation ID
}
```

### MessageBubble Props

```typescript
interface MessageBubbleProps {
  message: Message;          // Message to display
  isLatest: boolean;         // Whether this is the latest message (for auto-scroll)
}
```

### ChatInput Props

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;  // Callback when message is sent
  isLoading: boolean;        // Disable input while loading
  isDisabled: boolean;       // Disable input entirely
  placeholder?: string;      // Input placeholder text
}
```

### LoadingSpinner Props

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Spinner size
  className?: string;        // Additional CSS classes
}
```

### ErrorAlert Props

```typescript
interface ErrorAlertProps {
  error: string;             // Error message to display
  onRetry?: () => void;      // Optional retry callback
  onDismiss?: () => void;    // Optional dismiss callback
}
```

---

## Validation Rules

### Message Validation

```typescript
function validateMessage(message: Message): boolean {
  if (!message.id || typeof message.id !== 'string') return false;
  if (!['user', 'assistant'].includes(message.role)) return false;
  if (!message.content || typeof message.content !== 'string') return false;
  if (message.content.length === 0 || message.content.length > 4000) return false;
  if (!message.timestamp || typeof message.timestamp !== 'string') return false;
  return true;
}
```

### Input Validation

```typescript
function validateUserInput(input: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (input.length > 4000) {
    return { valid: false, error: 'Message is too long (max 4000 characters)' };
  }
  return { valid: true };
}
```

---

## Usage Examples

### Creating a Message

```typescript
const userMessage: Message = {
  id: crypto.randomUUID(),
  role: 'user',
  content: 'Add a task to buy groceries',
  timestamp: new Date().toISOString(),
};
```

### Updating Chat State

```typescript
// After successful API response
const newState: ChatState = {
  conversationId: response.conversation_id,
  messages: [
    ...previousState.messages,
    {
      id: response.message_id,
      role: 'assistant',
      content: response.response,
      timestamp: response.created_at,
      tool_calls: response.tool_calls,
    },
  ],
  isLoading: false,
  error: null,
  hasLoaded: true,
};
```

### Type-Safe API Call

```typescript
async function sendMessage(
  userId: string,
  request: SendMessageRequest,
  token: string
): Promise<ChatResponse> {
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
  return response.data;
}
```

---

## Notes

- All types are exported from `types/chat.ts` for reuse across components
- TypeScript strict mode should be enabled
- Use `interface` for object types that may be extended
- Use `type` for unions and complex types
- All component props should be strongly typed
- API response types match backend contract exactly
