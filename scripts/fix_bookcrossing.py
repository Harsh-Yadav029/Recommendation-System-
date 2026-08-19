import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def main():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    # Delete corrupted items (item_ids that are ISBNs have length 10, valid Book_IDs have length <= 6)
    result = await db.items.delete_many({"domain": "bookcrossing", "item_id": {"$regex": "^.{7,}$"}})
    print(f"Deleted {result.deleted_count} corrupted items.")

if __name__ == "__main__":
    asyncio.run(main())
