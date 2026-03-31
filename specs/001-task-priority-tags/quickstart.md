# Quickstart: Task Priorities and Tags Implementation

**Feature**: 001-task-priority-tags
**Date**: 2026-03-10
**Audience**: Developers implementing the feature

---

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Database accessible (Neon PostgreSQL)
- User authenticated with valid JWT token

---

## Step 1: Run Database Migration

Execute the migration script to add priority and tags columns:

```bash
# Connect to your Neon database
psql "postgresql://neondb_owner:npg_YsuCb6JKF7XL@ep-noisy-waterfall-ainej9o7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Or run from backend directory
cd backend
psql $DATABASE_URL -f migrations/002_add_priority_tags_to_tasks.sql
```

**Verify Migration**:
```sql
-- Check columns exist
\d tasks

-- Should show:
-- priority    | character varying(20) | not null default 'medium'
-- tags        | character varying(50)[] | not null default '{}'
```

---

## Step 2: Update Backend Models

Update `backend/src/models/task.py`:

```python
from sqlalchemy import Column, CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY

class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            "priority IN ('high', 'medium', 'low')",
            name="check_priority"
        ),
    )
    
    # ... existing fields ...
    
    # New fields
    priority = Column(String(20), default='medium', nullable=False)
    tags = Column(ARRAY(String(50)), default=list, nullable=False)
```

---

## Step 3: Update Backend Schemas

Update `backend/src/models/schemas.py`:

```python
from pydantic import Field, field_validator
from typing import List, Optional

VALID_PRIORITIES = {"high", "medium", "low"}
MAX_TAGS = 10
MAX_TAG_LENGTH = 50

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="medium")
    tags: List[str] = Field(default_factory=list)
    
    @field_validator('priority')
    def validate_priority(cls, v):
        if v not in VALID_PRIORITIES:
            raise ValueError(f'Priority must be one of: {VALID_PRIORITIES}')
        return v
    
    @field_validator('tags')
    def validate_tags(cls, v):
        tags = [tag.strip() for tag in v]
        tags = [tag for tag in tags if tag]
        seen = set()
        unique_tags = []
        for tag in tags:
            if tag.lower() not in seen:
                seen.add(tag.lower())
                unique_tags.append(tag)
        
        if len(unique_tags) > MAX_TAGS:
            raise ValueError(f'Maximum {MAX_TAGS} tags allowed')
        
        for tag in unique_tags:
            if len(tag) > MAX_TAG_LENGTH:
                raise ValueError(f'Each tag must be {MAX_TAG_LENGTH} characters or less')
        
        return unique_tags

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str
    tags: List[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True
```

---

## Step 4: Update Backend API Endpoints

Update `backend/src/api/tasks.py` to handle priority and tags:

```python
from fastapi import Query

@router.post("/tasks", response_model=TaskResponse, status_code=201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_task = Task(
        **task.model_dump(),
        user_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/tasks", response_model=List[TaskResponse])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    priority: Optional[str] = Query(None),
    tag: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # Filter by priority
    if priority:
        query = query.filter(Task.priority == priority)
    
    # Filter by tags
    if tag:
        for t in tag:
            query = query.filter(Task.tags.any(t))
    
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks
```

---

## Step 5: Update Frontend Types

Update `frontend/todo-app/types/index.ts`:

```typescript
export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}
```

---

## Step 6: Create Frontend Components

Create `frontend/todo-app/app/components/task/PrioritySelector.tsx`:

```tsx
interface PrioritySelectorProps {
  value: string;
  onChange: (priority: string) => void;
  disabled?: boolean;
}

export default function PrioritySelector({ 
  value, 
  onChange, 
  disabled 
}: PrioritySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="high">🔴 High</option>
      <option value="medium">🟡 Medium</option>
      <option value="low">🟢 Low</option>
    </select>
  );
}
```

Create `frontend/todo-app/app/components/task/TagsInput.tsx`:

```tsx
interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export default function TagsInput({ 
  value, 
  onChange, 
  disabled 
}: TagsInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim()) && value.length < 10) {
        onChange([...value, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="border border-gray-300 rounded-lg p-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-gray-300 rounded-full p-0.5"
              disabled={disabled}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Add tag and press Enter"
        className="w-full outline-none"
      />
    </div>
  );
}
```

Create `frontend/todo-app/app/components/task/PriorityBadge.tsx`:

```tsx
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

const priorityColors = {
  high: 'bg-red-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-green-500 text-white',
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
```

Create `frontend/todo-app/app/components/task/TagBadge.tsx`:

```tsx
interface TagBadgeProps {
  tag: string;
}

export default function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
      {tag}
    </span>
  );
}
```

---

## Step 7: Update Dashboard Page

Update `frontend/todo-app/app/dashboard/page.tsx` to display priority and tags:

```tsx
import PriorityBadge from '../components/task/PriorityBadge';
import TagBadge from '../components/task/TagBadge';
import PrioritySelector from '../components/task/PrioritySelector';
import TagsInput from '../components/task/TagsInput';

// In task card component:
<div className="flex items-center gap-2 mb-2">
  <h3 className="text-lg font-semibold">{task.title}</h3>
  <PriorityBadge priority={task.priority} />
</div>

{task.tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-3">
    {task.tags.map(tag => (
      <TagBadge key={tag} tag={tag} />
    ))}
  </div>
)}
```

---

## Step 8: Add Filter Controls

Add filter controls to dashboard:

```tsx
const [filterPriority, setFilterPriority] = useState<string>('');
const [filterTag, setFilterTag] = useState<string>('');

// Filter dropdown
<select
  value={filterPriority}
  onChange={(e) => setFilterPriority(e.target.value)}
  className="border border-gray-300 rounded-lg px-3 py-2"
>
  <option value="">All Priorities</option>
  <option value="high">High</option>
  <option value="medium">Medium</option>
  <option value="low">Low</option>
</select>

// Tag filter input
<input
  type="text"
  value={filterTag}
  onChange={(e) => setFilterTag(e.target.value)}
  placeholder="Filter by tag"
  className="border border-gray-300 rounded-lg px-3 py-2"
/>
```

---

## Step 9: Test the Implementation

**Test 1: Create Task with Priority and Tags**
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "priority": "high",
    "tags": ["work", "test"]
  }'
```

**Test 2: Filter by Priority**
```bash
curl "http://localhost:8000/api/tasks?priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 3: Filter by Tag**
```bash
curl "http://localhost:8000/api/tasks?tag=work" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Migration Fails
- Ensure database connection is working
- Check if columns already exist
- Run rollback script and retry

### Priority Validation Error
- Ensure value is lowercase: 'high', 'medium', or 'low'
- Check for leading/trailing whitespace

### Tags Not Saving
- Ensure tags is an array, not string
- Check tag count (max 10) and length (max 50 chars)

### Filter Not Working
- Check query parameter names (priority, tag)
- Ensure JWT token is valid
- Verify user owns the tasks

---

## Next Steps

- Add tag autocomplete suggestions
- Implement tag cloud visualization
- Add priority statistics dashboard
- Enable bulk priority/tag updates
