import numpy as np
from app.core.pinecone_client import PineconeClient
from app.models.schemas import RankedItem

def get_semantic_recommendations(user_history, domain, top_k=10):
    if not user_history:
        return []
        
    pc = PineconeClient.get_instance()
    prefixed_history = [f"{domain}_{uid}" for uid in user_history]
    vectors_dict = pc.fetch_vectors(prefixed_history)
    
    vectors = [v["values"] for v in vectors_dict.values() if "values" in v]
    if not vectors:
        return []
        
    # Calculate centroid (average vector)
    centroid = np.mean(vectors, axis=0).tolist()
    
    matches = pc.query(centroid, top_k=top_k + len(user_history), filter_dict={"domain": domain})
    
    results = []
    rank = 1
    for match in matches:
        raw_id = match["id"].replace(f"{domain}_", "")
        if raw_id in user_history:
            continue
        if rank > top_k:
            break
            
        title = match.get("metadata", {}).get("title", "Unknown")
        results.append(RankedItem(
            item_id=raw_id,
            title=title,
            score=float(match.get("score", 0.0)),
            rank=rank,
            similarity_basis="semantic profile matching (Pinecone)",
            matched_constraints=[],
            domain=domain
        ))
        rank += 1
        
    return results
