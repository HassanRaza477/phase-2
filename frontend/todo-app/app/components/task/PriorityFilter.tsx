'use client';

import React from 'react';

interface PriorityFilterProps {
  value: 'all' | 'high' | 'medium' | 'low';
  onChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  className?: string;
  id?: string;
}

/**
 * PriorityFilter - Dropdown filter for task priority with emoji indicators
 *
 * Features:
 * - Dropdown select with options: All Priorities, High (🔴), Medium (🟡), Low (🟢)
 * - Controlled component with value prop
 * - onChange handler for parent component
 * - Emoji indicators for visual priority recognition
 * - Accessible with ARIA labels
 * - Keyboard navigation support
 */
export const PriorityFilter: React.FC<PriorityFilterProps> = ({
  value,
  onChange,
  className = '',
  id = 'priority-filter',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as 'all' | 'high' | 'medium' | 'low');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-[#0C5446]/80 whitespace-nowrap">
        Priority:
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all"
        aria-label="Filter by priority"
      >
        <option value="all">All Priorities</option>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>
    </div>
  );
};

export default PriorityFilter;
