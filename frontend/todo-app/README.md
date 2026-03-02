This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Chat Feature

This application includes an AI-powered Chat Assistant that helps you manage your tasks through natural language conversations.

### Overview

The AI Chat feature allows users to:
- Create, update, and manage tasks using natural language
- Get intelligent suggestions for task organization
- View conversation history with persistent storage
- Receive real-time responses with tool invocation feedback

### Accessing the Chat

Navigate to `/chat` after logging in to access the AI Chat Assistant:

```
http://localhost:3000/chat
```

### Usage Examples

Here are some example interactions with the AI Chat Assistant:

**Creating a Task:**
```
User: "Add a task to buy groceries tomorrow"
Assistant: "I've added a task 'Buy groceries' scheduled for tomorrow."
```

**Managing Tasks:**
```
User: "Show me my pending tasks"
Assistant: "You have 3 pending tasks: 1. Buy groceries (Due: Tomorrow)..."
```

**Updating Tasks:**
```
User: "Mark task 1 as completed"
Assistant: "Task 1 has been marked as completed."
```

### Component Structure

The chat feature is built with the following components:

| Component | Description |
|-----------|-------------|
| `ChatPage` | Main chat page with state management |
| `MessageList` | Displays all messages with auto-scroll |
| `MessageBubble` | Individual message with role-based styling |
| `ChatInput` | Input field with send functionality |
| `ErrorAlert` | Error display with retry capability |
| `LoadingSpinner` | Loading state indicator |

### Environment Variables

The chat feature requires the following environment variables:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Create a `.env.local` file in the `frontend/todo-app` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Authentication

The chat feature requires authentication. Users must:
1. Log in via `/login` page
2. Obtain a valid JWT token
3. Token is automatically used for chat API requests

### API Integration

The chat integrates with the backend through:
- `POST /api/{user_id}/chat` - Send message and get AI response
- `GET /api/{user_id}/conversations/{id}` - Load conversation history

### Screenshots Description

**Chat Interface:**
- Header with AI Chat Assistant branding
- Message area with user (blue, right-aligned) and assistant (gray, left-aligned) messages
- Input field at bottom with Send button
- Error alerts appear at top with retry option

**Message Bubble:**
- User messages: Blue background, white text, right-aligned
- Assistant messages: Gray background, dark text, left-aligned
- Timestamps displayed below each message
- Tool call indicators shown when actions are performed

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
