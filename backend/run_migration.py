#!/usr/bin/env python3
"""
Database Migration Executor for Neon PostgreSQL
Executes SQL migration files and verifies schema changes.
"""

import psycopg2
from psycopg2 import sql
import sys
import os

# Database connection string from .env
DATABASE_URL = "postgresql://neondb_owner:npg_YsuCb6JKF7XL@ep-noisy-waterfall-ainej9o7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Migration file path
MIGRATION_FILE = "migrations/003_add_priority_tags_to_tasks.sql"

def read_migration_file(filepath):
    """Read SQL migration file content."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def execute_migration(conn, sql_content):
    """Execute migration SQL within a transaction."""
    try:
        with conn.cursor() as cur:
            # Execute the migration SQL
            cur.execute(sql_content)
            conn.commit()
            print("✓ Migration SQL executed successfully")
            return True
    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
        return False

def verify_schema(conn):
    """Verify the schema changes were applied correctly."""
    print("\n--- Verifying Schema Changes ---\n")
    
    try:
        with conn.cursor() as cur:
            # Check columns
            print("1. Checking columns in 'tasks' table:")
            print("-" * 60)
            cur.execute("""
                SELECT column_name, data_type, column_default, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name IN ('priority', 'tags')
                ORDER BY ordinal_position;
            """)
            columns = cur.fetchall()
            
            if columns:
                print(f"{'Column':<20} {'Data Type':<25} {'Default':<20} {'Nullable':<10}")
                print("-" * 60)
                for col in columns:
                    col_name, data_type, default, is_nullable = col
                    print(f"{col_name:<20} {data_type:<25} {str(default):<20} {is_nullable:<10}")
            else:
                print("WARNING: Expected columns not found!")
            
            # Check constraints
            print("\n2. Checking constraints on 'tasks' table:")
            print("-" * 60)
            cur.execute("""
                SELECT conname, contype, pg_get_constraintdef(oid)
                FROM pg_constraint
                WHERE conrelid = 'tasks'::regclass
                AND conname = 'check_priority_values';
            """)
            constraints = cur.fetchall()
            
            if constraints:
                for con in constraints:
                    print(f"Constraint: {con[0]}")
                    print(f"Type: {con[1]}")
                    print(f"Definition: {con[2]}")
            else:
                print("WARNING: check_priority_values constraint not found!")
            
            # Check indexes
            print("\n3. Checking indexes on 'tasks' table:")
            print("-" * 60)
            cur.execute("""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE tablename = 'tasks'
                AND indexname IN ('idx_tasks_priority', 'idx_tasks_tags')
                ORDER BY indexname;
            """)
            indexes = cur.fetchall()
            
            if indexes:
                for idx in indexes:
                    print(f"Index: {idx[0]}")
                    print(f"Definition: {idx[1]}")
                    print()
            else:
                print("WARNING: Expected indexes not found!")
            
            # Summary
            print("\n--- Migration Verification Summary ---")
            print(f"Columns found: {len(columns)}/2")
            print(f"Constraints found: {len(constraints)}/1")
            print(f"Indexes found: {len(indexes)}/2")
            
            success = len(columns) >= 2 and len(constraints) >= 1 and len(indexes) >= 2
            if success:
                print("\n✓ Migration verification PASSED")
            else:
                print("\n✗ Migration verification FAILED")
            
            return success
            
    except Exception as e:
        print(f"✗ Verification error: {e}")
        return False

def main():
    """Main migration execution function."""
    print("=" * 60)
    print("Database Migration: Task Priorities and Tags")
    print("=" * 60)
    print(f"Database: Neon PostgreSQL")
    print(f"Migration File: {MIGRATION_FILE}")
    print()
    
    # Read migration file
    print("Reading migration file...")
    try:
        sql_content = read_migration_file(MIGRATION_FILE)
        print(f"✓ Migration file loaded ({len(sql_content)} bytes)")
    except FileNotFoundError:
        print(f"✗ Migration file not found: {MIGRATION_FILE}")
        sys.exit(1)
    
    # Connect to database
    print("\nConnecting to Neon PostgreSQL...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✓ Connected successfully")
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        sys.exit(1)
    
    # Execute migration
    print("\nExecuting migration...")
    migration_success = execute_migration(conn, sql_content)
    
    # Verify schema
    if migration_success:
        verification_success = verify_schema(conn)
    else:
        verification_success = False
    
    # Close connection
    conn.close()
    print("\n✓ Database connection closed")
    
    # Exit with appropriate code
    if migration_success and verification_success:
        print("\n" + "=" * 60)
        print("MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("MIGRATION FAILED")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
