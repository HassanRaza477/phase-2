from sqlalchemy.orm import Session
from ..models.user import User
from ..models.schemas import UserCreate, UserLogin
from ..core.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from ..core.config import settings

class AuthService:
    @staticmethod
    def create_user(db: Session, user: UserCreate):
        """Register a new user"""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise ValueError("Email already registered")
        
        # Hash password and create user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, user: UserLogin):
        """Authenticate user and return JWT token"""
        db_user = db.query(User).filter(User.email == user.email).first()
        
        if not db_user:
            return None
        
        if not verify_password(user.password, db_user.hashed_password):
            return None
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.email, "user_id": db_user.id},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    @staticmethod
    def get_user_by_email(db: Session, email: str):
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()