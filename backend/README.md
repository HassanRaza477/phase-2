# Todo Backend API

This is the backend API for the Full-Stack Multi-User Todo Web Application.

## Technologies Used

- Python 3.11+
- FastAPI
- SQLModel
- PostgreSQL
- JWT for authentication

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

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info
- `GET /tasks/` - Get all tasks for the current user
- `POST /tasks/` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a task
- `PATCH /tasks/{task_id}/toggle-completion` - Toggle task completion status
- `DELETE /tasks/{task_id}` - Delete a task