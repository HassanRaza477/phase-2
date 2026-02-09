# Data Model: Authentication and API Security Layer

## Entities

### User
Represents an authenticated user in the system with security-related attributes.

**Fields:**
- `id`: UUID (Primary Key) - Unique identifier for the user
- `email`: String (Unique, Indexed) - User's email address for login
- `hashed_password`: String - BCrypt hashed password
- `created_at`: DateTime - Timestamp when the account was created
- `updated_at`: DateTime - Timestamp when the account was last updated
- `is_active`: Boolean - Whether the account is active (default: True)
- `email_verified`: Boolean - Whether the email has been verified (default: False)

**Validation Rules:**
- Email must be a valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements (handled by auth system)

### JWT Token
Represents a JSON Web Token containing user identity claims.

**Fields:**
- `token`: String - The JWT token string
- `user_id`: UUID (Foreign Key) - Reference to the user who owns this token
- `expires_at`: DateTime - When the token expires
- `issued_at`: DateTime - When the token was issued
- `is_revoked`: Boolean - Whether the token has been revoked (default: False)

**Validation Rules:**
- Token must be a valid JWT format
- User_id must reference an existing user
- Expires_at must be in the future
- Token must be signed with the correct secret

### Task
Represents a todo item owned by a specific user, with security considerations.

**Fields:**
- `id`: UUID (Primary Key) - Unique identifier for the task
- `title`: String (Indexed) - Brief title of the task (max 200 characters)
- `description`: Text (Optional) - Detailed description of the task
- `is_completed`: Boolean - Whether the task is completed (default: False)
- `created_at`: DateTime - Timestamp when the task was created
- `updated_at`: DateTime - Timestamp when the task was last updated
- `due_date`: DateTime (Optional) - When the task is due
- `user_id`: UUID (Foreign Key) - Reference to the owning user

**Validation Rules:**
- Title must not be empty
- Title must be less than 200 characters
- User_id must reference an existing user
- Due date must be in the future if provided

## Relationships
- **User → Task**: One-to-Many (One user can have many tasks)
- **Task → User**: Many-to-One (Many tasks belong to one user)
- **User → JWT Token**: One-to-Many (One user can have multiple active tokens)

## State Transitions
- **Task**: Incomplete → Completed (when user marks task as done)
- **Task**: Completed → Incomplete (when user unmarks task as done)
- **JWT Token**: Active → Revoked (when token is invalidated)

## Indexes
- User.email: For efficient login lookups
- Task.user_id: For efficient user-specific task queries
- Task.created_at: For chronological sorting
- Task.is_completed: For filtering completed/incomplete tasks
- JWT Token.expires_at: For token expiration checks

## Constraints
- All tasks must be associated with a valid user
- Users can only view and modify their own tasks
- JWT tokens must be validated before any database access
- Expired tokens are rejected by the system
- Revoked tokens are rejected by the system
- Soft deletes are not implemented; tasks are permanently deleted