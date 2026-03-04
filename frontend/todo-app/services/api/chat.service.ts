/**
 * Chat API Service
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  ChatResponse,
  ConversationWithMessages,
  ChatAPIError,
  ERROR_MESSAGES,
  SendMessageRequest,
} from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function extractErrorMessage(data: unknown): { code: string; message: string } {
  if (!data) return { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR };

  const dataObj = data as Record<string, any>;
  if (dataObj.success === false && dataObj.message) {
    return { code: dataObj.code || 'API_ERROR', message: dataObj.message };
  }

  if (dataObj.detail) {
    if (typeof dataObj.detail === 'string') return { code: 'API_ERROR', message: dataObj.detail };
    if (typeof dataObj.detail === 'object' && !Array.isArray(dataObj.detail)) {
      return {
        code: dataObj.detail.code || 'API_ERROR',
        message: dataObj.detail.message || JSON.stringify(dataObj.detail)
      };
    }
  }

  if (dataObj.message) return { code: 'API_ERROR', message: dataObj.message };

  return { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR };
}

export function handleAPIError(error: AxiosError): never {
  console.error('[ChatService] API Error:', error.response?.data || error.message);

  if (!error.response) {
    throw new ChatAPIError('NETWORK_ERROR', 'Cannot connect to backend. Is the server running?');
  }

  const { status, data } = error.response;
  const { code, message } = extractErrorMessage(data);

  if (status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    throw new ChatAPIError('INVALID_TOKEN', 'Session expired. Please log in again.');
  }

  throw new ChatAPIError(code || 'API_ERROR', message);
}

export class ChatService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    try {
      const request: SendMessageRequest = {
        message,
        ...(conversationId && { conversation_id: conversationId }),
      };

      const response = await axios.post<unknown>(
        `${API_BASE_URL}/api/chat`,
        request,
        { headers: this.getAuthHeaders(), timeout: 120000 }
      );

      // Backend returns standardized format: { success: true, ... }
      const data = response.data as ChatResponse;
      if (data.success) return data;
      return data; // Fallback
    } catch (error) {
      return handleAPIError(error as AxiosError);
    }
  }

  async getConversation(conversationId: string): Promise<ConversationWithMessages> {
    try {
      const response = await axios.get<unknown>(
        `${API_BASE_URL}/api/conversations/${conversationId}`,
        { headers: this.getAuthHeaders(), timeout: 15000 }
      );

      const data = response.data as { success: boolean; data: ConversationWithMessages };
      if (data.success && data.data) {
        return data.data;
      }
      return data as unknown as ConversationWithMessages;
    } catch (error) {
      return handleAPIError(error as AxiosError);
    }
  }

  async listConversations(limit: number = 20, offset: number = 0): Promise<{ conversations: any[]; total: number }> {
    try {
      const response = await axios.get<unknown>(
        `${API_BASE_URL}/api/conversations`,
        {
          params: { limit, offset },
          headers: this.getAuthHeaders(),
          timeout: 10000,
        }
      );
      const data = response.data as { success: boolean; data: { conversations: any[]; total: number } };
      if (data.success && data.data) return data.data;
      return data as unknown as { conversations: any[]; total: number };
    } catch (error) {
      return handleAPIError(error as AxiosError);
    }
  }
}

export function createChatService(token: string): ChatService {
  return new ChatService(token);
}
