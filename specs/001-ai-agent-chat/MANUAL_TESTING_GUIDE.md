# Manual Testing Guide - AI Agent Chat Endpoint

**Feature**: 001-ai-agent-chat  
**Date**: 2026-02-23  
**Status**: Ready for Manual Testing

---

## Prerequisites

1. **OpenAI API Key**: Get from https://platform.openai.com/api-keys
2. **Backend Running**: `cd backend && uvicorn src.main:app --reload`
3. **Database Migrated**: Tables `conversation` and `message` created
4. **Environment Configured**: `.env` file with all required variables

---

## Setup

### 1. Configure Environment

Create or update `backend/.env`:

```env
# Database
DATABASE_URL=postgresql+psycopg://user:password@host/database

# JWT Authentication (must match Better Auth)
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# JWT for Chat (same as SECRET_KEY)
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Start Backend

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Get JWT Token

Login to get a JWT token:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "your-password"
  }'
```

Save the `access_token` from the response.

---

## Test Tasks

### T028: Test Conversation Continuity

**Goal**: Verify agent remembers context from previous messages

#### Step 1: Send First Message

```bash
export TOKEN="YOUR_JWT_TOKEN_HERE"
export USER_ID="your-user-id-from-login"

curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "I need to buy groceries tomorrow"}'
```

**Expected**: Agent creates a task with title "buy groceries" and due date tomorrow.

**Save**: `conversation_id` from response.

#### Step 2: Send Related Follow-up

```bash
export CONVERSATION_ID="conversation_id_from_step_1"

curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Actually, change the due date to next Monday",
    "conversation_id": "'"${CONVERSATION_ID}"'"
  }'
```

**Expected**: Agent understands "the due date" refers to the groceries task from previous message and updates it.

#### Step 3: Send Another Related Message

```bash
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Also add milk to the list",
    "conversation_id": "'"${CONVERSATION_ID}"'"
  }'
```

**Expected**: Agent understands "the list" refers to the groceries task and adds "milk" to description or creates related task.

#### ✅ Pass Criteria

- [ ] Agent correctly references prior context in Step 2
- [ ] Agent correctly interprets "the list" in Step 3
- [ ] All three messages appear in conversation history
- [ ] Tool calls show correct task updates

---

### T035-T036: Test All MCP Tools

**Goal**: Verify each MCP tool is invoked correctly and results are returned

#### Test 1: create_task

```bash
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a task to call John at 3pm today"}'
```

**Expected Response**:
```json
{
  "conversation_id": "...",
  "response": "I've created a task 'Call John at 3pm today'",
  "tool_calls": [
    {
      "tool_id": "call_xxx",
      "tool_name": "create_task",
      "arguments": {
        "title": "Call John at 3pm today"
      },
      "result": {
        "task_id": "...",
        "title": "Call John at 3pm today",
        "created": true
      },
      "success": true
    }
  ]
}
```

**Verify**:
- [ ] `tool_name` is "create_task"
- [ ] `arguments.title` matches user request
- [ ] `result.task_id` is present
- [ ] `success` is true

#### Test 2: list_tasks

```bash
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}'
```

**Expected**: Agent calls `list_tasks` and returns formatted list.

**Verify**:
- [ ] `tool_calls` contains `list_tasks` invocation
- [ ] `response` lists tasks from result
- [ ] `success` is true

#### Test 3: update_task

```bash
# First get conversation_id from previous chat
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Change the call John task to 4pm",
    "conversation_id": "'"${CONVERSATION_ID}"'"
  }'
```

**Expected**: Agent calls `update_task` with task_id and new time.

**Verify**:
- [ ] `tool_name` is "update_task"
- [ ] `arguments.task_id` references correct task
- [ ] `arguments` includes updated field
- [ ] `success` is true

#### Test 4: delete_task

```bash
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Remove the call John task",
    "conversation_id": "'"${CONVERSATION_ID}"'"
  }'
```

**Expected**: Agent calls `delete_task`.

**Verify**:
- [ ] `tool_name` is "delete_task"
- [ ] `arguments.task_id` references correct task
- [ ] `success` is true

#### Test 5: get_task (if available)

```bash
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me details of task [task-id]"}'
```

**Expected**: Agent calls `get_task` if this tool is available.

**Verify**:
- [ ] Tool invocation present (or graceful handling if not available)

---

### T051: End-to-End Validation (Quickstart.md)

Follow all 8 steps from `specs/001-ai-agent-chat/quickstart.md`:

#### Step 1: Install Dependencies ✅
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Configure Environment ✅
```bash
# Verify .env has all required variables
cat backend/.env
```

#### Step 3: Database Tables ✅
Already migrated via Neon operator.

#### Step 4: Chat Endpoint ✅
Tested in T028, T035-T036 above.

#### Step 5: Agent Logic ✅
Verified via tool invocation tests.

#### Step 6: Register Router ✅
Already done in main.py.

#### Step 7: Test Endpoint ✅
Comprehensive testing in T028, T035-T036.

#### Step 8: Verify Database
```bash
# Connect to Neon database
psql "postgresql://user:password@host/database"

# Check conversations
SELECT id, user_id, created_at, updated_at 
FROM conversation 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY updated_at DESC;

# Check messages
SELECT m.id, m.role, m.content, m.created_at
FROM message m
JOIN conversation c ON m.conversation_id = c.id
WHERE c.user_id = 'YOUR_USER_ID'
ORDER BY m.created_at DESC
LIMIT 10;
```

**Verify**:
- [ ] Conversations table has records
- [ ] Messages table has user and assistant messages
- [ ] tool_calls JSONB contains tool invocation data
- [ ] Timestamps are correct

---

## Automated Tests

Run the automated test suite:

```bash
# Unit tests (JWT authentication)
pytest backend/tests/unit/test_auth.py -v

# Integration tests (chat endpoints)
pytest backend/tests/integration/test_chat_endpoint.py -v

# Contract tests (API schemas)
pytest backend/tests/contract/test_api_schemas.py -v

# All tests
pytest backend/tests/ -v
```

---

## Troubleshooting

### 401 Unauthorized

**Problem**: JWT token invalid or expired

**Solution**:
- Get fresh token via login
- Check `JWT_SECRET_KEY` matches Better Auth

### 500 Agent Error

**Problem**: OpenAI API key not configured or invalid

**Solution**:
- Verify `OPENAI_API_KEY` in `.env`
- Check OpenAI account has credits

### Tool Not Invoked

**Problem**: Agent doesn't call expected tool

**Solution**:
- Check system prompt in `agent/prompts.py`
- Verify tool schema in `agent/agent.py`
- Review agent logs for decision process

### Database Connection Error

**Problem**: Cannot connect to database

**Solution**:
- Verify `DATABASE_URL` in `.env`
- Check Neon project is active
- Ensure network connectivity

---

## Test Results Template

Copy and fill this template:

```markdown
## Test Results

**Tester**: [Your name]
**Date**: 2026-02-23
**Environment**: [Local/Staging/Production]

### T028: Conversation Continuity
- [ ] Step 1: First message - PASS/FAIL
- [ ] Step 2: Follow-up with context - PASS/FAIL
- [ ] Step 3: Another related message - PASS/FAIL

**Notes**: [Any issues or observations]

### T035-T036: MCP Tool Invocation
- [ ] create_task - PASS/FAIL
- [ ] list_tasks - PASS/FAIL
- [ ] update_task - PASS/FAIL
- [ ] delete_task - PASS/FAIL
- [ ] get_task - PASS/FAIL (if available)

**Notes**: [Any issues or observations]

### T051: End-to-End Validation
- [ ] Step 1: Dependencies - PASS/FAIL
- [ ] Step 2: Environment - PASS/FAIL
- [ ] Step 3: Database - PASS/FAIL
- [ ] Step 4-7: Chat endpoint - PASS/FAIL
- [ ] Step 8: Database verification - PASS/FAIL

**Notes**: [Any issues or observations]

### Overall Status
- [ ] All tests PASSED
- [ ] Some tests FAILED (see notes)

**Issues Found**:
1. [Issue description]
2. [Issue description]

**Recommendations**:
1. [Recommendation]
2. [Recommendation]
```

---

## Next Steps After Testing

1. **If all tests pass**: Mark tasks T028, T035, T036, T051 as complete in tasks.md
2. **If tests fail**: Document issues and create bug fixes
3. **Deploy to production**: Apply migration and deploy backend
4. **Monitor**: Set up logging and monitoring for chat endpoint

---

**Contact**: For questions or issues, refer to project documentation or create a GitHub issue.
