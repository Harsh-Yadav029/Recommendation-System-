import os
import sys
sys.path.insert(0, 'c:/Users/harsh/Desktop/Cognizant/ml-service')
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('c:/Users/harsh/Desktop/Cognizant/ml-service/.env')
uri = os.environ.get("MONGODB_URI")
client = MongoClient(uri)
db = client.get_default_database()
if db.name == 'test' and uri is not None and "comparex" in uri:
    db = client["comparex"]

print(f"MongoDB counts - Anime: {db.items.count_documents({'domain': 'anime'})}, Retailrocket: {db.items.count_documents({'domain': 'retailrocket'})}")

try:
    from app.core.pinecone_client import PineconeClient
    pc = PineconeClient.get_instance()
    stats = pc.index.describe_index_stats()
    print(f"Pinecone namespaces: {stats}")
except Exception as e:
    print("Pinecone error:", e)
