import os
import asyncio
import numpy as np
import pandas as pd
from surprise import Dataset, Reader, SVD
from collections import defaultdict
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def investigate():
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
    user_train_counts = {}
    
    for user_id, items in user_interactions.items():
        if len(items) < 2:
            for i_id, score in items:
                train_data.append([user_id, i_id, score])
            continue
            
        holdout_idx = random.randint(0, len(items) - 1)
        holdout_item, holdout_score = items.pop(holdout_idx)
        test_data[user_id].add(holdout_item)
        
        user_train_counts[user_id] = len(items)
        
        for i_id, score in items:
            train_data.append([user_id, i_id, score])
            
    df = pd.DataFrame(train_data, columns=["user", "item", "rating"])
    reader = Reader(rating_scale=(1, 10))
    dataset = Dataset.load_from_df(df[["user", "item", "rating"]], reader)
    trainset = dataset.build_full_trainset()
    
    algo = SVD(random_state=42)
    algo.fit(trainset)
    
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
    
    K = 10
    
    buckets = {
        "1-4 ratings": {"users": 0, "svd_hits": 0, "pop_hits": 0, "avg_overlap": 0},
        "5-9 ratings": {"users": 0, "svd_hits": 0, "pop_hits": 0, "avg_overlap": 0},
        "10+ ratings": {"users": 0, "svd_hits": 0, "pop_hits": 0, "avg_overlap": 0}
    }
    
    for user_id, true_items in test_data.items():
        train_cnt = user_train_counts[user_id]
        if train_cnt < 5: b = "1-4 ratings"
        elif train_cnt < 10: b = "5-9 ratings"
        else: b = "10+ ratings"
        
        buckets[b]["users"] += 1
        
        try:
            inner_uid = trainset.to_inner_uid(user_id)
            user_train_items = set([j for (j, _) in trainset.ur[inner_uid]])
        except ValueError:
            user_train_items = set()
            
        preds = []
        for inner_iid in trainset.all_items():
            if inner_iid not in user_train_items:
                raw_iid = trainset.to_raw_iid(inner_iid)
                est = algo.predict(user_id, raw_iid).est
                preds.append((raw_iid, est))
                
        preds.sort(key=lambda x: x[1], reverse=True)
        svd_top_k_idx = set([x[0] for x in preds[:K]])
        
        if len(svd_top_k_idx.intersection(true_items)) > 0:
            buckets[b]["svd_hits"] += 1
            
        pop_top_k = []
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
            buckets[b]["pop_hits"] += 1
            
        overlap = len(svd_top_k_idx.intersection(pop_top_k_idx))
        buckets[b]["avg_overlap"] += overlap
        
    for b, data in buckets.items():
        if data["users"] > 0:
            data["avg_overlap"] /= data["users"]
            data["svd_recall"] = data["svd_hits"] / data["users"]
            data["pop_recall"] = data["pop_hits"] / data["users"]
            print(f"[{b}] Users: {data['users']} | Overlap (Top 10): {data['avg_overlap']:.2f} | SVD Recall: {data['svd_recall']:.4f} | Pop Recall: {data['pop_recall']:.4f}")

if __name__ == "__main__":
    asyncio.run(investigate())
