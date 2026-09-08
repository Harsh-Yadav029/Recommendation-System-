import os
from pinecone import Pinecone
from dotenv import load_dotenv

class PineconeClient:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def __init__(self):
        load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
        api_key = os.environ.get("PINECONE_API_KEY")
        if not api_key:
            self.index = None
            print("WARNING: PINECONE_API_KEY not found.")
            return
            
        try:
            self.pc = Pinecone(api_key=api_key)
            self.index = self.pc.Index("comparex-index")
        except Exception as e:
            print(f"Failed to initialize Pinecone: {e}")
            self.index = None
            
    def query(self, vector, top_k=5, filter_dict=None):
        if not self.index:
            return []
            
        kwargs = {
            "vector": vector,
            "top_k": top_k,
            "include_metadata": True
        }
        if filter_dict:
            kwargs["filter"] = filter_dict
            
        res = self.index.query(**kwargs)
        return res.get("matches", [])
        
    def fetch_vectors(self, item_ids):
        if not self.index or not item_ids:
            return {}
        res = self.index.fetch(ids=item_ids)
        return res.get("vectors", {})
