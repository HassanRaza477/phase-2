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

function extractErrorMessage(data: any): { code: string; message: string } {
  if (!data) return { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR };

  if (data.success === false && data.message) {
    return { code: data.code || 'API_ERROR', message: data.message };
  }

  if (data.detail) {
    if (typeof data.detail === 'string') return { code: 'API_ERROR', message: data.detail };
    if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
      return {
        code: data.detail.code || 'API_ERROR',
        message: data.detail.message || JSON.stringify(data.detail)
      };
    }
  }

  if (data.message) return { code: 'API_ERROR', message: data.message };

  return { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR };
}

export function handleAPIError(error: AxiosError): never {
  console.error('[ChatService] API Error:', error.response?.data || error.message);

  if (!error.response) {
    throw new ChatAPIError('NETWORK_ERROR', 'Cannot connect to backend. Is the server running?');
  }

  const { status, data } = error.response;
  const { code, message } = extractErrorMessage(data as any);

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

      const response = await axios.post<any>(
        `${API_BASE_URL}/api/chat`,
        request,
        { headers: this.getAuthHeaders(), timeout: 120000 }
      );

      // Backend returns standardized format: { success: true, ... }
      const data = response.data;
      if (data.success) return data;
      return data; // Fallback
    } catch (error) {
      return handleAPIError(error as AxiosError);
    }
  }

  async getConversation(conversationId: string): Promise<ConversationWithMessages> {
    try {
      const response = await axios.get<any>(
        `${API_BASE_URL}/api/conversations/${conversationId}`,
        { headers: this.getAuthHeaders(), timeout: 15000 }
      );

      const data = response.data;
      if (data.success && data.data) {
        return data.data;
      }
      return data;
    } catch (error) {
      return handleAPIError(error as AxiosError);
    }
  }

  async listConversations(limit: number = 20, offset: number = 0): Promise<{ conversations: any[]; total: number }> {
    try {
      const response = await axios.get<any>(
        `${API_BASE_URL}/api/conversations`,
        {
          params: { limit, offset },
          headers: this.getAuthHeaders(),
          timeout: 10000,
        }
      );
      const data = response.data;
      if (data.success && data.data) return data.data;
      return data;
    } catch (error) {
      return handleAPIError(error as AxiosError);
    }
  }
}

export function createChatService(token: string): ChatService {
  return new ChatService(token);
}
