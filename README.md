# 🛍️ CompareX: Analytical Recommendation Engine

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-1A1A1A?style=for-the-badge&logo=pinecone&logoColor=white)

**CompareX** is a multi-domain product comparison and recommendation platform designed for real users. 

Unlike simple "AI Wrappers" that rely on LLM hallucinations to guess products, CompareX uses a **deterministic hybrid recommendation engine** trained on real interaction data. An LLM (Google Gemini / Groq / Claude) sits purely on top of this engine as an *explanation and routing layer*, guaranteeing that recommendations are always factually grounded in real databases.

---

## 🏗️ Project Structure

The repository is structured as a modern microservices monorepo:

```text
comparex/
├── frontend/                # React SPA (Vite + TailwindCSS)
│   ├── src/components/      # UI Surfaces (Browse, Compare, Chat, Login)
│   └── src/hooks/           # Custom React hooks for API state management
├── gateway/                 # Express.js API Gateway
│   ├── controllers/         # Auth & Proxy controllers
│   ├── middleware/          # JWT Verification, CSRF, Rate Limiting
│   └── models/              # Mongoose Schemas (User)
├── ml-service/              # Python FastAPI Machine Learning backend
│   ├── app/api/             # FastAPI routes (recommender, assistant)
│   ├── app/core/            # Global connections (Mongo, Pinecone, Embeddings)
│   ├── app/domains/         # Domain-specific recommender logic (Anime, Steam, Books)
│   └── app/llm/             # Hybrid LLM Client (Gemini -> Groq -> Claude fallback)
├── models/                  # Pickled ML models (ALS, SVD) & baseline JSONs
└── data/                    # Raw datasets & ingestion scripts
```

---

## 🔄 Complete Code & Data Flow

### 1. Authentication Flow
- **Registration/Login**: The user enters credentials on the `frontend`. The request is sent to the Node.js `gateway`.
- **Validation**: The gateway hashes passwords using `bcrypt` and validates against MongoDB. Google OAuth is also supported via `@react-oauth/google`.
- **Session**: On success, the gateway issues an HttpOnly, secure JWT cookie, protecting against XSS attacks. 

### 2. Standard Recommendation Flow
When a user navigates to the Browse page (e.g., Anime):
1. **Request**: The frontend requests `/api/recommend/anime`.
2. **Proxy**: The gateway verifies the JWT cookie and proxies the request to the `ml-service`.
3. **ML Service Processing**: 
   - Uses the `AnimeService` which implements the `BaseRecommenderService` contract.
   - Generates personalized recommendations using **Explicit Matrix Factorization (SVD)** or **Alternating Least Squares (ALS)**.
   - If constraints (budget, genre) are too strict, it triggers `relax_constraints_and_retry` to smoothly expand the search.
   - Enriches the ML output with item metadata stored in MongoDB via a highly optimized, global `MongoManager` connection pool.
4. **Response**: The frontend renders `DomainProductCard`s using the structured JSON response.

### 3. AI Assistant & Semantic Search Flow
When a user opens the side chat panel and asks *"Suggest me a relaxing strategy game"*:
1. **LLM Routing**: The `ml-service` uses `HybridLLMClient` to route the prompt to the primary LLM (Gemini). If Gemini hits rate limits (429), it automatically cascades to Groq, and then to Claude.
2. **Intent Classification**: The LLM securely parses the natural language to classify the intent (`recommend`, `compare`, etc.) and extracts JSON constraints (`{"similar_to_title": "relaxing strategy game"}`).
3. **Vector Search (Pinecone)**:
   - If thematic/natural language queries are detected, the local `EmbeddingsClient` (SentenceTransformers) converts the query into a dense vector embedding.
   - `PineconeClient` performs a semantic similarity search across the cloud vector database for the active domain.
4. **Explanation**: The semantically recommended items are fed *back* to the LLM. Using strict *No-Fabrication Style Instructions*, the LLM explains *why* the item was chosen based strictly on its `similarity_basis` and real metadata.
5. **UI Update**: The frontend chat panel streams the conversational response while seamlessly rendering actual, clickable product UI cards inline with the text.

---

## ✨ Key Features

- **Multi-Domain Recommendations**: Seamlessly switch between BookCrossing (Books), Steam (Games), and Anime.
- **Semantic & Collaborative Filtering**: Combines Pinecone vector searches with implicit/explicit collaborative models.
- **Dynamic Constraint Relaxation**: If your filters are too strict, the engine intelligently relaxes them instead of returning an empty screen.
- **Hybrid LLM Infrastructure**: Reliable AI parsing with built-in cascading fallbacks across multiple top-tier providers.
- **Side-by-Side Comparisons**: Select multiple items and instantly generate a structured comparison matrix.

---

## 🗄️ Domain Ecosystem

| Domain | ML Model | Vector Search | Strengths |
| :--- | :--- | :--- | :--- |
| **BookCrossing** | Baseline Fallbacks | Yes | UI Showcase. Includes titles, authors, years, and Amazon cover images. |
| **Steam** | ALS (Implicit) | Yes | Combines user playtime data with themes and genres. |
| **Anime** | SVD (Explicit) | Yes | Studio, episode counts, and structured ratings. |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas Cluster (Free Tier is fine)
- Pinecone Index (Dimension 384, Cosine)

### 1. Environment Configuration

You must create two `.env` files.

**Gateway (`gateway/.env`)**:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster...
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

**ML Service (`ml-service/.env`)**:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster...
PINECONE_API_KEY=your_pinecone_key
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_claude_api_key
```

### 2. Booting the Services

You will need three separate terminal windows.

**Terminal 1: ML Service (Python)**
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2: API Gateway (Node.js)**
```bash
cd gateway
npm install
npm run dev
```

**Terminal 3: Frontend (React)**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide

This project is fully configured for zero-cost deployment on **Vercel** (Frontend) and **Render** (Gateway & ML Service).

1. **MongoDB & Pinecone**: Ensure network access allows inbound traffic (`0.0.0.0/0`).
2. **Render**: Spin up two Web Services (`gateway` and `ml-service`) using the `render.yaml` Blueprint.
3. **Vercel**: Deploy the `/frontend` directory and update `vercel.json` to proxy traffic to your Render Gateway URL.
