# Research: Task Search and Filtering Implementation

**Feature**: 001-task-search-filter
**Date**: 2026-03-10
**Purpose**: Resolve technical unknowns and establish best practices for search and filtering implementation

---

## Decision 1: Search Using SQL ILIKE

**Decision**: Implement keyword search using PostgreSQL ILIKE operator for case-insensitive substring matching

**Rationale**: 
- ILIKE provides case-insensitive matching out of the box
- Substring matching is user-friendly (partial words match)
- No additional database extensions required
- Good performance on indexed columns
- Simple to implement and maintain

**Alternatives Considered**:
- **Full-text search (tsvector/tsquery)**: More powerful but requires indexing setup, overkill for simple search
- **Regular expressions**: More flexible but slower, harder to maintain
- **Exact match**: Too restrictive, poor user experience

**Implementation Approach**:
- SQL: `WHERE title ILIKE '%keyword%' OR description ILIKE '%keyword%'`
- Escape special characters to prevent injection
- Limit search query to 100 characters
- Trim whitespace from query

---

## Decision 2: Dynamic WHERE Clauses for Filters

**Decision**: Build dynamic WHERE clauses based on provided filter parameters

**Rationale**:
- Flexible and composable
- Only applies filters when parameters are provided
- Easy to extend with new filters
- Clear and maintainable code

**Alternatives Considered**:
- **Separate endpoints per filter**: More endpoints, harder to maintain
- **GraphQL**: Overkill for simple filtering
- **Query builder library**: Adds dependency, simple enough without

**Implementation Approach**:
- Start with base query filtered by user_id
- Add WHERE clauses conditionally based on parameters
- Combine all conditions with AND logic
- Use parameterized queries to prevent SQL injection

---

## Decision 3: AND Logic for Multiple Filters

**Decision**: Combine multiple filters with AND logic (all criteria must match)

**Rationale**:
- Most intuitive behavior for users
- Narrows down results effectively
- Standard pattern in task management apps
- Easier to understand than OR logic

**Alternatives Considered**:
- **OR logic**: Would return too many results, less useful
- **Configurable logic**: Adds complexity, not needed for this use case

**Implementation Approach**:
- SQL: `WHERE user_id = :user_id AND status = :status AND priority = :priority`
- All provided filters must match
- Search query also combined with AND logic

---

## Decision 4: Search Query Validation

**Decision**: Validate search queries: trim whitespace, limit to 100 characters, escape special characters

**Rationale**:
- Prevents SQL injection attacks
- Avoids performance issues with very long queries
- Whitespace-only queries show all tasks (no implicit filtering)
- Consistent user experience

**Alternatives Considered**:
- **No limit**: Potential performance issues, abuse vector
- **Stricter limit (50 chars)**: Might be too restrictive for some use cases
- **Automatic truncation**: Confusing for users

**Implementation Approach**:
- Trim leading/trailing whitespace
- Check length <= 100 characters
- Escape SQL special characters (%, _, \)
- Return validation error if invalid

---

## Decision 5: Results Sorting

**Decision**: Sort results by created_at descending (most recent first)

**Rationale**:
- Users typically want to see recent tasks first
- Consistent with existing task list behavior
- Predictable ordering
- Easy to implement

**Alternatives Considered**:
- **Sort by priority**: Would require additional logic, might not match user intent
- **Sort by due date**: Not all tasks have due dates
- **Relevance scoring**: Requires full-text search, overkill

**Implementation Approach**:
- SQL: `ORDER BY created_at DESC`
- Consistent across all search/filter combinations

---

## Decision 6: Empty Search Shows All Tasks

**Decision**: Empty or whitespace-only search query shows all tasks (no implicit filtering)

**Rationale**:
- Intuitive behavior - no search = show everything
- Clear search box = clear filters
- Consistent with standard search patterns
- Avoids confusion

**Alternatives Considered**:
- **Hide all tasks**: Confusing, requires explicit search
- **Show recent tasks only**: Implicit filtering, unpredictable

**Implementation Approach**:
- Check if search query is empty or whitespace-only
- Skip search WHERE clause if empty
- Return all tasks (filtered by user_id and other filters)

---

## Decision 7: Filter State in React State

**Decision**: Maintain search and filter state in React component state (not persisted)

**Rationale**:
- Simple to implement
- State resets on page refresh (expected behavior)
- No additional storage required
- Fast updates (no localStorage overhead)

**Alternatives Considered**:
- **localStorage persistence**: More complex, might confuse users with stale filters
- **URL query parameters**: Shareable URLs, but more complex implementation
- **Backend session**: Unnecessary complexity

**Implementation Approach**:
- useState hooks for search, status, priority, tag
- Update state on user input
- Re-fetch tasks when state changes
- Reset state on "clear all" action

---

## Decision 8: PostgreSQL Indexes for Performance

**Decision**: Ensure indexes exist on status, priority, and tags columns for query performance

**Rationale**:
- Fast filtering on large task lists
- Indexes already created by priority/tags migration
- Minimal storage overhead
- Significant query performance improvement

**Alternatives Considered**:
- **No indexes**: Slow on large datasets
- **Composite indexes**: More complex, not needed for simple filters
- **Materialized views**: Overkill for simple filtering

**Implementation Approach**:
- Verify indexes exist from priority/tags migration
- B-tree index on status and priority
- GIN index on tags array
- Test query performance with EXPLAIN ANALYZE

---

## Decision 9: Controlled Components for UI

**Decision**: Use controlled React components for search input and filter dropdowns

**Rationale**:
- Single source of truth (React state)
- Easy validation and error display
- Better UX with instant feedback
- Standard React pattern

**Alternatives Considered**:
- **Uncontrolled components**: Harder to validate, more complex
- **Form library (Formik)**: Overkill for simple search/filters
- **Ref-based**: More complex state management

**Implementation Approach**:
- useState for each filter value
- onChange handlers update state
- Value prop binds component to state
- Clear button resets state to defaults

---

## Decision 10: No Database Schema Changes

**Decision**: No new database columns or tables required - uses existing columns

**Rationale**:
- Priority and tags columns already exist from previous feature
- Search operates on existing title and description columns
- Minimal migration risk
- Faster implementation

**Alternatives Considered**:
- **Add search index table**: Overkill for simple search
- **Add filter presets table**: Out of scope for this feature
- **Add search history table**: Not needed

**Implementation Approach**:
- No migration required
- Use existing Task model
- Update API query logic only

---

## Summary of Technology Choices

| Component | Choice | Justification |
|-----------|--------|---------------|
| Search Matching | SQL ILIKE | Case-insensitive, substring, simple |
| Filter Logic | Dynamic WHERE clauses | Flexible, composable, maintainable |
| Filter Combination | AND logic | Intuitive, standard pattern |
| Query Validation | Trim, limit 100, escape | Security, performance, UX |
| Result Sorting | created_at DESC | Recent first, consistent |
| Empty Search | Show all tasks | Intuitive, standard |
| State Management | React useState | Simple, fast, no persistence |
| Performance | PostgreSQL indexes | Fast filtering, existing indexes |
| UI Components | Controlled components | Single source of truth, validation |
| Database Schema | No changes | Uses existing columns |

---

## Best Practices Identified

1. **SQL Injection Prevention**: Always use parameterized queries
2. **Input Validation**: Validate and sanitize all user input server-side
3. **Performance Testing**: Test with large task lists (1000+ tasks)
4. **Empty States**: Show helpful messages when no results found
5. **Accessibility**: Ensure search input and filters are keyboard accessible
6. **Mobile Responsive**: Ensure search and filters work on small screens
7. **Loading States**: Show loading indicator while fetching results
8. **Error Handling**: Handle API errors gracefully with user-friendly messages
9. **Clear Filters**: Provide easy way to reset all filters
10. **Filter Count**: Display number of active filters for user awareness

---

## Open Questions for Phase 1

None - all technical decisions resolved with informed defaults based on:
- Project constitution requirements
- Industry best practices
- PostgreSQL capabilities
- React/Next.js conventions

---

## Query Examples

### Search Only
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND (title ILIKE '%keyword%' OR description ILIKE '%keyword%')
ORDER BY created_at DESC;
```

### Filter by Status Only
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND status = :status
ORDER BY created_at DESC;
```

### Filter by Priority and Tag
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND priority = :priority
  AND :tag = ANY(tags)
ORDER BY created_at DESC;
```

### Combined Search + Multiple Filters
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND (title ILIKE '%keyword%' OR description ILIKE '%keyword%')
  AND status = :status
  AND priority = :priority
  AND :tag = ANY(tags)
ORDER BY created_at DESC;
```

---

## Frontend State Structure

```typescript
interface TaskFilterState {
  search: string;        // Search keyword
  status: string | null; // 'completed' | 'pending' | null
  priority: string | null; // 'high' | 'medium' | 'low' | null
  tag: string | null;    // Tag name | null
}

// Example state:
// { search: 'meeting', status: 'pending', priority: 'high', tag: 'work' }
```

---

## API Query Parameter Examples

```bash
# Search only
GET /api/tasks?search=meeting

# Filter by status
GET /api/tasks?status=completed

# Filter by priority
GET /api/tasks?priority=high

# Filter by tag
GET /api/tasks?tag=work

# Combined search + filters
GET /api/tasks?search=project&status=pending&priority=high&tag=work

# No filters (show all)
GET /api/tasks
```
