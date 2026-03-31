# Research: Task Sorting Implementation

**Feature**: 001-task-sorting
**Date**: 2026-03-10
**Purpose**: Resolve technical unknowns and establish best practices for sorting implementation

---

## Decision 1: SQL ORDER BY for Sorting

**Decision**: Implement sorting using SQL ORDER BY clauses in database queries

**Rationale**: 
- Database-level sorting is most efficient for large datasets
- PostgreSQL optimizes ORDER BY with indexes
- No client-side processing overhead
- Standard SQL pattern, easy to maintain
- Works seamlessly with existing search and filter logic

**Alternatives Considered**:
- **Client-side sorting**: Would require loading all tasks, poor performance on large lists
- **Full-text search ranking**: Overkill for simple field-based sorting
- **Custom sorting functions**: Adds complexity, no benefit over ORDER BY

**Implementation Approach**:
- Map sort parameter to ORDER BY clause
- due_date: `ORDER BY due_date ASC NULLS LAST`
- priority: `ORDER BY priority DESC` (high to low)
- alphabetical: `ORDER BY title ASC`
- created_at: `ORDER BY created_at DESC` (newest first)

---

## Decision 2: Enum Validation for Sort Parameter

**Decision**: Validate sort parameter against fixed enum values

**Rationale**:
- Prevents SQL injection attacks
- Clear error messages for invalid values
- Easy to extend with new sort options
- Type-safe with TypeScript/Python enums
- Default behavior for invalid values

**Alternatives Considered**:
- **Free-form string**: Security risk, harder to validate
- **Numeric codes**: Less readable, no clear benefit
- **No validation**: Security vulnerability

**Implementation Approach**:
- Backend enum: `["due_date", "priority", "alphabetical", "created_at"]`
- Frontend type: `type SortOption = 'due_date' | 'priority' | 'alphabetical' | 'created_at'`
- Default to 'created_at' for invalid/missing values

---

## Decision 3: Default Sort - Created At Descending

**Decision**: Default to created_at DESC (newest first) when sort parameter is missing or invalid

**Rationale**:
- Intuitive default - users typically want to see recent tasks first
- Consistent with existing behavior (before sorting feature)
- Creation date is always populated (no null handling needed)
- Matches user expectations from other task management apps

**Alternatives Considered**:
- **Due date ascending**: Would put overdue tasks first, but not all tasks have due dates
- **Priority descending**: Would show high priority first, but might not match user intent
- **Alphabetical**: Not intuitive for task management

**Implementation Approach**:
- If sort parameter missing: use created_at DESC
- If sort parameter invalid: use created_at DESC
- Log invalid sort parameters for monitoring

---

## Decision 4: Null Values with NULLS LAST

**Decision**: Handle null values using SQL NULLS LAST clause

**Rationale**:
- Tasks without due dates appear at the end when sorting by due date
- Consistent user experience
- Standard SQL pattern supported by PostgreSQL
- Prevents nulls from appearing randomly in sorted list

**Alternatives Considered**:
- **NULLS FIRST**: Would put tasks without due dates first, counterintuitive
- **Filter out nulls**: Would hide tasks, unacceptable data loss
- **Replace null with sentinel**: Adds complexity, potential bugs

**Implementation Approach**:
- due_date: `ORDER BY due_date ASC NULLS LAST`
- Other fields (title, priority, created_at) are NOT NULL, no special handling needed

---

## Decision 5: Secondary Sort by Created At

**Decision**: Apply secondary sort by created_at DESC for tasks with equal primary sort values

**Rationale**:
- Deterministic ordering when primary sort values are equal
- Recent tasks appear first among equals
- Improves user experience with consistent ordering
- No additional performance cost (created_at is indexed)

**Alternatives Considered**:
- **No secondary sort**: Ordering would be non-deterministic, confusing for users
- **Secondary sort by ID**: Less meaningful than creation date
- **Configurable secondary sort**: Adds complexity, not needed

**Implementation Approach**:
- All sorts: `ORDER BY <primary_field> <direction> NULLS LAST, created_at DESC`
- Ensures consistent, predictable ordering

---

## Decision 6: Database-Level Sorting Only

**Decision**: Perform all sorting at database level, no client-side sorting

**Rationale**:
- Optimal performance for large task lists
- Leverages database indexes
- Reduces memory usage on client
- Consistent with search and filter implementation
- Scales better with growing data

**Alternatives Considered**:
- **Client-side sorting**: Would require loading all tasks, poor performance
- **Hybrid approach**: Adds complexity, no clear benefit
- **Caching sorted results**: Premature optimization, database is fast enough

**Implementation Approach**:
- API accepts sort parameter
- Backend builds ORDER BY clause
- Database returns sorted results
- Frontend displays results as-is

---

## Decision 7: Sort State in React State

**Decision**: Maintain sort state in React component state (not persisted across sessions)

**Rationale**:
- Simple to implement
- State resets on page refresh (expected behavior)
- No additional storage required
- Fast updates (no localStorage overhead)

**Alternatives Considered**:
- **localStorage persistence**: More complex, might confuse users with stale sort settings
- **URL query parameters**: Shareable URLs, but more complex implementation
- **Backend session**: Unnecessary complexity for simple feature

**Implementation Approach**:
- useState for sort value
- onChange handler updates state
- State passed to API call
- Reset to default on page load

---

## Decision 8: PostgreSQL Indexes for Performance

**Decision**: Ensure indexes exist on sortable columns for query performance

**Rationale**:
- Fast sorting on large task lists
- Indexes may already exist from previous features
- Minimal storage overhead
- Significant query performance improvement

**Alternatives Considered**:
- **No indexes**: Slow on large datasets
- **Composite indexes**: More complex, not needed for simple sorts
- **Materialized views**: Overkill for simple sorting

**Implementation Approach**:
- Verify indexes exist on: due_date, priority, title, created_at
- B-tree indexes support all sort types
- Test query performance with EXPLAIN ANALYZE

---

## Decision 9: Controlled Dropdown Component

**Decision**: Use controlled React dropdown component for sort selector

**Rationale**:
- Single source of truth (React state)
- Easy validation and error display
- Better UX with instant feedback
- Standard React pattern

**Alternatives Considered**:
- **Uncontrolled component**: Harder to validate, more complex
- **Custom sort UI**: Overkill for simple dropdown
- **Ref-based**: More complex state management

**Implementation Approach**:
- useState for sort value
- Select dropdown with controlled value
- onChange handler updates state and triggers re-fetch
- Clear visual indication of current sort

---

## Decision 10: No Database Schema Changes

**Decision**: No new database columns or tables required - uses existing columns

**Rationale**:
- All sortable fields already exist in Task model
- due_date, priority, title, created_at are existing columns
- Minimal migration risk
- Faster implementation

**Alternatives Considered**:
- **Add sort_order column**: Unnecessary, dynamic sorting is sufficient
- **Add user sort preferences table**: Out of scope for this feature
- **Add sort history table**: Not needed

**Implementation Approach**:
- No migration required
- Use existing Task model
- Update API query logic only

---

## Summary of Technology Choices

| Component | Choice | Justification |
|-----------|--------|---------------|
| Sorting Method | SQL ORDER BY | Database-level, efficient, standard |
| Sort Validation | Enum values | Security, type-safe, clear errors |
| Default Sort | created_at DESC | Intuitive, consistent, always populated |
| Null Handling | NULLS LAST | Standard SQL, tasks without dates at end |
| Secondary Sort | created_at DESC | Deterministic ordering, recent first |
| Sort Location | Database only | Performance, scalability |
| State Management | React useState | Simple, fast, no persistence |
| Performance | PostgreSQL indexes | Fast sorting, existing indexes |
| UI Component | Controlled dropdown | Single source of truth, validation |
| Database Schema | No changes | Uses existing columns |

---

## Best Practices Identified

1. **SQL Injection Prevention**: Always use parameterized queries, validate enum values
2. **Performance Testing**: Test with large task lists (1000+ tasks)
3. **Empty States**: Show helpful messages when no tasks to sort
4. **Accessibility**: Ensure dropdown is keyboard accessible
5. **Mobile Responsive**: Ensure sort selector works on small screens
6. **Loading States**: Show loading indicator while fetching sorted results
7. **Error Handling**: Handle API errors gracefully with user-friendly messages
8. **Visual Feedback**: Clearly indicate current sort option
9. **Consistent Ordering**: Use secondary sort for deterministic results
10. **Logging**: Log invalid sort parameters for monitoring

---

## Open Questions for Phase 1

None - all technical decisions resolved with informed defaults based on:
- Project constitution requirements
- Industry best practices
- PostgreSQL capabilities
- React/Next.js conventions

---

## Query Examples

### Sort by Due Date
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
ORDER BY due_date ASC NULLS LAST, created_at DESC;
```

### Sort by Priority
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
ORDER BY 
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END ASC,
  created_at DESC;
```

### Sort by Title (Alphabetical)
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
ORDER BY title ASC, created_at DESC;
```

### Sort by Creation Date (Default)
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
ORDER BY created_at DESC;
```

### Combined with Search and Filters
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND (title ILIKE '%keyword%' OR description ILIKE '%keyword%')
  AND completed = :status
  AND priority = :priority
  AND :tag = ANY(tags)
ORDER BY due_date ASC NULLS LAST, created_at DESC;
```

---

## Frontend State Structure

```typescript
interface TaskSortState {
  sort: SortOption; // 'due_date' | 'priority' | 'alphabetical' | 'created_at'
}

// Example state:
// { sort: 'due_date' }
```

---

## API Query Parameter Examples

```bash
# Sort by due date
GET /api/tasks?sort=due_date

# Sort by priority
GET /api/tasks?sort=priority

# Sort alphabetically
GET /api/tasks?sort=alphabetical

# Sort by creation date (default)
GET /api/tasks?sort=created_at

# Invalid sort (defaults to created_at)
GET /api/tasks?sort=invalid

# No sort parameter (defaults to created_at)
GET /api/tasks

# Combined with search and filters
GET /api/tasks?search=project&status=pending&priority=high&sort=due_date
```
