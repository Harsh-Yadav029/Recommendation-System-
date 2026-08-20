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
                    artifact = pickle.load(f)
                    self.model = artifact["model"]
                    self.trainset = artifact["trainset"]
            except Exception as e:
                print(f"Failed to load BookCrossing SVD model: {e}")
                self.model = None
                
    def _get_item_metadata(self, item_ids: List[str]) -> Dict[str, Dict]:
        missing_ids = [iid for iid in item_ids if iid not in self.item_metadata]
        if missing_ids:
            from pymongo import MongoClient
            from dotenv import load_dotenv
            load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))
            uri = os.environ.get("MONGODB_URI")
            client = MongoClient(uri)
            db = client.get_default_database()
            if db.name == 'test' and "comparex" in uri:
                db = client["comparex"]
            for doc in db.items.find({"domain": "bookcrossing", "item_id": {"$in": missing_ids}}):
                self.item_metadata[str(doc["item_id"])] = doc
                
        return {iid: self.item_metadata.get(iid, {}) for iid in item_ids}
                
    def _get_baseline_recommendations(self, n: int = 10) -> RecommendationResponse:
        results = []
        # Pre-fetch metadata
        item_ids = [str(item["item_id"]) for item in self.baseline_items[:n]]
        metadata_map = self._get_item_metadata(item_ids)

        for item in self.baseline_items[:n]:
            item_id = str(item["item_id"])
            meta = metadata_map.get(item_id, {})
            results.append(RankedItem(
                item_id=item_id,
                score=float(item["score"]),
                matched_constraints=[],
                similarity_basis="popularity baseline fallback (Bayesian average)",
                domain=self.domain,
                title=meta.get("title", f"Book #{item_id}"),
                metadata=meta.get("metadata", {})
            ))
        return RecommendationResponse(items=results)
        
    def get_recommendations(self, user_profile: UserProfile, constraints: Constraints) -> RecommendationResponse:
        def _fetch(c: Constraints) -> RecommendationResponse:
            if self.model is None or self.trainset is None:
                return self._get_baseline_recommendations(10)
                
            try:
                # Surprise uses raw ids (strings). If user is unknown, it predicts the global mean.
                # To get top N, we must predict for all unseen items.
                try:
                    inner_uid = self.trainset.to_inner_uid(user_profile.user_id)
                    user_items = set([j for (j, _) in self.trainset.ur[inner_uid]])
                except ValueError:
                    # User not in trainset -> baseline
                    return self._get_baseline_recommendations(10)
                    
                predictions = []
                # Iterate over all items in trainset
                for inner_iid in self.trainset.all_items():
                    if inner_iid not in user_items:
                        raw_iid = self.trainset.to_raw_iid(inner_iid)
                        est = self.model.predict(user_profile.user_id, raw_iid).est
                        predictions.append((raw_iid, est))
                        
                predictions.sort(key=lambda x: x[1], reverse=True)
                top_preds = predictions[:20]
                
                results = []
                # Pre-fetch metadata
                metadata_map = self._get_item_metadata([iid for iid, _ in top_preds])

                for item_id, est in top_preds:
                    meta = metadata_map.get(item_id, {})
                    results.append(RankedItem(
                        item_id=item_id,
                        score=float(est),
                        matched_constraints=[],
                        similarity_basis="explicit matrix factorization (SVD)",
                        domain=self.domain,
                        title=meta.get("title", f"Book #{item_id}"),
                        metadata=meta.get("metadata", {})
                    ))
                
                if c.category:
                    return RecommendationResponse(items=[])
                    
                return RecommendationResponse(items=results[:10])
            except Exception:
                return self._get_baseline_recommendations(10)
                
        return relax_constraints_and_retry(_fetch, constraints, target_count=10)

    def compare(self, item_ids: List[str]) -> ComparisonTable:
        items = []
        
        score_map = {str(item["item_id"]): item["score"] for item in self.baseline_items}
        metadata_map = self._get_item_metadata(item_ids) 
        
        for item_id in item_ids:
            meta = metadata_map.get(item_id, {})
            # BookCrossing has rich metadata: Title, Author, Year, Publisher, Cover Images
            item_data = {
                "item_id": item_id,
                "title": meta.get("title", "not specified"),
                "author": meta.get("metadata", {}).get("author", "not specified"),
                "year": meta.get("metadata", {}).get("year", "not specified"),
                "publisher": meta.get("metadata", {}).get("publisher", "not specified"),
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
