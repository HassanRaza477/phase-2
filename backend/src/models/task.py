from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
from ..db.database import Base


class Task(Base):
    """
    Task model representing a user's todo item with priority and tags.
    
    Attributes:
        id: Primary key identifier
        title: Task title (required, max 255 chars)
        description: Optional detailed description
        due_date: Optional deadline for the task
        priority: Task priority level (high, medium, low)
        tags: List of tags for organization (max 10 tags)
        completed: Completion status
        completed_at: Timestamp when task was completed
        created_at: Auto-generated creation timestamp
        updated_at: Auto-updated modification timestamp
        user_id: Foreign key to task owner
    """
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            "priority IN ('high', 'medium', 'low')",
            name="check_priority_values"
        ),
        {"extend_existing": True}
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String(20), nullable=False, default="medium")
    tags = Column(ARRAY(String(50)), nullable=False, default=list)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Relationships
    owner = relationship("User", back_populates="tasks")
