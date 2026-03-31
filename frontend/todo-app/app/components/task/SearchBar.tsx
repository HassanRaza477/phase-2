'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  maxLength?: number;
  debounceMs?: number;
}

/**
 * SearchBar - Controlled search input component for task filtering
 *
 * Features:
 * - Text input with placeholder "Search tasks..."
 * - Controlled component with value prop
 * - onChange handler for parent component
 * - Clear button (X) when value exists
 * - Max length 100 characters (configurable)
 * - Debounced input (300ms default, configurable)
 * - Accessible with ARIA labels
 * - Maintains focus after clear
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search tasks...',
  className = '',
  id = 'task-search',
  maxLength = 100,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange handler
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  const debouncedChange = useCallback(
    (newValue: string) => {
      const timeoutId = setTimeout(() => {
        handleChange(newValue);
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    },
    [debounceMs, handleChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    setLocalValue(newValue);
    debouncedChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    // Focus is maintained on the input automatically
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div
      className={`relative flex items-center ${className}`}
      role="search"
      aria-label="Task search"
    >
      <div className="relative flex-1">
        <input
          type="text"
          id={id}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-4 py-2 pr-10 bg-[#FCFAEF] border rounded-lg text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all ${
            isFocused || localValue
              ? 'border-[#FF6700]/50'
              : 'border-[#DBD0BD]'
          }`}
          aria-label="Search tasks by title or description"
          aria-describedby={localValue.length > 0 ? 'search-character-count' : undefined}
        />
        
        {/* Clear Button */}
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-[#0C5446]/40 hover:text-[#0C5446]/80 hover:bg-[#DBD0BD]/50 rounded transition-all"
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Character Count (visually hidden but accessible) */}
      {localValue.length > 0 && (
        <span id="search-character-count" className="sr-only">
          {localValue.length} of {maxLength} characters
        </span>
      )}
    </div>
  );
};

export default SearchBar;
