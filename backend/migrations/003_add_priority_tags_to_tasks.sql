-- Migration: 002_add_priority_tags_to_tasks
-- Created: 2026-03-10
-- Description: Add priority and tags columns to tasks table for task organization

-- 1. Add priority column with CHECK constraint
-- Note: Column may already exist from previous migration, so we check first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'priority'
    ) THEN
        ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' NOT NULL;
    END IF;
END $$;

-- Add CHECK constraint for priority values (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'tasks' AND constraint_name = 'check_priority_values'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT check_priority_values 
        CHECK (priority IN ('high', 'medium', 'low'));
    END IF;
END $$;

-- 2. Add tags column as ARRAY (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'tags'
    ) THEN
        ALTER TABLE tasks ADD COLUMN tags VARCHAR(50)[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Create index on priority column (idempotent)
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- 4. Create GIN index on tags array for efficient array queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Verify schema after migration
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'tasks' 
-- ORDER BY ordinal_position;

-- Verify constraints
-- SELECT conname, contype, conbin 
-- FROM pg_constraint 
-- WHERE conrelid = 'tasks'::regclass;
