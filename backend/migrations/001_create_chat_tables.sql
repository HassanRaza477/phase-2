-- Migration: 001_create_chat_tables
-- Created: 2026-02-23
-- Description: Add conversation and message tables for AI chat feature

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Conversation table
CREATE TABLE IF NOT EXISTS conversation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create Message table
CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversation(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_expires_at ON conversation(expires_at) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated ON conversation(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON message(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON message(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON message(role);

-- Create trigger to update updated_at on message insert
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversation SET updated_at = NEW.created_at WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON message;
CREATE TRIGGER trigger_update_conversation_on_message
AFTER INSERT ON message
FOR EACH ROW
EXECUTE FUNCTION update_conversation_updated_at();

-- Create cleanup function for expired conversations
CREATE OR REPLACE FUNCTION cleanup_expired_conversations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversation
    WHERE expires_at < NOW() AND is_deleted = FALSE;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
