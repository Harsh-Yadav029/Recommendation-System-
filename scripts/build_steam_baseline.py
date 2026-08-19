import asyncio
import os
import json
import math
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from collections import defaultdict

async def build_baseline():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    
    print("Loading Steam interactions...")
    cursor = interactions.find({"domain": "steam"})
    
    item_scores = defaultdict(float)
    async for doc in cursor:
        item_id = str(doc["item_id"])
        event_type = doc["event_type"]
        value = doc.get("value", 1.0)
        
        if event_type == "purchase":
            score = 3.0
        elif event_type == "play":
            score = math.log1p(value) if value > 0 else 0.0
        else:
            score = 0.0
            
        item_scores[item_id] += score
        
    print(f"Computed baseline for {len(item_scores)} items.")
    
    # Sort by score descending
    ranked_items = sorted([{"item_id": k, "score": v} for k, v in item_scores.items()], 
                          key=lambda x: x["score"], reverse=True)
                          
    os.makedirs("models", exist_ok=True)
    out_path = os.path.join("models", "steam_baseline.json")
    with open(out_path, "w") as f:
        json.dump(ranked_items, f, indent=2)
        
    print(f"Saved Steam baseline to {out_path}")

if __name__ == "__main__":
    asyncio.run(build_baseline())
