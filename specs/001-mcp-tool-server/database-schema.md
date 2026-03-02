# Database Schema: Existing vs Required

**Feature**: MCP Tool Server  
**Branch**: `001-mcp-tool-server`  
**Date**: 2026-02-22  
**Purpose**: Document gap analysis between existing database schema and MCP tool requirements

---

## Existing Schema (from `backend/src/models/models.py`)

### Users Table

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    updated_at = Column(DateTime(timezone=False), onupdate=func.now(), server_default=func.now())

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
```

### Tasks Table

```python
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    owner = relationship("User", back_populates="tasks")
```

---

## Required Schema for MCP Tools

### MCP Tool Requirements

Based on the spec, MCP tools need to support:

1. **add_task**: Create task with `title`, `description`, `user_id`
2. **list_tasks**: Query tasks filtered by `user_id` and `completed` status
3. **update_task**: Update `title` and/or `description` by `task_id`
4. **complete_task**: Toggle `completed` status by `task_id`
5. **delete_task**: Delete task by `task_id`

### Schema Gap Analysis

| Field | Required by MCP | Existing in DB | Status |
|-------|----------------|----------------|--------|
| `tasks.id` | ✅ | ✅ | **OK** |
| `tasks.title` | ✅ | ✅ | **OK** (max 255 chars) |
| `tasks.description` | ✅ | ✅ | **OK** (Text field) |
| `tasks.completed` | ✅ | ✅ | **OK** (Boolean) |
| `tasks.user_id` | ✅ | ✅ | **OK** (ForeignKey) |
| `tasks.created_at` | ✅ | ✅ | **OK** |
| `tasks.updated_at` | ✅ | ✅ | **OK** |
| `tasks.due_date` | ❌ (optional) | ❌ | **NOT NEEDED** - removed from spec |
| `tasks.completed_at` | ❌ (optional) | ❌ | **NOT NEEDED** - removed from spec |

### Conclusion

✅ **No schema changes required**

The existing `tasks` table supports all MCP tool operations. The original spec included optional `due_date` and `completed_at` fields, but these were removed during planning to align with the existing database schema.

---

## Database Connection

**Existing Configuration** (from `backend/src/db/database.py`):

```python
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**MCP Tools Will Use**:
- Same `DATABASE_URL` from environment
- Same connection pooling settings
- Same `SessionLocal` session factory
- Synchronous sessions (not async)

---

## Authentication Integration

**Existing** (from `backend/src/services/auth_service.py`):

```python
class AuthService:
    @staticmethod
    def get_current_user(db: Session, token: str) -> Optional[User]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                return None
        except JWTError:
            return None

        try:
            user = db.query(User).filter(User.email == email).first()
            return user
        except SQLAlchemyError:
            return None
```

**MCP Tools Will**:
- Reuse `AuthService.get_current_user()` for JWT verification
- Extract `user_id` from authenticated user
- Enforce ownership at query level: `filter(Task.id == task_id, Task.user_id == user_id)`

---

## Migration Requirements

**None** - No database schema changes needed.

The existing tables created for the multi-user todo app fully support the MCP tool server functionality.

---

## Testing Database

For testing, use a separate test database:

```python
# In tests/conftest.py
@pytest.fixture
def test_db():
    # Create test database connection
    test_engine = create_engine(TEST_DATABASE_URL)
    
    # Create tables
    Base.metadata.create_all(test_engine)
    
    yield test_engine
    
    # Drop tables after tests
    Base.metadata.drop_all(test_engine)
```

---

## Summary

- ✅ Existing `users` table: Compatible
- ✅ Existing `tasks` table: Compatible
- ✅ Database connection: Reusable
- ✅ Authentication: Reusable
- ✅ No migrations required
- ✅ No breaking changes

**MCP tools will work with the existing database schema as-is.**
