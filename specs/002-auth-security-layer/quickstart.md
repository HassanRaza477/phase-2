# Quickstart Guide: Authentication and API Security Layer

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Better Auth compatible environment
- Docker and Docker Compose (optional, for local development)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Create environment files for both frontend and backend:

   **Backend (.env):**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
   SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   BETTER_AUTH_SECRET=your-better-auth-secret-key
   ```

   **Frontend (.env.local):**
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
   ```

## Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

## Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Better Auth:
   ```bash
   npm install better-auth
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Setup (Alternative)

1. From the project root, build and start all services:
   ```bash
   docker-compose up --build
   ```

## API Documentation

Once the backend is running, API documentation is available at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Running Tests

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Key Endpoints

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Authentication Flow

1. Register a new user via `POST /auth/register`
2. Login with credentials via `POST /auth/login`
3. Use the returned JWT token in the `Authorization: Bearer <token>` header for protected endpoints
4. The system will validate the JWT signature using the shared secret
5. User identity will be extracted from the token for authorization decisions

## Security Features

- All task endpoints require a valid JWT token
- Cross-user access is prevented by comparing token user ID with requested resource
- Database queries are scoped to authenticated user ID
- Invalid or expired tokens return 401 Unauthorized
- Cross-user access attempts return 403 Forbidden

## Troubleshooting

- If authentication fails, ensure BETTER_AUTH_SECRET is properly set in both frontend and backend environments
- If JWT validation fails, verify that the same SECRET_KEY is used for signing and verification
- For CORS issues, check that your frontend URL is properly configured in the backend settings