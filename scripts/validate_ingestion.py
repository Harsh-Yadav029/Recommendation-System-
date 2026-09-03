import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def validate_domain(domain: str):
    from dotenv import load_dotenv
    load_dotenv("ml-service/.env")
    
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/comparex")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    items = db["items"]
    
    icount = await interactions.count_documents({"domain": domain})
    itcount = await items.count_documents({"domain": domain})
    
    print(f"=== VALIDATION FOR {domain.upper()} ===")
    print(f"Total Interactions loaded in Mongo: {icount}")
    print(f"Total Items loaded in Mongo: {itcount}")
    
    print("\n--- Sample Interactions ---")
    async for doc in interactions.find({"domain": domain}).limit(3):
        print(doc)
        
    print("\n--- Sample Items ---")
    async for doc in items.find({"domain": domain}).limit(3):
        print(doc)
        
    client.close()

if __name__ == "__main__":
    import sys
    domain = sys.argv[1] if len(sys.argv) > 1 else "bookcrossing"
    asyncio.run(validate_domain(domain))
