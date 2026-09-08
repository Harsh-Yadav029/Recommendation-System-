import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env relative to this file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))

class MongoManager:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._client is None:
            uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
            cls._client = MongoClient(uri)
            cls._db = cls._client.get_default_database()
            if cls._db.name == 'test' and "comparex" in uri:
                cls._db = cls._client["comparex"]
        return cls._db
