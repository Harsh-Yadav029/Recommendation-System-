import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('ml-service/.env')

async def check():
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    
    try:
        indexes = await db.command("listSearchIndexes", "items")
        print("Search Indexes found:")
        for idx in indexes.get('cursor', {}).get('firstBatch', []):
            print(f"- Name: {idx.get('name')}, Type: {idx.get('type')}, Definition: {idx.get('latestDefinition')}")
    except Exception as e:
        print(f"Error checking search indexes: {e}")
        
    client.close()

asyncio.run(check())
