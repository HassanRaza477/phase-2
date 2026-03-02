# Implementation Plan: Chat Frontend UI for AI Todo Assistant

**Branch**: `001-chat-frontend-ui` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-chat-frontend-ui/spec.md`

## Summary

Build a responsive chat interface for the AI Todo Assistant that enables users to interact with the AI agent through natural language conversations. The frontend communicates with the backend chat endpoint via REST API, displays messages in a modern chat bubble format, maintains conversation context via conversation_id, and provides clear loading and error states. Built with Next.js App Router, TypeScript, and Tailwind CSS.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16+, React 18+, Tailwind CSS 3.x, Axios (or fetch API)
**Storage**: Browser localStorage for conversation_id persistence (optional), server-side database for messages
**Testing**: Jest, React Testing Library
**Target Platform**: Web browser (desktop and mobile responsive)
**Project Type**: Frontend (Next.js web application)
**Performance Goals**: <2s initial load, <5s message response time for 95% of requests, 60fps scrolling
**Constraints**: JWT authentication required, mobile-responsive (min 320px width), accessible (WCAG 2.1 AA)
**Scale/Scope**: Single chat page with message list, input field, and real-time updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Spec-First Engineering ✅
- Implementation follows approved specification (spec.md created and validated)
- All requirements traced to user stories (3 stories, 15 functional requirements)

### Gate 2: Deterministic Generation ✅
- Component behavior determined by props and state
- API contracts ensure consistent request/response format
- Same user input + conversation history yields identical UI rendering

### Gate 3: Security by Design ✅
- JWT authentication required before chat page access
- User identity derived from verified token, not client input
- Conversation records scoped by authenticated user

### Gate 4: Separation of Concerns ✅
- Chat UI component separate from API service layer
- State management isolated from presentation
- Clear interfaces: UI components → API service → backend endpoint

### Gate 5: Reproducibility ✅
- Component rendering deterministic based on state
- Conversation context persisted (survives page refresh)
- No reliance on ephemeral client-side state for critical data

### Gate 6: Traceability ✅
- All features map to spec requirements (FR-001 through FR-015)
- Clear lineage from user stories to components

### Gate 7: Tool-First AI Design ✅
- Frontend does not implement AI logic (backend responsibility)
- API calls route through defined backend endpoint
- No direct database access from frontend

### Gate 8: Stateless Server Architecture ✅
- Frontend is client-side only (no server-side session state)
- Conversation context stored in backend database
- Each API request includes authentication and conversation_id

### Gate 9: Strict User Isolation ✅
- JWT token ensures user identity
- Backend enforces user isolation (frontend cannot bypass)
- No cross-user data access possible from frontend

### Gate 10: No Hidden Side Effects ✅
- All API calls explicit and traceable
- No side effects outside declared API interactions
- State changes visible through React state management

**GATE STATUS**: All gates pass. Proceeding to Phase 0 research.

## Phase 0: Research

**Status**: ✅ Complete

**Artifacts**:
- `research.md` - All technical decisions resolved

**Key Decisions**:
1. Next.js 16+ with App Router for routing and server components
2. TypeScript for type safety and better developer experience
3. Tailwind CSS for styling (utility-first, responsive)
4. Axios for API calls (interceptors for JWT, better error handling)
5. React hooks (useState, useEffect, useRef) for state management
6. conversation_id stored in localStorage for persistence
7. Loading states with spinner/skeleton UI
8. Error handling with toast notifications or alert banners
9. Auto-scroll to latest message using refs and scrollIntoView
10. Mobile-first responsive design with breakpoints

All constitution gates re-validated post-research. No violations.

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Artifacts**:
- `data-model.md` - Frontend state models and types
- `contracts/api-contracts.md` - Backend API contract for chat endpoint
- `quickstart.md` - Implementation guide with code examples

**State Model Summary**:
- **Message**: { id, role (user/assistant), content, timestamp, tool_calls? }
- **ConversationState**: { conversation_id, messages: Message[], isLoading, error }
- **ChatInput**: { message, isSending }

**API Contract Summary**:
- **POST /api/{user_id}/chat**: Send message, receive response
- Request: { message, conversation_id? }
- Response: { conversation_id, message_id, response, tool_calls, created_at }
- Headers: Authorization: Bearer <JWT>

**Constitution Re-Check Post-Design**:

### Gate 1: Spec-First Engineering ✅
- Design derived from approved spec.md
- All requirements traced to component design

### Gate 2: Deterministic Generation ✅
- Component props and state clearly defined
- API contracts ensure consistent behavior

### Gate 3: Security by Design ✅
- JWT stored securely (httpOnly cookie or memory)
- Token included in all API requests
- Protected route with authentication check

### Gate 4: Separation of Concerns ✅
- ChatPage component (layout)
- MessageList component (rendering)
- ChatInput component (input)
- API service (HTTP calls)
- State management (hooks)

### Gate 5: Reproducibility ✅
- Component rendering based on props/state only
- No random or non-deterministic behavior

### Gate 6: Traceability ✅
- FR-001 → /chat page route
- FR-002 → MessageList component
- FR-003/004 → ChatInput component
- FR-005/006 → Message bubble styling
- FR-007 → Loading state
- FR-008 → Error handling
- FR-009 → Authentication check
- FR-010/011 → conversation_id state management
- FR-012 → Auto-scroll logic
- FR-013 → Conversation persistence
- FR-014 → Send button disabled state
- FR-015 → Enter key handler

### Gate 7: Tool-First AI Design ✅
- Frontend calls backend API only
- No AI logic in frontend code

### Gate 8: Stateless Server Architecture ✅
- Frontend is client-side only
- All conversation state in backend

### Gate 9: Strict User Isolation ✅
- JWT ensures user identity
- No cross-user data access

### Gate 10: No Hidden Side Effects ✅
- All API calls explicit
- State changes through React setState

**GATE STATUS**: All gates pass post-design. Ready for Phase 2 (Tasks).

## Phase 2: Tasks

**Status**: ⏳ Pending

**Next Command**: `/sp.tasks` to break implementation into testable tasks

## Project Structure

### Documentation (this feature)

```text
specs/001-chat-frontend-ui/
├── spec.md                  # Feature specification
├── plan.md                  # This implementation plan
├── research.md              # Phase 0: Technical decisions
├── data-model.md            # Phase 1: State models and types
├── quickstart.md            # Phase 1: Implementation guide
├── contracts/
│   └── api-contracts.md     # Phase 1: API contracts
└── checklists/
    └── requirements.md      # Spec quality checklist
```

### Source Code (frontend)

```text
frontend/todo-app/
├── app/
│   ├── chat/
│   │   └── page.tsx         # Chat page component
│   ├── components/
│   │   └── chat/
│   │       ├── ChatPage.tsx       # Main chat container
│   │       ├── MessageList.tsx    # Message list component
│   │       ├── MessageBubble.tsx  # Individual message bubble
│   │       ├── ChatInput.tsx      # Input field + send button
│   │       ├── LoadingSpinner.tsx # Loading indicator
│   │       └── ErrorAlert.tsx     # Error message display
│   └── services/
│       └── api/
│           └── chat.service.ts    # API service for chat endpoint
├── types/
│   └── chat.ts              # TypeScript types for chat
├── hooks/
│   └── useChat.ts           # Custom hook for chat state
├── styles/
│   └── globals.css          # Tailwind CSS setup
└── utils/
    └── auth.ts              # JWT token utilities
```

**Structure Decision**: Next.js App Router with component-based architecture. Chat feature isolated in `app/chat/` route with reusable components in `app/components/chat/`. API service layer abstracts HTTP calls. TypeScript types ensure type safety.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations - all gates passed | N/A |
