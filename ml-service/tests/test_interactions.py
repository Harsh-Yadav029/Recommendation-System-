import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import db

from app.db.database import connect_to_mongo, close_mongo_connection

import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    from dotenv import load_dotenv
    load_dotenv(".env")
    await connect_to_mongo()
    yield
    await close_mongo_connection()

@pytest.mark.asyncio
async def test_log_valid_interaction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await db.client.get_default_database()["interactions"].delete_many({"user_id": "TEST_LOG_USER"})

        
        payload = {
            "user_id": "TEST_LOG_USER",
            "session_id": "sess_123",
            "item_id": "item1",
            "domain": "retailrocket",
            "event_type": "view"
        }
        response = await ac.post("/api/interactions/log", json=payload)
        assert response.status_code == 200
        
        # Check DB
        doc = await db.client.get_default_database()["interactions"].find_one({"user_id": "TEST_LOG_USER"})
        assert doc is not None
        assert doc["count"] == 1
        
        # Log again to test $inc
        response2 = await ac.post("/api/interactions/log", json=payload)
        assert response2.status_code == 200
        
        doc2 = await db.client.get_default_database()["interactions"].find_one({"user_id": "TEST_LOG_USER"})
        assert doc2["count"] == 2
        
        await db.client.get_default_database()["interactions"].delete_many({"user_id": "TEST_LOG_USER"})

@pytest.mark.asyncio
async def test_log_malformed_interaction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "user_id": "TEST_LOG_USER",
            "item_id": "item1",
            "domain": "retailrocket",
            "event_type": "INVALID_EVENT"
        }
        response = await ac.post("/api/interactions/log", json=payload)
        assert response.status_code == 422 # Pydantic validation error
