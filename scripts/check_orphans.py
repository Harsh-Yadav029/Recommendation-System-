import pandas as pd

# Get all Book_IDs from items_info.dat by parsing manually
all_book_ids = set()
with open('data/raw/bookcrossing/items_info.dat', 'r', encoding='utf-8', errors='ignore') as f:
    next(f) # skip header
    for line in f:
        splits = line.strip('\n').split('\t')
        if len(splits) > 0:
            all_book_ids.add(splits[0])

# Get successfully parsed Book_IDs
parsed_items = pd.read_csv('data/raw/bookcrossing/items_info.dat', sep='\t', on_bad_lines='skip', index_col=False)
parsed_book_ids = set(parsed_items['Book_ID'].astype(str))

# Dropped Book_IDs
dropped_book_ids = all_book_ids - parsed_book_ids
print(f"Dropped items: {len(dropped_book_ids)}")

# Load interactions
ratings = pd.read_csv('data/raw/bookcrossing/book_ratings.dat', sep='\t')
history = pd.read_csv('data/raw/bookcrossing/book_history.dat', sep='\t')

rating_items = set(ratings['item'].astype(str))
history_items = set(history['item'].astype(str))
all_interaction_items = rating_items | history_items

orphaned = dropped_book_ids.intersection(all_interaction_items)
print(f"Orphaned dropped items referenced in interactions: {len(orphaned)}")
