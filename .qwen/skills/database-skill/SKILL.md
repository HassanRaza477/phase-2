---
name: database-skill
description: Design relational database schemas, create tables, and manage migrations safely. Use for backend data modeling.
---

# Database Skill – Schema Design & Migrations

## Instructions

1. **Schema design**
   - Identify entities and relationships
   - Normalize data appropriately
   - Choose correct data types
   - Define primary and foreign keys

2. **Table creation**
   - Create tables with clear, consistent naming
   - Add indexes for frequently queried columns
   - Enforce constraints (NOT NULL, UNIQUE, CHECK)
   - Use timestamps where applicable

3. **Migrations**
   - Write reversible migrations
   - Avoid destructive changes in production
   - Handle data backfills safely
   - Version and document schema changes

4. **Performance & integrity**
   - Optimize indexes and query paths
   - Prevent orphaned records
   - Use transactions for critical changes

## Best Practices
- Prefer explicit schema over implicit defaults
- Use snake_case for table and column names
- Add `created_at` and `updated_at` fields
- Avoid over-indexing
- Test migrations on staging first
- Keep migrations small and focused

