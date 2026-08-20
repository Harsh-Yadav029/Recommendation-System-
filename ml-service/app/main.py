from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.database import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(title="CompareX ML Service", lifespan=lifespan)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ml-service"}

from app.api.routes.interactions import router as interactions_router
from app.api.routes.recommender import router as recommender_router
from app.api.routes.assistant import router as assistant_router

# Register standard routers
app.include_router(interactions_router, prefix="/api/interactions", tags=["Interactions"])
app.include_router(recommender_router, prefix="/api", tags=["Recommender"])
app.include_router(assistant_router, prefix="/api/assistant", tags=["Assistant"])
