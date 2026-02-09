# Full-Stack Multi-User Todo Web Application

This is a production-style, multi-user todo web application with persistent storage, secure authentication, and full CRUD functionality. The system follows a layered architecture with a Next.js frontend, FastAPI backend, and Neon Serverless PostgreSQL database. Authentication is handled by Better Auth with JWT tokens for secure user isolation.

## Architecture

The application is split into two main parts:

### Backend
- Built with Python and FastAPI
- Uses SQLModel for database modeling
- PostgreSQL database (Neon Serverless)
- JWT-based authentication
- RESTful API endpoints

### Frontend
- Built with Next.js 14 and React 18
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run the application:
   ```bash
   uvicorn src.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- User registration and login
- Secure JWT-based authentication
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- User-specific task isolation
- Responsive web interface

## API Documentation

Backend API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc