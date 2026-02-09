# Quickstart Guide: Frontend Web Application for Multi-User Todo System

## Prerequisites

- Node.js 18+ (recommended)
- npm or yarn package manager
- Access to the backend API (FastAPI server running)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

5. Update environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
   ```

## Development Setup

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser to [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/              # API client modules
│   │   │   ├── auth.ts       # Authentication API functions
│   │   │   └── tasks.ts      # Task management API functions
│   │   ├── components/       # Reusable UI components
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── index.tsx     # Home page
│   │   │   ├── login.tsx     # Login page
│   │   │   ├── signup.tsx    # Signup page
│   │   │   └── dashboard.tsx # Task dashboard
│   │   └── context/          # React context providers
│   │       └── AuthContext.tsx
│   ├── lib/                  # Utility functions
│   │   └── utils.ts
│   └── types/                # TypeScript type definitions
│       └── index.ts
├── public/                   # Static assets
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
└── README.md                 # Project documentation
```

## Key Features

### Authentication
- User signup and login flows
- Session management with JWT tokens
- Protected routes that require authentication
- Automatic redirection for unauthenticated users

### Task Management
- Create, read, update, and delete tasks
- Toggle task completion status
- Responsive UI that works on desktop and mobile
- Loading states and error handling

### API Integration
- Centralized API client for all backend communication
- Automatic JWT token attachment to requests
- Global error handling for API failures
- Consistent request/response handling

## Running Tests

1. Run unit tests:
   ```bash
   npm test
   # or
   yarn test
   ```

2. Run linting:
   ```bash
   npm run lint
   # or
   yarn lint
   ```

3. Run type checking:
   ```bash
   npm run type-check
   # or
   yarn type-check
   ```

## Building for Production

1. Create a production build:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Troubleshooting

- If authentication isn't working, ensure the backend API is running and the `NEXT_PUBLIC_API_BASE_URL` is correctly set
- If API calls are failing, check that JWT tokens are being properly attached to requests
- For styling issues, verify that Tailwind CSS is properly configured
- For routing problems, ensure protected routes are properly wrapped with the `ProtectedRoute` component