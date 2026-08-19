import os
import asyncio
import numpy as np
import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import LeaveOneOut
from collections import defaultdict
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def evaluate():
    load_dotenv("ml-service/.env")
    uri = os.environ.get("MONGODB_URI")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    if db.name == 'test' and "comparex" in uri:
        db = client["comparex"]
        
    interactions = db["interactions"]
    
    print("Loading BookCrossing ratings...")
    cursor = interactions.find({"domain": "bookcrossing", "event_type": "rating"})
    
    user_interactions = defaultdict(list)
    async for doc in cursor:
        user_id = str(doc["user_id"])
        item_id = str(doc["item_id"])
        value = doc.get("value")
        
        if value is not None and value > 0:
            user_interactions[user_id].append((item_id, value))
            
    random.seed(42)
    
    train_data = []
    test_data = defaultdict(set)
    excluded_users = 0
    
    print("Splitting train/test...")
    for user_id, items in user_interactions.items():
        if len(items) < 2:
            excluded_users += 1
            for i_id, score in items:
                train_data.append([user_id, i_id, score])
            continue
            
        holdout_idx = random.randint(0, len(items) - 1)
        holdout_item, holdout_score = items.pop(holdout_idx)
        
        test_data[user_id].add(holdout_item)
        
        for i_id, score in items:
            train_data.append([user_id, i_id, score])
            
    print(f"Excluded users (only 1 item): {excluded_users}")
    print(f"Train interactions: {len(train_data)}")
    print(f"Test interactions: {len(test_data)} (1 per eligible user)")
    
    df = pd.DataFrame(train_data, columns=["user", "item", "rating"])
    reader = Reader(rating_scale=(1, 10))
    dataset = Dataset.load_from_df(df[["user", "item", "rating"]], reader)
    trainset = dataset.build_full_trainset()
    
    print("Training SVD model on train set...")
    algo = SVD(random_state=42)
    algo.fit(trainset)
    
    print("Computing Bayesian Baseline...")
    item_ratings = defaultdict(list)
    for u, i, r in train_data:
        item_ratings[i].append(r)
        
    all_ratings = [r for r_list in item_ratings.values() for r in r_list]
    C = np.mean(all_ratings) if all_ratings else 0.0
    m = 3
    
    item_pop = {}
    for i_id, r_list in item_ratings.items():
        v = len(r_list)
        R = np.mean(r_list)
        item_pop[i_id] = (v / (v + m)) * R + (m / (v + m)) * C
        
    pop_ranking = sorted(item_pop.keys(), key=lambda x: item_pop[x], reverse=True)
    
    print("Evaluating models...")
    K = 10
    
    svd_hits = 0
    pop_hits = 0
    total_eval_users = 0
    
    for user_id, true_items in test_data.items():
        total_eval_users += 1
        
        try:
            inner_uid = trainset.to_inner_uid(user_id)
            user_train_items = set([j for (j, _) in trainset.ur[inner_uid]])
        except ValueError:
            user_train_items = set()
            
        predictions = []
        for inner_iid in trainset.all_items():
            if inner_iid not in user_train_items:
                raw_iid = trainset.to_raw_iid(inner_iid)
                est = algo.predict(user_id, raw_iid).est
                predictions.append((raw_iid, est))
                
        predictions.sort(key=lambda x: x[1], reverse=True)
        svd_top_k_idx = set([x[0] for x in predictions[:K]])
        
        if len(svd_top_k_idx.intersection(true_items)) > 0:
            svd_hits += 1
            
        pop_top_k = []
        # user_train_items contains inner_iid, we need raw_iid
        raw_user_train_items = set()
        try:
            inner_uid = trainset.to_inner_uid(user_id)
            raw_user_train_items = set([trainset.to_raw_iid(j) for (j, _) in trainset.ur[inner_uid]])
        except ValueError:
            pass
            
        for i_id in pop_ranking:
            if i_id not in raw_user_train_items:
                pop_top_k.append(i_id)
            if len(pop_top_k) >= K:
                break
                
        pop_top_k_idx = set(pop_top_k)
        if len(pop_top_k_idx.intersection(true_items)) > 0:
            pop_hits += 1
            
    svd_recall = svd_hits / total_eval_users
    pop_recall = pop_hits / total_eval_users
    svd_precision = svd_recall / K
    pop_precision = pop_recall / K
    
    report = f"""# BookCrossing Offline Evaluation Report

## Setup
- **Split**: Leave-one-out per user (randomized with fixed seed).
- **Test Set**: 1 randomly held-out item per eligible user.
- **Excluded Users**: {excluded_users} users with only 1 interacted item were excluded from testing but kept in training.
- **Evaluation Users**: {total_eval_users}
- **Metrics**: Precision@{K}, Recall@{K}

## Results (Baseline vs Hybrid)

| Model | Recall@{K} | Precision@{K} |
|---|---|---|
| Popularity Baseline (Bayesian Avg) | {pop_recall:.4f} | {pop_precision:.4f} |
| SVD (Explicit Matrix Factorization) | {svd_recall:.4f} | {svd_precision:.4f} |

"""
    
    os.makedirs("docs/model_reports", exist_ok=True)
    with open("docs/model_reports/bookcrossing_evaluation.md", "w") as f:
        f.write(report)
        
    print("Evaluation complete. Report saved to docs/model_reports/bookcrossing_evaluation.md")

if __name__ == "__main__":
    asyncio.run(evaluate())
