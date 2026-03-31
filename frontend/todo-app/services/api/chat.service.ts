/**
 * Chat API Service
 * Refactored to use central apiClient for consistency.
 */

import { AxiosError } from 'axios';
import apiClient from '@/app/api/client';
import { chatAPI, conversationsAPI } from '@/app/api/client';
import {
  ChatResponse,
  ConversationWithMessages,
  ChatAPIError,
  ERROR_MESSAGES,
} from '@/types/chat';

export function handleAPIError(error: unknown): never {
  console.error('[ChatService] API Error:', error);

  if (error instanceof Error) {
    // Note: The central apiClient handles 401 Status codes by redirecting to /login.
    // We remove the broad text check here to prevent AI service 401s from triggering a logout.
    throw new ChatAPIError('API_ERROR', error.message);
  }

  throw new ChatAPIError('UNKNOWN_ERROR', ERROR_MESSAGES.UNKNOWN_ERROR);
}

export class ChatService {
  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    try {
      return await chatAPI.sendMessage({
        message,
        conversation_id: conversationId,
      });
    } catch (error) {
      return handleAPIError(error);
    }
  }

  async getConversation(conversationId: string): Promise<ConversationWithMessages> {
    try {
      const data = await conversationsAPI.get(conversationId);
      if (data && data.messages) {
        data.messages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.created_at,
        }));
      }
      return data;
    } catch (error) {
      return handleAPIError(error);
    }
  }

  async listConversations(limit: number = 20, offset: number = 0): Promise<{ conversations: any[]; total: number }> {
    try {
      return await conversationsAPI.list({ limit, offset });
    } catch (error) {
      return handleAPIError(error);
    }
  }
}

export function createChatService(token?: string): ChatService {
  // Token is now handled by apiClient interceptor from localStorage
  return new ChatService();
}
