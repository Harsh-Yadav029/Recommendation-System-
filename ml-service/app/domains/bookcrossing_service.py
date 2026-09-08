from typing import List, Dict, Any
import os
import json
import pickle
import numpy as np
from app.contracts.recommender import BaseRecommenderService
from app.models.schemas import UserProfile, Constraints, RankedItem, ComparisonTable, RecommendationResponse
from app.core.relaxation import relax_constraints_and_retry

class BookCrossingService(BaseRecommenderService):
    def __init__(self):
        self.domain = "bookcrossing"
        self.model = None
        self.trainset = None
        
        self.baseline_items = []
        self.item_metadata = {}
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
        
        # Load baseline
        baseline_path = os.path.join(project_root, "models", "bookcrossing_baseline.json")
        if os.path.exists(baseline_path):
            with open(baseline_path, "r") as f:
                self.baseline_items = json.load(f)
                
        # Load SVD model
        model_path = os.path.join(project_root, "models", "bookcrossing_svd.pkl")
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    artifact = pickle.load(f)  # nosec B301
                    self.model = artifact["model"]
                    self.trainset = artifact["trainset"]
            except Exception as e:
                print(f"Failed to load BookCrossing SVD model: {e}")
                self.model = None
                

    def _get_item_metadata(self, item_ids: List[str]) -> Dict[str, Dict]:
        missing_ids = [iid for iid in item_ids if iid not in self.item_metadata]
        if missing_ids:
            from app.core.mongo import MongoManager
            db = MongoManager.get_db()
            for doc in db.items.find({"domain": "bookcrossing", "item_id": {"$in": missing_ids}}):
                self.item_metadata[str(doc["item_id"])] = doc
                
        import hashlib
        res = {}
        for iid in item_ids:
            doc = dict(self.item_metadata.get(iid, {}))
            h = int(hashlib.md5(iid.encode(), usedforsecurity=False).hexdigest(), 16)
            if "metadata" not in doc:
                doc["metadata"] = {}
            if "author" not in doc["metadata"]:
                doc["metadata"]["author"] = doc.get("Book-Author", doc.get("author", "not specified"))
            
            res[iid] = doc
        return res
                
    def _get_baseline_recommendations(self, limit: int = 24, offset: int = 0, constraints: Constraints | None = None) -> RecommendationResponse:
        results = []
        c = constraints or Constraints()
        
        subset = self.baseline_items[:offset + limit * 10]
        item_ids = [str(item["item_id"]) for item in subset]
        metadata_map = self._get_item_metadata(item_ids)

        for item in subset:
            item_id = str(item["item_id"])
            meta = metadata_map.get(item_id, {})
            m = meta.get("metadata", {})
            
            if c.category and c.category.lower() not in str(m.get("category", "")).lower(): continue
            if c.author:
                filter_val = c.author.lower().replace(" ", "")
                author_val = str(m.get("author") or "").lower().replace(" ", "")
                if filter_val not in author_val: continue
            if c.year:
                y = int(m.get("year", 0)) if str(m.get("year", "")).isdigit() else 0
                if c.year == '2020-2024' and not (2020 <= y <= 2024): continue
                if c.year == '2015-2019' and not (2015 <= y <= 2019): continue
                if c.year == '2010-2014' and not (2010 <= y <= 2014): continue
                if c.year == 'Before 2010' and not (y > 0 and y < 2010): continue

            results.append(RankedItem(
                item_id=item_id,
                score=float(item["score"]),
                matched_constraints=[],
                similarity_basis="popularity baseline fallback (Bayesian average)",
                domain=self.domain,
                title=meta.get("title", f"Book #{item_id}"),
                metadata=m
            ))
        return RecommendationResponse(items=results[offset:offset+limit])
        
    def get_recommendations(self, user_profile: UserProfile, constraints: Constraints) -> RecommendationResponse:
        def _fetch(c: Constraints) -> RecommendationResponse:
            if self.model is None or self.trainset is None:
                return self._get_baseline_recommendations(limit=c.limit, offset=c.offset, constraints=c)
                
            try:
                try:
                    inner_uid = self.trainset.to_inner_uid(user_profile.user_id)
                    user_items = set([j for (j, _) in self.trainset.ur[inner_uid]])
                except ValueError:
                    return self._get_baseline_recommendations(limit=c.limit, offset=c.offset, constraints=c)
                    
                predictions = []
                for inner_iid in self.trainset.all_items():
                    if inner_iid not in user_items:
                        raw_iid = self.trainset.to_raw_iid(inner_iid)
                        est = self.model.predict(user_profile.user_id, raw_iid).est
                        predictions.append((raw_iid, est))
                        
                predictions.sort(key=lambda x: x[1], reverse=True)
                top_preds = predictions[:c.offset + c.limit * 10]
                
                results = []
                metadata_map = self._get_item_metadata([iid for iid, _ in top_preds])

                for item_id, est in top_preds:
                    meta = metadata_map.get(item_id, {})
                    m = meta.get("metadata", {})
                    
                    if c.category and c.category.lower() not in str(m.get("category", "")).lower(): continue
                    if c.author:
                        filter_val = c.author.lower().replace(" ", "")
                        author_val = str(m.get("author") or "").lower().replace(" ", "")
                        if filter_val not in author_val: continue
                    if c.year:
                        y = int(m.get("year", 0)) if str(m.get("year", "")).isdigit() else 0
                        if c.year == '2020-2024' and not (2020 <= y <= 2024): continue
                        if c.year == '2015-2019' and not (2015 <= y <= 2019): continue
                        if c.year == '2010-2014' and not (2010 <= y <= 2014): continue
                        if c.year == 'Before 2010' and not (y > 0 and y < 2010): continue

                    results.append(RankedItem(
                        item_id=item_id,
                        score=float(est),
                        matched_constraints=[],
                        similarity_basis="explicit matrix factorization (SVD)",
                        domain=self.domain,
                        title=meta.get("title", f"Book #{item_id}"),
                        metadata=m
                    ))
                
                return RecommendationResponse(items=results[c.offset:c.offset+c.limit])
            except Exception:
                return self._get_baseline_recommendations(limit=c.limit, offset=c.offset, constraints=c)
                
        return _fetch(constraints)

    def compare(self, item_ids: List[str]) -> ComparisonTable:
        items = []
        
        score_map = {str(item["item_id"]): item["score"] for item in self.baseline_items}
        metadata_map = self._get_item_metadata(item_ids) 
        
        for item_id in item_ids:
            meta = metadata_map.get(item_id, {})
            category = meta.get("metadata", {}).get("category", "not specified")
            # BookCrossing has rich metadata: Title, Author, Year, Publisher, Cover Images
            item_data = {
                "item_id": item_id,
                "title": meta.get("title", "not specified"),
                "author": meta.get("metadata", {}).get("author", "not specified"),
                "year": meta.get("metadata", {}).get("year", "not specified"),
                "publisher": meta.get("metadata", {}).get("publisher", "not specified"),
                "category": category,
                "image_url_s": meta.get("metadata", {}).get("image_url_s", "not specified"),
                "image_url_m": meta.get("metadata", {}).get("image_url_m", "not specified"),
                "image_url_l": meta.get("metadata", {}).get("image_url_l", "not specified"),
                "popularity_score": score_map.get(item_id, 0)
            }
            items.append(item_data)
            
        return ComparisonTable(items=items)

    def cold_start_recommend(self, preference_answers: dict) -> RecommendationResponse:
        # Surprise SVD doesn't have a fast similar_items(). 
        # We could compute cosine similarity on algo.qi (item factors), 
        # but for simplicity we fall back to Bayesian baseline for cold start here.
        return self._get_baseline_recommendations(10)

    def explain(self, item_id: str, user_profile: UserProfile) -> str:
        if self.model is None:
            return "matched_constraints=[], similarity_basis='popularity baseline fallback (Bayesian average)'"
        return "matched_constraints=[], similarity_basis='explicit matrix factorization (SVD)'"

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
            
        # Case insensitive exact match or contains
        docs = list(db.items.find({
            "domain": "bookcrossing", 
            "title": {"$regex": title, "$options": "i"}
        }).limit(5))
        return docs

    def find_similar_items(self, item_id: str, k: int = 5) -> RecommendationResponse:
        from pymongo import MongoClient
        import os
        from dotenv import load_dotenv
        from app.core.pinecone_client import PineconeClient
        
        load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))
        uri = os.environ.get("MONGODB_URI", "")
        client = MongoClient(uri or "mongodb://localhost:27017")
        db = client.get_default_database()
        if db.name == 'test' and "comparex" in uri:
            db = client["comparex"]
            
        target = db.items.find_one({"domain": "bookcrossing", "item_id": item_id})
        if not target:
            return RecommendationResponse(items=[])
            
        pc = PineconeClient.get_instance()
        prefixed_id = f"bookcrossing_{item_id}"
        vectors = pc.fetch_vectors([prefixed_id])
        
        if prefixed_id in vectors and "values" in vectors[prefixed_id]:
            vector = vectors[prefixed_id]["values"]
        elif "embedding" in target:
            vector = target["embedding"]
        else:
            return RecommendationResponse(items=[])
            
        matches = pc.query(vector, top_k=k+1, filter_dict={"domain": "bookcrossing"})
        
        ranked_items = []
        rank = 1
        for match in matches:
            raw_id = match["id"].replace("bookcrossing_", "")
            if raw_id == item_id:
                continue
            if rank > k:
                break
                
            title = match.get("metadata", {}).get("title", "Unknown")
            score = float(match.get("score", 0.0))
            
            meta_doc = db.items.find_one({"domain": "bookcrossing", "item_id": raw_id})
            metadata = meta_doc.get("metadata", {}) if meta_doc else {}
            
            ranked_items.append(
                RankedItem(
                    item_id=raw_id,
                    title=title,
                    score=score,
                    rank=rank,
                    metadata=metadata,
                    similarity_basis="semantically similar based on title/metadata (Pinecone)",
                    matched_constraints=[],
                    domain="bookcrossing"
                )
            )
            rank += 1
            
        return RecommendationResponse(items=ranked_items)
