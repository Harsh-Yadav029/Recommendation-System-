import os
import asyncio
import numpy as np
import pandas as pd
from surprise import Dataset, Reader, SVD
from collections import defaultdict
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
    
    # 1. Check user counts
    total_rating_users = len(await interactions.distinct("user_id", {"domain": "bookcrossing", "event_type": "rating", "value": {"$gt": 0}}))
    total_history_users = len(await interactions.distinct("user_id", {"domain": "bookcrossing", "event_type": {"$ne": "rating"}}))
    total_any_users = len(await interactions.distinct("user_id", {"domain": "bookcrossing"}))
    
    print(f"Users with >0 ratings: {total_rating_users}")
    print(f"Users with history events: {total_history_users}")
    print(f"Total distinct users in domain: {total_any_users}")
    
    # 2. Re-train and compare top 10 predictions
    cursor = interactions.find({"domain": "bookcrossing", "event_type": "rating"})
    user_interactions = defaultdict(list)
    async for doc in cursor:
        user_id = str(doc["user_id"])
        item_id = str(doc["item_id"])
        value = doc.get("value")
        if value is not None and value > 0:
            user_interactions[user_id].append((item_id, value))
            
    train_data = []
    for u, items in user_interactions.items():
        for i, s in items:
            train_data.append([u, i, s])
            
    df = pd.DataFrame(train_data, columns=["user", "item", "rating"])
    reader = Reader(rating_scale=(1, 10))
    dataset = Dataset.load_from_df(df[["user", "item", "rating"]], reader)
    trainset = dataset.build_full_trainset()
    
    algo = SVD(random_state=42)
    algo.fit(trainset)
    
    # Bayesian
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
    
    print("\nComparing Top 10 for User '0':")
    # Just take the first user
    test_user = list(user_interactions.keys())[0]
    
    user_train_items = set()
    try:
        inner_uid = trainset.to_inner_uid(test_user)
        user_train_items = set([trainset.to_raw_iid(j) for (j, _) in trainset.ur[inner_uid]])
    except Exception:
        pass
        
    preds = []
    for inner_iid in trainset.all_items():
        raw_iid = trainset.to_raw_iid(inner_iid)
        if raw_iid not in user_train_items:
            est = algo.predict(test_user, raw_iid).est
            preds.append((raw_iid, est))
            
    preds.sort(key=lambda x: x[1], reverse=True)
    
    pop_top = [i for i in pop_ranking if i not in user_train_items][:10]
    svd_top = [x[0] for x in preds[:10]]
    
    print(f"Bayesian Top 10: {pop_top}")
    print(f"SVD Top 10:      {svd_top}")
    
    # Check if they are identical
    print(f"Overlap: {len(set(pop_top).intersection(set(svd_top)))}")

if __name__ == "__main__":
    asyncio.run(investigate())
