"""
MCP Tool Server Module

Provides stateless MCP tools for task management operations.
All tools enforce user ownership and return structured JSON responses.
"""

from .server import mcp_server

__all__ = ["mcp_server"]
