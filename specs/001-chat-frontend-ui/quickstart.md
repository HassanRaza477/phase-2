# Quickstart: Chat Frontend UI Implementation

**Feature**: 001-chat-frontend-ui
**Date**: 2026-02-23
**Audience**: Frontend developers implementing the chat interface

---

## Prerequisites

- Node.js 18+ installed
- Next.js 16+ project set up (`frontend/todo-app/`)
- Tailwind CSS configured
- Backend chat endpoint running at `http://localhost:8000`
- User authentication working (JWT token available)

---

## Step 1: Create TypeScript Types

Create `types/chat.ts`:

```typescript
// types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_calls?: any[];
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  response: string;
  tool_calls: any[];
  created_at: string;
}

export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}
```

---

## Step 2: Create API Service

Create `services/api/chat.service.ts`:

```typescript
// services/api/chat.service.ts
import axios from 'axios';
import { ChatResponse, ConversationWithMessages } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ChatService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await axios.post<ChatResponse>(
      `${API_BASE_URL}/api/${userId}/chat`,
      { message, conversation_id: conversationId },
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async getConversation(
    userId: string,
    conversationId: string
  ): Promise<ConversationWithMessages> {
    const response = await axios.get<ConversationWithMessages>(
      `${API_BASE_URL}/api/${userId}/conversations/${conversationId}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` },
      }
    );
    return response.data;
  }
}
```

---

## Step 3: Create Chat Components

### MessageBubble Component

Create `app/components/chat/MessageBubble.tsx`:

```typescript
// app/components/chat/MessageBubble.tsx
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      ref={isLatest ? (el) => el?.scrollIntoView({ behavior: 'smooth' }) : undefined}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

### MessageList Component

Create `app/components/chat/MessageList.tsx`:

```typescript
// app/components/chat/MessageList.tsx
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from './LoadingSpinner';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
}

export function MessageList({ messages, isLoading, conversationId }: MessageListProps) {
  if (!conversationId && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Start a conversation by typing a message below</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLatest={index === messages.length - 1}
        />
      ))}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}
```

### ChatInput Component

Create `app/components/chat/ChatInput.tsx`:

```typescript
// app/components/chat/ChatInput.tsx
import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function ChatInput({ onSend, isLoading, isDisabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading && !isDisabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isDisabled}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || isDisabled}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### LoadingSpinner Component

Create `app/components/chat/LoadingSpinner.tsx`:

```typescript
// app/components/chat/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### ErrorAlert Component

Create `app/components/chat/ErrorAlert.tsx`:

```typescript
// app/components/chat/ErrorAlert.tsx
interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-red-800 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4: Create Chat Page

Create `app/chat/page.tsx`:

```typescript
// app/chat/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // Adjust import based on your auth setup
import { ChatService } from '@/services/api/chat.service';
import { MessageList } from '@/app/components/chat/MessageList';
import { ChatInput } from '@/app/components/chat/ChatInput';
import { ErrorAlert } from '@/app/components/chat/ErrorAlert';
import { Message } from '@/types/chat';

export default function ChatPage() {
  const { user, token } = useAuth();
  const [chatService] = useState(() => token ? new ChatService(token) : null);
  const [state, setState] = useState({
    conversationId: null as string | null,
    messages: [] as Message[],
    isLoading: false,
    error: null as string | null,
    hasLoaded: false,
  });

  // Load conversation on mount
  useEffect(() => {
    if (!user || !chatService) return;

    const loadConversation = async () => {
      const savedId = localStorage.getItem('chat_conversation_id');
      
      if (savedId) {
        try {
          setState(prev => ({ ...prev, isLoading: true, error: null }));
          const conversation = await chatService.getConversation(user.id, savedId);
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
  }, [user, chatService]);

  // Send message handler
  const handleSendMessage = useCallback(async (message: string) => {
    if (!user || !chatService) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await chatService.sendMessage(
        user.id,
        message,
        state.conversationId || undefined
      );

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Add assistant response
      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: response.created_at,
        tool_calls: response.tool_calls,
      };

      setState(prev => ({
        ...prev,
        conversationId: response.conversation_id,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: false,
        error: null,
      }));

      // Save conversation ID
      localStorage.setItem('chat_conversation_id', response.conversation_id);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send message',
      }));
    }
  }, [user, chatService, state.conversationId]);

  if (!user || !chatService) {
    return <div>Please log in to chat</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <header className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h1>
      </header>

      {state.error && (
        <ErrorAlert
          error={state.error}
          onRetry={() => setState(prev => ({ ...prev, error: null }))}
          onDismiss={() => setState(prev => ({ ...prev, error: null }))}
        />
      )}

      <MessageList
        messages={state.messages}
        isLoading={state.isLoading}
        conversationId={state.conversationId}
      />

      <ChatInput
        onSend={handleSendMessage}
        isLoading={state.isLoading}
        isDisabled={!state.hasLoaded}
      />
    </div>
  );
}
```

---

## Step 5: Add Environment Variable

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 6: Test the Chat Interface

1. **Start the backend**:
   ```bash
   cd backend
   uvicorn src.main:app --reload
   ```

2. **Start the frontend**:
   ```bash
   cd frontend/todo-app
   npm run dev
   ```

3. **Navigate to chat page**:
   - Open `http://localhost:3000/chat`
   - Log in if not already authenticated

4. **Test sending a message**:
   - Type "Add a task to buy groceries tomorrow"
   - Click Send or press Enter
   - Verify message appears in chat
   - Verify AI response appears

5. **Test conversation persistence**:
   - Refresh the page
   - Verify previous messages are restored

6. **Test error handling**:
   - Stop the backend server
   - Try sending a message
   - Verify error alert appears with retry option

---

## Troubleshooting

### CORS Error

**Problem**: `Access to fetch at 'http://localhost:8000' has been blocked by CORS policy`

**Solution**: Ensure backend has CORS configured for frontend origin:
```python
# backend/src/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized

**Problem**: All API requests return 401

**Solution**: Verify JWT token is valid and included in Authorization header

### Conversation Not Loading

**Problem**: Previous messages don't appear after refresh

**Solution**: Check localStorage for `chat_conversation_id` and verify backend GET endpoint

---

## Next Steps

- Add conversation history sidebar (list previous conversations)
- Add message timestamps
- Add typing indicator ("AI is typing...")
- Add markdown rendering for AI responses
- Add copy message button
- Add clear conversation button
- Add export conversation feature

---

**Complete!** You now have a fully functional chat interface that communicates with the backend AI agent.
