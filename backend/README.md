# Todo Backend API

This is the backend API for the Full-Stack Multi-User Todo Web Application.

## Technologies Used

- Python 3.11+
- FastAPI
- SQLModel
- PostgreSQL
- JWT for authentication
- OpenAI Agents SDK (for AI chat feature)

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the application:
   ```bash
   uvicorn src.main:app --reload
   ```

## API Documentation

The API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Tasks

- `GET /tasks/` - Get all tasks for the current user
- `POST /tasks/` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a task
- `PATCH /tasks/{task_id}/toggle-completion` - Toggle task completion status
- `DELETE /tasks/{task_id}` - Delete a task

### AI Agent Chat (NEW)

- `POST /api/{user_id}/chat` - Send a natural language message to the AI agent
- `GET /api/{user_id}/conversations` - List all conversations
- `GET /api/{user_id}/conversations/{conversation_id}` - Get conversation with messages
- `DELETE /api/{user_id}/conversations/{conversation_id}` - Delete a conversation

---

## AI Agent Chat Feature

The AI Agent Chat feature allows users to manage tasks through natural language conversations. The AI agent can create, update, delete, and list tasks based on user intent.

### Configuration

Add the following to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# JWT Secret (must match Better Auth secret)
JWT_SECRET_KEY=your-shared-secret-key-here
JWT_ALGORITHM=HS256
```

### Usage Examples

#### 1. Create a Task via Natural Language

```bash
# First, login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "your-password"}'

# Use the token to chat with AI agent
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries tomorrow"}'
```

**Example Response:**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "response": "I've created a task 'Buy groceries' due tomorrow.",
  "tool_calls": [
    {
      "tool_id": "call_123",
      "tool_name": "create_task",
      "arguments": {
        "title": "Buy groceries",
        "due_date": "2026-02-24"
      },
      "result": {
        "task_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "title": "Buy groceries",
        "created": true
      },
      "success": true
    }
  ],
  "created_at": "2026-02-23T14:30:00Z"
}
```

#### 2. Continue a Conversation

```bash
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Change the due date to Friday",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

#### 3. List All Conversations

```bash
curl -X GET http://localhost:8000/api/{user_id}/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-02-20T10:00:00Z",
      "updated_at": "2026-02-23T14:30:00Z",
      "message_count": 15,
      "last_message_preview": "I've created a task 'Buy groceries' due tomorrow."
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### 4. Get Conversation with Messages

```bash
curl -X GET http://localhost:8000/api/{user_id}/conversations/{conversation_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Delete a Conversation

```bash
curl -X DELETE http://localhost:8000/api/{user_id}/conversations/{conversation_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example Conversation Flows

#### Create Task
```
User: "Add a task to buy groceries tomorrow"
AI: "I've created a task 'Buy groceries' due tomorrow."
```

#### List Tasks
```
User: "What tasks do I have?"
AI: [Calls list_tasks] "You have 3 tasks: 1. Buy groceries (due tomorrow), 2. Call John (due today), ..."
```

#### Update Task
```
User: "Change the groceries task due date to Friday"
AI: [Calls update_task] "I've updated the due date for 'Buy groceries' to Friday."
```

#### Delete Task
```
User: "Remove the groceries task"
AI: [Calls delete_task] "I've deleted the task 'Buy groceries'."
```

### Error Handling

The API returns structured error responses:

**401 Unauthorized - Invalid Token:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token"
  }
}
```

**400 Bad Request - Empty Message:**
```json
{
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message cannot be empty"
  }
}
```

**404 Not Found - Conversation Not Found:**
```json
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "The specified conversation does not exist"
  }
}
```

### Testing

Run the test suite:

```bash
# Unit tests
pytest backend/tests/unit/test_auth.py -v

# Integration tests
pytest backend/tests/integration/test_chat_endpoint.py -v

# Contract tests
pytest backend/tests/contract/test_api_schemas.py -v

# All tests
pytest backend/tests/ -v
```

### Database Migration

The chat feature requires database tables. Run the migration:

```bash
# Connect to your Neon database
psql "postgresql://user:password@host/database"

# Run migration
\i backend/migrations/001_create_chat_tables.sql
```

### Architecture

```
User Message → JWT Verification → Chat Endpoint → Agent Processing → MCP Tool → Database
                     ↓                                      ↓
              User Validation                    Store Message & Response
```

**Key Components:**
- `backend/src/api/chat.py` - Chat endpoints (POST /chat, GET /conversations, etc.)
- `backend/src/agent/agent.py` - OpenAI agent integration and tool execution
- `backend/src/agent/prompts.py` - System prompts for AI behavior
- `backend/src/services/auth.py` - JWT verification service
- `backend/src/models/conversation.py` - Conversation SQLModel
- `backend/src/models/message.py` - Message SQLModel
- `backend/migrations/001_create_chat_tables.sql` - Database schema

### Security

- All endpoints require JWT authentication
- User isolation enforced at database query level
- User ID validated against JWT token subject
- No cross-user data access possible

### Performance

- Conversation context limited to last 50 messages (sliding window)
- Database indexes on user_id, conversation_id, created_at
- Stateless architecture (no in-memory session state)
- Supports 100+ concurrent requests

---

## MCP Tools

The backend includes MCP (Model Context Protocol) tools for task operations:

- `add_task` - Create a new task
- `list_tasks` - List tasks with filters
- `update_task` - Update a task
- `delete_task` - Delete a task
- `complete_task` - Mark task as completed

These tools are invoked by the AI agent based on user intent.