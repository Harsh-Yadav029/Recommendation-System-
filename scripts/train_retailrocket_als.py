import os
import asyncio
import numpy as np
import scipy.sparse as sparse
import implicit
import pickle
import json
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def train_als():
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
    
    print("Loading interactions...")
    cursor = interactions.find({"domain": "retailrocket"})
    
    user_to_idx = {}
    item_to_idx = {}
    idx_to_user = []
    idx_to_item = []
    
    row = []
    col = []
    data = []
    
    async for doc in cursor:
        user_id = str(doc["user_id"])
        item_id = str(doc["item_id"])
        event_type = doc["event_type"]
        count = doc.get("count", 1)
        
        weight = weights.get(event_type, 0)
        score = weight * count
        if score == 0:
            continue
            
        if user_id not in user_to_idx:
            user_to_idx[user_id] = len(idx_to_user)
            idx_to_user.append(user_id)
            
        if item_id not in item_to_idx:
            item_to_idx[item_id] = len(idx_to_item)
            idx_to_item.append(item_id)
            
        row.append(user_to_idx[user_id])
        col.append(item_to_idx[item_id])
        data.append(score)
        
    print(f"Loaded {len(data)} interactions for {len(user_to_idx)} users and {len(item_to_idx)} items.")
    
    user_items = sparse.csr_matrix((data, (row, col)), shape=(len(user_to_idx), len(item_to_idx)))
    
    print("Training ALS model...")
    model = implicit.als.AlternatingLeastSquares(factors=50, regularization=0.01, iterations=15, random_state=42)
    model.fit(user_items)
    
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--retrain", action="store_true", help="Auto-increment version")
    args = parser.parse_args()
    
    os.makedirs("models", exist_ok=True)
    manifest_path = "manifest.json"
    manifest = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, "r") as f:
            try:
                manifest = json.load(f)
            except:
                pass
                
    # Determine version and filename
    version = 1
    if "retailrocket" in manifest and "version" in manifest["retailrocket"]:
        current_version_str = manifest["retailrocket"]["version"]
        try:
            version = int(current_version_str.split(".")[0])
            if args.retrain:
                version += 1
        except:
            pass
            
    # Save the old entry for rollback safety if retraining
    if args.retrain and "retailrocket" in manifest:
        old_v = manifest["retailrocket"]["version"]
        manifest[f"retailrocket_{old_v}"] = manifest["retailrocket"]
        
    model_filename = f"retailrocket_als_v{version}.pkl" if version > 1 else "retailrocket_als.pkl"
    model_path = f"models/{model_filename}"
    
    artifact = {
        "model": model,
        "user_to_idx": user_to_idx,
        "item_to_idx": item_to_idx,
        "idx_to_user": idx_to_user,
        "idx_to_item": idx_to_item
    }
    
    with open(model_path, "wb") as f:
        pickle.dump(artifact, f)
        
    print(f"Saved ALS model to {model_path}")
            
    manifest["retailrocket"] = {
        "model_file": model_path,
        "version": f"{version}.0.0",
        "type": "ALS",
        "description": f"Implicit ALS model for retailrocket (version {version})"
    }
    
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    asyncio.run(train_als())
