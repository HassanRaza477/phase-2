# Data Model: AI Agent Chat Endpoint

**Feature**: 001-ai-agent-chat
**Date**: 2026-02-23
**Source**: Derived from spec.md Key Entities and Functional Requirements

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │ Conversation│         │   Message   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄───────┤│ user_id (FK)│         │ id (PK)     │
│ email       │         │ created_at  │◄───────┤│ conversation│
│ created_at  │         │ updated_at  │         │ role        │
└─────────────┘         │ is_deleted  │         │ content     │
                        └─────────────┘         │ tool_calls  │
                                                │ created_at  │
                                                └─────────────┘
```

---

## Table: Conversation

**Purpose**: Represents a chat session between a user and the AI agent

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique conversation identifier |
| user_id | UUID | FOREIGN KEY REFERENCES User(id), NOT NULL | Owner of the conversation |
| created_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | When conversation was created |
| updated_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | Last message timestamp |
| expires_at | TIMESTAMPTZ | DEFAULT NOW() + INTERVAL '1 year', NOT NULL | Auto-deletion date |
| is_deleted | BOOLEAN | DEFAULT FALSE, NOT NULL | Soft delete flag |

**Indexes**:
- `idx_conversations_user_id` ON Conversation(user_id)
- `idx_conversations_expires_at` ON Conversation(expires_at) WHERE is_deleted = FALSE
- `idx_conversations_user_updated` ON Conversation(user_id, updated_at DESC)

**Validation Rules**:
- user_id must reference existing User
- updated_at >= created_at
- expires_at > created_at

**State Transitions**:
- **Created**: Initial state when first message is sent
- **Active**: Messages being added (updated_at refreshed)
- **Expired**: expires_at < NOW(), eligible for cleanup job
- **Deleted**: is_deleted = TRUE, user manually deleted

---

## Table: Message

**Purpose**: Individual messages within a conversation (user inputs and agent responses)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| conversation_id | UUID | FOREIGN KEY REFERENCES Conversation(id), NOT NULL | Parent conversation |
| role | VARCHAR(20) | CHECK (role IN ('user', 'assistant', 'system')), NOT NULL | Message sender type |
| content | TEXT | NOT NULL | Message text content |
| tool_calls | JSONB | DEFAULT NULL | Tool invocation details (if applicable) |
| created_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | When message was created |

**Indexes**:
- `idx_messages_conversation_id` ON Message(conversation_id)
- `idx_messages_conversation_created` ON Message(conversation_id, created_at ASC)
- `idx_messages_role` ON Message(role)

**Validation Rules**:
- conversation_id must reference existing Conversation
- role must be one of: 'user', 'assistant', 'system'
- tool_calls must be valid JSON if present

**tool_calls JSON Schema**:
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "tool_id": {"type": "string"},
      "tool_name": {"type": "string"},
      "arguments": {"type": "object"},
      "result": {"type": "object"},
      "success": {"type": "boolean"},
      "error": {"type": "string"}
    },
    "required": ["tool_id", "tool_name", "arguments"]
  }
}
```

---

## SQLModel Models

### Conversation Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from uuid import UUID

class Conversation(SQLModel, table=True):
    __tablename__ = "conversation"
    
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=365), nullable=False)
    is_deleted: bool = Field(default=False, nullable=False)
    
    messages: list["Message"] = Relationship(back_populates="conversation")
```

### Message Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any

class Message(SQLModel, table=True):
    __tablename__ = "message"
    
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", nullable=False)
    role: str = Field(nullable=False, max_length=20)
    content: str = Field(nullable=False)
    tool_calls: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"server_default": "null"})
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
    conversation: Conversation = Relationship(back_populates="messages")
```

---

## Database Migrations

### Migration: Create Conversation and Message Tables

```sql
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

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversation(user_id);
CREATE INDEX idx_conversations_expires_at ON conversation(expires_at) WHERE is_deleted = FALSE;
CREATE INDEX idx_conversations_user_updated ON conversation(user_id, updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON message(conversation_id);
CREATE INDEX idx_messages_conversation_created ON message(conversation_id, created_at ASC);
CREATE INDEX idx_messages_role ON message(role);

-- Create trigger to update updated_at on message insert
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversation SET updated_at = NEW.created_at WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
AFTER INSERT ON message
FOR EACH ROW
EXECUTE FUNCTION update_conversation_updated_at();
```

### Migration: Add Cleanup Job for Expired Conversations

```sql
-- Migration: 002_add_conversation_cleanup
-- Created: 2026-02-23
-- Description: Add function to delete expired conversations

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
```

---

## Query Patterns

### Get Conversation with Messages

```sql
SELECT 
    c.id,
    c.user_id,
    c.created_at,
    c.updated_at,
    m.id as message_id,
    m.role,
    m.content,
    m.tool_calls,
    m.created_at as message_created_at
FROM conversation c
LEFT JOIN message m ON c.id = m.conversation_id
WHERE c.id = :conversation_id
  AND c.user_id = :user_id
  AND c.is_deleted = FALSE
ORDER BY m.created_at ASC;
```

### Get Recent Messages (Sliding Window)

```sql
SELECT 
    id,
    role,
    content,
    tool_calls,
    created_at
FROM message
WHERE conversation_id = :conversation_id
ORDER BY created_at DESC
LIMIT 50;
```

### Create New Conversation

```sql
INSERT INTO conversation (user_id, created_at, updated_at, expires_at)
VALUES (:user_id, NOW(), NOW(), NOW() + INTERVAL '1 year')
RETURNING id;
```

### Create Message

```sql
INSERT INTO message (conversation_id, role, content, tool_calls)
VALUES (:conversation_id, :role, :content, :tool_calls::jsonb)
RETURNING id;
```

### Delete Conversation (Soft Delete)

```sql
UPDATE conversation 
SET is_deleted = TRUE, updated_at = NOW()
WHERE id = :conversation_id AND user_id = :user_id;
```

### Cleanup Expired Conversations (Scheduled Job)

```sql
-- Run daily via cron or scheduled task
SELECT cleanup_expired_conversations();
```

---

## Validation Rules

### Conversation Validation

1. **User Ownership**: user_id must reference existing User
2. **Expiration**: expires_at must be in the future
3. **Timestamps**: updated_at >= created_at

### Message Validation

1. **Conversation Exists**: conversation_id must reference existing Conversation
2. **Valid Role**: role must be 'user', 'assistant', or 'system'
3. **Content Required**: content cannot be empty or null
4. **Tool Calls Format**: If present, tool_calls must be valid JSON matching schema

### User Isolation

1. **All queries must filter by user_id**: Prevents cross-user data access
2. **JWT verification**: user_id from token must match request path
3. **Database-level enforcement**: Foreign key constraints and WHERE clauses

---

## Data Retention Policy

- **Active Conversations**: Retained for 1 year from creation
- **Manually Deleted**: Soft delete (is_deleted = TRUE), hard delete after 30 days
- **Expired**: Automatically deleted by daily cleanup job
- **User Export**: Users can request all conversation data (GDPR compliance)
