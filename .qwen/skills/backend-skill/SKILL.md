---
name: backend-skill
description: Generate backend routes, handle requests and responses, and connect securely to databases. Use for API and server-side development.
---

# Backend Skill

## Instructions

### 1. Routing
- Define RESTful or RPC-style routes
- Use correct HTTP methods (GET, POST, PUT, DELETE)
- Group routes by feature or domain
- Apply middleware (auth, validation, logging) where needed

### 2. Request & Response Handling
- Parse request body, params, and query safely
- Validate incoming data before processing
- Return consistent JSON responses
- Use proper HTTP status codes
- Handle errors without exposing internal details

### 3. Database Integration
- Connect to relational or NoSQL databases securely
- Use environment variables for DB credentials
- Perform efficient CRUD operations
- Use ORMs or query builders when appropriate
- Protect against SQL / NoSQL injection

### 4. Business Logic
- Keep controllers thin
- Move core logic to service layers
- Handle async/await correctly
- Avoid blocking operations

## Best Practices
- Always validate input data
- Implement pagination, filtering, and sorting
- Use transactions for critical writes
- Log errors and important events
- Follow API versioning standards
- Keep code modular and testable

