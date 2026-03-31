# Quickstart: Task Search and Filtering Implementation

**Feature**: 001-task-search-filter
**Date**: 2026-03-10
**Audience**: Developers implementing the feature

---

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Database accessible (Neon PostgreSQL)
- User authenticated with valid JWT token
- Priority and tags feature already implemented

---

## Step 1: Update Backend API Endpoint

Update `backend/src/api/tasks.py` to accept query parameters:

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import or_

from ..db.database import get_db
from ..models import Task
from ..services.auth import get_current_user_from_token

router = APIRouter()

@router.get("/tasks")
def read_tasks(
    search: Optional[str] = Query(None, max_length=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    tag: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Get authenticated user
    user_id = get_current_user_from_token(authorization)
    
    # Base query - always filter by user_id
    query = db.query(Task).filter(Task.user_id == user_id)
    
    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )
    
    # Apply status filter
    if status:
        if status not in ['completed', 'pending']:
            raise HTTPException(
                status_code=400,
                detail={"code": "INVALID_STATUS", "message": "Status must be 'completed' or 'pending'"}
            )
        query = query.filter(Task.completed == (status == 'completed'))
    
    # Apply priority filter
    if priority:
        if priority not in ['high', 'medium', 'low']:
            raise HTTPException(
                status_code=400,
                detail={"code": "INVALID_PRIORITY", "message": "Priority must be 'high', 'medium', or 'low'"}
            )
        query = query.filter(Task.priority == priority)
    
    # Apply tag filter
    if tag:
        for t in tag:
            query = query.filter(Task.tags.any(t))
    
    # Order by created_at descending
    tasks = query.order_by(Task.created_at.desc()).all()
    
    return tasks
```

---

## Step 2: Create Frontend Search Component

Create `frontend/todo-app/app/components/task/SearchBar.tsx`:

```tsx
'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        maxLength={100}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

---

## Step 3: Create Filter Components

Create `frontend/todo-app/app/components/task/StatusFilter.tsx`:

```tsx
'use client';

interface StatusFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
    </select>
  );
}
```

Create `frontend/todo-app/app/components/task/PriorityFilter.tsx`:

```tsx
'use client';

interface PriorityFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Priorities</option>
      <option value="high">🔴 High</option>
      <option value="medium">🟡 Medium</option>
      <option value="low">🟢 Low</option>
    </select>
  );
}
```

---

## Step 4: Update Dashboard Page

Update `frontend/todo-app/app/dashboard/page.tsx` to integrate search and filters:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/client';
import SearchBar from '../components/task/SearchBar';
import StatusFilter from '../components/task/StatusFilter';
import PriorityFilter from '../components/task/PriorityFilter';
import TagFilter from '../components/task/TagFilter';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    tag: '',
  });

  // Fetch tasks when filters change
  useEffect(() => {
    const fetchTasks = async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.tag) params.append('tag', filters.tag);
      
      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      tag: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          onClear={() => setFilters({ ...filters, search: '' })}
        />
        
        <div className="flex gap-4 flex-wrap">
          <StatusFilter
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value || '' })}
          />
          <PriorityFilter
            value={filters.priority}
            onChange={(value) => setFilters({ ...filters, priority: value || '' })}
          />
          <TagFilter
            value={filters.tag}
            onChange={(value) => setFilters({ ...filters, tag: value || '' })}
          />
        </div>
        
        {/* Clear All Button */}
        {(filters.search || filters.status || filters.priority || filters.tag) && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>
      
      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No tasks found</p>
            {(filters.search || filters.status || filters.priority || filters.tag) && (
              <p className="text-sm mt-2">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              {/* Render priority badge, tags, etc. */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Step 5: Test the Implementation

**Test 1: Search by Keyword**
```bash
curl "http://localhost:8000/api/tasks?search=meeting" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 2: Filter by Status**
```bash
curl "http://localhost:8000/api/tasks?status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 3: Filter by Priority**
```bash
curl "http://localhost:8000/api/tasks?priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 4: Combined Search and Filters**
```bash
curl "http://localhost:8000/api/tasks?search=project&status=pending&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Search Not Working
- Verify search query is not empty or whitespace-only
- Check ILIKE operator is supported by database
- Ensure title and description columns are searchable

### Filters Not Applying
- Verify filter values match allowed enum values
- Check JWT token is valid
- Ensure user owns the tasks being filtered

### Slow Performance
- Verify indexes exist on status, priority, and tags columns
- Check query execution plan with EXPLAIN ANALYZE
- Ensure search query is limited to 100 characters

---

## Next Steps

- Add tag autocomplete suggestions
- Implement saved filter presets
- Add search result highlighting
- Enable keyboard shortcuts for filters
