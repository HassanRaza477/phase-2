from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, tasks
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Task Manager API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - Allow frontend
origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "Task Manager API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup():
    logger.info("Starting up Task Manager API...")
    logger.info(f"Database URL configured: {'Yes' if os.getenv('DATABASE_URL') else 'No'}")