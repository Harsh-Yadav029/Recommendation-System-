import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(r"C:\Users\harsh\Desktop\Cognizant\ml-service", ".env"))
uri = os.environ.get("MONGODB_URI")
client = MongoClient(uri)
db = client.get_default_database()
if db.name == 'test' and "comparex" in uri:
    db = client["comparex"]

doc = db.items.find_one({"domain": "anime"})
import pprint
pprint.pprint(doc)
