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

result_items = db.items.delete_many({'domain': 'retailrocket'})
result_interactions = db.interactions.delete_many({'domain': 'retailrocket'})

print(f"Deleted {result_items.deleted_count} items and {result_interactions.deleted_count} interactions for retailrocket.")
