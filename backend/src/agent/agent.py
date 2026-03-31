"""
AI Agent Module

Handles communication with OpenAI Agents SDK and processes tool calls.
Maps agent decisions to MCP tool invocations.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from openai import OpenAI
import anyio
from dotenv import load_dotenv

load_dotenv(override=True)

from .prompts import SYSTEM_PROMPT
from ..mcp_server.tools.add_task import add_task as mcp_create_task
from ..mcp_server.tools.update_task import update_task as mcp_update_task
from ..mcp_server.tools.delete_task import delete_task as mcp_delete_task
from ..mcp_server.tools.list_tasks import list_tasks as mcp_list_tasks
from ..mcp_server.tools.complete_task import complete_task as mcp_complete_task

logger = logging.getLogger(__name__)

# Initialize OpenAI client with custom base URL for AI Studio
api_key = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
client = OpenAI(
    api_key=api_key, 
    base_url=base_url,
    default_headers={
        "HTTP-Referer": "http://localhost:3000", # Optional, for OpenRouter rankings
        "X-Title": "Todo AI App",                # Optional, for OpenRouter rankings
    }
)

# Define MCP tools for OpenAI function calling
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new todo task",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Task title (required)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Task description (optional)"
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Due date in YYYY-MM-DD format (optional)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Task priority level (optional)"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update an existing todo task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "Task ID to update (required)"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title (optional)"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description (optional)"
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "New due date in YYYY-MM-DD format (optional)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "New priority level (optional)"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a todo task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "Task ID to delete (required)"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List tasks with optional filters",
            "parameters": {
                "type": "object",
                "properties": {
                    "filter": {
                        "type": "object",
                        "properties": {
                            "due_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Filter by due date"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "Filter by priority"
                            },
                            "status": {
                                "type": "string",
                                "enum": ["pending", "completed"],
                                "description": "Filter by completion status"
                            }
                        }
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_task",
            "description": "Get details of a specific task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "Task ID to retrieve (required)"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed or incomplete",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "Task ID to complete (required)"
                    }
                },
                "required": ["task_id"]
            }
        }
    }
]


async def process_agent_message(
    message_history: List[Dict[str, Any]],
    user_id: int,
    db: Session
) -> Dict[str, Any]:
    """
    Process message with OpenAI agent, execute tool calls, and provide final response.
    """
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + message_history
        max_turns = 5
        curr_turn = 0
        all_tool_calls_result = []

        while curr_turn < max_turns:
            curr_turn += 1
            
            def call_openai():
                return client.chat.completions.create(
                    model=os.getenv("OPENAI_MODEL", "google/gemini-2.0-flash-exp:free"),
                    messages=messages,
                    tools=OPENAI_TOOLS,
                    tool_choice="auto",
                    temperature=0.7
                )

            response = await anyio.to_thread.run_sync(call_openai)
            assistant_message = response.choices[0].message
            messages.append(assistant_message) # Add assistant thought/tool-call to history

            if not assistant_message.tool_calls:
                # We have a final text response
                return {
                    "response": assistant_message.content or "I've processed your request.",
                    "tool_calls": all_tool_calls_result
                }

            # Handle tool calls
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                try:
                    result = await execute_mcp_tool(
                        tool_name=function_name,
                        arguments=function_args,
                        user_id=user_id,
                        db=db
                    )
                    
                    is_success = result.get("success", False)
                    all_tool_calls_result.append({
                        "tool_id": tool_call.id,
                        "tool_name": function_name,
                        "arguments": function_args,
                        "result": result,
                        "success": is_success
                    })

                    # Add tool result to conversation history for next model turn
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(result)
                    })

                except Exception as e:
                    logger.error(f"Error executing tool {function_name}: {e}")
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps({"success": False, "error": str(e)})
                    })

        # If we hit max turns
        return {
            "response": "I've performed several actions but reached my processing limit.",
            "tool_calls": all_tool_calls_result
        }
        
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg:
            logger.error(f"External AI service authentication failed: {error_msg}")
            raise Exception(f"External AI Service authentication error (OpenRouter 401). Please check your OPENAI_API_KEY in the backend .env file. Details: {error_msg}")
        logger.error(f"Error in agent message processing: {error_msg}", exc_info=True)
        raise Exception(f"AI agent error: {error_msg}")


async def execute_mcp_tool(
    tool_name: str,
    arguments: Dict[str, Any],
    user_id: int,
    db: Session
) -> Dict[str, Any]:
    """
    Execute an MCP tool with the given arguments.
    
    Args:
        tool_name: Name of the tool to execute
        arguments: Tool arguments as dictionary
        user_id: Authenticated user UUID
        db: Database session
        
    Returns:
        dict: Tool execution result
        
    Raises:
        ValueError: If tool name is unknown
        Exception: If tool execution fails
    """
    # Map tool names to MCP functions
    tool_mapping = {
        "create_task": mcp_create_task,
        "update_task": mcp_update_task,
        "delete_task": mcp_delete_task,
        "list_tasks": mcp_list_tasks,
        "complete_task": mcp_complete_task,
        "get_task": mcp_list_tasks, # get_task logic is usually a specific list or details
    }
    
    if tool_name not in tool_mapping:
        raise ValueError(f"Unknown tool: {tool_name}")
    
    tool_func = tool_mapping[tool_name]
    
    # Execute tool with user_id and db
    # Note: MCP tools expect user_id and db parameters
    result = tool_func(
        **arguments,
        user_id=user_id,
        db=db
    )
    
    return result
