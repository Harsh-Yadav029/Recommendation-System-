import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from collections import defaultdict

async def check():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    cursor = db.interactions.find({"domain": "retailrocket"})
    
    user_items = defaultdict(set)
    async for doc in cursor:
        user_items[doc["user_id"]].add(doc["item_id"])
        
    count_1 = 0
    total = len(user_items)
    for u, items in user_items.items():
        if len(items) < 2:
            count_1 += 1
            
    print(f"Total users: {total}, Users with <2 unique items: {count_1}")

if __name__ == "__main__":
    asyncio.run(check())
