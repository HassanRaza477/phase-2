import React from 'react';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
  removable?: boolean;
}

/**
 * TagBadge - Displays a tag as a rounded badge
 * 
 * Features:
 * - Gray background (#DBD0BD style)
 * - Dark text for contrast
 * - Small font size (text-xs)
 * - Optional remove button (X)
 * - Accessible with proper ARIA attributes
 */
export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  className = '',
  removable = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 ${className}`}
      role="status"
      aria-label={`Tag: ${tag}`}
    >
      {tag}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 rounded-full p-0.5"
          aria-label={`Remove tag ${tag}`}
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default TagBadge;
