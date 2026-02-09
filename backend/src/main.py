from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, tasks
from .db.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Multi-User Todo API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Multi-User Todo API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}