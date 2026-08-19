import asyncio
import os
import numpy as np
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
        
    cursor = db.interactions.find({"domain": "bookcrossing", "event_type": "rating"})
    
    item_counts = defaultdict(int)
    async for doc in cursor:
        item_counts[doc["item_id"]] += 1
        
    counts = list(item_counts.values())
    
    print(f"Total rated books: {len(counts)}")
    print(f"Total ratings: {sum(counts)}")
    print(f"Mean ratings per book: {np.mean(counts):.2f}")
    print(f"Median ratings per book: {np.median(counts):.2f}")
    print(f"Max ratings on a single book: {np.max(counts)}")
    
    for i in range(1, 11):
        num_books = sum(1 for c in counts if c >= i)
        print(f"Books with >={i} ratings: {num_books} ({num_books/len(counts)*100:.2f}%)")

if __name__ == "__main__":
    asyncio.run(check())
