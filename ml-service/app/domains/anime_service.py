from typing import List, Dict, Any
import os
import random
from app.contracts.recommender import BaseRecommenderService
from app.models.schemas import UserProfile, Constraints, RankedItem, ComparisonTable, RecommendationResponse
from app.core.relaxation import relax_constraints_and_retry
from app.core.pinecone_client import PineconeClient
from app.core.semantic_recommender import get_semantic_recommendations

class AnimeService(BaseRecommenderService):
    def __init__(self):
        self.domain = "anime"
        self.item_metadata = {}
        self.baseline_items = []
        
        # Load a simple baseline of popular anime from DB
        from pymongo import MongoClient
        from dotenv import load_dotenv
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        load_dotenv(os.path.join(current_dir, "..", "..", ".env"))
        
        uri = os.environ.get("MONGODB_URI", "")
        if uri:
            client = MongoClient(uri)
            db = client.get_default_database()
            if db.name == 'test' and "comparex" in uri:
                db = client["comparex"]
                
            # Fetch a sample of anime to use as baseline (since we don't have a pre-trained model)
            # We'll just fetch 500 anime, parse their members/ratings, and sort them to create a popular baseline
            docs = list(db.items.find({"domain": "anime"}).limit(1000))
            
            for doc in docs:
                self.item_metadata[str(doc["item_id"])] = doc
                members_str = doc.get("metadata", {}).get("members", "0")
                try:
                    members = int(members_str)
                except ValueError:
                    members = 0
                
                self.baseline_items.append({
                    "item_id": str(doc["item_id"]),
                    "score": members,
                    "doc": doc
                })
                
            self.baseline_items.sort(key=lambda x: x["score"], reverse=True)

    def _get_item_metadata(self, item_ids: List[str]) -> Dict[str, Dict]:
        missing_ids = [iid for iid in item_ids if iid not in self.item_metadata]
        if missing_ids:
            from pymongo import MongoClient
            import os
            from dotenv import load_dotenv
            load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))
            uri = os.environ.get("MONGODB_URI", "")
            client = MongoClient(uri or "mongodb://localhost:27017")
            db = client.get_default_database()
            if db.name == 'test' and "comparex" in uri:
                db = client["comparex"]
                
            for doc in db.items.find({"domain": "anime", "item_id": {"$in": missing_ids}}):
                self.item_metadata[str(doc["item_id"])] = doc
                
        return {iid: self.item_metadata.get(iid, {}) for iid in item_ids}

    def _get_baseline_recommendations(self, limit: int = 24, offset: int = 0, constraints: Constraints | None = None) -> RecommendationResponse:
        results = []
        c = constraints or Constraints()
        
        # Give a popularity score normalized between 0 and 1
        max_score = self.baseline_items[0]["score"] if self.baseline_items and self.baseline_items[0]["score"] > 0 else 1
        
        for item in self.baseline_items:
            doc = item["doc"]
            item_id = str(doc["item_id"])
            m = doc.get("metadata", {})
            
            if c.genre and c.genre.lower() not in m.get("genre", "").lower(): continue
            
            score = item["score"] / max_score
            
            results.append(RankedItem(
                item_id=item_id,
                score=float(score),
                matched_constraints=[],
                similarity_basis="popularity baseline fallback (most members)",
                domain=self.domain,
                title=doc.get("title", f"Anime #{item_id}"),
                metadata=m
            ))
            
            if len(results) >= offset + limit * 5:
                break
                
        return RecommendationResponse(items=results[offset:offset+limit])

    def get_recommendations(self, user_profile: UserProfile, constraints: Constraints) -> RecommendationResponse:
        def _fetch(c: Constraints) -> RecommendationResponse:
            results = []
            
            # Fetch Semantic Recommendations if user has history
            if user_profile.history:
                try:
                    sem_results = get_semantic_recommendations(user_profile.history, self.domain, top_k=c.limit * 3)
                    metadata_map = self._get_item_metadata([item.item_id for item in sem_results])
                    for item in sem_results:
                        meta = metadata_map.get(item.item_id, {})
                        m = meta.get("metadata", {})
                        if c.genre and c.genre.lower() not in m.get("genre", "").lower(): continue
                        item.metadata = m
                        item.title = meta.get("title", item.title)
                        results.append(item)
                except Exception as e:
                    print(f"Anime semantic fallback failed: {e}")
                    
            if not results:
                return self._get_baseline_recommendations(limit=c.limit, offset=c.offset, constraints=c)
                
            seen = set()
            dedup = []
            for r in results:
                if r.item_id not in seen:
                    seen.add(r.item_id)
                    dedup.append(r)
                    
            dedup.sort(key=lambda x: x.score, reverse=True)
            return RecommendationResponse(items=dedup[c.offset:c.offset+c.limit])
                
        return relax_constraints_and_retry(_fetch, constraints, target_count=constraints.limit)

    def compare(self, item_ids: List[str]) -> ComparisonTable:
        items = []
        metadata_map = self._get_item_metadata(item_ids) 
        
        for item_id in item_ids:
            meta = metadata_map.get(item_id, {})
            m = meta.get("metadata", {})
            
            item_data = {
                "item_id": item_id,
                "title": meta.get("title", "Unknown Anime"),
                "genre": m.get("genre", "Unknown"),
                "type": m.get("type", "Unknown"),
                "episodes": m.get("episodes", "Unknown"),
                "popularity_score": m.get("rating", "0.0"),
                "user_feedback": {
                    "Total Members": m.get("members", "0"),
                    "Average Rating": f"{m.get('rating', '0.0')} / 10.0"
                }
            }
            items.append(item_data)
            
        return ComparisonTable(items=items)

    def cold_start_recommend(self, preference_answers: dict) -> RecommendationResponse:
        return self._get_baseline_recommendations(10)

    def explain(self, item_id: str, user_profile: UserProfile) -> str:
        if not user_profile.history:
            return "matched_constraints=[], similarity_basis='popularity baseline fallback (most members)'"
        return "matched_constraints=[], similarity_basis='semantic profile matching (Pinecone)'"

    def search_by_title(self, title: str) -> List[Dict]:
        from pymongo import MongoClient
        import os
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))
        uri = os.environ.get("MONGODB_URI", "")
        client = MongoClient(uri or "mongodb://localhost:27017")
        db = client.get_default_database()
        if db.name == 'test' and "comparex" in uri:
            db = client["comparex"]
            
        docs = list(db.items.find({
            "domain": "anime", 
            "title": {"$regex": title, "$options": "i"}
        }).limit(5))
        return docs

    def find_similar_items(self, item_id: str, k: int = 5) -> RecommendationResponse:
        from pymongo import MongoClient
        import os
        from dotenv import load_dotenv
        
        load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))
        uri = os.environ.get("MONGODB_URI", "")
        client = MongoClient(uri or "mongodb://localhost:27017")
        db = client.get_default_database()
        if db.name == 'test' and "comparex" in uri:
            db = client["comparex"]
            
        target = db.items.find_one({"domain": "anime", "item_id": str(item_id)})
        if not target:
            return RecommendationResponse(items=[])
            
        pc = PineconeClient.get_instance()
        prefixed_id = f"anime_{item_id}"
        vectors = pc.fetch_vectors([prefixed_id])
        
        if prefixed_id in vectors and "values" in vectors[prefixed_id]:
            vector = vectors[prefixed_id]["values"]
        elif "embedding" in target:
            vector = target["embedding"]
        else:
            return RecommendationResponse(items=[])
            
        matches = pc.query(vector, top_k=k+1, filter_dict={"domain": "anime"})
        
        ranked_items = []
        rank = 1
        for match in matches:
            raw_id = match["id"].replace("anime_", "")
            if raw_id == str(item_id):
                continue
            if rank > k:
                break
                
            title = match.get("metadata", {}).get("title", "Unknown")
            score = float(match.get("score", 0.0))
            
            meta_doc = db.items.find_one({"domain": "anime", "item_id": raw_id})
            metadata = meta_doc.get("metadata", {}) if meta_doc else {}
            
            ranked_items.append(
                RankedItem(
                    item_id=raw_id,
                    title=title,
                    score=score,
                    rank=rank,
                    metadata=metadata,
                    similarity_basis="semantically similar based on metadata (Pinecone)",
                    matched_constraints=[],
                    domain="anime"
                )
            )
            rank += 1
            
        return RecommendationResponse(items=ranked_items)
