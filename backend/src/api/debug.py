from fastapi import APIRouter
from ..db.database import engine, Base
from .. import models   # ✅ correct relative import

router = APIRouter(prefix="/debug", tags=["Debug"])

@router.get("/create-tables")
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        return {"message": "Tables created successfully"}
    except Exception as e:
        return {"error": str(e)}