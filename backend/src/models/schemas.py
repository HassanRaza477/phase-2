from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# Task schemas
# Valid priority levels
PRIORITY_VALUES = ["high", "medium", "low"]
MAX_TAGS_COUNT = 10
MAX_TAG_LENGTH = 50


class TaskBase(BaseModel):
    """Base schema for task with common fields."""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"
    tags: Optional[List[str]] = []

    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        """Validate priority is one of the allowed values (case-sensitive)."""
        if v is not None and v not in PRIORITY_VALUES:
            raise ValueError(f'Priority must be one of: {", ".join(PRIORITY_VALUES)}')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        """
        Validate tags array:
        - Maximum 10 tags per task
        - Maximum 50 characters per tag
        - No duplicate tags (case-sensitive)
        """
        if v is None:
            return []
        
        if len(v) > MAX_TAGS_COUNT:
            raise ValueError(f'Maximum {MAX_TAGS_COUNT} tags allowed per task')
        
        for tag in v:
            if len(tag) > MAX_TAG_LENGTH:
                raise ValueError(f'Each tag must be {MAX_TAG_LENGTH} characters or less')
            if not tag.strip():
                raise ValueError('Tags cannot be empty or whitespace only')
        
        # Check for duplicates
        if len(v) != len(set(v)):
            raise ValueError('Duplicate tags are not allowed')
        
        return v


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    completed: Optional[bool] = None

    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        """Validate priority is one of the allowed values (case-sensitive)."""
        if v is not None and v not in PRIORITY_VALUES:
            raise ValueError(f'Priority must be one of: {", ".join(PRIORITY_VALUES)}')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        """
        Validate tags array:
        - Maximum 10 tags per task
        - Maximum 50 characters per tag
        - No duplicate tags (case-sensitive)
        """
        if v is None:
            return None
        
        if len(v) > MAX_TAGS_COUNT:
            raise ValueError(f'Maximum {MAX_TAGS_COUNT} tags allowed per task')
        
        for tag in v:
            if len(tag) > MAX_TAG_LENGTH:
                raise ValueError(f'Each tag must be {MAX_TAG_LENGTH} characters or less')
            if not tag.strip():
                raise ValueError('Tags cannot be empty or whitespace only')
        
        # Check for duplicates
        if len(v) != len(set(v)):
            raise ValueError('Duplicate tags are not allowed')
        
        return v


class TaskResponse(TaskBase):
    """Schema for task response with all fields."""
    id: int
    completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    user_id: int

    model_config = ConfigDict(from_attributes=True)
