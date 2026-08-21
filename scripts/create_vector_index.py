import os
import time
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

def main():
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "ml-service", ".env"))
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("ERROR: MONGODB_URI not found!")
        return
    client = MongoClient(uri)
    db = client["comparex"]
    collection = db["items"]
    index_name = "items_embedding_vector_index"
    
    # Check if index already exists
    existing = list(collection.list_search_indexes())
    exists = any(idx.get("name") == index_name for idx in existing)
    
    if not exists:
        print(f"Creating search index '{index_name}'...")
        search_index_model = SearchIndexModel(
            definition={
                "fields": [
                    {
                        "type": "vector",
                        "path": "embedding",
                        "numDimensions": 384,
                        "similarity": "cosine"
                    },
                    {
                        "type": "filter",
                        "path": "domain"
                    }
                ]
            },
            name=index_name,
            type="vectorSearch"
        )
        try:
            collection.create_search_index(model=search_index_model)
            print("Command issued successfully.")
        except Exception as e:
            print(f"Error creating index: {e}")
            return
    else:
        print(f"Index '{index_name}' already exists.")

    print("Polling index status...")
    while True:
        indexes = list(collection.list_search_indexes(index_name))
        if not indexes:
            print("Index not found in list yet...")
        else:
            status = indexes[0].get("status")
            print(f"Status: {status}")
            if status == "READY":
                print("Index is READY!")
                break
            elif status == "FAILED":
                print("Index creation FAILED!")
                return
        time.sleep(5)

    print("\n--- Running Test Query ---")
    sample_item = collection.find_one({"domain": "bookcrossing", "embedding": {"$exists": True}})
    if not sample_item:
        print("No sample item found!")
        return
        
    print(f"Target Item: {sample_item.get('title')}")
    pipeline = [
        {
            "$vectorSearch": {
                "index": index_name,
                "path": "embedding",
                "queryVector": sample_item["embedding"],
                "numCandidates": 50,
                "limit": 5,
                "filter": {"domain": "bookcrossing"}
            }
        },
        {
            "$project": {
                "title": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    results = list(collection.aggregate(pipeline))
    print("\nTop Similar Items:")
    for r in results:
        print(f" - {r.get('title', 'Unknown')} (Score: {r.get('score', 0):.4f})")

if __name__ == "__main__":
    main()
