import os
import pandas as pd

def process_interactions():
    raw_dir = "data/raw/retailrocket"
    processed_dir = "data/processed/retailrocket"
    os.makedirs(processed_dir, exist_ok=True)
    
    files = {
        "view_ecommerce.dat": "view",
        "add_to_cart_ecommerce.dat": "add_to_cart",
        "purchase_ecommerce.dat": "purchase"
    }
    
    all_interactions = []
    
    for filename, event_type in files.items():
        filepath = os.path.join(raw_dir, filename)
        df = pd.read_csv(filepath, sep='\t')
        
        df['user_id'] = df['visitorid'].astype(str)
        df['item_id'] = df['itemid'].astype(str)
        df['domain'] = 'retailrocket'
        df['event_type'] = event_type
        df['value'] = None
        df['timestamp'] = None
        
        df = df[['user_id', 'item_id', 'domain', 'event_type', 'value', 'timestamp']]
        all_interactions.append(df)
        
    final_df = pd.concat(all_interactions, ignore_index=True)
    
    # Write interactions parquet
    interactions_path = os.path.join(processed_dir, "interactions.parquet")
    final_df.to_parquet(interactions_path, engine="pyarrow", index=False)
    print(f"Saved {len(final_df)} interactions to {interactions_path}")
    
    # Items: extract unique item_id from interactions
    unique_items = final_df['item_id'].unique()
    import json
    items_df = pd.DataFrame({
        'item_id': unique_items,
        'domain': 'retailrocket',
        'title': None,
        'category': None,
        'price': None,
        'metadata': [json.dumps({}) for _ in range(len(unique_items))]
    })
    
    items_path = os.path.join(processed_dir, "items.parquet")
    items_df.to_parquet(items_path, engine="pyarrow", index=False)
    print(f"Saved {len(items_df)} items to {items_path}")

if __name__ == "__main__":
    process_interactions()
