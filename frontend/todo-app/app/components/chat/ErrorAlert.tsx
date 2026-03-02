'use client';

import React from 'react';
import { ErrorAlertProps } from '@/types/chat';

/**
 * ErrorAlert Component
 * 
 * Displays error messages with optional retry and dismiss actions.
 * Uses a red color scheme to indicate errors.
 * 
 * @param error - Error message to display
 * @param onRetry - Optional callback for retry action
 * @param onDismiss - Optional callback for dismiss action
 */
export default function ErrorAlert({ 
  error, 
  onRetry, 
  onDismiss 
}: ErrorAlertProps) {
  return (
    <div 
      className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 my-2"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 flex items-start gap-3">
          {/* Error Icon */}
          <svg
            className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          
          {/* Error Message */}
          <p className="text-sm text-red-800">{error}</p>
        </div>
        
        {/* Action Buttons */}
        {(onRetry || onDismiss) && (
          <div className="flex gap-2 flex-shrink-0">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-red-800 hover:text-red-900 font-medium 
                         px-3 py-1 rounded-md hover:bg-red-100 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                aria-label="Retry sending message"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-red-600 hover:text-red-800 font-medium 
                         px-3 py-1 rounded-md hover:bg-red-100 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
