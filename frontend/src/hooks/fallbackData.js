// Static curated fallback data — shown when the ML service is rate-limited or unavailable
// Matches the shape of the API response items for each domain

export const FALLBACK_DATA = {
  books: [
    { item_id: "b001", title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", year: 1979, rating: 4.2, cover_url: "https://covers.openlibrary.org/b/id/8739161-L.jpg", genre: "Science Fiction", isbn: "0345391802" },
    { item_id: "b002", title: "1984", author: "George Orwell", year: 1949, rating: 4.7, cover_url: "https://covers.openlibrary.org/b/id/8575708-L.jpg", genre: "Dystopian Fiction", isbn: "0451524934" },
    { item_id: "b003", title: "Dune", author: "Frank Herbert", year: 1965, rating: 4.4, cover_url: "https://covers.openlibrary.org/b/id/8701370-L.jpg", genre: "Science Fiction", isbn: "0441013597" },
    { item_id: "b004", title: "The Name of the Wind", author: "Patrick Rothfuss", year: 2007, rating: 4.5, cover_url: "https://covers.openlibrary.org/b/id/8732150-L.jpg", genre: "Fantasy", isbn: "0756404746" },
    { item_id: "b005", title: "Foundation", author: "Isaac Asimov", year: 1951, rating: 4.3, cover_url: "https://covers.openlibrary.org/b/id/9255566-L.jpg", genre: "Science Fiction", isbn: "0553293354" },
    { item_id: "b006", title: "The Way of Kings", author: "Brandon Sanderson", year: 2010, rating: 4.6, cover_url: "https://covers.openlibrary.org/b/id/8749999-L.jpg", genre: "Epic Fantasy", isbn: "0765326361" },
    { item_id: "b007", title: "Ender's Game", author: "Orson Scott Card", year: 1985, rating: 4.3, cover_url: "https://covers.openlibrary.org/b/id/6979616-L.jpg", genre: "Science Fiction", isbn: "0812550706" },
    { item_id: "b008", title: "A Game of Thrones", author: "George R.R. Martin", year: 1996, rating: 4.4, cover_url: "https://covers.openlibrary.org/b/id/8743174-L.jpg", genre: "Fantasy", isbn: "0553381687" },
    { item_id: "b009", title: "Neuromancer", author: "William Gibson", year: 1984, rating: 4.1, cover_url: "https://covers.openlibrary.org/b/id/8479613-L.jpg", genre: "Cyberpunk", isbn: "0441569595" },
    { item_id: "b010", title: "The Martian", author: "Andy Weir", year: 2011, rating: 4.4, cover_url: "https://covers.openlibrary.org/b/id/8226874-L.jpg", genre: "Science Fiction", isbn: "0553418025" },
    { item_id: "b011", title: "Mistborn", author: "Brandon Sanderson", year: 2006, rating: 4.4, cover_url: "https://covers.openlibrary.org/b/id/7875971-L.jpg", genre: "Fantasy", isbn: "0765311785" },
    { item_id: "b012", title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, rating: 4.6, cover_url: "https://covers.openlibrary.org/b/id/8405797-L.jpg", genre: "Fantasy", isbn: "0547928227" },
  ],

  steam: [
    { item_id: "s001", title: "Hollow Knight", developer: "Team Cherry", genres: ["Action", "Metroidvania", "Indie"], rating: 9.5, playtime_avg: 40, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg", themes: ["Dark Fantasy"] },
    { item_id: "s002", title: "Stardew Valley", developer: "ConcernedApe", genres: ["Simulation", "RPG", "Indie"], rating: 9.6, playtime_avg: 80, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg", themes: ["Farming", "Relaxing"] },
    { item_id: "s003", title: "Hades", developer: "Supergiant Games", genres: ["Roguelike", "Action", "Indie"], rating: 9.5, playtime_avg: 60, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg", themes: ["Greek Mythology"] },
    { item_id: "s004", title: "Terraria", developer: "Re-Logic", genres: ["Action", "Adventure", "Sandbox"], rating: 9.7, playtime_avg: 120, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg", themes: ["Exploration", "Building"] },
    { item_id: "s005", title: "The Witcher 3", developer: "CD PROJEKT RED", genres: ["RPG", "Open World", "Action"], rating: 9.8, playtime_avg: 150, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg", themes: ["Dark Fantasy"] },
    { item_id: "s006", title: "Portal 2", developer: "Valve", genres: ["Puzzle", "Co-op", "First-Person"], rating: 9.8, playtime_avg: 15, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg", themes: ["Sci-Fi", "Comedy"] },
    { item_id: "s007", title: "Celeste", developer: "Maddy Makes Games", genres: ["Platformer", "Indie", "Difficult"], rating: 9.5, playtime_avg: 12, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg", themes: ["Mental Health", "Mountain"] },
    { item_id: "s008", title: "Dead Cells", developer: "Motion Twin", genres: ["Roguelike", "Action", "Platformer"], rating: 9.0, playtime_avg: 45, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg", themes: ["Dark", "Metroidvania"] },
    { item_id: "s009", title: "Disco Elysium", developer: "ZA/UM", genres: ["RPG", "Detective", "Narrative"], rating: 9.5, playtime_avg: 30, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg", themes: ["Neo-Noir", "Politics"] },
    { item_id: "s010", title: "Sekiro: Shadows Die Twice", developer: "FromSoftware", genres: ["Action", "Soulslike", "Difficult"], rating: 9.4, playtime_avg: 55, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg", themes: ["Feudal Japan", "Ninja"] },
    { item_id: "s011", title: "Deep Rock Galactic", developer: "Ghost Ship Games", genres: ["Co-op", "Shooter", "Indie"], rating: 9.7, playtime_avg: 100, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/548430/header.jpg", themes: ["Space Mining", "Dwarves"] },
    { item_id: "s012", title: "Divinity: Original Sin 2", developer: "Larian Studios", genres: ["RPG", "Turn-Based", "Strategy"], rating: 9.6, playtime_avg: 130, image_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/435150/header.jpg", themes: ["High Fantasy"] },
  ],

  anime: [
    { item_id: "a001", title: "Fullmetal Alchemist: Brotherhood", studio: "Bones", genres: ["Action", "Adventure", "Drama"], rating: 9.1, episodes: 64, image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg", year: 2009 },
    { item_id: "a002", title: "Steins;Gate", studio: "White Fox", genres: ["Sci-Fi", "Thriller", "Romance"], rating: 9.1, episodes: 24, image_url: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", year: 2011 },
    { item_id: "a003", title: "Hunter x Hunter (2011)", studio: "Madhouse", genres: ["Action", "Adventure", "Fantasy"], rating: 9.0, episodes: 148, image_url: "https://cdn.myanimelist.net/images/anime/11/33657.jpg", year: 2011 },
    { item_id: "a004", title: "Attack on Titan", studio: "MAPPA", genres: ["Action", "Dark Fantasy", "Drama"], rating: 9.1, episodes: 94, image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", year: 2013 },
    { item_id: "a005", title: "Death Note", studio: "Madhouse", genres: ["Psychological", "Thriller", "Supernatural"], rating: 8.6, episodes: 37, image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", year: 2006 },
    { item_id: "a006", title: "Vinland Saga", studio: "Wit Studio", genres: ["Action", "Historical", "Drama"], rating: 8.7, episodes: 48, image_url: "https://cdn.myanimelist.net/images/anime/1500/103005.jpg", year: 2019 },
    { item_id: "a007", title: "Demon Slayer", studio: "ufotable", genres: ["Action", "Fantasy", "Supernatural"], rating: 8.7, episodes: 52, image_url: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", year: 2019 },
    { item_id: "a008", title: "Cowboy Bebop", studio: "Sunrise", genres: ["Sci-Fi", "Action", "Jazz"], rating: 8.8, episodes: 26, image_url: "https://cdn.myanimelist.net/images/anime/4/19644.jpg", year: 1998 },
    { item_id: "a009", title: "Neon Genesis Evangelion", studio: "Gainax", genres: ["Mecha", "Psychological", "Drama"], rating: 8.5, episodes: 26, image_url: "https://cdn.myanimelist.net/images/anime/7/76358.jpg", year: 1995 },
    { item_id: "a010", title: "Mob Psycho 100", studio: "Bones", genres: ["Action", "Supernatural", "Comedy"], rating: 8.9, episodes: 37, image_url: "https://cdn.myanimelist.net/images/anime/8/80356.jpg", year: 2016 },
    { item_id: "a011", title: "Made in Abyss", studio: "Kinema Citrus", genres: ["Adventure", "Dark Fantasy", "Mystery"], rating: 8.7, episodes: 13, image_url: "https://cdn.myanimelist.net/images/anime/6/86733.jpg", year: 2017 },
    { item_id: "a012", title: "Jujutsu Kaisen", studio: "MAPPA", genres: ["Action", "Supernatural", "Dark Fantasy"], rating: 8.7, episodes: 48, image_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", year: 2020 },
  ]
};
