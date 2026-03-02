from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models import User
from ..models.schemas import UserCreate, UserLogin, Token
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        try:
            # Check if user exists
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise ValueError("Email already registered")

            hashed_password = AuthService.get_password_hash(user_data.password)
            db_user = User(email=user_data.email, hashed_password=hashed_password)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except SQLAlchemyError as e:
            db.rollback()
            raise RuntimeError(f"Database error: {str(e)}")
        except Exception as e:
            db.rollback()
            raise

    @staticmethod
    def authenticate_user(db: Session, user_data: UserLogin) -> Optional[Token]:
        try:
            db_user = db.query(User).filter(User.email == user_data.email).first()
            if not db_user:
                return None
            if not AuthService.verify_password(user_data.password, db_user.hashed_password):
                return None

            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            # Use user ID as the subject (sub) claim for consistency
            access_token = AuthService.create_access_token(
                data={"sub": str(db_user.id), "email": db_user.email},
                expires_delta=access_token_expires
            )
            return Token(access_token=access_token)
        except SQLAlchemyError:
            return None
        except Exception:
            return None

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def get_current_user(db: Session, token: str) -> Optional[User]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                return None
            # Convert to int since we store user ID as string in JWT
            user_id = int(user_id_str)
        except (JWTError, ValueError, TypeError) as e:
            logger.error(f"Token decode error: {e}")
            return None

        try:
            user = db.query(User).filter(User.id == user_id).first()
            return user
        except SQLAlchemyError as e:
            logger.error(f"DB error fetching user: {e}")
            return None