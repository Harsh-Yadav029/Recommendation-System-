import asyncio
import os
import json
import numpy as np
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
    
    print("Loading BookCrossing ratings...")
    cursor = interactions.find({"domain": "bookcrossing", "event_type": "rating"})
    
    item_ratings = defaultdict(list)
    async for doc in cursor:
        item_id = str(doc["item_id"])
        value = doc.get("value")
        if value is not None and value > 0:
            item_ratings[item_id].append(value)
            
    # Bayesian Average
    # Score = (v / (v + m)) * R + (m / (v + m)) * C
    # m = 3
    m = 3
    
    all_ratings = [r for ratings in item_ratings.values() for r in ratings]
    C = np.mean(all_ratings) if all_ratings else 0.0
    
    print(f"Global mean rating (C): {C:.2f}")
    
    item_scores = {}
    for item_id, ratings in item_ratings.items():
        v = len(ratings)
        R = np.mean(ratings)
        score = (v / (v + m)) * R + (m / (v + m)) * C
        item_scores[item_id] = score
        
    print(f"Computed baseline for {len(item_scores)} items.")
    
    # Sort by score descending
    ranked_items = sorted([{"item_id": k, "score": v} for k, v in item_scores.items()], 
                          key=lambda x: x["score"], reverse=True)
                          
    os.makedirs("models", exist_ok=True)
    out_path = os.path.join("models", "bookcrossing_baseline.json")
    with open(out_path, "w") as f:
        json.dump(ranked_items, f, indent=2)
        
    print(f"Saved BookCrossing baseline to {out_path}")

if __name__ == "__main__":
    asyncio.run(build_baseline())
