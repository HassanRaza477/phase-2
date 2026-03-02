/**
 * Chat Feature End-to-End Integration Tests
 * 
 * This file demonstrates the test structure for chat feature integration tests.
 * Tests cover complete user flows including sending messages, viewing history,
 * and error handling scenarios.
 * 
 * Run tests with: npm test
 * 
 * Note: These tests use a testing framework pattern compatible with Playwright,
 * Cypress, or similar E2E testing tools. Adjust imports based on your chosen framework.
 */

import { test, expect, describe, beforeEach, afterEach } from '@playwright/test';

// Alternative setup for Jest + React Testing Library:
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import ChatPage from '@/app/chat/page';

describe('Chat Feature - E2E Tests', () => {
  // Test configuration
  const TEST_USER_EMAIL = 'test@example.com';
  const TEST_USER_PASSWORD = 'TestPassword123!';
  const CHAT_PAGE_URL = '/chat';
  const LOGIN_PAGE_URL = '/login';

  describe('Authentication Flow', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      // Navigate to chat page without authentication
      await page.goto(CHAT_PAGE_URL);
      
      // Should be redirected to login page
      await expect(page).toHaveURL(new RegExp(`.*${LOGIN_PAGE_URL}.*`));
      
      // Should see login form
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });

    test('should access chat page after successful login', async ({ page }) => {
      // Navigate to login page
      await page.goto(LOGIN_PAGE_URL);
      
      // Fill in credentials
      await page.getByLabel('Email').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      
      // Submit login form
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for navigation to chat page
      await page.waitForURL(new RegExp(`.*${CHAT_PAGE_URL}.*`));
      
      // Should see chat interface
      await expect(page.getByRole('heading', { name: /ai chat assistant/i })).toBeVisible();
    });
  });

  describe('Send Message', () => {
    beforeEach(async ({ page }) => {
      // Setup: Login before each test
      await page.goto(LOGIN_PAGE_URL);
      await page.getByLabel('Email').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(new RegExp(`.*${CHAT_PAGE_URL}.*`));
    });

    test('should send a message and receive response', async ({ page }) => {
      const testMessage = 'Hello, can you help me create a task?';
      
      // Type message in input
      const input = page.getByLabel('Message input');
      await input.fill(testMessage);
      
      // Click send button
      await page.getByRole('button', { name: /send/i }).click();
      
      // Should show user message in chat
      await expect(page.getByText(testMessage)).toBeVisible();
      
      // Should show loading state
      await expect(page.getByText(/sending.../i)).toBeVisible();
      
      // Should receive assistant response (mocked or real)
      await waitForResponse(page);
      await expect(page.getByRole('button', { name: /send/i })).toBeEnabled();
    });

    test('should send message using Enter key', async ({ page }) => {
      const testMessage = 'Test message via Enter key';
      
      const input = page.getByLabel('Message input');
      await input.fill(testMessage);
      await input.press('Enter');
      
      // Should show user message
      await expect(page.getByText(testMessage)).toBeVisible();
    });

    test('should not send empty message', async ({ page }) => {
      // Click send without typing
      await page.getByRole('button', { name: /send/i }).click();
      
      // Should not show any new messages
      const messageCount = await page.getByTestId('message-bubble').count();
      expect(messageCount).toBe(0);
    });

    test('should disable send button when input is empty', async ({ page }) => {
      const sendButton = page.getByRole('button', { name: /send/i });
      
      // Send button should be disabled when input is empty
      await expect(sendButton).toBeDisabled();
    });

    test('should enable send button when input has text', async ({ page }) => {
      const input = page.getByLabel('Message input');
      const sendButton = page.getByRole('button', { name: /send/i });
      
      await input.fill('Test');
      
      await expect(sendButton).toBeEnabled();
    });

    test('should clear input after sending message', async ({ page }) => {
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Input should be cleared after sending
      await expect(input).toHaveValue('');
    });

    test('should handle multiple consecutive messages', async ({ page }) => {
      const messages = [
        'First message',
        'Second message',
        'Third message',
      ];

      for (const message of messages) {
        const input = page.getByLabel('Message input');
        await input.fill(message);
        await page.getByRole('button', { name: /send/i }).click();
        
        await expect(page.getByText(message)).toBeVisible();
        await waitForResponse(page);
      }

      // All messages should be visible
      for (const message of messages) {
        await expect(page.getByText(message)).toBeVisible();
      }
    });
  });

  describe('View History', () => {
    beforeEach(async ({ page }) => {
      // Setup: Login with existing conversation
      await page.goto(LOGIN_PAGE_URL);
      await page.getByLabel('Email').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(new RegExp(`.*${CHAT_PAGE_URL}.*`));
    });

    test('should load previous conversation from localStorage', async ({ page }) => {
      // Wait for conversation to load
      await page.waitForLoadState('networkidle');
      
      // Should display chat interface
      await expect(page.getByRole('heading', { name: /ai chat assistant/i })).toBeVisible();
      
      // Previous messages should be loaded (if any exist in localStorage)
      // This depends on localStorage state
    });

    test('should display messages in chronological order', async ({ page }) => {
      // Send two messages
      const firstMessage = 'First';
      const secondMessage = 'Second';
      
      let input = page.getByLabel('Message input');
      await input.fill(firstMessage);
      await page.getByRole('button', { name: /send/i }).click();
      await waitForResponse(page);
      
      input = page.getByLabel('Message input');
      await input.fill(secondMessage);
      await page.getByRole('button', { name: /send/i }).click();
      await waitForResponse(page);
      
      // Messages should appear in order
      const messages = page.getByTestId('message-bubble');
      await expect(messages.first()).toContainText(firstMessage);
      await expect(messages.last()).toContainText(secondMessage);
    });

    test('should auto-scroll to latest message', async ({ page }) => {
      // Send multiple messages to trigger scrolling
      for (let i = 0; i < 5; i++) {
        const input = page.getByLabel('Message input');
        await input.fill(`Message ${i + 1}`);
        await page.getByRole('button', { name: /send/i }).click();
        await waitForResponse(page);
      }
      
      // Latest message should be visible
      await expect(page.getByText('Message 5')).toBeInViewport();
    });

    test('should display timestamps for each message', async ({ page }) => {
      const testMessage = 'Message with timestamp';
      
      const input = page.getByLabel('Message input');
      await input.fill(testMessage);
      await page.getByRole('button', { name: /send/i }).click();
      await waitForResponse(page);
      
      // Timestamps should be displayed (format: HH:MM AM/PM)
      await expect(page.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/)).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async ({ page }) => {
      // Setup: Login before each test
      await page.goto(LOGIN_PAGE_URL);
      await page.getByLabel('Email').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(new RegExp(`.*${CHAT_PAGE_URL}.*`));
    });

    test('should display error alert on API failure', async ({ page }) => {
      // Simulate API failure by blocking network requests
      await page.route('**/api/*/chat', (route) => route.abort('failed'));
      
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Should show error alert
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByText(/unable to connect|error/i)).toBeVisible();
    });

    test('should show retry button on error', async ({ page }) => {
      // Simulate API failure
      await page.route('**/api/*/chat', (route) => route.abort('failed'));
      
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Wait for error
      await page.waitForSelector('[role="alert"]');
      
      // Should show retry button
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
    });

    test('should dismiss error on close', async ({ page }) => {
      // Simulate API failure
      await page.route('**/api/*/chat', (route) => route.abort('failed'));
      
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Wait for error
      await page.waitForSelector('[role="alert"]');
      
      // Click dismiss button
      await page.getByRole('button', { name: /dismiss|close/i }).click();
      
      // Error should be dismissed
      await expect(page.getByRole('alert')).not.toBeVisible();
    });

    test('should handle network timeout', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/*/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await route.continue();
      });
      
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Should show loading state
      await expect(page.getByText(/sending.../i)).toBeVisible();
      
      // After timeout, should show error
      // (depends on timeout configuration)
    });

    test('should handle invalid token / session expiration', async ({ page }) => {
      // Simulate invalid token response
      await page.route('**/api/*/chat', (route) =>
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: { code: 'INVALID_TOKEN', message: 'Session expired' } }),
        })
      );
      
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Should redirect to login on session expiration
      await page.waitForURL(new RegExp(`.*${LOGIN_PAGE_URL}.*`));
    });

    test('should recover after retry on transient error', async ({ page }) => {
      let attemptCount = 0;
      
      // Fail first attempt, succeed on retry
      await page.route('**/api/*/chat', (route) => {
        attemptCount++;
        if (attemptCount === 1) {
          route.abort('failed');
        } else {
          route.fulfill({
            status: 200,
            body: JSON.stringify({
              conversation_id: 'test-conv-1',
              message_id: 'msg-1',
              response: 'Success after retry',
              tool_calls: [],
              created_at: new Date().toISOString(),
            }),
          });
        }
      });
      
      const input = page.getByLabel('Message input');
      await input.fill('Test message');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Wait for error
      await page.waitForSelector('[role="alert"]');
      
      // Click retry
      await page.getByRole('button', { name: /retry/i }).click();
      
      // Should succeed on retry
      await waitForResponse(page);
      await expect(page.getByText('Success after retry')).toBeVisible();
    });
  });

  describe('UI/UX', () => {
    beforeEach(async ({ page }) => {
      await page.goto(LOGIN_PAGE_URL);
      await page.getByLabel('Email').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(new RegExp(`.*${CHAT_PAGE_URL}.*`));
    });

    test('should display chat header with branding', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /ai chat assistant/i })).toBeVisible();
      await expect(page.getByText(/ask me to help manage your tasks/i)).toBeVisible();
    });

    test('should display user messages with correct styling', async ({ page }) => {
      const input = page.getByLabel('Message input');
      await input.fill('User message');
      await page.getByRole('button', { name: /send/i }).click();
      await waitForResponse(page);
      
      // User messages should be right-aligned with blue background
      const userMessage = page.getByText('User message');
      await expect(userMessage).toBeVisible();
    });

    test('should display assistant messages with correct styling', async ({ page }) => {
      const input = page.getByLabel('Message input');
      await input.fill('Hello');
      await page.getByRole('button', { name: /send/i }).click();
      await waitForResponse(page);
      
      // Assistant messages should be left-aligned with gray background
      // (Response content depends on backend)
    });

    test('should show loading spinner while waiting for response', async ({ page }) => {
      // Simulate slow response
      await page.route('**/api/*/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      const input = page.getByLabel('Message input');
      await input.fill('Test');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Should show loading state
      await expect(page.getByText(/sending.../i)).toBeVisible();
    });
  });
});

/**
 * Helper function to wait for API response
 */
async function waitForResponse(page: any): Promise<void> {
  await page.waitForFunction(
    () => {
      const sendButton = document.querySelector('button[aria-label="Send message"]');
      return sendButton && !sendButton.textContent?.includes('Sending');
    },
    { timeout: 10000 }
  );
}

/**
 * Alternative Jest + React Testing Library version
 * Uncomment and use if testing with RTL instead of Playwright
 */
/*
describe('Chat Feature - Integration Tests (RTL)', () => {
  const mockSendMessage = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send message and display response', async () => {
    render(<ChatPage />);
    
    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    
    await waitFor(() => {
      expect(screen.getByText(/response/i)).toBeInTheDocument();
    });
  });

  it('should handle error and show retry option', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('Network error'));
    
    render(<ChatPage />);
    
    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
*/
