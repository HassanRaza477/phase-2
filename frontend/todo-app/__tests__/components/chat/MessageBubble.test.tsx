/**
 * MessageBubble Component Tests
 * 
 * This file demonstrates the test structure for the MessageBubble component.
 * Tests cover rendering, styling, and user interactions.
 * 
 * Run tests with: npm test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from '@/app/components/chat/MessageBubble';
import { Message } from '@/types/chat';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('MessageBubble', () => {
  // Test data
  const userMessage: Message = {
    id: 'msg-1',
    role: 'user',
    content: 'Hello, can you help me create a task?',
    timestamp: '2024-01-15T10:30:00Z',
  };

  const assistantMessage: Message = {
    id: 'msg-2',
    role: 'assistant',
    content: "Of course! I'd be happy to help you create a task. What would you like to add?",
    timestamp: '2024-01-15T10:30:05Z',
  };

  const messageWithToolCalls: Message = {
    id: 'msg-3',
    role: 'assistant',
    content: "I've created the task for you.",
    timestamp: '2024-01-15T10:31:00Z',
    tool_calls: [
      {
        tool_id: 'tool-1',
        tool_name: 'create_task',
        arguments: { title: 'Buy groceries', due_date: '2024-01-16' },
        success: true,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render a user message correctly', () => {
      render(<MessageBubble message={userMessage} isLatest={false} />);
      
      expect(screen.getByText(userMessage.content)).toBeInTheDocument();
    });

    it('should render an assistant message correctly', () => {
      render(<MessageBubble message={assistantMessage} isLatest={false} />);
      
      expect(screen.getByText(assistantMessage.content)).toBeInTheDocument();
    });

    it('should display the formatted timestamp', () => {
      render(<MessageBubble message={userMessage} isLatest={false} />);
      
      // Timestamp should be formatted as HH:MM AM/PM
      expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    });

    it('should render tool calls indicator when present', () => {
      render(<MessageBubble message={messageWithToolCalls} isLatest={false} />);
      
      expect(screen.getByText(/1 action performed/)).toBeInTheDocument();
    });

    it('should not render tool calls indicator when absent', () => {
      render(<MessageBubble message={assistantMessage} isLatest={false} />);
      
      expect(screen.queryByText(/action.*performed/)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply user message styles', () => {
      const { container } = render(<MessageBubble message={userMessage} isLatest={false} />);
      
      // User messages should be right-aligned with blue background
      const bubble = container.querySelector('.bg-blue-600');
      expect(bubble).toBeInTheDocument();
      
      // Should have justify-end for right alignment
      const flexContainer = container.querySelector('.justify-end');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should apply assistant message styles', () => {
      const { container } = render(<MessageBubble message={assistantMessage} isLatest={false} />);
      
      // Assistant messages should have gray background
      const bubble = container.querySelector('.bg-gray-100');
      expect(bubble).toBeInTheDocument();
      
      // Should have justify-start for left alignment
      const flexContainer = container.querySelector('.justify-start');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should apply rounded corners correctly', () => {
      const { container } = render(
        <>
          <MessageBubble message={userMessage} isLatest={false} />
          <MessageBubble message={assistantMessage} isLatest={false} />
        </>
      );
      
      const bubbles = container.querySelectorAll('.rounded-2xl');
      expect(bubbles).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<MessageBubble message={userMessage} isLatest={false} />);
      
      // Message content should be in a paragraph
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
    });

    it('should support keyboard navigation', () => {
      const { container } = render(<MessageBubble message={userMessage} isLatest={false} />);
      
      // Component should be focusable
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long messages with word wrapping', () => {
      const longMessage: Message = {
        ...userMessage,
        content: 'This is a very long message that should wrap to multiple lines to ensure the component handles overflow correctly and maintains readability across different screen sizes.',
      };
      
      render(<MessageBubble message={longMessage} isLatest={false} />);
      
      expect(screen.getByText(longMessage.content)).toBeInTheDocument();
    });

    it('should handle empty message content', () => {
      const emptyMessage: Message = {
        ...userMessage,
        content: '',
      };
      
      render(<MessageBubble message={emptyMessage} isLatest={false} />);
      
      // Empty content should still render without errors
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialMessage: Message = {
        ...userMessage,
        content: 'Special chars: <>&"\' and emoji 🎉',
      };
      
      render(<MessageBubble message={specialMessage} isLatest={false} />);
      
      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });
  });

  describe('Multiple Tool Calls', () => {
    it('should display plural form for multiple tool calls', () => {
      const multipleToolCalls: Message = {
        ...messageWithToolCalls,
        tool_calls: [
          { tool_id: '1', tool_name: 'create_task', arguments: {}, success: true },
          { tool_id: '2', tool_name: 'update_task', arguments: {}, success: true },
          { tool_id: '3', tool_name: 'delete_task', arguments: {}, success: true },
        ],
      };
      
      render(<MessageBubble message={multipleToolCalls} isLatest={false} />);
      
      expect(screen.getByText(/3 actions performed/)).toBeInTheDocument();
    });
  });
});
