import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

async def generate_embeddings():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml-service", ".env")
    load_dotenv(env_path)
    uri = os.environ.get("MONGODB_URI")
    pc_key = os.environ.get("PINECONE_API_KEY")
    
    pc = Pinecone(api_key=pc_key)
    index = pc.Index("comparex-index")
    
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    items_coll = db["items"]
    
    # First, delete the improperly formatted anime vectors
    print("Deleting old Anime vectors from Pinecone...")
    index.delete(filter={"domain": "anime"})
    print("Deleted old vectors.")
    
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    domain = "anime"
    print(f"Generating new embeddings for {domain}...")
    cursor = items_coll.find({"domain": domain})
    docs = await cursor.to_list(length=None)
    
    batch_size = 200
    batch_vectors = []
    texts = []
    total_processed = 0
    
    for doc in docs:
        item_id = str(doc.get("item_id"))
        
        title = doc.get("title", "")
        genre = doc.get("metadata", {}).get("genre", "")
        text = f"{title}. Genre: {genre}"
            
        if not text or not str(text).strip():
            continue
            
        texts.append(str(text))
        batch_vectors.append({
            "id": f"{domain}_{item_id}",
            "metadata": {
                "domain": domain,
                "title": str(title) if title else "Unknown"
            }
        })
        
        if len(texts) >= batch_size:
            embeddings = model.encode(texts)
            for i in range(len(batch_vectors)):
                batch_vectors[i]["values"] = embeddings[i].tolist()
            index.upsert(vectors=batch_vectors)
            total_processed += len(batch_vectors)
            print(f"Upserted {total_processed} items for {domain}")
            batch_vectors = []
            texts = []
            
    if texts:
        embeddings = model.encode(texts)
        for i in range(len(batch_vectors)):
            batch_vectors[i]["values"] = embeddings[i].tolist()
        index.upsert(vectors=batch_vectors)
        total_processed += len(batch_vectors)
        print(f"Upserted {total_processed} items for {domain}")
        
if __name__ == "__main__":
    asyncio.run(generate_embeddings())
