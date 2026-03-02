/**
 * ChatInput Component Tests
 * 
 * This file demonstrates the test structure for the ChatInput component.
 * Tests cover input handling, send functionality, and disabled states.
 * 
 * Run tests with: npm test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from '@/app/components/chat/ChatInput';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ChatInput', () => {
  // Mock callback functions
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the input field', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      expect(input).toBeInTheDocument();
    });

    it('should render the send button', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeInTheDocument();
    });

    it('should display the default placeholder', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByPlaceholderText('Type your message...');
      expect(input).toBeInTheDocument();
    });

    it('should display custom placeholder', () => {
      const customPlaceholder = 'Ask me anything...';
      render(
        <ChatInput 
          onSend={mockOnSend} 
          isLoading={false} 
          isDisabled={false} 
          placeholder={customPlaceholder} 
        />
      );
      
      const input = screen.getByPlaceholderText(customPlaceholder);
      expect(input).toBeInTheDocument();
    });

    it('should display helper text', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      expect(screen.getByText('Press Enter to send, Shift+Enter for new line')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should update input value when typing', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      
      expect(input).toHaveValue('Hello, world!');
    });

    it('should clear input after sending message', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(input).toHaveValue('');
    });

    it('should trim whitespace before sending', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: '   Test message   ' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('should not send empty message', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only message', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: '   ' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should send message on Enter key', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
      
      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('should not send message on Shift+Enter', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should prevent default on Enter key', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test' } });
      
      const event = fireEvent.keyDown(input, { key: 'Enter', shiftKey: false, cancelable: true });
      expect(event).toBe(false); // Event should be prevented
    });
  });

  describe('Loading State', () => {
    it('should show loading text when isLoading is true', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={true} isDisabled={false} />);
      
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    it('should show send button text when not loading', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      expect(screen.getByText('Send')).toBeInTheDocument();
    });

    it('should disable input when loading', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={true} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      expect(input).toBeDisabled();
    });

    it('should disable send button when loading', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={true} isDisabled={false} />);
      
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('should not send message when loading', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={true} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when isDisabled is true', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={true} />);
      
      const input = screen.getByLabelText('Message input');
      expect(input).toBeDisabled();
    });

    it('should disable send button when isDisabled is true', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={true} />);
      
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('should not send message when disabled', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={true} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should apply disabled styling', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={true} />);
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('disabled:bg-gray-100');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      expect(input).toHaveAttribute('aria-label', 'Message input');
    });

    it('should have aria-label on send button', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toHaveAttribute('aria-label', 'Send message');
    });

    it('should have aria-disabled when disabled', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={true} />);
      
      const input = screen.getByLabelText('Message input');
      expect(input).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have focus styles', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus:ring-2');
    });
  });

  describe('Callback Invocation', () => {
    it('should call onSend with correct message', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Hello, AI!' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      
      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith('Hello, AI!');
    });

    it('should call onSend only once per click', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} isDisabled={false} />);
      
      const input = screen.getByLabelText('Message input');
      fireEvent.change(input, { target: { value: 'Test' } });
      
      const sendButton = screen.getByLabelText('Send message');
      fireEvent.click(sendButton);
      fireEvent.click(sendButton); // Second click should not send (input is empty)
      
      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });
  });
});
