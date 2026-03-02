'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ChatService, createChatService } from '@/services/api/chat.service';
import { Message, ChatState, initialChatState, ChatAPIError, ERROR_MESSAGES } from '@/types/chat';
import { getToken, getConversationId, saveConversationId, clearAuthData } from '@/utils/auth';
import MessageList from '@/app/components/chat/MessageList';
import ChatInput from '@/app/components/chat/ChatInput';
import ErrorAlert from '@/app/components/chat/ErrorAlert';
import Header from '@/app/components/Header';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatPage Component
 * 
 * Main chat interface for interacting with the AI assistant.
 * Handles message sending, conversation loading, and error management.
 */
export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Component state
  const [state, setState] = useState<ChatState>(initialChatState);
  const [chatService, setChatService] = useState<ChatService | null>(null);

  // Store last message for retry functionality
  const lastMessageRef = useRef<string | null>(null);

  // Initialize chat service with token
  useEffect(() => {
    const token = getToken();
    if (token) {
      setChatService(createChatService(token));
    }
  }, []);

  // Check authentication and load conversation on mount
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!chatService) return;

    loadConversation();
  }, [isAuthenticated, authLoading, chatService]);

  /**
   * Load existing conversation from localStorage and API.
   */
  const loadConversation = useCallback(async () => {
    const savedConversationId = getConversationId();

    if (!savedConversationId) {
      setState(prev => ({ ...prev, hasLoaded: true }));
      return;
    }

    if (!chatService) {
      setState(prev => ({ ...prev, hasLoaded: true }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const conversation = await chatService.getConversation(savedConversationId);

      setState({
        conversationId: conversation.conversation.id,
        messages: conversation.messages,
        isLoading: false,
        error: null,
        hasLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load conversation:', error);

      if (error instanceof ChatAPIError && error.code === 'INVALID_TOKEN') {
        clearAuthData();
        router.push('/login');
        return;
      }

      // Start fresh if conversation not found
      if (error instanceof ChatAPIError && error.code === 'CONVERSATION_NOT_FOUND') {
        setState(prev => ({ ...prev, isLoading: false, error: null, hasLoaded: true }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load previous conversation. Starting fresh.',
        hasLoaded: true,
      }));
    }
  }, [chatService, router]);

  /**
   * Send a message to the AI agent.
   */
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatService) {
      setState(prev => ({
        ...prev,
        error: 'Chat service not initialized. Please refresh the page.',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      lastMessageRef.current = message; // Store for retry

      const token = getToken();
      if (!token) {
        throw new ChatAPIError('INVALID_TOKEN', ERROR_MESSAGES.INVALID_TOKEN);
      }

      // Send to API
      const response = await chatService.sendMessage(
        message,
        state.conversationId || undefined
      );

      // Create user message from request
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Create assistant message from response
      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: response.created_at,
        tool_calls: response.tool_calls,
      };

      // Update state with both messages
      setState(prev => ({
        ...prev,
        conversationId: response.conversation_id,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: false,
        error: null,
      }));

      // Save conversation ID for persistence
      saveConversationId(response.conversation_id);

      // Notify dashboard to sync if tool calls were made
      if (response.tool_calls && response.tool_calls.length > 0) {
        localStorage.setItem('tasks_updated', Date.now().toString());
      }

      lastMessageRef.current = null; // Clear on success

    } catch (error) {
      console.error('Failed to send message:', error);

      if (error instanceof ChatAPIError) {
        // Handle session expiration
        if (error.code === 'INVALID_TOKEN') {
          clearAuthData();
          router.push('/login');
          return;
        }

        // Show specific error message
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to send message. Please try again.',
        }));
      } else {
        // Unknown error
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Connection error. Please check if the backend is running.',
        }));
      }
    }
  }, [chatService, state.conversationId, router]);

  /**
   * Retry sending the last failed message.
   */
  const handleRetry = useCallback(() => {
    if (lastMessageRef.current) {
      handleSendMessage(lastMessageRef.current);
    }
  }, [handleSendMessage]);

  /**
   * Dismiss the current error.
   */
  const handleDismissError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Show loading while checking authentication
  if (authLoading || !chatService) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#FCFAEF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0C5446] border-t-transparent mx-auto mb-4" />
          <p className="text-[#0C5446] font-medium">Entering Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FCFAEF]">
      <Header />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden border-x border-[#DBD0BD]/30 bg-white shadow-2xl relative">
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-[radial-gradient(#DBD0BD_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15] pointer-events-none" />

        {/* Error Alert Overlay */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0 z-20"
            >
              <ErrorAlert
                error={state.error}
                onRetry={handleRetry}
                onDismiss={handleDismissError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message List Area */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList
            messages={state.messages}
            isLoading={state.isLoading}
            conversationId={state.conversationId}
          />
        </div>

        {/* Chat Input Section */}
        <div className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-[#DBD0BD]/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={state.isLoading}
            isDisabled={!state.hasLoaded}
            placeholder="Plan your next task with AI..."
          />
        </div>
      </main>
    </div>
  );
}
