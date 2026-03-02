"""
MCP Tools Package

All MCP tools are imported here to be registered with the MCP server.
Tools are organized by operation type.
"""

# Import tools to register them with MCP server
from . import add_task
from . import list_tasks
from . import update_task
from . import complete_task
from . import delete_task

__all__ = ["add_task", "list_tasks", "update_task", "complete_task", "delete_task"]
