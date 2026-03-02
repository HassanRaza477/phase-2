"""
FastAPI Main Application

Configures CORS, includes all routers, and provides health and MCP endpoints.
"""
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .api import auth, tasks, chat
from .api.tasks import get_current_user
from .mcp_server.server import mcp_server
from .models import User
from sqlalchemy.orm import Session
from .db.database import get_db
import os
import logging
import traceback
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(override=True)

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Task Manager API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Filter out empty strings from origins list
_raw_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", ""),
]
origins = [o for o in _raw_origins if o]  # Remove empty strings

logger.info(f"CORS allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ─── Global Exception Handlers ────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with detailed messages."""
    errors = exc.errors()
    logger.warning(f"Validation error on {request.url}: {errors}")
    first_error = errors[0] if errors else {}
    field = " → ".join(str(f) for f in first_error.get("loc", []))
    msg = first_error.get("msg", "Validation failed")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": f"Validation error on '{field}': {msg}",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler that returns structured JSON instead of HTML 500 pages."""
    tb = traceback.format_exc()
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}\n{tb}")
    
    # Check if it's already an HTTPException with our detail structure
    if hasattr(exc, "status_code") and hasattr(exc, "detail") and isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
        
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": f"Internal server error: {str(exc)}",
            "type": type(exc).__name__
        }
    )


# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])

security = HTTPBearer()


class MCPToolInvocation(BaseModel):
    """Request model for MCP tool invocation."""
    arguments: dict


# ─── Base Routes ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"success": True, "message": "Task Manager API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    db_ok = False
    db_error = None
    try:
        from .db.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_error = str(e)
        logger.error(f"Health check DB error: {e}")

    return {
        "success": True,
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else f"error: {db_error}",
        "api_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "db_url_set": bool(os.getenv("DATABASE_URL")),
    }


@app.get("/mcp/tools")
def list_mcp_tools():
    """List all available MCP tools."""
    return {
        "success": True,
        "tools": mcp_server.list_tools(),
        "server": mcp_server.name,
        "version": mcp_server.version
    }


@app.post("/mcp/invoke/{tool_name}")
def invoke_mcp_tool(
    tool_name: str,
    request: MCPToolInvocation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invoke an MCP tool with authenticated user context."""
    tool = mcp_server.get_tool(tool_name)

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "code": "TOOL_NOT_FOUND",
                "message": f"Tool '{tool_name}' not found"
            }
        )

    try:
        result = tool(**request.arguments, user_id=current_user.id, db=db)
        return result
    except Exception as e:
        logger.error(f"Error executing MCP tool '{tool_name}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": f"Failed to execute tool '{tool_name}': {str(e)}"
            }
        )


@app.on_event("startup")
async def startup():
    logger.info("=" * 60)
    logger.info("Starting Task Manager API...")
    logger.info(f"  DATABASE_URL set: {'Yes' if os.getenv('DATABASE_URL') else 'NO - MISSING!'}")
    logger.info(f"  SECRET_KEY set:   {'Yes' if os.getenv('SECRET_KEY') else 'NO - MISSING!'}")
    logger.info(f"  OPENAI_API_KEY:   {'Yes' if os.getenv('OPENAI_API_KEY') else 'NO - AI will fail'}")
    logger.info(f"  CORS origins:     {origins}")
    logger.info("=" * 60)