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
        
    await db.interactions.delete_many({"domain": "bookcrossing"})
    await db.items.delete_many({"domain": "bookcrossing"})
    print("Deleted all bookcrossing data.")

if __name__ == "__main__":
    asyncio.run(main())
