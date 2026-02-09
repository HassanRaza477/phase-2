# Data Model: Frontend Web Application for Multi-User Todo System

## Entities

### User Session
Represents an authenticated user's session state with JWT token and user profile information.

**Fields:**
- `id`: string - Unique identifier for the user
- `email`: string - User's email address
- `token`: string - JWT token for API authentication
- `isLoggedIn`: boolean - Whether the user is currently logged in
- `expiresAt`: Date - When the session expires

**Validation Rules:**
- Token must be a valid JWT format
- Email must be a valid email format
- Session must be refreshed before expiration

### Task
Represents a todo item with title, description, completion status, and creation timestamp.

**Fields:**
- `id`: string - Unique identifier for the task
- `title`: string - Brief title of the task (max 200 characters)
- `description`: string (optional) - Detailed description of the task
- `isCompleted`: boolean - Whether the task is completed (default: false)
- `createdAt`: Date - Timestamp when the task was created
- `updatedAt`: Date - Timestamp when the task was last updated
- `dueDate`: Date (optional) - When the task is due
- `userId`: string - Reference to the owning user

**Validation Rules:**
- Title must not be empty
- Title must be less than 200 characters
- UserId must reference an existing user
- Due date must be in the future if provided

### API Response
Represents the structure of API responses from the backend.

**Fields:**
- `success`: boolean - Whether the request was successful
- `data`: object (optional) - The response data
- `error`: object (optional) - Error information if request failed
- `message`: string (optional) - Additional information about the response

**Validation Rules:**
- Either data or error must be present (but not both)
- Success field must match presence of data/error fields

## Relationships
- **User Session → Task**: One-to-Many (One user can have many tasks)
- **Task → User Session**: Many-to-One (Many tasks belong to one user)

## State Transitions
- **Task**: Incomplete → Completed (when user marks task as done)
- **Task**: Completed → Incomplete (when user unmarks task as done)
- **User Session**: LoggedOut → LoggedIn (when user authenticates)
- **User Session**: LoggedIn → LoggedOut (when user logs out or session expires)

## Constraints
- All tasks must be associated with a valid user session
- Users can only view and modify their own tasks
- JWT tokens must be validated before any API access
- Expired tokens must trigger re-authentication
- Session data must be cleared on logout