import os
import asyncio
import numpy as np
import pickle
import pandas as pd
from surprise import Dataset, Reader, SVD
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def train_svd():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    
    print("Loading BookCrossing ratings...")
    cursor = interactions.find({"domain": "bookcrossing", "event_type": "rating"})
    
    data = []
    
    interaction_count = 0
    async for doc in cursor:
        interaction_count += 1
        user_id = str(doc["user_id"])
        item_id = str(doc["item_id"])
        value = doc.get("value")
        
        if value is not None and value > 0:
            data.append([user_id, item_id, value])
            
    print(f"Loaded {len(data)} ratings.")
    
    df = pd.DataFrame(data, columns=["user", "item", "rating"])
    
    # Reader with rating scale 1 to 10
    reader = Reader(rating_scale=(1, 10))
    dataset = Dataset.load_from_df(df[["user", "item", "rating"]], reader)
    
    trainset = dataset.build_full_trainset()
    
    print("Training SVD model...")
    algo = SVD(random_state=42)
    algo.fit(trainset)
    
    # To mimic the similar_items cold start, surprise SVD doesn't have a fast item-item similarity.
    # However, we can extract the item factors (algo.qi) and compute cosine similarity.
    # We will save the trainset and algo to use them in the service.
    
    artifact = {
        "model": algo,
        "trainset": trainset
    }
    
    os.makedirs("models", exist_ok=True)
    out_path = os.path.join("models", "bookcrossing_svd.pkl")
    with open(out_path, "wb") as f:
        pickle.dump(artifact, f)
        
    print(f"Saved SVD model to {out_path}")
    
    # Update manifest
    manifest_path = os.path.join("ml-service", "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        import json
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            
    manifest["bookcrossing"] = {
        "model_type": "surprise_svd",
        "model_path": "models/bookcrossing_svd.pkl",
        "baseline_path": "models/bookcrossing_baseline.json"
    }
    
    with open(manifest_path, "w") as f:
        import json
        json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    asyncio.run(train_svd())
