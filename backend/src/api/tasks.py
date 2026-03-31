from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_, or_, case, nullslast
from typing import List, Optional
import logging
import re

from ..db.database import get_db
from ..models.schemas import TaskCreate, TaskUpdate, TaskResponse
from ..models import Task, User
from ..services.auth_service import AuthService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
router = APIRouter()
logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────
MAX_SEARCH_LENGTH = 100
VALID_STATUSES = ["completed", "pending"]
VALID_PRIORITIES = ["high", "medium", "low"]
VALID_SORTS = ["due_date", "priority", "alphabetical", "created_at"]
DEFAULT_SORT = "created_at"


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


# ─── Validation Helpers ───────────────────────────────────────────────────────
def validate_search_query(search: Optional[str]) -> Optional[str]:
    """
    Validate and sanitize search query.
    
    Args:
        search: Raw search query string
        
    Returns:
        Sanitized search query or None if empty
        
    Raises:
        HTTPException: If search query exceeds max length
    """
    if search is None:
        return None
    
    # Trim whitespace
    sanitized = search.strip()
    
    # Return None if empty after trimming
    if not sanitized:
        return None
    
    # Validate max length
    if len(sanitized) > MAX_SEARCH_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "code": "SEARCH_TOO_LONG",
                "message": f"Search query must not exceed {MAX_SEARCH_LENGTH} characters"
            }
        )
    
    # Escape special SQL LIKE characters (%, _, \)
    # These need to be escaped to prevent SQL injection via LIKE queries
    sanitized = sanitized.replace('\\', '\\\\')
    sanitized = sanitized.replace('%', '\\%')
    sanitized = sanitized.replace('_', '\\_')
    
    return sanitized


def validate_status_filter(status_filter: Optional[str]) -> Optional[bool]:
    """
    Validate status filter parameter.
    
    Args:
        status_filter: Status string ('completed' or 'pending')
        
    Returns:
        Boolean value (True for completed, False for pending) or None
        
    Raises:
        HTTPException: If status value is invalid
    """
    if status_filter is None:
        return None
    
    status_lower = status_filter.lower().strip()
    
    if status_lower not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "code": "INVALID_STATUS",
                "message": f"Status must be one of: {', '.join(VALID_STATUSES)}"
            }
        )
    
    return status_lower == "completed"


def validate_priority_filter(priority_filter: Optional[str]) -> Optional[str]:
    """
    Validate priority filter parameter.
    
    Args:
        priority_filter: Priority string ('high', 'medium', or 'low')
        
    Returns:
        Validated priority string or None
        
    Raises:
        HTTPException: If priority value is invalid
    """
    if priority_filter is None:
        return None
    
    priority_lower = priority_filter.lower().strip()
    
    if priority_lower not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "code": "INVALID_PRIORITY",
                "message": f"Priority must be one of: {', '.join(VALID_PRIORITIES)}"
            }
        )
    
    return priority_lower


def validate_tag_filters(tags: Optional[List[str]]) -> Optional[List[str]]:
    """
    Validate tag filters.

    Args:
        tags: List of tag strings to filter by

    Returns:
        Validated list of tags or None

    Raises:
        HTTPException: If any tag is invalid
    """
    if tags is None or len(tags) == 0:
        return None

    validated_tags = []
    for tag in tags:
        trimmed = tag.strip()
        if trimmed:
            validated_tags.append(trimmed)

    return validated_tags if validated_tags else None


def validate_sort_option(sort_option: Optional[str]) -> str:
    """
    Validate sort option parameter.

    Args:
        sort_option: Sort option string (due_date, priority, alphabetical, created_at)

    Returns:
        Validated sort option or DEFAULT_SORT if None/invalid

    Note:
        Invalid sort options default to created_at without raising an error.
        This provides a graceful fallback for client errors.
    """
    if sort_option is None:
        return DEFAULT_SORT

    sort_lower = sort_option.lower().strip()

    if sort_lower not in VALID_SORTS:
        # Log invalid sort parameter for monitoring (optional)
        logger.info(f"Invalid sort parameter '{sort_option}', defaulting to '{DEFAULT_SORT}'")
        return DEFAULT_SORT

    return sort_lower


# ─── GET /tasks ───────────────────────────────────────────────────────────────
@router.get("/tasks")
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(
        None,
        max_length=MAX_SEARCH_LENGTH,
        description="Search keyword for title and description (case-insensitive)"
    ),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status (completed or pending)"
    ),
    priority: Optional[str] = Query(
        None,
        description="Filter by priority (high, medium, low)"
    ),
    tags: Optional[List[str]] = Query(
        None,
        description="Filter by tags (can specify multiple: ?tags=work&tags=urgent)"
    ),
    sort: Optional[str] = Query(
        None,
        description=f"Sort option ({', '.join(VALID_SORTS)}). Default: {DEFAULT_SORT}"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all tasks for the current user with optional search, filtering, and sorting.

    Query Parameters:
        - skip: Number of tasks to skip (pagination)
        - limit: Maximum number of tasks to return
        - search: Keyword to search in title and description (case-insensitive)
        - status: Filter by status (completed or pending)
        - priority: Filter by priority level (high, medium, low)
        - tags: Filter by tags (can specify multiple times: ?tags=work&tags=urgent)
        - sort: Sort option (due_date, priority, alphabetical, created_at). Default: created_at

    Returns:
        List of tasks matching the search and filters, scoped to the authenticated user.
        All filters use AND logic. Sort is applied after filtering.
    """
    try:
        # Validate and sanitize all input parameters
        sanitized_search = validate_search_query(search)
        validated_status = validate_status_filter(status_filter)
        validated_priority = validate_priority_filter(priority)
        validated_tags = validate_tag_filters(tags)
        validated_sort = validate_sort_option(sort)

        # Build base query scoped to user (user isolation)
        query = db.query(Task).filter(Task.user_id == current_user.id)

        # Build dynamic WHERE clause with all filters using AND logic
        conditions = []

        # Apply search query (case-insensitive substring match on title OR description)
        if sanitized_search is not None:
            # Use ILIKE for case-insensitive matching with escaped special chars
            search_pattern = f"%{sanitized_search}%"
            search_condition = or_(
                Task.title.ilike(search_pattern, escape='\\'),
                Task.description.ilike(search_pattern, escape='\\')
            )
            conditions.append(search_condition)

        # Apply status filter (exact boolean match)
        if validated_status is not None:
            conditions.append(Task.completed == validated_status)

        # Apply priority filter (exact string match)
        if validated_priority is not None:
            conditions.append(Task.priority == validated_priority)

        # Apply tag filter (PostgreSQL ARRAY overlap operator &&)
        # Tasks must contain ALL specified tags
        if validated_tags is not None and len(validated_tags) > 0:
            # Use PostgreSQL ARRAY overlap operator for efficient filtering
            # This checks if the task's tags array overlaps with the provided tags
            conditions.append(Task.tags.op("&&")(validated_tags))

        # Combine all conditions with AND logic
        if conditions:
            query = query.filter(and_(*conditions))

        # Apply sorting based on validated sort option
        # All sorts use secondary sort by created_at DESC for consistent ordering
        if validated_sort == "due_date":
            # Sort by due_date ASC (earliest first), NULLS LAST (tasks without due dates at end)
            # Secondary sort by created_at DESC for tasks with same due date
            query = query.order_by(nullslast(Task.due_date.asc()), Task.created_at.desc())
        elif validated_sort == "priority":
            # Sort by priority using CASE statement (high=1, medium=2, low=3)
            # Secondary sort by created_at DESC for tasks with same priority
            priority_order = case(
                (Task.priority == "high", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "low", 3),
                else_=4  # Fallback for any unexpected values
            )
            query = query.order_by(priority_order, Task.created_at.desc())
        elif validated_sort == "alphabetical":
            # Sort by title ASC (A-Z)
            # Secondary sort by created_at DESC for tasks with same title
            query = query.order_by(Task.title.asc(), Task.created_at.desc())
        else:  # created_at (default)
            # Sort by created_at DESC (newest first)
            query = query.order_by(Task.created_at.desc())

        # Paginate results
        tasks = (
            query
            .offset(skip)
            .limit(limit)
            .all()
        )

        task_list = [TaskResponse.model_validate(t).model_dump() for t in tasks]

        # Build response with filter and sort info
        response_message = f"Successfully fetched {len(tasks)} tasks"
        active_filters = []
        if sanitized_search:
            active_filters.append(f"search='{sanitized_search}'")
        if validated_status is not None:
            active_filters.append(f"status={'completed' if validated_status else 'pending'}")
        if validated_priority:
            active_filters.append(f"priority={validated_priority}")
        if validated_tags:
            active_filters.append(f"tags={validated_tags}")
        if validated_sort:
            active_filters.append(f"sort={validated_sort}")

        if active_filters:
            response_message += f" (filtered by: {', '.join(active_filters)})"

        return {
            "success": True,
            "message": response_message,
            "data": task_list,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "returned": len(tasks)
            },
            "filters": {
                "search": sanitized_search,
                "status": 'completed' if validated_status else 'pending' if validated_status is not None else None,
                "priority": validated_priority,
                "tags": validated_tags,
                "sort": validated_sort
            }
        }
    except HTTPException:
        raise
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
    """
    Create a new task for the current user.

    Request Body:
        - title: Task title (required, max 255 chars)
        - description: Optional description
        - due_date: Optional deadline
        - priority: Priority level (high, medium, low) - defaults to "medium"
        - tags: Array of tags (max 10, max 50 chars each, no duplicates)

    Returns:
        Created task with all fields including auto-generated ID and timestamps.
    """
    try:
        # Create task with validated data
        # Pydantic has already validated priority and tags
        task_data = task.model_dump(exclude_none=False)

        # Ensure tags is a list (handle None case)
        if task_data.get('tags') is None:
            task_data['tags'] = []

        # Remove duplicate tags automatically (case-sensitive)
        if task_data.get('tags'):
            task_data['tags'] = list(dict.fromkeys(task_data['tags']))

        db_task = Task(**task_data, user_id=current_user.id)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)

        task_data = TaskResponse.model_validate(db_task).model_dump()
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
        task_data = TaskResponse.model_validate(task).model_dump()
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
    """
    Update an existing task.

    Path Parameters:
        - task_id: ID of the task to update

    Request Body (all fields optional):
        - title: New title
        - description: New description
        - due_date: New deadline
        - priority: New priority level (high, medium, low)
        - tags: New array of tags
        - completed: Completion status

    Returns:
        Updated task with all fields.
    """
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

        # Process tags if provided
        if 'tags' in update_data and update_data['tags'] is not None:
            # Remove duplicates automatically
            update_data['tags'] = list(dict.fromkeys(update_data['tags']))

        for field, value in update_data.items():
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        task_data = TaskResponse.model_validate(task).model_dump()
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
        task_data = TaskResponse.model_validate(task).model_dump()
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
