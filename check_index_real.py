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
        # Find a real book, e.g., "Decision in Normandy" or any book that has an embedding
        print("Looking for a real book with an embedding...")
        book = await db.items.find_one({
            "domain": "bookcrossing", 
            "title": {"$regex": "Normandy", "$options": "i"},
            "embedding": {"$exists": True}
        })
        
        if not book:
            # Fallback to any book with an embedding if that specific one isn't found
            book = await db.items.find_one({
                "domain": "bookcrossing",
                "embedding": {"$exists": True}
            })
            
        if not book:
            print("No book found with an embedding.")
            return

        print(f"\nFound Source Book: '{book.get('title')}' (ID: {book.get('item_id')})")
        vector = book["embedding"]
        
        print("\nExecuting $vectorSearch...")
        search_pipeline = [
            {
                "$vectorSearch": {
                    "index": "items_embedding_vector_index",
                    "path": "embedding",
                    "queryVector": vector,
                    "numCandidates": 20,
                    "limit": 5
                }
            },
            {
                "$project": {
                    "title": 1,
                    "domain": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        results = await db.items.aggregate(search_pipeline).to_list(None)
        
        print("\n--- Semantic Search Results ---")
        for res in results:
            title = res.get('title', 'NO_TITLE')
            score = res.get('score', 0.0)
            domain = res.get('domain', 'UNKNOWN')
            print(f"[{domain}] {title} (Score: {score:.4f})")
            
    except Exception as e:
        print(f"Error executing vector search: {e}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
