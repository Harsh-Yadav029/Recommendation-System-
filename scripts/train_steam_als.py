import os
import asyncio
import numpy as np
import scipy.sparse as sparse
import implicit
import pickle
import math
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from collections import defaultdict

async def train_als():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    
    print("Loading interactions...")
    cursor = interactions.find({"domain": "steam"})
    
    user_to_idx = {}
    item_to_idx = {}
    idx_to_user = []
    idx_to_item = []
    
    data = []
    row = []
    col = []
    
    # Pre-aggregate scores for user-item pairs
    user_item_scores = defaultdict(float)
    
    interaction_count = 0
    async for doc in cursor:
        interaction_count += 1
        user_id = str(doc["user_id"])
        item_id = str(doc["item_id"])
        event_type = doc["event_type"]
        value = doc.get("value", 1.0)
        
        if event_type == "purchase":
            score = 3.0
        elif event_type == "play":
            score = math.log1p(value) if value > 0 else 0.0
        else:
            continue
            
        user_item_scores[(user_id, item_id)] += score
        
    for (user_id, item_id), score in user_item_scores.items():
        if user_id not in user_to_idx:
            user_to_idx[user_id] = len(idx_to_user)
            idx_to_user.append(user_id)
        if item_id not in item_to_idx:
            item_to_idx[item_id] = len(idx_to_item)
            idx_to_item.append(item_id)
            
        row.append(user_to_idx[user_id])
        col.append(item_to_idx[item_id])
        data.append(score)
        
    print(f"Loaded {interaction_count} raw interactions, aggregated into {len(data)} user-item pairs.")
    print(f"Users: {len(user_to_idx)}, Items: {len(item_to_idx)}")
    
    user_items = sparse.csr_matrix((data, (row, col)), shape=(len(user_to_idx), len(item_to_idx)))
    
    print("Training ALS model...")
    model = implicit.als.AlternatingLeastSquares(factors=50, regularization=0.01, iterations=15, random_state=42)
    model.fit(user_items)
    
    artifact = {
        "model": model,
        "user_to_idx": user_to_idx,
        "item_to_idx": item_to_idx,
        "idx_to_user": idx_to_user,
        "idx_to_item": idx_to_item
    }
    
    os.makedirs("models", exist_ok=True)
    out_path = os.path.join("models", "steam_als.pkl")
    with open(out_path, "wb") as f:
        pickle.dump(artifact, f)
        
    print(f"Saved ALS model to {out_path}")
    
    # Update manifest
    manifest_path = os.path.join("ml-service", "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        import json
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            
    manifest["steam"] = {
        "model_type": "implicit_als",
        "model_path": "models/steam_als.pkl",
        "baseline_path": "models/steam_baseline.json"
    }
    
    with open(manifest_path, "w") as f:
        import json
        json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    asyncio.run(train_als())
