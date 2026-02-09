from sqlalchemy.orm import Session
from ..models.task import Task
from ..models.schemas import TaskCreate, TaskUpdate
from typing import List, Optional

class TaskService:
    @staticmethod
    def create_task(db: Session, task: TaskCreate, user_id: int):
        """Create a new task for a user"""
        db_task = Task(
            title=task.title,
            description=task.description,
            completed=task.completed,
            user_id=user_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    
    @staticmethod
    def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
        """Get all tasks for a specific user"""
        return db.query(Task).filter(Task.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_task(db: Session, task_id: int, user_id: int) -> Optional[Task]:
        """Get a specific task for a user"""
        return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    
    @staticmethod
    def update_task(db: Session, task_id: int, user_id: int, task_update: TaskUpdate):
        """Update a task"""
        db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        
        if not db_task:
            return None
        
        # Update only provided fields
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task
    
    @staticmethod
    def delete_task(db: Session, task_id: int, user_id: int) -> bool:
        """Delete a task"""
        db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        
        if not db_task:
            return False
        
        db.delete(db_task)
        db.commit()
        return True
    
    @staticmethod
    def toggle_task_completion(db: Session, task_id: int, user_id: int):
        """Toggle task completion status"""
        db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        
        if not db_task:
            return None
        
        db_task.completed = not db_task.completed
        db.commit()
        db.refresh(db_task)
        return db_task