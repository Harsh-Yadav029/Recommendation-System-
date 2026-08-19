import os
import pandas as pd
import json

def process_bookcrossing():
    raw_dir = "data/raw/bookcrossing"
    processed_dir = "data/processed/bookcrossing"
    os.makedirs(processed_dir, exist_ok=True)
    
    # Process book_ratings.dat
    ratings_df = pd.read_csv(os.path.join(raw_dir, "book_ratings.dat"), sep='\t')
    ratings_df['user_id'] = ratings_df['user'].astype(str)
    ratings_df['item_id'] = ratings_df['item'].astype(str)
    ratings_df['domain'] = 'bookcrossing'
    ratings_df['event_type'] = 'rating'
    ratings_df['value'] = ratings_df['rating'].astype(float)
    ratings_df['timestamp'] = None
    ratings_df = ratings_df[['user_id', 'item_id', 'domain', 'event_type', 'value', 'timestamp']]
    
    # Process book_history.dat
    history_df = pd.read_csv(os.path.join(raw_dir, "book_history.dat"), sep='\t')
    history_df['user_id'] = history_df['user'].astype(str)
    history_df['item_id'] = history_df['item'].astype(str)
    history_df['domain'] = 'bookcrossing'
    history_df['event_type'] = 'view'
    history_df['value'] = None
    history_df['timestamp'] = None
    history_df = history_df[['user_id', 'item_id', 'domain', 'event_type', 'value', 'timestamp']]
    
    final_inter = pd.concat([ratings_df, history_df], ignore_index=True)
    interactions_path = os.path.join(processed_dir, "interactions.parquet")
    final_inter.to_parquet(interactions_path, engine="pyarrow", index=False)
    print(f"Saved {len(final_inter)} interactions to {interactions_path}")
    
    # Process items_info.dat custom parser
    items = []
    with open(os.path.join(raw_dir, "items_info.dat"), 'r', encoding='utf-8', errors='ignore') as f:
        next(f) # skip header
        for line in f:
            splits = line.strip('\n').split('\t')
            if len(splits) > 0 and splits[-1] == '':
                splits = splits[:-1]
                
            if len(splits) == 0:
                continue
                
            if len(splits) == 9:
                book_id, isbn, title, author, year, publisher, img_s, img_m, img_l = splits
            else:
                if len(splits) < 9:
                    continue # Too few columns to salvage
                book_id, isbn = splits[0], splits[1]
                img_s, img_m, img_l = splits[-3], splits[-2], splits[-1]
                
                y_idx = -1
                for i in range(len(splits)-4, 1, -1):
                    if splits[i].isdigit():
                        y_idx = i
                        break
                
                if y_idx != -1:
                    year = splits[y_idx]
                    publisher = " ".join(splits[y_idx+1 : -3])
                    author = splits[y_idx-1]
                    title = " ".join(splits[2 : y_idx-1])
                else:
                    year = ""
                    publisher = " ".join(splits[5 : -3])
                    author = splits[4] if len(splits) > 4 else ""
                    title = " ".join(splits[2 : 4])
            
            meta = {
                "author": author if author else None,
                "year": year if year else None,
                "publisher": publisher if publisher else None,
                "isbn": isbn if isbn else None,
                "image_url_s": img_s if img_s else None,
                "image_url_m": img_m if img_m else None,
                "image_url_l": img_l if img_l else None,
            }
            # Filter out NaN/None
            meta = {k: str(v) for k, v in meta.items() if v is not None and str(v).strip() != '' and not pd.isna(v)}
            
            items.append({
                'item_id': str(book_id),
                'domain': 'bookcrossing',
                'title': title,
                'category': None,
                'price': None,
                'metadata': json.dumps(meta)
            })
            
    items_df = pd.DataFrame(items)
    items_path = os.path.join(processed_dir, "items.parquet")
    items_df.to_parquet(items_path, engine="pyarrow", index=False)
    print(f"Saved {len(items_df)} items to {items_path}")

if __name__ == "__main__":
    process_bookcrossing()
