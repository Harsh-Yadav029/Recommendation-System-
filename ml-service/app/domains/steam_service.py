from typing import List, Dict, Any, Optional
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
                    artifact = pickle.load(f)  # nosec B301
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
        missing_ids = [iid for iid in item_ids if iid not in self.item_metadata]
        if missing_ids:
            from app.core.mongo import MongoManager
            db = MongoManager.get_db()
            for doc in db.items.find({"domain": "steam", "item_id": {"$in": missing_ids}}):
                self.item_metadata[str(doc["item_id"])] = doc
                
        import hashlib
        res = {}
        for iid in item_ids:
            doc = dict(self.item_metadata.get(iid, {}))
            if "metadata" not in doc:
                doc["metadata"] = {}
            if "genre" not in doc["metadata"]:
                doc["metadata"]["genre"] = "not specified"
            if "rating" not in doc["metadata"]:
                doc["metadata"]["rating"] = "not specified"
            if "platform" not in doc["metadata"]:
                doc["metadata"]["platform"] = "not specified"
            res[iid] = doc
        return res
                
    def _get_baseline_recommendations(self, limit: int = 24, offset: int = 0, constraints: Optional[Constraints] = None) -> RecommendationResponse:
        results = []
        c = constraints or Constraints()
        
        # We need to filter, so we might need more than 'limit' items initially
        subset = self.baseline_items[:offset + limit * 10]
        item_ids = [str(item["item_id"]) for item in subset]
        metadata_map = self._get_item_metadata(item_ids)

        for item in subset:
            item_id = str(item["item_id"])
            meta = metadata_map.get(item_id, {})
            m = meta.get("metadata", {})
            
            if c.genre and c.genre.lower() not in str(m.get("genre", "")).lower(): continue
            if c.rating and c.rating.lower() not in str(m.get("rating", "")).lower(): continue
            if c.platform and c.platform.lower() not in str(m.get("platform", "")).lower(): continue
            
            results.append(RankedItem(
                item_id=item_id,
                score=float(item["score"]),
                matched_constraints=[],
                similarity_basis="popularity baseline fallback",
                domain=self.domain,
                title=meta.get("title", f"Steam Item #{item_id}"),
                metadata=m
            ))
            
        return RecommendationResponse(items=results[offset:offset+limit])
        
    def get_recommendations(self, user_profile: UserProfile, constraints: Constraints) -> RecommendationResponse:
        from app.core.semantic_recommender import get_semantic_recommendations
        
        def _fetch(c: Constraints) -> RecommendationResponse:
            results = []
            
            if self.model is not None and user_profile.user_id in self.user_to_idx:
                u_idx = self.user_to_idx[user_profile.user_id]
                try:
                    ids, scores = self.model.recommend(u_idx, None, N=c.offset + c.limit * 10, filter_already_liked_items=False)
                    if isinstance(ids, np.ndarray):
                        raw_ids = [str(self.idx_to_item[ids[i]]) for i in range(len(ids))]
                        metadata_map = self._get_item_metadata(raw_ids)

                        for i in range(len(ids)):
                            item_id = raw_ids[i]
                            meta = metadata_map.get(item_id, {})
                            m = meta.get("metadata", {})
                            
                            if c.genre and c.genre.lower() not in str(m.get("genre", "")).lower(): continue
                            if c.rating and c.rating.lower() not in str(m.get("rating", "")).lower(): continue
                            if c.platform and c.platform.lower() not in str(m.get("platform", "")).lower(): continue

                            results.append(RankedItem(
                                item_id=item_id,
                                score=float(scores[i]),
                                matched_constraints=[],
                                similarity_basis="collaborative filtering based on similar purchase/play patterns",
                                domain=self.domain,
                                title=meta.get("title", f"Steam Item #{item_id}"),
                                metadata=m
                            ))
                except Exception as e:
                    print(f"Error mapping steam recommendation: {e}")

            if user_profile.history:
                try:
                    sem_results = get_semantic_recommendations(user_profile.history, self.domain, top_k=c.limit)
                    metadata_map = self._get_item_metadata([item.item_id for item in sem_results])
                    for item in sem_results:
                        meta = metadata_map.get(item.item_id, {})
                        m = meta.get("metadata", {})
                        if c.genre and c.genre.lower() not in str(m.get("genre", "")).lower(): continue
                        if c.rating and c.rating.lower() not in str(m.get("rating", "")).lower(): continue
                        if c.platform and c.platform.lower() not in str(m.get("platform", "")).lower(): continue
                        item.metadata = m
                        item.title = meta.get("title", item.title)
                        results.append(item)
                except Exception as e:
                    print(f"Semantic fallback failed: {e}")
                    
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
        
        score_map = {str(item["item_id"]): item["score"] for item in self.baseline_items}
        metadata_map = self._get_item_metadata(item_ids) # Sync call to lazy load
        
        for item_id in item_ids:
            meta = metadata_map.get(item_id, {})
            genre = meta.get("metadata", {}).get("genre", "not specified")
            item_data = {
                "item_id": item_id,
                "title": meta.get("title", f"Steam Item #{item_id}"),
                "category": genre,
                "genre": genre,
                "price": "not specified",
                "popularity_score": score_map.get(item_id, 0)
            }
            items.append(item_data)
            
        return ComparisonTable(items=items)

    def cold_start_recommend(self, preference_answers: dict) -> RecommendationResponse:
        session_items = preference_answers.get("session_items", [])
        if not session_items or self.model is None:
            return self._get_baseline_recommendations(24)
            
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
                    print(f"Error mapping similar item in steam: {e}")
                    
        if not scores:
            return self._get_baseline_recommendations(24)
            
        ranked_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:24]
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
        if self.model is None:
            return "matched_constraints=[], similarity_basis='popularity baseline fallback'"
        return "matched_constraints=[], similarity_basis='collaborative filtering (ALS implicit feedback)'"

    def search_by_title(self, title: str) -> List[Dict]:
        from app.core.mongo import MongoManager
        db = MongoManager.get_db()
            
        docs = list(db.items.find({
            "domain": "steam", 
            "title": {"$regex": title, "$options": "i"}
        }).limit(5))
        return docs

    def find_similar_items(self, item_id: str, k: int = 5) -> RecommendationResponse:
        from app.core.mongo import MongoManager
        from app.core.pinecone_client import PineconeClient
        
        db = MongoManager.get_db()
            
        target = db.items.find_one({"domain": "steam", "item_id": item_id})
        if not target:
            return RecommendationResponse(items=[])
            
        pc = PineconeClient.get_instance()
        prefixed_id = f"steam_{item_id}"
        vectors = pc.fetch_vectors([prefixed_id])
        
        if prefixed_id in vectors and "values" in vectors[prefixed_id]:
            vector = vectors[prefixed_id]["values"]
        elif "embedding" in target:
            vector = target["embedding"]
        else:
            return RecommendationResponse(items=[])
            
        matches = pc.query(vector, top_k=k+1, filter_dict={"domain": "steam"})
        
        ranked_items = []
        rank = 1
        for match in matches:
            raw_id = match["id"].replace("steam_", "")
            if raw_id == item_id:
                continue
            if rank > k:
                break
                
            title = match.get("metadata", {}).get("title", "Unknown")
            score = float(match.get("score", 0.0))
            
            # Fetch metadata from MongoDB to match the previous structure
            meta_doc = db.items.find_one({"domain": "steam", "item_id": raw_id})
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
                    domain="steam"
                )
            )
            rank += 1
            
        return RecommendationResponse(items=ranked_items)
