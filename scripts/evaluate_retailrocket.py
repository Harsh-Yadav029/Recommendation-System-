import os
import asyncio
import numpy as np
import scipy.sparse as sparse
import implicit
import json
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from collections import defaultdict

async def evaluate():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    
    weights = {
        "purchase": 5,
        "add_to_cart": 3,
        "view": 1
    }
    
    print("Loading interactions...")
    cursor = interactions.find({"domain": "retailrocket"})
    
    user_interactions = defaultdict(list)
    async for doc in cursor:
        user_id = str(doc["user_id"])
        item_id = str(doc["item_id"])
        event_type = doc["event_type"]
        count = doc.get("count", 1)
        
        score = weights.get(event_type, 0) * count
        if score == 0:
            continue
        user_interactions[user_id].append((item_id, score))
        
    random.seed(42)
    
    train_data = []
    test_data = defaultdict(set)
    excluded_users = 0
    
    item_to_idx = {}
    user_to_idx = {}
    
    print("Splitting train/test...")
    for user_id, items in user_interactions.items():
        item_scores = defaultdict(float)
        for i_id, score in items:
            item_scores[i_id] += score
            
        unique_items = list(item_scores.keys())
        if len(unique_items) < 2:
            excluded_users += 1
            for i_id, score in item_scores.items():
                train_data.append((user_id, i_id, score))
            continue
            
        holdout_idx = random.randint(0, len(unique_items) - 1)
        holdout_item = unique_items.pop(holdout_idx)
        
        test_data[user_id].add(holdout_item)
        
        for i_id in unique_items:
            train_data.append((user_id, i_id, item_scores[i_id]))
            
    print(f"Excluded users (only 1 item): {excluded_users}")
    print(f"Train interactions: {len(train_data)}")
    print(f"Test interactions: {len(test_data)} (1 per eligible user)")
    
    for u, i, s in train_data:
        if u not in user_to_idx:
            user_to_idx[u] = len(user_to_idx)
        if i not in item_to_idx:
            item_to_idx[i] = len(item_to_idx)
            
    for u, items in test_data.items():
        for i in items:
            if i not in item_to_idx:
                item_to_idx[i] = len(item_to_idx)
                
    row = []
    col = []
    data = []
    for u, i, s in train_data:
        row.append(user_to_idx[u])
        col.append(item_to_idx[i])
        data.append(s)
        
    user_items = sparse.csr_matrix((data, (row, col)), shape=(len(user_to_idx), len(item_to_idx)))
    
    print("Training ALS model on train set...")
    als_model = implicit.als.AlternatingLeastSquares(factors=50, regularization=0.01, iterations=15, random_state=42)
    als_model.fit(user_items)
    
    print("Computing Popularity Baseline...")
    item_pop = defaultdict(float)
    for u, i, s in train_data:
        item_pop[i] += s
    pop_ranking = sorted(item_pop.keys(), key=lambda x: item_pop[x], reverse=True)
    
    print("Evaluating models...")
    K = 10
    
    als_hits = 0
    pop_hits = 0
    total_eval_users = 0
    
    for user_id, true_items in test_data.items():
        if user_id not in user_to_idx:
            continue
            
        u_idx = user_to_idx[user_id]
        total_eval_users += 1
        
        ids, scores = als_model.recommend(u_idx, user_items[u_idx], N=K, filter_already_liked_items=True)
        
        test_indices = {item_to_idx[i] for i in true_items}
        als_top_k_idx = set(ids)
        
        if len(als_top_k_idx.intersection(test_indices)) > 0:
            als_hits += 1
            
        liked_indices = set(user_items[u_idx].indices)
        pop_top_k = []
        for i_id in pop_ranking:
            if item_to_idx[i_id] not in liked_indices:
                pop_top_k.append(item_to_idx[i_id])
            if len(pop_top_k) >= K:
                break
                
        pop_top_k_idx = set(pop_top_k)
        if len(pop_top_k_idx.intersection(test_indices)) > 0:
            pop_hits += 1
            
    als_recall = als_hits / total_eval_users
    pop_recall = pop_hits / total_eval_users
    als_precision = als_recall / K
    pop_precision = pop_recall / K
    
    report = f"""# Retailrocket Offline Evaluation Report

## Setup
- **Split**: Leave-one-out per user (randomized with fixed seed).
- **Test Set**: 1 randomly held-out item per eligible user.
- **Excluded Users**: {excluded_users} users with only 1 interacted item were excluded from testing but kept in training.
- **Evaluation Users**: {total_eval_users}
- **Metrics**: Precision@{K}, Recall@{K}

## Results (Baseline vs Hybrid)

| Model | Recall@{K} | Precision@{K} |
|---|---|---|
| Popularity Baseline | {pop_recall:.4f} | {pop_precision:.4f} |
| ALS (Implicit CF) | {als_recall:.4f} | {als_precision:.4f} |

"""
    
    os.makedirs("docs/model_reports", exist_ok=True)
    with open("docs/model_reports/retailrocket_evaluation.md", "w") as f:
        f.write(report)
        
    print("Evaluation complete. Report saved to docs/model_reports/retailrocket_evaluation.md")

if __name__ == "__main__":
    asyncio.run(evaluate())
