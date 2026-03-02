import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from src.db.database import engine, Base
from src.models import User, Task, Conversation, Message

def create_tables():
    """Create database tables"""
    print("Creating tables in Neon PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()