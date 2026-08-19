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
