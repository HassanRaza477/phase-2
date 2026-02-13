from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import logging
from ..db.database import get_db
from ..models.schemas import TaskCreate, TaskUpdate, TaskResponse
from ..models.models import Task, User
from ..services.auth_service import AuthService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
router = APIRouter()
logger = logging.getLogger(__name__)

def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = AuthService.get_current_user(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.get("/tasks", response_model=List[TaskResponse])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        tasks = db.query(Task).filter(Task.user_id == current_user.id).offset(skip).limit(limit).all()
        return tasks
    except SQLAlchemyError as e:
        logger.error(f"Database error in read_tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_task = Task(**task.dict(), user_id=current_user.id)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in create_task: {e}")
        raise HTTPException(status_code=500, detail="Failed to create task")

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except SQLAlchemyError as e:
        logger.error(f"Database error in read_task: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch task")

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        for field, value in task_update.dict(exclude_unset=True).items():
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        return task
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in update_task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update task")

@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        db.delete(task)
        db.commit()
        return {"message": "Task deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in delete_task: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete task")

@router.patch("/tasks/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        task.completed = not task.completed
        db.commit()
        db.refresh(task)
        return task
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in toggle_task: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle task")