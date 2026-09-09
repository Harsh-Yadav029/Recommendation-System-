import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env relative to this file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))

# Fix Windows DNS SRV resolution for mongodb+srv:// URIs
if sys.platform == "win32":
    try:
        import dns.resolver
        dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
        dns.resolver.default_resolver.nameservers = ["8.8.8.8", "8.8.4.4"]
    except ImportError:
        pass

class MongoManager:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._client is None:
            uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
            cls._client = MongoClient(
                uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000
            )
            cls._db = cls._client.get_default_database()
            if cls._db.name == 'test' and "comparex" in uri:
                cls._db = cls._client["comparex"]
        return cls._db

