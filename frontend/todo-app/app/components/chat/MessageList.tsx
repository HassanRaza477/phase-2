'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageListProps } from '@/types/chat';
import MessageBubble from './MessageBubble';

/**
 * MessageList Component
 * 
 * Renders a list of chat messages with auto-scroll functionality.
 * Shows empty state when no messages exist.
 */
export default function MessageList({
  messages,
  isLoading,
  conversationId
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to the latest message when messages change.
   */
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: messages.length <= 1 ? 'auto' : 'smooth',
          block: 'end'
        });
      }
    };

    // Use interaction observer or timing to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Empty state - no conversation yet
  if (!conversationId && messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex items-center justify-center p-8 text-center"
      >
        <div className="max-w-md">
          <div className="w-20 h-20 bg-[#FCFAEF] border-2 border-[#DBD0BD] rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-sm">
            <svg className="w-10 h-10 text-[#FF6700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0C5446] mb-2">How can I help you today?</h2>
          <p className="text-[#0C5446]/60 leading-relaxed">
            I'm your TaskFlow assistant. Ask me to add tasks, list your pending items, or help organize your day.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['"Add a task to buy tea"', '"Show my tasks"', '"Complete task 5"', '"Delete old tasks"'].map((hint, i) => (
              <div key={i} className="text-xs font-medium text-[#0C5446]/50 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg py-2 px-3">
                {hint}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-[#DBD0BD] scrollbar-track-transparent"
      role="log"
      aria-label="Chat messages"
    >
      <div className="flex flex-col min-h-full">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start mb-6"
          >
            <div className="bg-white border border-[#DBD0BD] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-1.5 h-1.5 bg-[#FF6700] rounded-full"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-[#FF6700] rounded-full"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-[#FF6700] rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-[#0C5446]/60 uppercase tracking-widest">Thinking</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
      </div>
    </div>
  );
}
