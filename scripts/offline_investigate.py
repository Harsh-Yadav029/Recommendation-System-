import pickle
import json
import numpy as np

def investigate():
    with open("models/bookcrossing_svd.pkl", "rb") as f:
        artifact = pickle.load(f)
    algo = artifact["model"]
    trainset = artifact["trainset"]
    
    with open("models/bookcrossing_baseline.json", "r") as f:
        baseline = json.load(f)
        
    pop_ranking = [x["item_id"] for x in baseline]
    
    # Bucket users by train size
    # trainset.ur is defaultdict of inner_uid -> [(inner_iid, rating), ...]
    users_by_size = {"1-4": [], "5-9": [], "10+": []}
    
    for uid, items in trainset.ur.items():
        cnt = len(items)
        if cnt < 5: users_by_size["1-4"].append(uid)
        elif cnt < 10: users_by_size["5-9"].append(uid)
        else: users_by_size["10+"].append(uid)
        
    print(f"Users by training size:")
    print(f"1-4 ratings: {len(users_by_size['1-4'])}")
    print(f"5-9 ratings: {len(users_by_size['5-9'])}")
    print(f"10+ ratings: {len(users_by_size['10+'])}")
    
    # Let's see if top 10 is identical for dense users
    K = 10
    
    for bucket_name, uids in users_by_size.items():
        if not uids:
            continue
            
        sample_uids = uids[:50] # Sample up to 50 users per bucket
        total_overlap = 0
        
        for inner_uid in sample_uids:
            raw_uid = trainset.to_raw_uid(inner_uid)
            user_items = set([j for (j, _) in trainset.ur[inner_uid]])
            
            preds = []
            for inner_iid in trainset.all_items():
                if inner_iid not in user_items:
                    raw_iid = trainset.to_raw_iid(inner_iid)
                    est = algo.predict(raw_uid, raw_iid).est
                    preds.append((raw_iid, est))
                    
            preds.sort(key=lambda x: x[1], reverse=True)
            svd_top_k = set([x[0] for x in preds[:K]])
            
            raw_user_train_items = set([trainset.to_raw_iid(j) for j in user_items])
            
            pop_top_k = []
            for i_id in pop_ranking:
                if i_id not in raw_user_train_items:
                    pop_top_k.append(i_id)
                if len(pop_top_k) >= K:
                    break
                    
            pop_top_k_set = set(pop_top_k)
            total_overlap += len(svd_top_k.intersection(pop_top_k_set))
            
        avg_overlap = total_overlap / len(sample_uids)
        print(f"[{bucket_name}] Avg overlap in Top 10 SVD vs Pop: {avg_overlap:.2f} / 10")

if __name__ == "__main__":
    investigate()
