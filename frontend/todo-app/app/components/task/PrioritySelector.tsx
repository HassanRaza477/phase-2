import React from 'react';

interface PrioritySelectorProps {
  value: 'high' | 'medium' | 'low';
  onChange: (priority: 'high' | 'medium' | 'low') => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
}

/**
 * PrioritySelector - Dropdown select for task priority
 * 
 * Features:
 * - Controlled component with value prop
 * - Three options: High, Medium, Low
 * - Disabled state support
 * - Optional label
 * - Accessible with proper ARIA attributes
 */
export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  id = 'priority',
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as 'high' | 'medium' | 'low');
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#0C5446] mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label={label || 'Select priority'}
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
};

export default PrioritySelector;
