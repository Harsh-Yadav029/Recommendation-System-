import os
import asyncio
import pandas as pd
from pymongo import UpdateOne
from motor.motor_asyncio import AsyncIOMotorClient

async def load_domain(domain: str):
    from dotenv import load_dotenv
    load_dotenv("ml-service/.env")
    
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/comparex")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions_coll = db["interactions"]
    items_coll = db["items"]
    
    processed_dir = f"data/processed/{domain}"
    
    # Load Items
    print(f"Loading {domain} items...")
    items_df = pd.read_parquet(os.path.join(processed_dir, "items.parquet"))
    item_requests = []
    import json
    for _, row in items_df.iterrows():
        doc = row.to_dict()
        if pd.isna(doc.get('metadata')) or doc.get('metadata') is None:
            doc['metadata'] = {}
        elif isinstance(doc['metadata'], str):
            doc['metadata'] = json.loads(doc['metadata'])
        
        # Replace pd.NA/NaN with None
        for k, v in doc.items():
            if pd.isna(v):
                doc[k] = None
                
        key = {"item_id": doc["item_id"], "domain": doc["domain"]}
        
        item_requests.append(UpdateOne(key, {"$set": doc}, upsert=True))
        
        if len(item_requests) >= 5000:
            await items_coll.bulk_write(item_requests)
            item_requests = []
            
    if item_requests:
        await items_coll.bulk_write(item_requests)
    print(f"Items loaded.")

    # Load Interactions
    print(f"Loading {domain} interactions...")
    inter_df = pd.read_parquet(os.path.join(processed_dir, "interactions.parquet"))
    inter_requests = []
    for _, row in inter_df.iterrows():
        doc = row.to_dict()
        for k, v in doc.items():
            if pd.isna(v):
                doc[k] = None
                
        key = {
            "user_id": doc["user_id"],
            "item_id": doc["item_id"],
            "domain": doc["domain"],
            "event_type": doc["event_type"]
        }
        
        update = {
            "$set": doc,
            "$inc": {"count": 1}
        }
        
        inter_requests.append(UpdateOne(key, update, upsert=True))
        
        if len(inter_requests) >= 5000:
            await interactions_coll.bulk_write(inter_requests)
            inter_requests = []
            
    if inter_requests:
        await interactions_coll.bulk_write(inter_requests)
    print("Interactions loaded.")
    
    client.close()

if __name__ == "__main__":
    import sys
    domain = sys.argv[1] if len(sys.argv) > 1 else "bookcrossing"
    asyncio.run(load_domain(domain))
