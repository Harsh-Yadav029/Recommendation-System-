# CompareX

**CompareX** is a multi-domain product comparison and recommendation platform designed for real users. It serves as a recommender engine with an LLM explanation layer on top, ensuring that recommendations come from real models trained on real interaction data, rather than LLM hallucinations.

## Architecture

CompareX is built with a microservices architecture:

1.  **Frontend (`/frontend`)**: A React Single Page Application (SPA) built with Vite and styled with Tailwind CSS v4. It implements the primary product surfaces:
    *   **Browse/Search**: A filterable product grid for each domain.
    *   **Compare**: A structured comparison table for selected items.
    *   **Assistant (Chat)**: A conversational layer for explanations and filtering (layered on top of the core deterministic recommender).
    *   **Admin/Analytics**: A dashboard for system metrics and model evaluation.
2.  **API Gateway (`/gateway`)**: An Express/Node.js service that acts as the entry point for the frontend, handling:
    *   Authentication (JWT) and Session Management.
    *   Security (CSRF protection via cookies, Rate Limiting, Helmet, CORS).
    *   Proxying requests to the downstream ML Service.
3.  **ML Service (`/ml-service`)**: A FastAPI/Python backend that provides the core recommendation logic and LLM integrations:
    *   **Recommendation Engine**: Implements collaborative filtering (SVD via Surprise) and popularity baselines.
    *   **Constraint Relaxation**: Gracefully handles overly strict filters by relaxing constraints (category > budget > tags) rather than returning empty states.
    *   **LLM Client (Gemini)**: Utilizes Google's Gemini API for intent routing, constraint extraction, and natural language explanations of recommendations.
4.  **Database**: MongoDB Atlas is used as the primary data store for normalized interaction data and product metadata.

## Domains

CompareX currently supports three distinct domains, each demonstrating different levels of metadata richness and collaborative filtering capabilities:

1.  **RetailrocketEcommerce (Minimal)**: Pure collaborative filtering. Implicit feedback (views/cart/purchase) with fully anonymized IDs and no metadata.
2.  **Steam (Medium)**: Middle ground. Implicit feedback combined with basic metadata (title, item ID).
3.  **BookCrossing (Rich)**: Explicit feedback (ratings 1-10) with rich metadata (title, author, year, publisher, cover images). This domain is the primary UI showcase.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Python (3.10+)
*   Docker & Docker Compose (Optional, for local services if configured)
*   MongoDB Atlas cluster

### Environment Setup

You need to configure `.env` files in the respective service directories.

**`gateway/.env`**:
```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string
FRONTEND_URL=http://localhost:5173
```

**`ml-service/.env`**:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
ENABLED_DOMAINS=retailrocket,steam,bookcrossing
```

### Running the Services Locally

1.  **Start the ML Service**:
    ```bash
    cd ml-service
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    pip install -r requirements.txt
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

2.  **Start the Gateway**:
    ```bash
    cd gateway
    npm install
    npm run dev
    ```

3.  **Start the Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

The frontend will be available at `http://localhost:5173`.

## Core Principles

*   **Deterministic Recommender**: The recommendation engine is the source of truth. The LLM is strictly used for explanation, comparison formatting, RAG, and intent routing. It NEVER generates ranked recommendations from its own knowledge.
*   **Explainability**: The system returns the "why" alongside the "what" (via `similarity_basis` and `matched_constraints`), allowing the LLM to provide grounded, factual explanations.
*   **Additive Phases**: Development follows a strict phased approach where later phases build upon, but never contradict, earlier architectural decisions.
