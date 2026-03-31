# Research: Task Priorities and Tags Implementation

**Feature**: 001-task-priority-tags
**Date**: 2026-03-10
**Purpose**: Resolve technical unknowns and establish best practices for priority and tags implementation

---

## Decision 1: Priority Storage as String Enum

**Decision**: Store priority as VARCHAR column with values 'high', 'medium', 'low' in PostgreSQL

**Rationale**: 
- String enums are more readable than integers in database queries
- Easy to extend if new priority levels needed in future
- Self-documenting - no need to remember what 1, 2, 3 mean
- PostgreSQL CHECK constraint can enforce valid values
- Aligns with Python string validation

**Alternatives Considered**:
- **Integer enum (1,2,3)**: Less readable, requires mapping layer
- **Separate priority table**: Over-engineering for fixed set of 3 values
- **PostgreSQL ENUM type**: Harder to migrate/modify, database-specific

**Implementation Approach**:
- Add `priority` column as VARCHAR(20)
- Add CHECK constraint: `priority IN ('high', 'medium', 'low')`
- Default value: 'medium'
- Python validation using set membership or Enum

---

## Decision 2: Tags Stored as PostgreSQL ARRAY

**Decision**: Store tags as ARRAY of VARCHAR in PostgreSQL using native array support

**Rationale**:
- PostgreSQL has excellent ARRAY support
- Efficient querying with ANY() and ALL() operators
- Simple schema - no join table needed
- Easy to add/remove tags
- Aligns with SQLModel/SQLAlchemy array support

**Alternatives Considered**:
- **Separate tags table with join table**: More complex, requires joins
- **JSON/JSONB column**: Less type safety, harder to query
- **Comma-separated string**: Hard to query, prone to parsing errors

**Implementation Approach**:
- Add `tags` column as `ARRAY(VARCHAR(50))`
- SQLAlchemy/SQLModel: `Column(ARRAY(String(50)))`
- Validate array length (max 10) in application layer
- Query filtering: `tags.any(tag)` or `tag == ANY(tags)`

---

## Decision 3: Default Priority for Backward Compatibility

**Decision**: Set default priority to 'medium' for all existing and new tasks without explicit priority

**Rationale**:
- Existing tasks in database need a priority value
- Medium is neutral - not urgent, not low priority
- Prevents breaking changes to existing functionality
- Users can always change priority later

**Alternatives Considered**:
- **NULL priority**: Would require NULL checks everywhere
- **Low priority**: Might devalue existing tasks
- **High priority**: Would create false urgency

**Implementation Approach**:
- Database migration: `ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium'`
- Update existing rows: `UPDATE tasks SET priority = 'medium' WHERE priority IS NULL`
- Schema default: `priority: str = "medium"`

---

## Decision 4: Priority Validation Using String Validation

**Decision**: Validate priority using simple string validation (set membership) rather than Python Enum

**Rationale**:
- Simpler implementation
- No need to convert between Python Enum and string
- Easier JSON serialization
- Sufficient for only 3 values

**Alternatives Considered**:
- **Python Enum**: More type-safe but requires conversion
- **Pydantic Enum**: Adds complexity for simple use case

**Implementation Approach**:
- Validation: `if priority not in {'high', 'medium', 'low'}: raise ValueError`
- Pydantic schema: `priority: Optional[str] = "medium"`
- API validation in endpoint

---

## Decision 5: Tags Input as Comma-Separated String

**Decision**: Accept tags as comma-separated string in API, parse to array server-side

**Rationale**:
- Simple for frontend to implement
- No complex array handling in HTTP requests
- Easy to validate and sanitize
- User-friendly input format

**Alternatives Considered**:
- **Array in JSON**: More complex frontend serialization
- **Separate tag management endpoint**: Over-engineering
- **Space-separated**: Would break on multi-word tags

**Implementation Approach**:
- Frontend sends: `"tags": "work,urgent,meeting"`
- Backend parses: `tags = [t.strip() for t in tags_str.split(',')]`
- Validate each tag (max length, no empty strings)
- Remove duplicates automatically

---

## Decision 6: Filter via Query Parameters

**Decision**: Implement filtering using query parameters on GET /tasks endpoint

**Rationale**:
- RESTful convention for filtering
- Composable filters (priority + tags)
- Easy to implement and test
- Standard pagination compatible

**Alternatives Considered**:
- **POST /tasks/filter**: Less RESTful, harder to cache
- **Separate filter endpoint**: Unnecessary complexity
- **GraphQL**: Overkill for simple filtering

**Implementation Approach**:
- GET `/api/tasks?priority=high&tag=work`
- Backend builds query dynamically
- Multiple tags: `/api/tasks?tag=work&tag=urgent`
- Return filtered list with same response schema

---

## Decision 7: Priority Badges with Color Coding

**Decision**: Use color-coded badges for priority display (red=high, yellow=medium, green=low)

**Rationale**:
- Universal color semantics (red = urgent/important)
- Quick visual scanning
- Accessible (color + text label)
- Industry standard pattern

**Alternatives Considered**:
- **Icons only**: Less clear meaning
- **Text only**: Slower to scan
- **Custom colors per user**: Inconsistent UX

**Implementation Approach**:
- High: Red background (#EF4444 or Tailwind bg-red-500)
- Medium: Yellow/amber background (#F59E0B or bg-yellow-500)
- Low: Green background (#10B981 or bg-green-500)
- White text for contrast
- Rounded badge styling

---

## Decision 8: Tag Badges with Uniform Styling

**Decision**: All tags use uniform styling (gray/blue badges) without custom colors

**Rationale**:
- Simpler implementation
- Consistent appearance
- No need for tag color management
- Focus on content, not decoration

**Alternatives Considered**:
- **Color per tag**: Requires color assignment logic
- **User-customized colors**: Complex, not essential
- **Icons per tag**: Requires icon library

**Implementation Approach**:
- Background: Gray/blue (#DBD0BD or bg-gray-200)
- Text: Dark gray for contrast
- Rounded pill shape
- Small font size (text-xs or text-sm)

---

## Decision 9: Controlled Components for Input

**Decision**: Use controlled React components for priority selector and tags input

**Rationale**:
- Single source of truth (React state)
- Easy validation and error display
- Better UX with instant feedback
- Standard React pattern

**Alternatives Considered**:
- **Uncontrolled components**: Harder to validate
- **Form library (Formik)**: Overkill for simple form
- **Ref-based**: More complex state management

**Implementation Approach**:
- Priority: Select dropdown with controlled value
- Tags: Input field with controlled value + tags array state
- Validation on change and submit
- Error messages displayed inline

---

## Decision 10: Database Migration with Backfill

**Decision**: Add nullable columns, set defaults, backfill existing data

**Rationale**:
- Zero-downtime migration possible
- Safe rollback if needed
- Existing data handled properly
- Application can deploy before or after migration

**Alternatives Considered**:
- **Drop and recreate table**: Destructive, data loss
- **Application-level default only**: Database constraint missing
- **Separate migration script**: Unnecessary complexity

**Implementation Approach**:
1. Add nullable column: `ALTER TABLE tasks ADD COLUMN priority VARCHAR(20)`
2. Set default: `ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium'`
3. Backfill: `UPDATE tasks SET priority = 'medium' WHERE priority IS NULL`
4. Add constraint: `ALTER TABLE tasks ALTER COLUMN priority SET NOT NULL`
5. Add tags column: `ALTER TABLE tasks ADD COLUMN tags VARCHAR(50)[] DEFAULT '{}'`

---

## Summary of Technology Choices

| Component | Choice | Justification |
|-----------|--------|---------------|
| Priority Storage | VARCHAR with CHECK constraint | Readable, simple, extensible |
| Tags Storage | PostgreSQL ARRAY | Native support, efficient querying |
| Default Priority | 'medium' | Neutral, backward compatible |
| Priority Validation | String set membership | Simple, sufficient |
| Tags Input | Comma-separated string | Simple frontend, easy parsing |
| Filtering | Query parameters | RESTful, composable |
| Priority Display | Color-coded badges | Quick visual scanning |
| Tag Display | Uniform badges | Simple, consistent |
| Frontend State | Controlled components | Single source of truth |
| Migration | Nullable + backfill | Zero-downtime, safe |

---

## Best Practices Identified

1. **Validation**: Validate priority and tags server-side, not just client-side
2. **Error Messages**: Return specific validation errors (e.g., "Invalid priority value")
3. **Backward Compatibility**: Ensure existing tasks work without priority/tags
4. **Indexing**: Consider index on priority column for filtering performance
5. **Tag Normalization**: Trim whitespace, convert to lowercase for consistency
6. **Duplicate Prevention**: Automatically remove duplicate tags
7. **Length Limits**: Enforce max 10 tags, 50 chars each
8. **Accessibility**: Ensure color contrast meets WCAG standards
9. **Mobile Responsive**: Ensure badges and filters work on small screens
10. **Testing**: Test filtering with edge cases (no results, multiple filters)

---

## Open Questions for Phase 1

None - all technical decisions resolved with informed defaults based on:
- Project constitution requirements
- Industry best practices
- PostgreSQL capabilities
- React/Next.js conventions

---

## Database Schema Reference

```sql
-- Priority column
ALTER TABLE tasks 
ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
ADD CONSTRAINT check_priority CHECK (priority IN ('high', 'medium', 'low'));

-- Tags column
ALTER TABLE tasks 
ADD COLUMN tags VARCHAR(50)[] DEFAULT '{}';

-- Index for filtering
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
```

---

## API Query Examples

```bash
# Filter by priority
GET /api/tasks?priority=high

# Filter by single tag
GET /api/tasks?tag=work

# Filter by multiple tags (AND logic)
GET /api/tasks?tag=work&tag=urgent

# Combined filters
GET /api/tasks?priority=high&tag=work

# All tasks (no filters)
GET /api/tasks
```
