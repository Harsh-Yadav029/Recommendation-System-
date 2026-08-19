# CompareX Data Dictionary

This document provides a data dictionary for the three domains used in CompareX. 

## 1. RetailrocketEcommerce

- **Source files and formats**:
  - `view_ecommerce.dat` (TSV)
  - `add_to_cart_ecommerce.dat` (TSV)
  - `purchase_ecommerce.dat` (TSV)
  - `README.md` (data dictionary)
- **Row counts (approximate)**: 
  - Views: 78,371 rows
  - Add to cart: 9,028 rows
  - Purchases: 5,088 rows
- **Feedback type**: Implicit (Views, Add to Carts, Purchases)
- **Columns**:
  - `visitorid`: Numeric identifier for the user.
  - `itemid`: Numeric identifier for the item.
  - `event`: Event type indicator (value is always `1` in these pre-separated files).
- **Data quality concerns**:
  - `timestamp`: Not available in source data (this is expected).
  - The `event` column is redundant as files are already separated by event type.
- **Metadata richness**: None. There are no price, category, title, or genre fields available. This domain serves as the pure collaborative-filtering proof domain.

---

## 2. Steam

- **Source files and formats**:
  - `game_play.dat` (TSV)
  - `game_purchase.dat` (TSV)
  - `item_info.dat` (TSV)
  - `user_info.dat` (TSV)
  - `README.md` (data dictionary)
- **Row counts (approximate)**:
  - Play: 70,490 rows
  - Purchases: 129,512 rows
  - Items: 5,155 rows
  - Users: 12,393 rows
- **Feedback type**: Implicit (Purchase = 1.0, Play = hours played)
- **Columns**:
  - Interactions:
    - `User_ID`: Numeric identifier for the user.
    - `Game_ID`: Numeric identifier for the game.
    - `Purchase` / `Hours`: Value indicating the degree of interaction (1.0 for purchase, hours for play).
  - Items:
    - `Game_ID`: Numeric identifier for the game.
    - `Game Name`: The title of the game.
- **Data quality concerns**:
  - `timestamp`: Not available in source data (this is expected).
  - The README describes `items_info.dat` and `users_info.dat`, but the actual extracted files are `item_info.dat` and `user_info.dat`.
- **Metadata richness**: Title only. No category, price, or genre metadata available.

---

## 3. BookCrossing

- **Source files and formats**:
  - `book_history.dat` (TSV)
  - `book_ratings.dat` (TSV)
  - `items_info.dat` (TSV)
  - `users_info.dat` (TSV)
  - `README.md` (data dictionary)
- **Row counts (approximate)**:
  - History: 272,679 rows
  - Ratings: 62,657 rows
  - Items: 17,384 rows
  - Users: 2,946 rows
- **Feedback type**: Explicit (ratings 1-10) and Implicit (history/access)
- **Columns**:
  - Interactions:
    - `user` / `user id`: Numeric identifier for the user.
    - `item` / `item id`: Numeric identifier for the book.
    - `rating` / `accessed`: Rating score (1-10) or implicit access flag.
  - Items:
    - `Book_ID`: Numeric identifier for the book.
    - `ISBN`: International Standard Book Number.
    - `Book-Title`: Title of the book.
    - `Book-Author`: Author of the book.
    - `Year-Of-Publication`: Year the book was published.
    - `Publisher`: Publisher of the book.
    - `Image-URL-S` / `Image-URL-M` / `Image-URL-L`: URLs to book cover images.
- **Data quality concerns**:
  - `timestamp`: Not available in source data (this is expected).
  - Some `Book-Title` and `Publisher` fields contain unescaped HTML entities (e.g., `&amp` instead of `&`). Frontend display code should HTML-decode these fields when rendering in Browse/Compare (or they can be cleaned during ingestion).
- **Metadata richness**: High (Title, Author, Year, Publisher, Cover Images). This makes BookCrossing the primary UI-showcase domain candidate.

---

## 4. Anime

- **Source files and formats**:
  - `anime_history.dat` (TSV)
  - `anime_ratings.dat` (TSV)
  - `anime_info.dat` (TSV)
  - `README.md` (data dictionary)
- **Row counts (approximate)**:
  - History: 520,610 rows
  - Ratings: 419,944 rows
  - Items: ~7,392 rows
  - Users: 5,000 rows
- **Feedback type**: Explicit (ratings 1-10) and Implicit (history)
- **Columns**:
  - Interactions:
    - `User_ID`: Numeric identifier for the user.
    - `Anime_ID`: Numeric identifier for the anime.
    - `Feedback`: Rating score (1-10) or implicit access flag.
  - Items:
    - `anime_ids`: Numeric identifier for the anime.
    - `name`: Full name of anime.
    - `genre`: Comma separated list of genres for this anime.
    - `type`: movie, TV, OVA, etc.
    - `episodes`: How many episodes in this show. (1 if movie).
    - `rating`: Average rating out of 10 for this anime.
    - `members`: Number of community members that are in this anime's "group".
- **Data quality concerns**:
  - `timestamp`: Not available in source data (this is expected).
- **Metadata richness**: High (Name, Genre, Type, Episodes, Average Rating, Members). This makes Anime a strong UI-showcase domain candidate alongside BookCrossing, particularly with its detailed genre classifications.
