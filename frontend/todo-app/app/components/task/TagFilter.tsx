'use client';

import React from 'react';

interface TagFilterProps {
  value: string;
  onChange: (tag: string) => void;
  className?: string;
  id?: string;
  placeholder?: string;
}

/**
 * TagFilter - Input field for filtering tasks by tag
 *
 * Features:
 * - Text input for tag filter
 * - Controlled component with value prop
 * - onChange handler for parent component
 * - Accessible with ARIA labels
 * - Keyboard navigation support
 */
export const TagFilter: React.FC<TagFilterProps> = ({
  value,
  onChange,
  className = '',
  id = 'tag-filter',
  placeholder = 'Filter by tag...',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-[#0C5446]/80 whitespace-nowrap">
        Tag:
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] text-sm placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all"
        aria-label="Filter by tag"
      />
    </div>
  );
};

export default TagFilter;
