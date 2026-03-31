---
id: 007
title: Frontend Task Sorting Implementation
stage: green
date: 2026-03-11T12:00:00Z
surface: agent
model: qwen3.5
feature: 001-task-sorting
branch: feature/task-sorting
user: HASAN RAZA
command: Implement frontend Task Sorting feature
labels: ["frontend", "typescript", "nextjs", "sorting", "ui-components"]
links:
  spec: specs/001-task-sorting/spec.md
  ticket: specs/001-task-sorting/tasks.md
  adr: null
  pr: null
files:
  - frontend/todo-app/types/index.ts
  - frontend/todo-app/app/components/task/SortSelector.tsx
  - frontend/todo-app/app/components/task/index.ts
  - frontend/todo-app/app/api/client.ts
  - frontend/todo-app/app/dashboard/page.tsx
tests:
  - Manual testing: SortSelector dropdown renders with 4 options
  - Manual testing: Sort changes trigger API calls with sort parameter
  - Manual testing: Sort works combined with search and filters
---

## Prompt

Implement the frontend portion of the Task Sorting feature following the tasks.md specification.

**Context**: We're extending the Todo application with task sorting capabilities. The backend API is already implemented. Now we need to create the frontend UI components and integrate them.

**Tasks to Complete** (from specs/001-task-sorting/tasks.md):

**Phase 2: Foundational (Frontend)**
- T006: Define SortOption type in frontend/todo-app/types/index.ts
  - Create type: `type SortOption = 'due_date' | 'priority' | 'alphabetical' | 'created_at'`
  - Export type for use in components

**Phase 3: User Story 1 (Frontend)**
- T012: Create SortSelector component: frontend/todo-app/app/components/task/SortSelector.tsx
  - Dropdown select with 4 options (Due Date, Priority, Alphabetical, Recently Created)
  - Controlled component with value prop
  - onChange handler for parent component
  - Include icons/emojis for visual clarity (📅 🎯 🔤 🕐)
  - Responsive design
  - ARIA labels for accessibility
- T013: Integrate SortSelector in dashboard: frontend/todo-app/app/dashboard/page.tsx
  - Add SortSelector component to page
  - Add sort state (useState)
  - Pass sort value to API call
  - Update results when sort changes
- T014: Display current sort option: frontend/todo-app/app/dashboard/page.tsx
  - Highlight selected sort option in dropdown
  - Visual indication of active sort

**Phase 4: User Story 2 (Frontend)**
- T015: Implement sort state persistence: frontend/todo-app/app/dashboard/page.tsx
  - Maintain sort state in React useState
  - State persists during component lifecycle
  - Reset to default on page refresh
- T018: Combine sort with search and filters: frontend/todo-app/app/dashboard/page.tsx
  - Update API call to include sort with other filters
  - Ensure sort state works with filter state
  - Test UI with all filters and sort active
- T019: Handle empty task list: frontend/todo-app/app/dashboard/page.tsx
  - Show empty state message when no tasks
  - Sort selector still visible and functional
  - Helpful message suggesting to create tasks

**Technical Requirements**:
- Use Next.js 16+ App Router
- Use TypeScript with strict typing
- Use Tailwind CSS 4.x for styling
- Use Axios or fetch API for API calls
- Responsive design (mobile-first)
- Accessibility (ARIA labels, keyboard navigation)
- Controlled components for forms

**Files to Create**:
- frontend/todo-app/app/components/task/SortSelector.tsx (CREATE)

**Files to Modify**:
- frontend/todo-app/types/index.ts (MODIFY - add SortOption type)
- frontend/todo-app/app/dashboard/page.tsx (MODIFY - integrate SortSelector)

**Design Guidelines**:
- Consistent with existing design system
- Responsive layout on all screen sizes
- Accessible (ARIA labels, keyboard navigation)
- Clear visual indication of current sort

Return the complete implementation code for all files.

## Response snapshot

Implemented all required frontend components for task sorting:

1. **Added SortOption type** to `types/index.ts`:
   - Created union type with 4 sort options
   - Added JSDoc documentation

2. **Created SortSelector component** at `app/components/task/SortSelector.tsx`:
   - Controlled dropdown component with 4 sort options
   - Icons/emojis for each option (📅 🎯 🔤 🕐)
   - Full ARIA accessibility support
   - Visual description of current selection
   - Responsive Tailwind CSS styling

3. **Exported SortSelector** from `components/task/index.ts`

4. **Updated tasksAPI** in `app/api/client.ts`:
   - Added sort parameter to getTasks method
   - Imported SortOption type

5. **Integrated SortSelector in dashboard** page:
   - Added sortOption state with useState
   - Updated fetchTasks to include sort parameter
   - Added SortSelector component to UI
   - Sort state persists during component lifecycle
   - Works combined with search and filters

## Outcome

- ✅ Impact: Users can now sort tasks by due date, priority, alphabetical order, and creation date
- 🧪 Tests: Manual testing required for all 4 sort options and combination with filters
- 📁 Files: 5 files modified/created
- 🔁 Next prompts: Backend sorting implementation verification, comprehensive testing
- 🧠 Reflection: Component follows existing design patterns and is fully accessible

## Evaluation notes (flywheel)

- Failure modes observed: None during implementation
- Graders run and results (PASS/FAIL): Pending manual testing
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test with backend API to verify sorting works end-to-end
