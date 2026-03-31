import React, { useState, useRef, useEffect } from 'react';
import { TagBadge } from './TagBadge';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
  maxTags?: number;
  placeholder?: string;
}

/**
 * TagsInput - Multi-tag input component
 * 
 * Features:
 * - Enter key to add tags
 * - Display existing tags as badges
 * - Remove tag on X button click
 * - Validate max 10 tags
 * - Prevent duplicates
 * - Disabled state support
 * - Accessible with proper ARIA attributes
 */
export const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  disabled = false,
  className = '',
  id = 'tags',
  label,
  maxTags = 10,
  placeholder = 'Add tags...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    // Validate: not empty, not duplicate, not exceeding max
    if (!trimmedTag) return;
    if (value.includes(trimmedTag)) return;
    if (value.length >= maxTags) return;

    onChange([...value, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    // Add tag on blur if there's input
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  // Focus input when clicking on the container
  const handleContainerClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#0C5446] mb-1"
        >
          {label}
          <span className="text-[#0C5446]/60 font-normal ml-1">
            (Press Enter to add)
          </span>
        </label>
      )}
      <div
        className={`w-full min-h-[42px] px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg focus-within:ring-2 focus-within:ring-[#FF6700] focus-within:border-transparent transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
        }`}
        onClick={handleContainerClick}
        role="group"
        aria-label="Tags input"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Display existing tags */}
          {value.map((tag, index) => (
            <TagBadge
              key={tag}
              tag={tag}
              onRemove={() => !disabled && removeTag(tag)}
              removable={!disabled}
              className={disabled ? 'pointer-events-none' : ''}
            />
          ))}
          
          {/* Input field */}
          {!disabled && value.length < maxTags && (
            <input
              ref={inputRef}
              type="text"
              id={id}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-[#0C5446] placeholder-[#0C5446]/40 text-sm"
              aria-label="Add a tag"
              disabled={disabled}
            />
          )}
          
          {/* Max tags warning */}
          {value.length >= maxTags && (
            <span className="text-xs text-[#FF6700]">
              Maximum {maxTags} tags reached
            </span>
          )}
        </div>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-[#0C5446]/60 mt-1">
        {value.length} of {maxTags} tags used
      </p>
    </div>
  );
};

export default TagsInput;
