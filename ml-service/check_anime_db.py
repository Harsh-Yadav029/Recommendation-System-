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

doc = db.items.find_one({"domain": "anime"})
import pprint
pprint.pprint(doc)
