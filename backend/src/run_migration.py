import os
import sys
from sqlalchemy import text
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from src.db.database import engine

def migrate():
    """Run SQL migrations against database"""
    print("Running migration for 'tasks' table in Neon PostgreSQL...")
    
    # Read SQL file
    sql_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'migrations', '002_add_missing_task_columns.sql')
    
    with open(sql_file_path, 'r') as f:
        sql_commands = f.read()

    # Split commands by semicolon to run individually (though PostgreSQL handles multiple)
    # Actually just run the whole block
    
    with engine.connect() as connection:
        # Wrap everything in a transaction
        trans = connection.begin()
        try:
            # We need to run each command separately if using text() or use a single string
            # Execute each non-empty command
            for command in sql_commands.split(';'):
                clean_command = command.strip()
                if clean_command and not clean_command.startswith('--'):
                    print(f"Executing: {clean_command[:50]}...")
                    connection.execute(text(clean_command))
            
            trans.commit()
            print("Migration completed successfully!")
        except Exception as e:
            trans.rollback()
            print(f"Migration failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    migrate()
