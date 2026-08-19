import asyncio
import os
import json
from collections import defaultdict
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def build_baseline():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    
    # Weight mapping
    weights = {
        "purchase": 5,
        "add_to_cart": 3,
        "view": 1
    }
    
    item_scores = defaultdict(float)
    
    print("Aggregating interactions from MongoDB...")
    cursor = interactions.find({"domain": "retailrocket"})
    
    async for doc in cursor:
        event_type = doc.get("event_type")
        item_id = doc.get("item_id")
        count = doc.get("count", 1)
        
        weight = weights.get(event_type, 0)
        item_scores[item_id] += (weight * count)
        
    # Sort items by score descending
    ranked_items = sorted(item_scores.items(), key=lambda x: x[1], reverse=True)
    
    baseline_data = [{"item_id": item_id, "score": score} for item_id, score in ranked_items]
    
    os.makedirs("models", exist_ok=True)
    output_path = "models/retailrocket_baseline.json"
    with open(output_path, "w") as f:
        json.dump(baseline_data, f, indent=2)
        
    print(f"Saved popularity baseline with {len(baseline_data)} items to {output_path}")
    print("\n--- TOP 10 ITEMS ---")
    for i, item in enumerate(baseline_data[:10]):
        print(f"{i+1}. Item {item['item_id']} (Score: {item['score']})")

if __name__ == "__main__":
    asyncio.run(build_baseline())
