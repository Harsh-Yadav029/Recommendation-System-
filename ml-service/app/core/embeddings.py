class EmbeddingsClient:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def __init__(self):
        self.model = None
        try:
            print("Loading SentenceTransformer model...")
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Warning: SentenceTransformer failed to load (App Control / DLL policy): {e}")
            self.model = None
        
    def encode(self, text: str) -> list[float]:
        if not self.model:
            return []
        try:
            return self.model.encode([text])[0].tolist()
        except Exception as e:
            print(f"Embedding encoding failed: {e}")
            return []
