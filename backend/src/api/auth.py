from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging
from ..db.database import get_db
from ..models.schemas import UserCreate, UserLogin, Token, UserResponse
from ..services.auth_service import AuthService
from ..models import User

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = AuthService.create_user(db, user)
        # Convert to Pydantic for serialization if needed, or return dict
        user_data = UserResponse.from_orm(new_user).model_dump()
        return {
            "success": True,
            "message": "User registered successfully",
            "data": user_data
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": str(e)}
        )
    except Exception as e:
        logger.error(f"Error during registration: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": f"Registration failed: {str(e)}"}
        )

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        token_data = AuthService.authenticate_user(db, user)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"success": False, "message": "Incorrect email or password"},
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user for additional data
        db_user = db.query(User).filter(User.email == user.email).first()
        user_info = UserResponse.from_orm(db_user).model_dump()
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "access_token": token_data.access_token,
                "token_type": "bearer",
                "user": user_info
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": "An unexpected error occurred during login"}
        )