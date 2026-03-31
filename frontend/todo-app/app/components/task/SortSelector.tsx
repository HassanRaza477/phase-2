'use client';

import React from 'react';
import { SortOption } from '@/types';

interface SortSelectorProps {
  /** Current selected sort option */
  value: SortOption;
  /** Handler when sort option changes */
  onChange: (value: SortOption) => void;
  /** Optional CSS class name */
  className?: string;
  /** Optional ID for accessibility */
  id?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * SortSelector - Dropdown component for selecting task sort order
 *
 * Features:
 * - 4 sort options: Due Date, Priority, Alphabetical, Recently Created
 * - Visual icons/emojis for each option (📅 🎯 🔤 🕐)
 * - Controlled component with value and onChange props
 * - Responsive design with Tailwind CSS
 * - Full ARIA accessibility support
 * - Keyboard navigation friendly
 *
 * Usage:
 * ```tsx
 * const [sort, setSort] = useState<SortOption>('created_at');
 * <SortSelector value={sort} onChange={setSort} />
 * ```
 */
export const SortSelector: React.FC<SortSelectorProps> = ({
  value,
  onChange,
  className = '',
  id = 'sort-selector',
  disabled = false,
}) => {
  // Sort options with labels and icons
  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      value: 'due_date',
      label: 'Due Date',
      icon: '📅',
      description: 'Earliest due date first',
    },
    {
      value: 'priority',
      label: 'Priority',
      icon: '🎯',
      description: 'High to low priority',
    },
    {
      value: 'alphabetical',
      label: 'Alphabetical',
      icon: '🔤',
      description: 'A to Z by title',
    },
    {
      value: 'created_at',
      label: 'Recently Created',
      icon: '🕐',
      description: 'Newest tasks first',
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as SortOption);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#0C5446]/80 flex items-center gap-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
            clipRule="evenodd"
          />
        </svg>
        Sort by
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full appearance-none px-4 py-2.5 pr-10 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-[#FF6700]/50"
          aria-label="Sort tasks by"
          aria-describedby={`${id}-description`}
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-[#0C5446]"
            >
              {option.icon} {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#0C5446]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {/* Description for current selection */}
      <p
        id={`${id}-description`}
        className="text-xs text-[#0C5446]/50 flex items-center gap-1"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6700]"></span>
        {sortOptions.find((opt) => opt.value === value)?.description}
      </p>
    </div>
  );
};

export default SortSelector;
