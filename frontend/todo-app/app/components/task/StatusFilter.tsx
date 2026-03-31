'use client';

import React from 'react';

interface StatusFilterProps {
  value: 'all' | 'pending' | 'completed';
  onChange: (status: 'all' | 'pending' | 'completed') => void;
  className?: string;
  id?: string;
}

/**
 * StatusFilter - Dropdown filter for task status
 *
 * Features:
 * - Dropdown select with options: All Status, Pending, Completed
 * - Controlled component with value prop
 * - onChange handler for parent component
 * - Accessible with ARIA labels
 * - Keyboard navigation support
 */
export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  className = '',
  id = 'status-filter',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as 'all' | 'pending' | 'completed');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-[#0C5446]/80 whitespace-nowrap">
        Status:
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all"
        aria-label="Filter by status"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
};

export default StatusFilter;
