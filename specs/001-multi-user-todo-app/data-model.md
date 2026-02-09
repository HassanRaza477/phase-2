# Data Model: Full-Stack Multi-User Todo Web Application

## Entities

### User
Represents a registered user in the system

**Fields:**
- `id`: UUID (Primary Key) - Unique identifier for the user
- `email`: String (Unique, Indexed) - User's email address for login
- `hashed_password`: String - BCrypt hashed password
- `created_at`: DateTime - Timestamp when the account was created
- `updated_at`: DateTime - Timestamp when the account was last updated
- `is_active`: Boolean - Whether the account is active (default: True)

**Validation Rules:**
- Email must be a valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements (handled by auth system)

### Task
Represents a todo item owned by a specific user

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

## State Transitions
- **Task**: Incomplete → Completed (when user marks task as done)
- **Task**: Completed → Incomplete (when user unmarks task as done)

## Indexes
- User.email: For efficient login lookups
- Task.user_id: For efficient user-specific task queries
- Task.created_at: For chronological sorting
- Task.is_completed: For filtering completed/incomplete tasks

## Constraints
- All tasks must be associated with a valid user
- Users can only view and modify their own tasks
- Soft deletes are not implemented; tasks are permanently deleted