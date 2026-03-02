<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 2.0.0
Modified principles: Core Principles (expanded from 6 to 14 with AI Layer principles)
Added sections: AI Layer Principles (8), AI Governance Standards, AI Security Standards (Extended), AI Architecture Constraints, Conversation Standards, Tool Design Standards, AI Operational Constraints, AI Quality Standards, Phase III Success Criteria, Prohibited Behaviors (AI)
Removed sections: N/A
Templates requiring updates: ⚠ pending - .specify/templates/plan-template.md (add AI constitution checks), .specify/templates/spec-template.md (add AI requirements section), .specify/templates/tasks-template.md (add AI task categories)
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

## AI Layer Principles

### VII. Tool-First AI Design (NON-NEGOTIABLE)
LLM must act only through defined MCP tools; No direct database or system access permitted; All AI operations must route through explicit tool contracts.

### VIII. Deterministic Tool Contracts
All MCP tools must have explicit schemas with defined inputs, outputs, and error handling; Tool behavior must be predictable and verifiable.

### IX. Stateless Server Architecture
No in-memory session state permitted; All conversation context must persist via database; Each request must be independently executable and reconstructible.

### X. Conversation Persistence via Database
All AI conversations must be stored in the Message table; Conversation continuity must survive server restarts; Context reconstruction from database is mandatory.

### XI. Strict User Isolation across AI Workflows
AI must never access cross-user data; All tool invocations must enforce user ownership; Conversation records must be scoped by authenticated user only.

### XII. Separation of AI Reasoning from Business Logic
AI layer must remain decoupled from core business logic; MCP tools encapsulate all data operations; Agent instructions must not contain hidden business rules.

### XIII. Reproducibility of Agent Behavior
Agent behavior must be fully determined by prompts and tool definitions; Same conversation history + same input must yield identical tool selections and responses.

### XIV. No Hidden Side Effects
All AI operations must occur exclusively through MCP tools; No side effects outside declared tool scope; All tool calls must be logged and traceable.

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

## AI Security Standards (Extended)

- Chat endpoint requires valid JWT authentication
- User identity must be derived from verified token
- MCP tools must require authenticated user_id
- Agent must not accept user_id from raw prompt text
- Cross-user tool execution must be impossible
- Conversation records must be scoped by authenticated user
- No sensitive secrets exposed to agent context
- AI must never directly modify the database
- All task mutations must occur exclusively through MCP tools
- MCP tools must validate input before execution
- Every tool must enforce user ownership
- All AI responses must be derived from agent execution + tool results
- Tool calls must be logged and traceable
- Server must not store conversation state in memory

## Architecture Constraints

- Frontend and backend must be independently deployable
- Backend must not depend on frontend runtime
- Auth system must remain stateless (JWT-based)
- Database: Neon Serverless PostgreSQL only
- API must follow defined route structure
- System must support horizontal scaling (stateless design)

## AI Architecture Constraints

- AI logic must use OpenAI Agents SDK
- MCP server must use Official MCP SDK
- MCP tools must be stateless and database-backed
- Chat endpoint must reconstruct context from database each request
- No global variables storing conversation state
- Each request must be independently executable

## Development Constraints

- Workflow must follow: Spec → Plan → Tasks → Implementation
- Each spec must be independently testable
- Features must be modular and composable
- No undocumented features
- No speculative features outside scope

## Conversation Standards

- Each message stored in Message table
- Conversation table must track user ownership
- Agent input must include prior messages from database
- Assistant responses stored before response returned
- Conversation must resume correctly after server restart

## Tool Design Standards

- Each tool must declare:
  - Name
  - Purpose
  - Input schema
  - Output schema
- Tool responses must be structured JSON
- Tool errors must return structured failure responses
- No tool may perform operations outside its declared scope

## AI Operational Constraints

- No manual coding outside spec-driven workflow
- Each AI behavior must map to documented tool usage
- No speculative AI capabilities beyond defined tools
- Agent instructions must clearly describe tool usage rules
- Natural language must translate into explicit tool invocation

## Quality Standards

- Code must be production-structured (folders, modules, separation)
- Type safety required where supported
- Validation required on all inputs
- Clear naming conventions for endpoints, models, and files
- No unused dependencies
- No dead code

## AI Quality Standards

- All AI interactions must confirm actions clearly
- Errors must be handled gracefully
- Tool invocation must be observable in response payload
- System must scale horizontally (stateless design)
- Code must remain modular: frontend, chat endpoint, agent, MCP server separated

## Success Criteria

- All defined API endpoints function correctly
- Authentication correctly isolates users
- Users cannot access other users' data
- Frontend successfully performs full CRUD through API
- System works with persistent Neon database
- App supports multiple concurrent users
- All functionality implemented strictly via spec-driven process
- Judges can trace every feature back to spec artifacts

## Phase III Success Criteria

- Users can manage tasks entirely through natural language
- Agent correctly selects MCP tools based on intent
- Conversation context persists across requests
- Server restart does not break conversation continuity
- AI cannot access other users' tasks
- All tool invocations are validated and secure
- System remains fully stateless
- Judges can trace AI decisions to tool definitions

## Prohibited Behaviors (AI)

- Direct DB manipulation by agent
- In-memory conversation caching
- Hidden business logic inside prompt
- Accepting user_id from user message
- Bypassing MCP layer for task operations
- Non-deterministic or undocumented tool side effects

## Governance

This constitution supersedes all other development practices and guidelines; All amendments must be documented with proper approval and migration plans if needed; All pull requests and reviews must verify compliance with these principles; All complexity must be justified against these core principles; Use specification documents for runtime development guidance.

**Version**: 2.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-22
