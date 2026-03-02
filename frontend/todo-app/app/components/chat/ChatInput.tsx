'use client';

import React, { useState, KeyboardEvent, ChangeEvent, useRef, useEffect } from 'react';
import { ChatInputProps } from '@/types/chat';
import { Send, Command } from 'lucide-react';

/**
 * ChatInput Component
 * 
 * Input field and send button for composing and sending messages.
 * Supports Enter key to send and Shift+Enter for new line.
 */
export default function ChatInput({
  onSend,
  isLoading,
  isDisabled,
  placeholder = "Talk to TaskFlow AI..."
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && !isDisabled) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const isSendDisabled = !message.trim() || isLoading || isDisabled;

  return (
    <div className="border-t border-[#DBD0BD] p-4 bg-white/80 backdrop-blur-md sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#FF6700] focus-within:border-transparent transition-all shadow-sm">
          {/* Message Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isDisabled}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-2 text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none resize-none min-h-[44px] max-h-[200px] disabled:cursor-not-allowed selection:bg-[#FF6700]/20"
            aria-label="Message input"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isSendDisabled}
            className={`flex items-center justify-center p-3 rounded-lg transition-all
                     ${isSendDisabled
                ? 'bg-[#DBD0BD] text-[#0C5446]/40 cursor-not-allowed'
                : 'bg-[#FF6700] text-white hover:bg-[#e55c00] hover:scale-105 active:scale-95 shadow-md'
              }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Shortcut Info */}
        <div className="flex items-center justify-center gap-4 mt-2 px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[#0C5446]/40">
            <span className="flex items-center justify-center min-w-[16px] px-1 h-4 bg-[#DBD0BD] rounded text-[#0C5446] font-bold">Enter</span>
            <span>to send</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#0C5446]/40">
            <span className="flex items-center justify-center min-w-[28px] px-1 h-4 bg-[#DBD0BD] rounded text-[#0C5446] font-bold">Shift</span>
            <span className="text-[#0C5446]">+</span>
            <span className="flex items-center justify-center min-w-[16px] px-1 h-4 bg-[#DBD0BD] rounded text-[#0C5446] font-bold">Enter</span>
            <span>for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
