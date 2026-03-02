'use client';

import React from 'react';
import { LoadingSpinnerProps } from '@/types/chat';

/**
 * LoadingSpinner Component
 * 
 * Displays an animated loading spinner while waiting for API responses.
 * Supports multiple sizes and custom CSS classes.
 * 
 * @param size - Spinner size ('sm', 'md', 'lg')
 * @param className - Additional CSS classes
 */
export default function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div 
      className={`flex justify-center items-center py-4 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
