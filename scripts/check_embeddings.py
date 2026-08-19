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
        
    for domain in ["steam", "bookcrossing"]:
        doc = await db.items.find_one({"domain": domain, "embedding": {"$exists": True}})
        if doc:
            emb = doc.get("embedding", [])
            print(f"--- {domain.upper()} ---")
            print(f"Item ID: {doc.get('item_id')}")
            print(f"Title: {doc.get('title')}")
            print(f"Embedding length: {len(emb)}")
            print(f"Embedding snippet: {emb[:5]} ...\n")
        else:
            print(f"--- {domain.upper()} ---")
            print("No items with embeddings found!\n")

if __name__ == "__main__":
    asyncio.run(main())
