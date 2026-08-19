import os
from motor.motor_asyncio import AsyncIOMotorClient


from typing import Optional


class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo():
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/comparex")
    db.client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)

    # Initialize indexes
    database = db.client.get_default_database()
    if database.name == "test" and "comparex" in uri:
        # motor fallback if uri doesn't specify db properly
        database = db.client["comparex"]

    interactions = database["interactions"]
    items = database["items"]

    # Interactions indexes
    try:
        await interactions.create_index([("user_id", 1), ("domain", 1)])
        await interactions.create_index([("item_id", 1), ("domain", 1)])

        # Items indexes: (domain, category)
        await items.create_index([("domain", 1), ("category", 1)])
        
        print("MongoDB connected and indexes verified.")
    except Exception as e:
        print(f"MongoDB index creation skipped (mock boot or offline): {e}")

    # Vector search placeholder


async def close_mongo_connection():
    if db.client:
        db.client.close()
