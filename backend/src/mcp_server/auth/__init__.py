"""
MCP Authentication Package

Provides JWT verification utilities for MCP tool authentication.
Reuses existing AuthService from the backend.
"""

from .jwt_verifier import get_current_user_id

__all__ = ["get_current_user_id"]
