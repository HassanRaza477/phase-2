# Data Model: Task Priorities and Tags

**Feature**: 001-task-priority-tags
**Date**: 2026-03-10
**Source**: Derived from spec.md Key Entities and Functional Requirements

---

## Overview

This document defines the updated Task data model with priority and tags support. The changes are backward compatible with existing tasks.

---

## Updated Task Model

### Database Schema (PostgreSQL)

```sql
-- Existing columns (unchanged)
id              INTEGER PRIMARY KEY
title           VARCHAR(255) NOT NULL
description     TEXT
user_id         INTEGER REFERENCES users(id)
completed       BOOLEAN DEFAULT FALSE
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()

-- New columns
priority        VARCHAR(20) DEFAULT 'medium' NOT NULL
tags            VARCHAR(50)[] DEFAULT '{}'

-- Constraints
CONSTRAINT check_priority CHECK (priority IN ('high', 'medium', 'low'))
```

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from typing import List, Optional
from datetime import datetime

VALID_PRIORITIES = {"high", "medium", "low"}

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            "priority IN ('high', 'medium', 'low')",
            name="check_priority"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    user_id: int = Field(foreign_key="users.id")
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # New fields
    priority: str = Field(default="medium", max_length=20)
    tags: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String(50)), default=list)
    )
```

---

## Field Specifications

### Priority Field

**Type**: VARCHAR(20) / Python str  
**Allowed Values**: 'high', 'medium', 'low'  
**Default**: 'medium'  
**Nullable**: No  
**Constraints**: CHECK constraint enforcing valid values  

**Validation Rules**:
- Must be one of: 'high', 'medium', 'low'
- Case-sensitive (must be lowercase)
- Cannot be null or empty
- Default to 'medium' if not provided

**Examples**:
```python
# Valid
task.priority = "high"
task.priority = "medium"
task.priority = "low"

# Invalid - will raise validation error
task.priority = "urgent"  # Not in allowed values
task.priority = "HIGH"    # Wrong case
task.priority = ""        # Empty string
```

### Tags Field

**Type**: ARRAY of VARCHAR(50) / Python List[str]  
**Default**: Empty list []  
**Nullable**: No (but empty list is valid)  
**Max Items**: 10 tags per task  
**Max Length**: 50 characters per tag  

**Validation Rules**:
- Each tag must be 1-50 characters
- Maximum 10 tags per task
- No duplicate tags (automatically deduplicated)
- Whitespace trimmed from both ends
- Empty tags (after trimming) are rejected
- Case preserved (no automatic lowercasing)

**Examples**:
```python
# Valid
task.tags = ["work", "urgent", "meeting"]
task.tags = ["personal"]
task.tags = []  # No tags

# Invalid - will raise validation error
task.tags = ["work", "work", "urgent"]  # Duplicates removed automatically
task.tags = ["a" * 51]  # Tag too long (>50 chars)
task.tags = list(range(11))  # Too many tags (>10)
task.tags = ["", "valid"]  # Empty tag rejected
```

---

## Pydantic Schemas

### TaskCreate Schema

```python
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

MAX_TAGS = 10
MAX_TAG_LENGTH = 50
VALID_PRIORITIES = {"high", "medium", "low"}

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    priority: str = Field(default="medium")
    tags: List[str] = Field(default_factory=list)
    
    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        if v not in VALID_PRIORITIES:
            raise ValueError(f'Priority must be one of: {VALID_PRIORITIES}')
        return v
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        # Trim whitespace
        tags = [tag.strip() for tag in v]
        # Remove empty tags
        tags = [tag for tag in tags if tag]
        # Remove duplicates while preserving order
        seen = set()
        unique_tags = []
        for tag in tags:
            if tag.lower() not in seen:
                seen.add(tag.lower())
                unique_tags.append(tag)
        
        # Validate count
        if len(unique_tags) > MAX_TAGS:
            raise ValueError(f'Maximum {MAX_TAGS} tags allowed')
        
        # Validate length
        for tag in unique_tags:
            if len(tag) > MAX_TAG_LENGTH:
                raise ValueError(f'Each tag must be {MAX_TAG_LENGTH} characters or less')
        
        return unique_tags
```

### TaskUpdate Schema

```python
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    priority: Optional[str] = Field(default=None)
    tags: Optional[List[str]] = Field(default=None)
    completed: Optional[bool] = Field(default=None)
    
    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f'Priority must be one of: {VALID_PRIORITIES}')
        return v
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if v is None:
            return v
        # Same validation as TaskCreate
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
```

### TaskResponse Schema

```python
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

## Database Migration

### Migration Script

```sql
-- Migration: 002_add_priority_tags_to_tasks
-- Created: 2026-03-10
-- Description: Add priority and tags columns to tasks table

-- Step 1: Add nullable priority column (allows zero-downtime deployment)
ALTER TABLE tasks 
ADD COLUMN priority VARCHAR(20);

-- Step 2: Set default value for existing rows
UPDATE tasks 
SET priority = 'medium' 
WHERE priority IS NULL;

-- Step 3: Make column not null with default
ALTER TABLE tasks 
ALTER COLUMN priority SET DEFAULT 'medium',
ALTER COLUMN priority SET NOT NULL;

-- Step 4: Add CHECK constraint for validation
ALTER TABLE tasks
ADD CONSTRAINT check_priority 
CHECK (priority IN ('high', 'medium', 'low'));

-- Step 5: Add tags column (ARRAY type, PostgreSQL-specific)
ALTER TABLE tasks
ADD COLUMN tags VARCHAR(50)[] DEFAULT '{}';

-- Step 6: Create indexes for filtering performance
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Step 7: Add comment for documentation
COMMENT ON COLUMN tasks.priority IS 'Task priority: high, medium, or low';
COMMENT ON COLUMN tasks.tags IS 'Array of tag labels (max 10 tags, 50 chars each)';
```

### Rollback Script

```sql
-- Rollback: Remove priority and tags columns
DROP INDEX IF EXISTS idx_tasks_tags;
DROP INDEX IF EXISTS idx_tasks_priority;
ALTER TABLE tasks DROP COLUMN IF EXISTS tags;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_priority;
ALTER TABLE tasks DROP COLUMN IF EXISTS priority;
```

---

## Query Examples

### Filter by Priority

```sql
-- Get all high priority tasks
SELECT * FROM tasks 
WHERE user_id = :user_id 
  AND priority = 'high'
ORDER BY created_at DESC;
```

### Filter by Tag

```sql
-- Get tasks with specific tag
SELECT * FROM tasks 
WHERE user_id = :user_id 
  AND :tag = ANY(tags)
ORDER BY created_at DESC;
```

### Filter by Multiple Tags (AND logic)

```sql
-- Get tasks with ALL specified tags
SELECT * FROM tasks 
WHERE user_id = :user_id 
  AND tags @> ARRAY[:tag1, :tag2]
ORDER BY created_at DESC;
```

### Filter by Priority and Tag

```sql
-- Combined filter
SELECT * FROM tasks 
WHERE user_id = :user_id 
  AND priority = 'high'
  AND :tag = ANY(tags)
ORDER BY created_at DESC;
```

### Update Priority

```sql
UPDATE tasks 
SET priority = 'high', 
    updated_at = NOW()
WHERE id = :task_id 
  AND user_id = :user_id;
```

### Update Tags

```sql
UPDATE tasks 
SET tags = ARRAY['work', 'urgent', 'meeting'],
    updated_at = NOW()
WHERE id = :task_id 
  AND user_id = :user_id;
```

---

## Validation Flow

### Backend Validation (Python)

```python
def validate_task_priority(priority: str) -> str:
    """Validate priority value."""
    if priority not in {"high", "medium", "low"}:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "code": "INVALID_PRIORITY",
                "message": "Priority must be 'high', 'medium', or 'low'"
            }
        )
    return priority

def validate_task_tags(tags: List[str]) -> List[str]:
    """Validate and normalize tags."""
    MAX_TAGS = 10
    MAX_TAG_LENGTH = 50
    
    # Trim whitespace
    tags = [tag.strip() for tag in tags]
    
    # Remove empty tags
    tags = [tag for tag in tags if tag]
    
    # Remove duplicates (case-insensitive)
    seen = set()
    unique_tags = []
    for tag in tags:
        if tag.lower() not in seen:
            seen.add(tag.lower())
            unique_tags.append(tag)
    
    # Validate count
    if len(unique_tags) > MAX_TAGS:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "code": "TOO_MANY_TAGS",
                "message": f"Maximum {MAX_TAGS} tags allowed"
            }
        )
    
    # Validate length
    for tag in unique_tags:
        if len(tag) > MAX_TAG_LENGTH:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "code": "TAG_TOO_LONG",
                    "message": f"Each tag must be {MAX_TAG_LENGTH} characters or less"
                }
            )
    
    return unique_tags
```

---

## Notes

- All existing tasks automatically get priority='medium' via migration
- Empty tags array [] is valid (task with no tags)
- Tags are stored exactly as entered (case preserved)
- Duplicate detection is case-insensitive ("Work" and "work" are duplicates)
- Database constraint ensures data integrity even if application validation fails
- Indexes on priority and tags enable fast filtering
