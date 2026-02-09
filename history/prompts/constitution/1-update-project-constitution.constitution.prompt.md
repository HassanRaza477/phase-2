---
id: 1
title: "Update Project Constitution"
stage: constitution
date_iso: "2026-02-08"
surface: "agent"
model: "Qwen"
feature: "none"
branch: "main"
user: "HASAN RAZA"
command: "/sp.constitution"
labels: ["constitution", "spec-driven", "full-stack-web-app"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - ".specify/memory/constitution.md"
tests_yaml: []
---

# Update Project Constitution

## User Input

```
Project: Full-Stack Multi-User Todo Web Application (Spec-Driven, Agentic Development)

Core principles:
- Spec-first engineering (no implementation without approved specification)
- Deterministic generation (outputs must strictly follow the written spec)
- Security by design (authentication and authorization enforced at every layer)
- Separation of concerns (frontend, backend, and auth layers remain decoupled)
- Reproducibility (same prompts → same architecture and behavior)
- Traceability (all features map back to explicit requirements)

Key standards:
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

Security standards:
- All endpoints require valid JWT unless explicitly marked public
- User identity must be derived from token, never trusted from client input
- Task ownership must be enforced at database query level
- Tokens must support expiration
- No sensitive secrets hardcoded in codebase

Architecture constraints:
- Frontend and backend must be independently deployable
- Backend must not depend on frontend runtime
- Auth system must remain stateless (JWT-based)
- Database: Neon Serverless PostgreSQL only
- API must follow defined route structure
- System must support horizontal scaling (stateless backend)

Development constraints:
- Workflow must follow: Spec → Plan → Tasks → Implementation
- Each spec must be independently testable
- Features must be modular and composable
- No undocumented features
- No speculative features outside scope

Quality standards:
- Code must be production-structured (folders, modules, separation)
- Type safety required where supported
- Validation required on all inputs
- Clear naming conventions for endpoints, models, and files
- No unused dependencies
- No dead code

Success criteria:
- All defined API endpoints function correctly
- Authentication correctly isolates users
- Users cannot access other users' data
- Frontend successfully performs full CRUD through API
- System works with persistent Neon database
- App supports multiple concurrent users
- All functionality implemented strictly via spec-driven process
- Judges can trace every feature back to spec artifacts
```

## Response Summary

Updated the project constitution file (.specify/memory/constitution.md) with comprehensive principles, standards, constraints, and criteria for the Full-Stack Multi-User Todo Web Application project. The new constitution includes:

- Six core principles covering spec-first engineering, deterministic generation, security by design, separation of concerns, reproducibility, and traceability
- Key standards for development including no manual coding, RESTful API conventions, JWT authentication, and technology stack requirements
- Security standards for authentication, authorization, and data protection
- Architecture constraints for deployment, scalability, and database usage
- Development constraints for workflow and feature implementation
- Quality standards for code structure and validation
- Success criteria for functionality and evaluation

The constitution is versioned as 1.0.0 with ratification and amendment dates set to 2026-02-08.

## Outcome

Successfully created and updated the project constitution file with all specified requirements. The constitution now serves as the governing document for the spec-driven development of the full-stack web application project.