from sentence_transformers import SentenceTransformer

class EmbeddingsClient:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def __init__(self):
        print("Loading SentenceTransformer model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def encode(self, text: str) -> list[float]:
        return self.model.encode([text])[0].tolist()
