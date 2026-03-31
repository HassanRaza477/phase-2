'use client';

import React from 'react';
import { SearchBar } from './SearchBar';
import { StatusFilter } from './StatusFilter';
import { PriorityFilter } from './PriorityFilter';
import { TagFilter } from './TagFilter';

interface FilterBarProps {
  // Search state
  searchQuery: string;
  onSearchChange: (value: string) => void;
  
  // Filter states
  filterStatus: 'all' | 'pending' | 'completed';
  onStatusChange: (status: 'all' | 'pending' | 'completed') => void;
  
  filterPriority: 'all' | 'high' | 'medium' | 'low';
  onPriorityChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  
  filterTag: string;
  onTagChange: (tag: string) => void;
  
  // Clear all handler
  onClearAll: () => void;
  
  className?: string;
}

/**
 * FilterBar - Combined filter bar component that includes all filter controls
 *
 * Features:
 * - Combines SearchBar, StatusFilter, PriorityFilter, and TagFilter
 * - Displays active filter count badge
 * - Provides "Clear All" button when filters are active
 * - Responsive layout with proper wrapping on small screens
 * - Accessible with ARIA labels
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPriority,
  onPriorityChange,
  filterTag,
  onTagChange,
  onClearAll,
  className = '',
}) => {
  // Count active filters
  const activeFilterCount = [
    searchQuery ? 1 : 0,
    filterStatus !== 'all' ? 1 : 0,
    filterPriority !== 'all' ? 1 : 0,
    filterTag ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className={`bg-white rounded-xl border border-[#DBD0BD] p-4 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4">
        {/* First row: Search and Status filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search tasks..."
              id="task-search-bar"
            />
          </div>
          <div className="flex items-center gap-2">
            <StatusFilter
              value={filterStatus}
              onChange={onStatusChange}
              id="status-filter-bar"
            />
          </div>
        </div>

        {/* Second row: Priority and Tag filters */}
        <div className="flex flex-wrap items-center gap-4">
          <PriorityFilter
            value={filterPriority}
            onChange={onPriorityChange}
            id="priority-filter-bar"
          />
          <TagFilter
            value={filterTag}
            onChange={onTagChange}
            id="tag-filter-bar"
            placeholder="Filter by tag..."
          />

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="ml-auto px-3 py-2 text-sm text-[#FF6700] hover:text-[#e55c00] font-medium transition-colors flex items-center gap-1"
              aria-label="Clear all filters"
              title="Clear all filters"
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
              Clear All
            </button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DBD0BD]">
            <span className="text-xs text-[#0C5446]/60">
              Active filters:
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium text-white bg-[#FF6700] rounded-full">
                {activeFilterCount}
              </span>
            </span>
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF6700]/10 text-[#FF6700]">
                Status: {filterStatus}
                <button
                  type="button"
                  onClick={() => onStatusChange('all')}
                  className="ml-1 hover:text-[#e55c00]"
                  aria-label="Clear status filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {filterPriority !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF6700]/10 text-[#FF6700]">
                Priority: {filterPriority}
                <button
                  type="button"
                  onClick={() => onPriorityChange('all')}
                  className="ml-1 hover:text-[#e55c00]"
                  aria-label="Clear priority filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {filterTag && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF6700]/10 text-[#FF6700]">
                Tag: {filterTag}
                <button
                  type="button"
                  onClick={() => onTagChange('')}
                  className="ml-1 hover:text-[#e55c00]"
                  aria-label="Clear tag filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-blue-600"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
