import React from 'react';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
  showLabel?: boolean;
}

const priorityConfig = {
  high: {
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    label: 'High',
  },
  medium: {
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    label: 'Medium',
  },
  low: {
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    label: 'Low',
  },
};

/**
 * PriorityBadge - Displays task priority as a colored badge
 * 
 * Features:
 * - Color-coded: Red (High), Yellow (Medium), Green (Low)
 * - Rounded pill shape
 * - Accessible with text label
 * - Optional label display
 */
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = '',
  showLabel = true,
}) => {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} text-white ${className}`}
      aria-label={`Priority: ${config.label}`}
      role="status"
    >
      {showLabel ? config.label : null}
    </span>
  );
};

export default PriorityBadge;
