'use client';

import { motion } from 'framer-motion';
import { MessageBubbleProps } from '@/types/chat';

/**
 * MessageBubble Component
 * 
 * Displays an individual chat message with role-based styling.
 * User messages are right-aligned with red theme.
 * Assistant messages are left-aligned with dark green theme.
 * 
 * @param message - Message to display
 * @param isLatest - Whether this is the latest message (for auto-scroll)
 */
export default function MessageBubble({
  message
}: Omit<MessageBubbleProps, 'isLatest'>) {
  const isUser = message.role === 'user';

  // Format timestamp as HH:MM AM/PM
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  // Helper to get success message based on tool name
  const getSuccessMessage = (toolName: string) => {
    switch (toolName) {
      case 'create_task': return '✅ Task created successfully';
      case 'update_task': return '✏️ Task updated successfully';
      case 'delete_task': return '🗑️ Task deleted successfully';
      case 'complete_task': return '✅ Task status updated';
      default: return '✅ Action completed successfully';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-2`}
    >
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[80%]`}>
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-md transition-all duration-200 border
                     ${isUser
              ? 'bg-gradient-to-br from-[#FF6700] to-[#E55C00] text-white rounded-br-none border-[#FF6700]/10'
              : 'bg-white border-[#DBD0BD] text-[#0C5446] rounded-bl-none shadow-sm'
            }`}
        >
          {/* Role Header */}
          <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isUser ? 'bg-white/20' : 'bg-[#0C5446]/10'}`}>
              {isUser ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
              ) : (
                <svg className="w-3 h-3 text-[#0C5446]" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-white/80' : 'text-[#0C5446]/60'}`}>
              {isUser ? 'You' : 'TaskFlow AI'}
            </span>
          </div>

          {/* Message Content */}
          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Tool Call Feedbacks */}
          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.tool_calls.map((tool, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-xs border flex items-center justify-between ${tool.success
                      ? isUser ? 'bg-white/10 border-white/20 text-white' : 'bg-green-50 border-green-100 text-green-700'
                      : 'bg-red-50 border-red-100 text-red-700'
                    }`}
                >
                  <span className="font-medium">
                    {tool.success ? getSuccessMessage(tool.tool_name) : `❌ ${tool.error || 'Operation failed'}`}
                  </span>
                  {tool.success && (
                    <div className={`w-2 h-2 rounded-full ${isUser ? 'bg-white/40' : 'bg-green-400'} animate-pulse`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`mt-1 px-1 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-[#0C5446]/40 font-medium">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
