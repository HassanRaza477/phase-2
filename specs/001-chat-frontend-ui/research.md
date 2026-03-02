# Research: Chat Frontend UI

**Feature**: 001-chat-frontend-ui
**Date**: 2026-02-23
**Purpose**: Resolve technical unknowns and establish best practices for chat frontend implementation

---

## Decision 1: Next.js App Router

**Decision**: Use Next.js 16+ with App Router for routing and page structure

**Rationale**: 
- App Router is the modern standard for Next.js (Pages Router is legacy)
- Built-in support for server and client components
- Better performance with React Server Components
- Simplified routing with file-based convention
- Aligns with project constitution (Frontend must use Next.js App Router architecture)

**Alternatives Considered**:
- **Next.js Pages Router**: Legacy approach, being phased out, less performant
- **Create React App**: No SSR, worse SEO, more configuration required
- **Vite + React Router**: Good alternative but doesn't match project stack

**Implementation Approach**:
- Create `app/chat/page.tsx` for chat route
- Use 'use client' directive for interactive components
- Leverage Next.js layout system for consistent UI

---

## Decision 2: TypeScript for Type Safety

**Decision**: Use TypeScript 5.x for all frontend code

**Rationale**:
- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Self-documenting code with type definitions
- Catches errors at compile time
- Aligns with modern React best practices

**Alternatives Considered**:
- **JavaScript (JSDoc)**: Less robust type checking, more verbose
- **Flow**: Deprecated, community moved to TypeScript

**Implementation Approach**:
- Define types in `types/chat.ts`
- Use TypeScript for all components, services, hooks
- Strict mode enabled in tsconfig.json

---

## Decision 3: Tailwind CSS for Styling

**Decision**: Use Tailwind CSS 3.x for all styling

**Rationale**:
- Utility-first approach speeds up development
- Responsive design built-in with breakpoints
- Small bundle size with PurgeCSS
- Consistent design system
- Already configured in project

**Alternatives Considered**:
- **CSS Modules**: More verbose, harder to maintain consistency
- **Styled Components**: Runtime overhead, larger bundle
- **Chakra UI / MUI**: Larger bundle, less flexibility

**Implementation Approach**:
- Use Tailwind utility classes in components
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- Custom colors in tailwind.config.js if needed

---

## Decision 4: Axios for API Calls

**Decision**: Use Axios for HTTP requests to backend

**Rationale**:
- Built-in request/response interceptors (perfect for JWT)
- Better error handling than fetch
- Automatic JSON transformation
- Cancel request support
- Cleaner API than fetch

**Alternatives Considered**:
- **Fetch API**: Built-in but more verbose, no interceptors
- **React Query**: Overkill for simple chat feature, adds complexity
- **SWR**: Good for caching but adds dependency

**Implementation Approach**:
- Create axios instance with base URL
- Add interceptor to attach JWT to Authorization header
- Handle errors in service layer

---

## Decision 5: React Hooks for State Management

**Decision**: Use React hooks (useState, useEffect, useRef) for state management

**Rationale**:
- Simple and sufficient for chat state
- No need for complex state management (Redux, Zustand)
- Built-in to React
- Easy to test and reason about

**Alternatives Considered**:
- **Redux**: Overkill for single feature, adds boilerplate
- **Zustand**: Good but unnecessary complexity
- **Context API**: Could work but hooks are simpler

**Implementation Approach**:
- `useState` for messages, isLoading, error
- `useEffect` for fetching conversation on mount
- `useRef` for auto-scrolling to latest message

---

## Decision 6: Conversation ID Persistence

**Decision**: Store conversation_id in localStorage

**Rationale**:
- Survives page refresh (requirement FR-013)
- Simple to implement
- No server-side session required
- User-specific (scoped to browser)

**Alternatives Considered**:
- **Session Storage**: Lost on tab close, worse UX
- **Cookie**: More complex, unnecessary for this use case
- **URL Parameter**: Exposes conversation_id, less clean

**Implementation Approach**:
- Store conversation_id after first response
- Retrieve on page load to restore conversation
- Key: `chat_conversation_id`

---

## Decision 7: Loading State UI

**Decision**: Show loading spinner while waiting for response

**Rationale**:
- Clear visual feedback (requirement FR-007)
- Prevents user from sending duplicate messages
- Industry standard pattern
- Simple to implement

**Alternatives Considered**:
- **Skeleton Screen**: Better for content loading, overkill for chat
- **Progress Bar**: Implies known duration, not suitable
- **Disable Input Only**: Less clear, user might think broken

**Implementation Approach**:
- Show spinner in ChatInput while isLoading=true
- Disable send button during loading
- Optional: Show "AI is typing..." message

---

## Decision 8: Error Handling UI

**Decision**: Show error alert banner with retry option

**Rationale**:
- Clear error communication (requirement FR-008)
- Actionable (retry button)
- Non-intrusive (doesn't block UI)
- User-friendly messages

**Alternatives Considered**:
- **Toast Notifications**: Good but adds dependency
- **Modal Dialog**: Too intrusive for errors
- **Inline Error in Input**: Less visible

**Implementation Approach**:
- ErrorAlert component at top of chat
- Show error message from API or generic message
- Retry button calls send function again
- Auto-dismiss after 5 seconds for transient errors

---

## Decision 9: Auto-Scroll to Latest Message

**Decision**: Auto-scroll chat container when new messages arrive

**Rationale**:
- Expected behavior for chat UIs
- User doesn't need to manually scroll
- Better UX especially on mobile
- Requirement FR-012

**Alternatives Considered**:
- **Manual Scroll**: Poor UX, users expect auto-scroll
- **Scroll to Bottom Button**: Extra interaction, not automatic

**Implementation Approach**:
- useRef for message list container
- useEffect on messages array change
- scrollIntoView() on latest message element

---

## Decision 10: Mobile-First Responsive Design

**Decision**: Design mobile-first with responsive breakpoints

**Rationale**:
- Mobile traffic often exceeds desktop
- Better performance (load mobile styles first)
- Easier to scale up than scale down
- Requirement: min 320px wide support

**Alternatives Considered**:
- **Desktop-First**: Worse mobile performance, harder to maintain
- **Separate Mobile Site**: More maintenance, not recommended

**Implementation Approach**:
- Mobile styles by default
- `sm:`, `md:`, `lg:` breakpoints for larger screens
- Test on real devices and emulators
- Touch-friendly button sizes (min 44px)

---

## Decision 11: JWT Storage Strategy

**Decision**: Store JWT in memory (React state) after initial retrieval from httpOnly cookie

**Rationale**:
- More secure than localStorage (not accessible to XSS)
- Automatically cleared on page close
- Backend can read from httpOnly cookie
- Aligns with security best practices

**Alternatives Considered**:
- **localStorage**: Vulnerable to XSS attacks
- **Session Storage**: Better but still vulnerable
- **httpOnly Cookie Only**: Requires backend changes, more complex

**Implementation Approach**:
- Auth context provides JWT from cookie
- Store in React state for API calls
- Token refreshed via cookie expiration

---

## Decision 12: Component Architecture

**Decision**: Modular component structure with separation of concerns

**Rationale**:
- Easier to test individual components
- Reusability across features
- Clear ownership and responsibilities
- Aligns with React best practices

**Alternatives Considered**:
- **Single Monolithic Component**: Harder to test, less reusable
- **HOC Pattern**: More complex, hooks preferred

**Implementation Approach**:
- ChatPage: Layout and orchestration
- MessageList: Render message array
- MessageBubble: Individual message styling
- ChatInput: Input field and send button
- LoadingSpinner: Loading indicator
- ErrorAlert: Error display

---

## Summary of Technology Choices

| Component | Choice | Justification |
|-----------|--------|---------------|
| Framework | Next.js 16+ App Router | Modern standard, SSR support, project standard |
| Language | TypeScript 5.x | Type safety, better DX, error prevention |
| Styling | Tailwind CSS 3.x | Fast development, responsive, small bundle |
| HTTP Client | Axios | Interceptors, error handling, cleaner API |
| State | React Hooks | Simple, sufficient, no extra dependencies |
| Persistence | localStorage | Simple, survives refresh, user-scoped |
| Loading UI | Spinner | Clear feedback, industry standard |
| Error UI | Alert banner | Non-intrusive, actionable with retry |
| Responsive | Mobile-first | Better performance, easier maintenance |
| Auth | JWT in memory + httpOnly cookie | Secure, XSS-resistant, best practice |

---

## Open Questions for Phase 1

None - all technical decisions resolved with informed defaults based on:
- Project constitution requirements
- Industry best practices
- React/Next.js conventions
- Security standards

---

## Best Practices Identified

1. **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation
2. **Performance**: Lazy load components, optimize images, minimize re-renders
3. **Error Boundaries**: Wrap chat in error boundary to catch React errors
4. **Testing**: Write unit tests for components, integration tests for API calls
5. **Code Quality**: ESLint, Prettier, consistent formatting
6. **Security**: Sanitize user input, prevent XSS, validate API responses
7. **Analytics**: Track message send events (optional, future enhancement)
