/**
 * Authentication Utilities
 * 
 * Helper functions for JWT token management and authentication.
 */

const TOKEN_KEY = 'token';
const CONVERSATION_KEY = 'chat_conversation_id';

/**
 * Get the current JWT token from localStorage.
 * 
 * @returns The JWT token string or null if not found
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save the JWT token to localStorage.
 * 
 * @param token - The JWT token to store
 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the JWT token from localStorage.
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if the user is authenticated (has a token).
 * 
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Get the current conversation ID from localStorage.
 * 
 * @returns The conversation ID string or null if not found
 */
export function getConversationId(): string | null {
  return localStorage.getItem(CONVERSATION_KEY);
}

/**
 * Save the conversation ID to localStorage.
 * 
 * @param conversationId - The conversation ID to store
 */
export function saveConversationId(conversationId: string): void {
  localStorage.setItem(CONVERSATION_KEY, conversationId);
}

/**
 * Remove the conversation ID from localStorage.
 */
export function removeConversationId(): void {
  localStorage.removeItem(CONVERSATION_KEY);
}

/**
 * Clear all authentication data from localStorage.
 */
export function clearAuthData(): void {
  removeToken();
  removeConversationId();
}

/**
 * Decode a JWT token to extract payload information.
 * Note: This does not verify the token signature.
 * 
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired.
 * 
 * @param token - The JWT token to check
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Validate the current token and refresh if needed.
 *
 * @returns true if token is valid, false otherwise
 */
export function validateToken(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    clearAuthData();
    return false;
  }

  return true;
}

/**
 * Get the user ID from the JWT token payload.
 * The user ID is stored in the 'sub' (subject) claim.
 *
 * @returns The user ID string or null if not found
 */
export function getUserId(): string | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  const payload = decodeToken(token);
  if (!payload || !payload.sub) {
    return null;
  }

  return payload.sub;
}
