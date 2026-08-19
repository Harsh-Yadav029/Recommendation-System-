from typing import List, Dict, Any
import os
import json
import pickle
import numpy as np
from app.contracts.recommender import BaseRecommenderService
from app.models.schemas import UserProfile, Constraints, RankedItem, ComparisonTable, RecommendationResponse
from app.core.relaxation import relax_constraints_and_retry

class SteamService(BaseRecommenderService):
    def __init__(self):
        self.domain = "steam"
        self.model = None
        self.user_to_idx = {}
        self.item_to_idx = {}
        self.idx_to_user = []
        self.idx_to_item = []
        
        self.baseline_items = []
        self.item_metadata = {}
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
        
        # Load baseline
        baseline_path = os.path.join(project_root, "models", "steam_baseline.json")
        if os.path.exists(baseline_path):
            with open(baseline_path, "r") as f:
                self.baseline_items = json.load(f)
                
        # Load ALS model
        model_path = os.path.join(project_root, "models", "steam_als.pkl")
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    artifact = pickle.load(f)
                    self.model = artifact["model"]
                    self.user_to_idx = artifact["user_to_idx"]
                    self.item_to_idx = artifact["item_to_idx"]
                    self.idx_to_user = artifact["idx_to_user"]
                    self.idx_to_item = artifact["idx_to_item"]
            except Exception as e:
                print(f"Failed to load Steam ALS model: {e}")
                self.model = None
                
        # In a real system, metadata would be fetched from MongoDB per request or cached in Redis.
        # For this prototype service, we will fetch it dynamically in compare() or lazy load.
        self.db = None
                
    def _get_item_metadata(self, item_ids: List[str]) -> Dict[str, Dict]:
        # Helper to fetch metadata. In synchronous code without async db, we might need a sync driver 
        # or pre-cache. We'll use motor in a sync wrapper if needed, but compare() is sync in the interface.
        # Actually, FastAPI routes can be async and call async service methods, but BaseRecommenderService 
        # is defined with sync methods in SKILL.md. We must fetch from DB synchronously or use an existing client.
        # To avoid blocking issues, we can just load the entire items collection for Steam into memory,
        # it's only 5155 items. Let's do that lazily.
        if not self.item_metadata:
            from pymongo import MongoClient
            from dotenv import load_dotenv
            load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))
            uri = os.environ.get("MONGODB_URI")
            client = MongoClient(uri)
            db = client.get_default_database()
            if db.name == 'test' and "comparex" in uri:
                db = client["comparex"]
            for doc in db.items.find({"domain": "steam"}):
                self.item_metadata[str(doc["item_id"])] = doc
                
        return {iid: self.item_metadata.get(iid, {}) for iid in item_ids}
                
    def _get_baseline_recommendations(self, n: int = 10) -> RecommendationResponse:
        results = []
        for item in self.baseline_items[:n]:
            results.append(RankedItem(
                item_id=str(item["item_id"]),
                score=float(item["score"]),
                matched_constraints=[],
                similarity_basis="popularity baseline fallback",
                domain=self.domain
            ))
        return RecommendationResponse(items=results)
        
    def get_recommendations(self, user_profile: UserProfile, constraints: Constraints) -> RecommendationResponse:
        def _fetch(c: Constraints) -> RecommendationResponse:
            if self.model is None or user_profile.user_id not in self.user_to_idx:
                return self._get_baseline_recommendations(10)
                
            u_idx = self.user_to_idx[user_profile.user_id]
            
            try:
                ids, scores = self.model.recommend(u_idx, None, N=20, filter_already_liked_items=False)
                
                results = []
                if isinstance(ids, np.ndarray):
                    for i in range(len(ids)):
                        item_id = str(self.idx_to_item[ids[i]])
                        results.append(RankedItem(
                            item_id=item_id,
                            score=float(scores[i]),
                            matched_constraints=[],
                            similarity_basis="collaborative filtering based on similar purchase/play patterns",
                            domain=self.domain
                        ))
                
                # Apply constraints (Steam has no category/price, but just in case)
                if c.category:
                    # In a real app we'd filter by category, Steam doesn't have it, so we simulate failure
                    return RecommendationResponse(items=[])
                    
                return RecommendationResponse(items=results[:10])
            except Exception:
                return self._get_baseline_recommendations(10)
                
        return relax_constraints_and_retry(_fetch, constraints, target_count=10)

    def compare(self, item_ids: List[str]) -> ComparisonTable:
        items = []
        
        score_map = {str(item["item_id"]): item["score"] for item in self.baseline_items}
        metadata_map = self._get_item_metadata(item_ids) # Sync call to lazy load
        
        for item_id in item_ids:
            meta = metadata_map.get(item_id, {})
            item_data = {
                "item_id": item_id,
                "title": meta.get("title", "not specified"),
                "category": "not specified", # Steam has no category
                "price": "not specified", # Steam has no price
                "popularity_score": score_map.get(item_id, 0)
            }
            items.append(item_data)
            
        return ComparisonTable(items=items)

    def cold_start_recommend(self, preference_answers: dict) -> RecommendationResponse:
        session_items = preference_answers.get("session_items", [])
        if not session_items or self.model is None:
            return self._get_baseline_recommendations(10)
            
        scores = {}
        for item_id in session_items:
            if item_id in self.item_to_idx:
                i_idx = self.item_to_idx[item_id]
                try:
                    ids, item_scores = self.model.similar_items(i_idx, N=15)
                    if isinstance(ids, np.ndarray):
                        for j in range(len(ids)):
                            sim_idx = ids[j]
                            sim_score = item_scores[j]
                            sim_item_id = str(self.idx_to_item[sim_idx])
                            if sim_item_id not in session_items:
                                scores[sim_item_id] = scores.get(sim_item_id, 0) + sim_score
                except Exception as e:
                    pass
                    
        if not scores:
            return self._get_baseline_recommendations(10)
            
        ranked_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:10]
        results = []
        for item_id, score in ranked_items:
            results.append(RankedItem(
                item_id=item_id,
                score=float(score),
                matched_constraints=[],
                similarity_basis="session-based co-occurrence",
                domain=self.domain
            ))
            
        return RecommendationResponse(items=results)

    def explain(self, item_id: str, user_profile: UserProfile) -> str:
        if self.model is None or user_profile.user_id not in self.user_to_idx:
            return "matched_constraints=[], similarity_basis='popularity baseline fallback'"
        return "matched_constraints=[], similarity_basis='collaborative filtering based on similar purchase/play patterns'"
