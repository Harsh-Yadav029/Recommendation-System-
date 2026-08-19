import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import json

async def generate_embeddings():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    items_coll = db["items"]
    
    print("Loading SentenceTransformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    for domain in ["steam", "bookcrossing"]:
        print(f"Generating embeddings for {domain}...")
        # Only process items that don't have embeddings yet
        cursor = items_coll.find({"domain": domain, "embedding": {"$exists": False}})
        batch_size = 500
        batch_docs = []
        texts = []
        total_processed = 0
        
        async for doc in cursor:
            if domain == "steam":
                text = doc.get("title", "")
            elif domain == "bookcrossing":
                meta = doc.get("metadata", "{}")
                if isinstance(meta, str):
                    try:
                        meta = json.loads(meta)
                    except:
                        meta = {}
                title = doc.get("title", "")
                author = meta.get("author", "")
                publisher = meta.get("publisher", "")
                year = meta.get("year", "")
                parts = []
                if title: parts.append(title)
                if author: parts.append(f"By {author}")
                if publisher: parts.append(f"Published by {publisher}")
                if year: parts.append(f"in {year}")
                text = ". ".join(parts)
            else:
                continue
                
            if not text or not str(text).strip():
                continue
                
            batch_docs.append(doc)
            texts.append(str(text))
            
            if len(batch_docs) >= batch_size:
                embeddings = model.encode(texts)
                
                from pymongo import UpdateOne
                requests = []
                for idx, b_doc in enumerate(batch_docs):
                    requests.append(UpdateOne(
                        {"_id": b_doc["_id"]},
                        {"$set": {"embedding": embeddings[idx].tolist()}}
                    ))
                if requests:
                    await items_coll.bulk_write(requests)
                total_processed += len(batch_docs)
                print(f"Processed {total_processed} items for {domain}")
                batch_docs = []
                texts = []
                
        # Process remaining
        if batch_docs:
            embeddings = model.encode(texts)
            from pymongo import UpdateOne
            requests = []
            for idx, b_doc in enumerate(batch_docs):
                requests.append(UpdateOne(
                    {"_id": b_doc["_id"]},
                    {"$set": {"embedding": embeddings[idx].tolist()}}
                ))
            if requests:
                await items_coll.bulk_write(requests)
            total_processed += len(batch_docs)
            print(f"Processed {total_processed} items for {domain}")
            
    print("Embeddings generation complete.")

if __name__ == "__main__":
    asyncio.run(generate_embeddings())
