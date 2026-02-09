# Quickstart Guide: Full-Stack Multi-User Todo Web Application

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL-compatible database (Neon Serverless recommended)
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

3. Set up the database:
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

4. Start the backend server:
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

3. Start the development server:
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

## Troubleshooting

- If database migrations fail, ensure your DATABASE_URL is correctly configured
- If frontend can't connect to backend, verify NEXT_PUBLIC_API_BASE_URL is set correctly
- For authentication issues, ensure SECRET_KEY is properly set in backend environment