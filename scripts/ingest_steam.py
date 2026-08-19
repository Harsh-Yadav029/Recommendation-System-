import os
import pandas as pd
import json

def process_steam():
    raw_dir = "data/raw/steam"
    processed_dir = "data/processed/steam"
    os.makedirs(processed_dir, exist_ok=True)
    
    # Process game_play.dat
    play_df = pd.read_csv(os.path.join(raw_dir, "game_play.dat"), sep='\t')
    play_df['user_id'] = play_df['User_ID'].astype(str)
    play_df['item_id'] = play_df['Game_ID'].astype(str)
    play_df['domain'] = 'steam'
    play_df['event_type'] = 'play'
    play_df['value'] = play_df['Hours'].astype(float)
    play_df['timestamp'] = None
    play_df = play_df[['user_id', 'item_id', 'domain', 'event_type', 'value', 'timestamp']]
    
    # Process game_purchase.dat
    purch_df = pd.read_csv(os.path.join(raw_dir, "game_purchase.dat"), sep='\t')
    purch_df['user_id'] = purch_df['User_ID'].astype(str)
    purch_df['item_id'] = purch_df['Game_ID'].astype(str)
    purch_df['domain'] = 'steam'
    purch_df['event_type'] = 'purchase'
    purch_df['value'] = purch_df['Purchase'].astype(float)
    purch_df['timestamp'] = None
    purch_df = purch_df[['user_id', 'item_id', 'domain', 'event_type', 'value', 'timestamp']]
    
    final_inter = pd.concat([play_df, purch_df], ignore_index=True)
    interactions_path = os.path.join(processed_dir, "interactions.parquet")
    final_inter.to_parquet(interactions_path, engine="pyarrow", index=False)
    print(f"Saved {len(final_inter)} interactions to {interactions_path}")
    
    # Process item_info.dat
    item_info = pd.read_csv(os.path.join(raw_dir, "item_info.dat"), sep='\t')
    items_df = pd.DataFrame()
    items_df['item_id'] = item_info['Game_ID'].astype(str)
    items_df['domain'] = 'steam'
    items_df['title'] = item_info['Game Name']
    items_df['category'] = None
    items_df['price'] = None
    items_df['metadata'] = [json.dumps({}) for _ in range(len(items_df))]
    
    items_path = os.path.join(processed_dir, "items.parquet")
    items_df.to_parquet(items_path, engine="pyarrow", index=False)
    print(f"Saved {len(items_df)} items to {items_path}")

if __name__ == "__main__":
    process_steam()
