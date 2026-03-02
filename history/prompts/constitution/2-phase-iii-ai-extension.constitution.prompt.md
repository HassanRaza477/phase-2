---
id: 2
title: "Phase III AI Extension Constitution Update"
stage: constitution
date_iso: "2026-02-22"
surface: "agent"
model: "Qwen"
feature: "ai-powered-todo-chatbot"
branch: "main"
user: "HASAN RAZA"
command: "/sp.constitution (Phase III Update)"
labels: ["constitution", "ai-layer", "mcp-server", "phase-iii"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - ".specify/memory/constitution.md"
tests_yaml: []
---

# Phase III AI Extension Constitution Update

## User Input

```
/sp.constitution (Phase III Update)

Project Extension: AI-Powered Todo Chatbot using MCP Server Architecture

Purpose:
Extend the existing multi-user todo system with a conversational AI interface that manages tasks through MCP tools using a stateless, secure, and deterministic architecture.

Core principles (AI Layer):

- Tool-First AI Design (LLM must act only through defined MCP tools)
- Deterministic Tool Contracts (all MCP tools must have explicit schemas)
- Stateless Server Architecture (no in-memory session state)
- Conversation Persistence via Database
- Strict User Isolation across AI workflows
- Separation of AI reasoning from business logic
- Reproducibility of agent behavior via defined prompts and tool specs
- No hidden side effects outside MCP tools

AI Governance Standards:

- The AI agent must never directly modify the database
- All task mutations must occur exclusively through MCP tools
- MCP tools must validate input before execution
- Every tool must enforce user ownership
- All AI responses must be derived from agent execution + tool results
- Tool calls must be logged and traceable
- Conversation history must be stored in database
- Server must not store conversation state in memory

Security Standards (Extended):

- Chat endpoint requires valid JWT authentication
- User identity must be derived from verified token
- MCP tools must require authenticated user_id
- Agent must not accept user_id from raw prompt text
- Cross-user tool execution must be impossible
- Conversation records must be scoped by authenticated user
- No sensitive secrets exposed to agent context

Architecture Constraints:

- AI logic must use OpenAI Agents SDK
- MCP server must use Official MCP SDK
- MCP tools must be stateless and database-backed
- Chat endpoint must reconstruct context from database each request
- No global variables storing conversation state
- Each request must be independently executable

Conversation Standards:

- Each message stored in Message table
- Conversation table must track user ownership
- Agent input must include prior messages from database
- Assistant responses stored before response returned
- Conversation must resume correctly after server restart

Tool Design Standards:

- Each tool must declare:
  - Name
  - Purpose
  - Input schema
  - Output schema
- Tool responses must be structured JSON
- Tool errors must return structured failure responses
- No tool may perform operations outside its declared scope

Operational Constraints:

- No manual coding outside spec-driven workflow
- Each AI behavior must map to documented tool usage
- No speculative AI capabilities beyond defined tools
- Agent instructions must clearly describe tool usage rules
- Natural language must translate into explicit tool invocation

Quality Standards:

- All AI interactions must confirm actions clearly
- Errors must be handled gracefully
- Tool invocation must be observable in response payload
- System must scale horizontally (stateless design)
- Code must remain modular: frontend, chat endpoint, agent, MCP server separated

Success Criteria (Phase III):

- Users can manage tasks entirely through natural language
- Agent correctly selects MCP tools based on intent
- Conversation context persists across requests
- Server restart does not break conversation continuity
- AI cannot access other users' tasks
- All tool invocations are validated and secure
- System remains fully stateless
- Judges can trace AI decisions to tool definitions

Prohibited Behaviors:

- Direct DB manipulation by agent
- In-memory conversation caching
- Hidden business logic inside prompt
- Accepting user_id from user message
- Bypassing MCP layer for task operations
- Non-deterministic or undocumented tool side effects
```

## Response Summary

Updated the project constitution to version 2.0.0 with the Phase III AI-Powered Todo Chatbot extension. The constitution now includes:

**Added 8 new AI Layer Principles:**
- Tool-First AI Design (NON-NEGOTIABLE)
- Deterministic Tool Contracts
- Stateless Server Architecture
- Conversation Persistence via Database
- Strict User Isolation across AI Workflows
- Separation of AI Reasoning from Business Logic
- Reproducibility of Agent Behavior
- No Hidden Side Effects

**Added comprehensive AI standards:**
- AI Security Standards (Extended) - 14 specific security requirements
- AI Architecture Constraints - 6 constraints for AI layer
- Conversation Standards - 5 database persistence requirements
- Tool Design Standards - Schema requirements for all MCP tools
- AI Operational Constraints - 5 workflow requirements
- AI Quality Standards - 5 modularity and observability requirements

**Added Phase III Success Criteria:**
- 8 measurable success criteria for the AI chatbot feature

**Added Prohibited Behaviors (AI):**
- 6 explicitly forbidden patterns to prevent security and architecture violations

Version bumped from 1.0.0 to 2.0.0 (MAJOR bump due to addition of 8 new principles and significant architectural expansion).

## Outcome

Successfully updated the constitution to govern Phase III AI-powered chatbot development. The document now provides comprehensive guidance for building a secure, stateless, MCP-based AI interface that maintains user isolation and deterministic behavior. Templates flagged for follow-up updates to include AI-specific constitution checks.
