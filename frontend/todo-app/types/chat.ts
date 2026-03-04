/**
 * Chat Feature TypeScript Types
 * 
 * Core types for the AI Chat Assistant feature.
 * These types ensure type safety across all chat components and services.
 */

/**
 * Represents an MCP tool invocation by the AI agent.
 */
export interface ToolCall {
  tool_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  result?: Record<string, unknown>;
  success?: boolean;
  error?: string;
}

/**
 * Represents an individual chat message in the conversation.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_calls?: ToolCall[];
}

/**
 * API response from POST /api/{user_id}/chat endpoint.
 */
export interface ChatResponse {
  success: boolean;
  conversation_id: string;
  message_id: string;
  response: string;
  tool_calls: ToolCall[];
  created_at: string;
}

/**
 * Conversation detail from GET /api/{user_id}/conversations/{id} endpoint.
 */
export interface ConversationDetail {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * API response containing conversation with all messages.
 */
export interface ConversationWithMessages {
  conversation: ConversationDetail;
  messages: Message[];
  total_messages: number;
}

/**
 * Conversation preview for listing.
 */
export interface ConversationPreview {
  id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string;
}

/**
 * API response from GET /api/{user_id}/conversations endpoint.
 */
export interface ConversationListResponse {
  conversations: ConversationPreview[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Complete state of the chat component.
 */
export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

/**
 * Initial chat state.
 */
export const initialChatState: ChatState = {
  conversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
};

/**
 * Request body for sending a message.
 */
export interface SendMessageRequest {
  message: string;
  conversation_id?: string;
}

/**
 * Error response from API.
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Custom error class for chat API errors.
 */
export class ChatAPIError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ChatAPIError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error codes mapped to user-friendly messages.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_MESSAGE: 'Please enter a valid message',
  INVALID_TOKEN: 'Your session has expired. Please log in again.',
  USER_ID_MISMATCH: 'Access denied',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  AGENT_ERROR: "Sorry, I'm having trouble processing your request. Please try again.",
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Component props types
 */

export interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
  placeholder?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}
