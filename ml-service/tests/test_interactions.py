import os
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import db, connect_to_mongo, close_mongo_connection
import pytest_asyncio
from dotenv import load_dotenv

# Ensure environment variables are loaded regardless of current working directory
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv(".env")

def get_interactions_collection():
    if db.client is None:
        return None
    try:
        database = db.client.get_default_database()
        if database.name == "test":
            database = db.client["comparex"]
    except Exception:
        database = db.client["comparex"]
    return database["interactions"]

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await connect_to_mongo()
    yield
    await close_mongo_connection()

@pytest.mark.asyncio
async def test_log_valid_interaction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        interactions = get_interactions_collection()
        await interactions.delete_many({"user_id": "TEST_LOG_USER"})
        
        payload = {
            "user_id": "TEST_LOG_USER",
            "session_id": "sess_123",
            "item_id": "item1",
            "domain": "bookcrossing",
            "event_type": "view"
        }
        response = await ac.post("/api/interactions/log", json=payload)
        assert response.status_code == 200
        
        # Check DB
        doc = await interactions.find_one({"user_id": "TEST_LOG_USER"})
        assert doc is not None
        assert doc["count"] == 1
        
        # Log again to test $inc
        response2 = await ac.post("/api/interactions/log", json=payload)
        assert response2.status_code == 200
        
        doc2 = await interactions.find_one({"user_id": "TEST_LOG_USER"})
        assert doc2["count"] == 2
        
        await interactions.delete_many({"user_id": "TEST_LOG_USER"})

@pytest.mark.asyncio
async def test_log_malformed_interaction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "user_id": "TEST_LOG_USER",
            "item_id": "item1",
            "domain": "bookcrossing",
            "event_type": "INVALID_EVENT"
        }
        response = await ac.post("/api/interactions/log", json=payload)
        assert response.status_code == 422  # Pydantic validation error
