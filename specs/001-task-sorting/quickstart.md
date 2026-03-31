# Quickstart: Task Sorting Implementation

**Feature**: 001-task-sorting
**Date**: 2026-03-10
**Audience**: Developers implementing the feature

---

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Database accessible (Neon PostgreSQL)
- User authenticated with valid JWT token
- Previous features (priority, tags, search, filter) already implemented

---

## Step 1: Update Backend API Endpoint

Update `backend/src/api/tasks.py` to accept sort parameter:

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import or_, desc, asc, nullslast, case

from ..db.database import get_db
from ..models import Task
from ..services.auth import get_current_user_from_token

router = APIRouter()

# Valid sort options
VALID_SORTS = ["due_date", "priority", "alphabetical", "created_at"]
DEFAULT_SORT = "created_at"

@router.get("/tasks")
def read_tasks(
    search: Optional[str] = Query(None, max_length=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    sort: Optional[str] = Query(DEFAULT_SORT),
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Get authenticated user
    user_id = get_current_user_from_token(authorization)
    
    # Validate sort parameter
    if sort not in VALID_SORTS:
        sort = DEFAULT_SORT  # Default to created_at for invalid values
    
    # Base query - always filter by user_id
    query = db.query(Task).filter(Task.user_id == user_id)
    
    # Apply search filter (existing code)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )
    
    # Apply status filter (existing code)
    if status:
        query = query.filter(Task.completed == (status == 'completed'))
    
    # Apply priority filter (existing code)
    if priority:
        query = query.filter(Task.priority == priority)
    
    # Apply tag filter (existing code)
    if tags:
        for tag in tags:
            query = query.filter(Task.tags.any(tag))
    
    # Apply sorting
    if sort == "due_date":
        query = query.order_by(nullslast(Task.due_date.asc()), Task.created_at.desc())
    elif sort == "priority":
        # Custom sort for priority (high, medium, low)
        priority_order = case(
            (Task.priority == 'high', 1),
            (Task.priority == 'medium', 2),
            (Task.priority == 'low', 3),
        )
        query = query.order_by(priority_order, Task.created_at.desc())
    elif sort == "alphabetical":
        query = query.order_by(Task.title.asc(), Task.created_at.desc())
    elif sort == "created_at":
        query = query.order_by(Task.created_at.desc())
    
    # Execute query
    tasks = query.all()
    
    return tasks
```

---

## Step 2: Create Frontend Sort Component

Create `frontend/todo-app/app/components/task/SortSelector.tsx`:

```tsx
'use client';

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <div className="mb-4">
      <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="due_date">📅 Due Date</option>
        <option value="priority">🎯 Priority</option>
        <option value="alphabetical">🔤 Alphabetical</option>
        <option value="created_at">🕐 Recently Created</option>
      </select>
    </div>
  );
}
```

---

## Step 3: Update Dashboard Page

Update `frontend/todo-app/app/dashboard/page.tsx` to integrate sort selector:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/client';
import SearchBar from '../components/task/SearchBar';
import StatusFilter from '../components/task/StatusFilter';
import PriorityFilter from '../components/task/PriorityFilter';
import TagFilter from '../components/task/TagFilter';
import SortSelector from '../components/task/SortSelector';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    tag: '',
    sort: 'created_at', // Default sort
  });

  // Fetch tasks when filters or sort changes
  useEffect(() => {
    const fetchTasks = async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.sort) params.append('sort', filters.sort);
      
      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, [filters]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      
      {/* Search, Filters, and Sort */}
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
          <SortSelector
            value={filters.sort}
            onChange={(value) => setFilters({ ...filters, sort: value })}
          />
        </div>
      </div>
      
      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No tasks found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              {/* Render priority badge, tags, due date, etc. */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Step 4: Test the Implementation

**Test 1: Sort by Due Date**
```bash
curl "http://localhost:8000/api/tasks?sort=due_date" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 2: Sort by Priority**
```bash
curl "http://localhost:8000/api/tasks?sort=priority" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 3: Sort Alphabetically**
```bash
curl "http://localhost:8000/api/tasks?sort=alphabetical" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 4: Sort by Creation Date (Default)**
```bash
curl "http://localhost:8000/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 5: Combined with Search and Filters**
```bash
curl "http://localhost:8000/api/tasks?search=project&status=pending&sort=due_date" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Sort Not Working
- Verify sort parameter is one of: due_date, priority, alphabetical, created_at
- Check database connection
- Ensure tasks exist in database

### Incorrect Order
- Verify ORDER BY clause in backend
- Check secondary sort is applied (created_at DESC)
- Ensure null handling is correct (NULLS LAST for due_date)

### Slow Performance
- Verify indexes exist on sortable columns
- Check query execution plan with EXPLAIN ANALYZE
- Ensure database-level sorting (not client-side)

---

## Next Steps

- Add sort direction toggle (ascending/descending)
- Implement multi-level sorting
- Add user sort preferences
- Save sort settings across sessions
