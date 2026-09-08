import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import json
from pinecone import Pinecone

async def generate_embeddings():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml-service", ".env")
    load_dotenv(env_path)
    uri = os.environ.get("MONGODB_URI")
    pc_key = os.environ.get("PINECONE_API_KEY")
    
    if not pc_key:
        print("Missing PINECONE_API_KEY")
        return
        
    pc = Pinecone(api_key=pc_key)
    index = pc.Index("comparex-index")
    
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    items_coll = db["items"]
    
    print("Loading SentenceTransformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    for domain in ["steam", "bookcrossing", "anime"]:
        print(f"Generating embeddings for {domain}...")
        cursor = items_coll.find({"domain": domain})
        docs = await cursor.to_list(length=None)
        
        batch_size = 200
        batch_vectors = []
        texts = []
        total_processed = 0
        
        for doc in docs:
            item_id = str(doc.get("item_id", doc.get("anime_ids", doc.get("_id"))))
            
            if domain == "steam":
                text = doc.get("title", "")
                title = text
            elif domain == "bookcrossing":
                meta = doc.get("metadata", "{}")
                if isinstance(meta, str):
                    try: meta = json.loads(meta.replace("'", '"'))
                    except: meta = {}
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
            elif domain == "anime":
                title = doc.get("name", doc.get("title", ""))
                genre = doc.get("genre", "")
                text = f"{title}. Genre: {genre}"
            else:
                continue
                
            if not text or not str(text).strip():
                continue
                
            texts.append(str(text))
            # Pinecone metadata must be a dictionary with simple types
            batch_vectors.append({
                "id": f"{domain}_{item_id}",
                "metadata": {
                    "domain": domain,
                    "title": str(title) if title else "Unknown"
                }
            })
            
            if len(texts) >= batch_size:
                embeddings = model.encode(texts)
                
                # Attach values to vectors
                for i in range(len(batch_vectors)):
                    batch_vectors[i]["values"] = embeddings[i].tolist()
                    
                # Upsert to Pinecone
                index.upsert(vectors=batch_vectors)
                
                total_processed += len(batch_vectors)
                print(f"Upserted {total_processed} items for {domain} to Pinecone")
                batch_vectors = []
                texts = []
                
        # Process remaining
        if texts:
            embeddings = model.encode(texts)
            for i in range(len(batch_vectors)):
                batch_vectors[i]["values"] = embeddings[i].tolist()
            index.upsert(vectors=batch_vectors)
            total_processed += len(batch_vectors)
            print(f"Upserted {total_processed} items for {domain} to Pinecone")
            
    print("Pinecone embeddings generation complete.")

if __name__ == "__main__":
    asyncio.run(generate_embeddings())
