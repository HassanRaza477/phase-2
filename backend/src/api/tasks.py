from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import logging

from ..db.database import get_db
from ..models.schemas import TaskCreate, TaskUpdate, TaskResponse
from ..models import Task, User
from ..services.auth_service import AuthService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
router = APIRouter()
logger = logging.getLogger(__name__)


# ─── Auth Dependency ──────────────────────────────────────────────────────────
def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Verify JWT token and return the current user."""
    token = credentials.credentials
    user = AuthService.get_current_user(db, token)
    if not user:
        logger.warning("Authentication failed: invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "code": "INVALID_TOKEN",
                "message": "Invalid or expired authentication token. Please log in again."
            },
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ─── GET /tasks ───────────────────────────────────────────────────────────────
@router.get("/tasks")
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all tasks for the current user."""
    try:
        tasks = (
            db.query(Task)
            .filter(Task.user_id == current_user.id)
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        task_list = [TaskResponse.from_orm(t).model_dump() for t in tasks]
        return {
            "success": True,
            "message": f"Successfully fetched {len(tasks)} tasks",
            "data": task_list
        }
    except SQLAlchemyError as e:
        logger.error(f"[GET /tasks] Database error for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "code": "DATABASE_ERROR",
                "message": f"Failed to fetch tasks: {str(e)}"
            }
        )


# ─── POST /tasks ──────────────────────────────────────────────────────────────
@router.post("/tasks", status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task for the current user."""
    try:
        db_task = Task(**task.model_dump(exclude_none=False), user_id=current_user.id)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        task_data = TaskResponse.from_orm(db_task).model_dump()
        return {
            "success": True,
            "message": "Task created successfully",
            "data": task_data
        }
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"[POST /tasks] Database error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "code": "DATABASE_ERROR",
                "message": f"Failed to create task: {str(e)}"
            }
        )


# ─── GET /tasks/{task_id} ─────────────────────────────────────────────────────
@router.get("/tasks/{task_id}")
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID."""
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "code": "TASK_NOT_FOUND",
                    "message": f"Task with ID {task_id} was not found"
                }
            )
        task_data = TaskResponse.from_orm(task).model_dump()
        return {
            "success": True,
            "message": "Task fetched successfully",
            "data": task_data
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"[GET /tasks/{task_id}] Database error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "code": "DATABASE_ERROR",
                "message": f"Failed to fetch task: {str(e)}"
            }
        )


# ─── PUT /tasks/{task_id} ─────────────────────────────────────────────────────
@router.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing task."""
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "code": "TASK_NOT_FOUND",
                    "message": f"Task with ID {task_id} was not found"
                }
            )

        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        task_data = TaskResponse.from_orm(task).model_dump()
        return {
            "success": True,
            "message": "Task updated successfully",
            "data": task_data
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"[PUT /tasks/{task_id}] Database error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "code": "DATABASE_ERROR",
                "message": f"Failed to update task: {str(e)}"
            }
        )


# ─── DELETE /tasks/{task_id} ──────────────────────────────────────────────────
@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task permanently."""
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "code": "TASK_NOT_FOUND",
                    "message": f"Task with ID {task_id} was not found"
                }
            )

        title = task.title
        db.delete(task)
        db.commit()
        return {
            "success": True,
            "message": f"Task '{title}' deleted successfully",
            "data": {"deleted_task_id": task_id}
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"[DELETE /tasks/{task_id}] Database error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "code": "DATABASE_ERROR",
                "message": f"Failed to delete task: {str(e)}"
            }
        )


# ─── PATCH /tasks/{task_id}/toggle ───────────────────────────────────────────
@router.patch("/tasks/{task_id}/toggle")
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle a task's completion status."""
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "code": "TASK_NOT_FOUND",
                    "message": f"Task with ID {task_id} was not found"
                }
            )

        task.completed = not task.completed
        if task.completed:
            from datetime import datetime
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None
            
        db.commit()
        db.refresh(task)
        task_data = TaskResponse.from_orm(task).model_dump()
        return {
            "success": True,
            "message": f"Task marked as {'completed' if task.completed else 'pending'}",
            "data": task_data
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"[PATCH /tasks/{task_id}/toggle] Database error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "code": "DATABASE_ERROR",
                "message": f"Failed to toggle task: {str(e)}"
            }
        )