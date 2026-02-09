<!-- SYNC IMPACT REPORT
Version change: N/A -> 1.0.0
Modified principles: N/A
Added sections: Core Principles (6), Key Standards, Security Standards, Architecture Constraints, Development Constraints, Quality Standards, Success Criteria
Removed sections: N/A
Templates requiring updates: ⚠ pending - .specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md
Follow-up TODOs: None
-->

# Full-Stack Multi-User Todo Web Application Constitution

## Core Principles

### I. Spec-First Engineering
All implementation must strictly follow an approved specification; No code implementation without a corresponding written spec that has been reviewed and approved.

### II. Deterministic Generation
All outputs must strictly follow the written specification; Same prompts and specs must result in consistent architecture and behavior across generations.

### III. Security by Design
Authentication and authorization must be enforced at every layer of the application; Security considerations must be integrated from the initial design phase.

### IV. Separation of Concerns
Frontend, backend, and authentication layers must remain decoupled; Each layer should have well-defined interfaces and minimal interdependencies.

### V. Reproducibility (NON-NEGOTIABLE)
Same inputs and prompts must consistently yield identical architecture and behavior; All processes must be deterministic and repeatable.

### VI. Traceability
Every feature and component must map back to explicit requirements in the specification; Clear lineage from requirements to implementation must be maintained.

## Key Standards

- No manual coding allowed — all code must be agent-generated from specs
- RESTful API conventions must be followed
- All data operations must be user-scoped (multi-user isolation)
- Authentication must use JWT issued by Better Auth
- Backend must verify JWT signatures using shared secret
- Database interactions must use SQLModel ORM
- Frontend must use Next.js App Router architecture
- Backend framework must be FastAPI
- All environment secrets must be externalized (env variables only)
- Error handling must return proper HTTP status codes
- API responses must be JSON and schema-consistent

## Security Standards

- All endpoints require valid JWT unless explicitly marked public
- User identity must be derived from token, never trusted from client input
- Task ownership must be enforced at database query level
- Tokens must support expiration
- No sensitive secrets hardcoded in codebase

## Architecture Constraints

- Frontend and backend must be independently deployable
- Backend must not depend on frontend runtime
- Auth system must remain stateless (JWT-based)
- Database: Neon Serverless PostgreSQL only
- API must follow defined route structure
- System must support horizontal scaling (stateless backend)

## Development Constraints

- Workflow must follow: Spec → Plan → Tasks → Implementation
- Each spec must be independently testable
- Features must be modular and composable
- No undocumented features
- No speculative features outside scope

## Quality Standards

- Code must be production-structured (folders, modules, separation)
- Type safety required where supported
- Validation required on all inputs
- Clear naming conventions for endpoints, models, and files
- No unused dependencies
- No dead code

## Success Criteria

- All defined API endpoints function correctly
- Authentication correctly isolates users
- Users cannot access other users' data
- Frontend successfully performs full CRUD through API
- System works with persistent Neon database
- App supports multiple concurrent users
- All functionality implemented strictly via spec-driven process
- Judges can trace every feature back to spec artifacts

## Governance

This constitution supersedes all other development practices and guidelines; All amendments must be documented with proper approval and migration plans if needed; All pull requests and reviews must verify compliance with these principles; All complexity must be justified against these core principles; Use specification documents for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
