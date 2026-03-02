# Tasks: Chat Frontend UI for AI Todo Assistant

**Input**: Design documents from `/specs/001-chat-frontend-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification or if user requests TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/todo-app/` at repository root
- Paths shown assume Next.js App Router structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure

- [X] T001 Verify Next.js 16+ project exists at frontend/todo-app/
- [X] T002 [P] Install Axios: cd frontend/todo-app && npm install axios
- [X] T003 [P] Verify Tailwind CSS is configured in frontend/todo-app/tailwind.config.js
- [X] T004 [P] Create TypeScript types file: frontend/todo-app/types/chat.ts
- [X] T005 [P] Create API service directory: frontend/todo-app/services/api/
- [X] T006 Create environment file: frontend/todo-app/.env.local with NEXT_PUBLIC_API_URL=http://localhost:8000

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create TypeScript types in frontend/todo-app/types/chat.ts (Message, ChatResponse, ChatState interfaces)
- [X] T008 [P] Create API service: frontend/todo-app/services/api/chat.service.ts with sendMessage method
- [X] T009 [P] Create JWT auth utility: frontend/todo-app/utils/auth.ts with getToken function
- [X] T010 Verify authentication context is available (useAuth hook from existing AuthContext)
- [X] T011 [P] Create base chat components directory: frontend/todo-app/app/components/chat/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send Message to AI Agent (Priority: P1) 🎯 MVP

**Goal**: Users can type a natural language message and send it to the AI agent to manage tasks

**Independent Test**: Can be fully tested by typing a message, clicking send, and verifying the message appears in the chat and receives a response from the agent.

### Implementation for User Story 1

- [X] T012 [P] [US1] Create LoadingSpinner component: frontend/todo-app/app/components/chat/LoadingSpinner.tsx
- [X] T013 [P] [US1] Create ErrorAlert component: frontend/todo-app/app/components/chat/ErrorAlert.tsx
- [X] T014 [P] [US1] Create ChatInput component: frontend/todo-app/app/components/chat/ChatInput.tsx
- [X] T015 [US1] Add message input state management in ChatInput (message, onChange, onKeyDown for Enter key)
- [X] T016 [US1] Add send button with disabled state (disabled when empty or isLoading)
- [X] T017 [US1] Add Enter key handler to send message (prevent default on Enter key)
- [X] T018 [P] [US1] Create MessageBubble component: frontend/todo-app/app/components/chat/MessageBubble.tsx
- [X] T019 [US1] Style user message bubble (right-aligned, blue background, white text)
- [X] T020 [US1] Style assistant message bubble (left-aligned, gray background, dark text)
- [X] T021 [P] [US1] Create ChatPage component: frontend/todo-app/app/chat/page.tsx
- [X] T022 [US1] Add chat state management (conversationId, messages, isLoading, error, hasLoaded)
- [X] T023 [US1] Implement handleSendMessage function (call chatService.sendMessage, update state)
- [X] T024 [US1] Store conversation_id in localStorage after first response
- [X] T025 [US1] Integrate ChatInput component with onSend callback
- [X] T026 [US1] Integrate MessageList component with messages array
- [X] T027 [US1] Show LoadingSpinner while isLoading is true
- [X] T028 [US1] Show ErrorAlert when error is not null

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- User can navigate to /chat page
- User can type a message and click send (or press Enter)
- Message appears in chat bubble
- Loading spinner shows while waiting
- AI response appears in chat bubble
- Error alert shows if request fails

---

## Phase 4: User Story 2 - View Conversation History (Priority: P2)

**Goal**: Users can see their current conversation with the AI agent, including all previous messages and responses

**Independent Test**: Can be tested by sending multiple messages and verifying all messages (user and assistant) are displayed in chronological order with proper styling.

### Implementation for User Story 2

- [X] T029 [P] [US2] Create MessageList component: frontend/todo-app/app/components/chat/MessageList.tsx
- [X] T030 [US2] Render messages array chronologically (map over messages, render MessageBubble for each)
- [X] T031 [US2] Add auto-scroll to latest message (useRef, scrollIntoView, useEffect on messages change)
- [X] T032 [US2] Add conversation persistence: load conversation_id from localStorage on mount
- [X] T033 [P] [US2] Add getConversation method to chat.service.ts
- [X] T034 [US2] Fetch conversation on page load (useEffect, call chatService.getConversation)
- [X] T035 [US2] Restore messages from conversation into state
- [X] T036 [US2] Handle conversation not found error gracefully (start new conversation)
- [X] T037 [US2] Add empty state message ("Start a conversation by typing a message below")
- [X] T038 [US2] Ensure messages are read-only (no edit/delete functionality)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- User can send messages and see responses
- Conversation persists across page refresh
- All messages display in correct order with proper styling
- Auto-scroll works when new messages arrive

---

## Phase 5: User Story 3 - Error Handling and Feedback (Priority: P3)

**Goal**: Users receive clear feedback when something goes wrong with actionable guidance

**Independent Test**: Can be tested by simulating a network failure and verifying an error message is displayed with clear instructions.

### Implementation for User Story 3

- [X] T039 [P] [US3] Add error type definitions to types/chat.ts (ChatAPIError class)
- [X] T040 [US3] Implement error handling in chat.service.ts (handleAPIError function)
- [X] T041 [US3] Map error codes to user-friendly messages (INVALID_MESSAGE, INVALID_TOKEN, NETWORK_ERROR, etc.)
- [X] T042 [US3] Add retry functionality to ErrorAlert component (onRetry prop)
- [X] T043 [US3] Implement retry logic in handleSendMessage (store last message for retry)
- [X] T044 [US3] Add session expiration handling (redirect to login on 401)
- [X] T045 [US3] Add timeout handling for slow responses (>10 seconds)
- [X] T046 [US3] Add dismiss functionality to ErrorAlert (onDismiss prop)
- [ ] T047 [US3] Test error scenarios (disconnect network, stop backend, invalid token)

**Checkpoint**: All user stories should now be independently functional
- Error messages display for all failure scenarios
- Retry button works to resend failed message
- Session expiration redirects to login
- Network errors show user-friendly messages

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T048 [P] Add responsive design for mobile (sm:, md:, lg: breakpoints)
- [X] T049 [P] Add accessibility features (ARIA labels, keyboard navigation, focus management)
- [X] T050 [P] Add timestamp to message bubbles (format as HH:MM AM/PM)
- [X] T051 [P] Add max-width to chat container (max-w-4xl mx-auto)
- [X] T052 [P] Add header to chat page ("AI Chat Assistant")
- [X] T053 [P] Add placeholder text to input ("Type your message...")
- [X] T054 [P] Add transition animations for messages (fade-in, slide-up)
- [X] T055 [P] Add typing indicator ("AI is typing...") while waiting for response
- [ ] T056 [P] Add clear conversation button (optional, with confirmation)
- [X] T057 [P] Add unit tests for components: frontend/todo-app/__tests__/components/chat/
- [X] T058 [P] Add integration tests: frontend/todo-app/__tests__/e2e/chat.test.tsx
- [X] T059 Documentation: Update frontend/README.md with chat feature documentation
- [X] T060 [P] Verify all TypeScript types are correct (no any types)
- [X] T061 [P] Run ESLint and fix all issues
- [ ] T062 [P] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] T063 [P] Test on desktop browsers (Chrome, Firefox, Safari, Edge)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

- Components before integration
- Services before components that use them
- Types before services and components
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002, T003, T004, T005, T006 can all run in parallel
- **Phase 2**: T007, T008, T009, T011 can all run in parallel (different files)
- **Phase 3 (US1)**: T012, T013, T014, T018, T021 can run in parallel; T015-T020 depend on component creation
- **Phase 4 (US2)**: T029, T033 can run in parallel; T030-T032 depend on MessageList
- **Phase 5 (US3)**: T039, T040 can run in parallel; T041+ depend on error types
- **Phase 6**: T048, T049, T050, T051, T052, T053, T054, T055, T056, T057, T058 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1:

# Task: Create LoadingSpinner in frontend/todo-app/app/components/chat/LoadingSpinner.tsx
# Task: Create ErrorAlert in frontend/todo-app/app/components/chat/ErrorAlert.tsx
# Task: Create ChatInput in frontend/todo-app/app/components/chat/ChatInput.tsx
# Task: Create MessageBubble in frontend/todo-app/app/components/chat/MessageBubble.tsx
# Task: Create ChatPage in frontend/todo-app/app/chat/page.tsx

# These can all be done in parallel (different files, no dependencies)
# Then integrate components in ChatPage (depends on all components complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T011) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T012-T028)
4. **STOP and VALIDATE**: Test message send and response display
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish features → Test → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (chat components, send message)
   - Developer B: User Story 2 (conversation history, persistence)
   - Developer C: User Story 3 (error handling, retry logic)
3. Stories complete and integrate independently
4. Team completes Polish features together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Task Summary

- **Total Tasks**: 63
- **Phase 1 (Setup)**: 6 tasks ✅ Complete
- **Phase 2 (Foundational)**: 5 tasks ✅ Complete
- **Phase 3 (US1 - Send Message)**: 17 tasks ✅ Complete
- **Phase 4 (US2 - View History)**: 10 tasks ✅ Complete
- **Phase 5 (US3 - Error Handling)**: 9 tasks (8 ✅ Complete, 1 ⏳ Manual test pending)
- **Phase 6 (Polish)**: 16 tasks (13 ✅ Complete, 3 ⏳ Optional/manual pending)

**Completed**: 59/63 (94%)
**Pending**: 4/63 (6% - manual testing and optional features)

## Independent Test Criteria

- **User Story 1**: User can type "Add a task to buy groceries", click send, and see message appear with AI response
- **User Story 2**: After sending 3 messages, refresh page and verify all messages are restored in correct order
- **User Story 3**: Stop backend server, send message, verify error alert appears with retry option

---

## Quick Start

```bash
# 1. Install dependencies
cd frontend/todo-app
npm install axios

# 2. Start development server
npm run dev

# 3. Navigate to chat page
# http://localhost:3000/chat

# 4. Test sending a message
# Type "Hello" and press Enter or click Send
```
