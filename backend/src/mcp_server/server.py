"""
MCP Server Initialization

Initializes the Model Context Protocol server for task management tools.
"""

import logging

# Configure logging for MCP server
logger = logging.getLogger(__name__)

# MCP Server configuration
MCP_SERVER_NAME = "todo-mcp-server"
MCP_SERVER_VERSION = "1.0.0"


class MCPServer:
    """
    MCP Server for Task Management
    
    Provides stateless tools for AI agents to manage tasks.
    All tools enforce user ownership and return structured JSON responses.
    """
    
    def __init__(self):
        self.name = MCP_SERVER_NAME
        self.version = MCP_SERVER_VERSION
        self.tools = {}
        logger.info(f"Initialized MCP Server: {self.name} v{self.version}")
    
    def register_tool(self, name: str, func):
        """Register a tool with the MCP server."""
        self.tools[name] = func
        logger.info(f"Registered MCP tool: {name}")
    
    def get_tool(self, name: str):
        """Get a registered tool by name."""
        return self.tools.get(name)
    
    def list_tools(self):
        """List all registered tools."""
        return list(self.tools.keys())


# Create global MCP server instance
mcp_server = MCPServer()
