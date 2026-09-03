# 🛍️ CompareX: Analytical Recommendation Engine

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

**CompareX** is a multi-domain product comparison and recommendation platform designed for real users. 

Unlike simple "AI Wrappers" that rely on LLM hallucinations to guess products, CompareX uses a **deterministic hybrid recommendation engine** trained on real interaction data. An LLM (Google Gemini) sits purely on top of this engine as an *explanation and routing layer*, guaranteeing that recommendations are always factually grounded in real databases.

---

## ✨ Key Features

- **Multi-Domain Recommendations**: Seamlessly switch between BookCrossing (Books) and Steam (Games).
- **Secure Authentication**: JWT-based secure user registration, login, and HttpOnly session management.
- **Dynamic Constraint Relaxation**: If your filters are too strict, the engine intelligently relaxes them (e.g., drops tags before budget) instead of returning a frustrating empty screen.
- **AI-Powered Explanations**: Gemini evaluates the deterministic `similarity_basis` scores returned by the Recommender, translating complex math into natural language for the user.
- **Side-by-Side Comparisons**: Select multiple items and instantly generate a structured comparison matrix.
- **Expert Assistant Chat**: Talk to the recommendation engine to refine searches or ask why a specific item was chosen for you.

---

## 🏗️ Architecture Stack

CompareX is built on a scalable microservices architecture spanning three independent systems:

### 1. Frontend (`/frontend`)
A blazing fast React Single Page Application (SPA) built with Vite and Tailwind CSS. 
- **Browse/Search**: A filterable product grid with category, budget, and tag dropdowns.
- **Comparison Engine**: Real-time side-by-side matrices.
- **State Management**: React Hooks and Context for complex cross-component state (like the floating Compare bar).
- **Proxy Routing**: Uses Vite proxying in dev, and Vercel edge rewrites in production, completely eliminating CORS issues.

### 2. API Gateway (`/gateway`)
An Express/Node.js service acting as the central nervous system.
- **Security First**: Protected via `helmet`, `cors`, `express-rate-limit`, and robust CSRF token generation.
- **JWT Auth**: Issues and validates `HttpOnly` access tokens (15m) and refresh tokens (7d).
- **Proxy**: Securely authenticates users before proxying allowed traffic to the internal Python ML Service.

### 3. ML Service (`/ml-service`)
A FastAPI/Python backend doing the heavy lifting.
- **Machine Learning**: Implements SVD (Singular Value Decomposition) and ALS (Alternating Least Squares) models via `Surprise` and `implicit`.
- **Constraint Engine**: Custom algorithms to filter vectors based on rigid user requirements.
- **LLM Client**: Secure, isolated Google Gemini integrations.

---

## 🗄️ Domain Ecosystem

CompareX relies on real-world datasets from [caserec/Datasets-for-Recommender-Systems](https://github.com/caserec/Datasets-for-Recommender-Systems).

| Domain | Data Type | Feedback | Strengths |
| :--- | :--- | :--- | :--- |
| **BookCrossing** | Rich Metadata | Explicit (1-10) | UI Showcase. Includes titles, authors, years, and Amazon cover images. |
| **Steam** | Medium | Implicit | Combines user playtime data with basic titles and item IDs. |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas Cluster (Free Tier is fine)

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
> **Windows DNS Bug**: If you encounter a `querySrv ECONNREFUSED` error on Windows, Node.js is failing to resolve the SRV record. Replace `mongodb+srv://...` with the direct node replica set string (e.g., `mongodb://user:pass@node1:27017,node2:27017...`).

**ML Service (`ml-service/.env`)**:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster...
GEMINI_API_KEY=your_google_gemini_api_key
ENABLED_DOMAINS=steam,bookcrossing
```

### 2. Booting the Services

You will need three separate terminal windows.

**Terminal 1: ML Service (Python)**
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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

Visit `http://localhost:5173` in your browser. You will be greeted by the Landing page and must Register/Login to access the dashboard!

---

## ☁️ Deployment Guide

This project is fully configured for zero-cost deployment on **Vercel** (Frontend) and **Render** (Gateway & ML Service).

### Step 1: MongoDB Network Access
Cloud PaaS providers like Vercel and Render use dynamic outbound IPs. You MUST go to your MongoDB Atlas dashboard -> Network Access, and ensure the IP Whitelist is set to `0.0.0.0/0` (Allow Access from Anywhere).

### Step 2: Render (Backend Services)
1. Log into Render and click **New -> Blueprint**.
2. Connect this GitHub repository.
3. Render will automatically detect the `render.yaml` file in the root directory.
4. It will spin up **two** Web Services:
   - `comparex-gateway` (Node.js)
   - `comparex-ml-service` (Python FastAPI)
5. Provide your environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) when prompted.
6. Once deployed, copy the URL for the `comparex-gateway` (e.g., `https://comparex-gateway-xyz.onrender.com`).

### Step 3: Vercel (Frontend)
1. Open `frontend/vercel.json` in your code.
2. Replace `YOUR_GATEWAY_URL` with the actual Gateway URL you got from Render in Step 2.
3. Commit and push this change to GitHub.
4. Log into Vercel and click **Add New -> Project**.
5. Import this repository. **Crucial**: Set the Root Directory to `frontend`.
6. Click Deploy. Vercel will automatically detect Vite, build the React app, and use the `vercel.json` file to proxy all `/api/*` traffic seamlessly to your Render backend, entirely bypassing CORS restrictions.

---

## 🔒 Core Engineering Principles

- **No AI Hallucinations**: The LLM is strictly forbidden from generating ranked recommendations from its own knowledge.
- **Explainability Contract**: The backend must always return the "why" alongside the "what" via a `similarity_basis` string. 
- **Graceful Fallbacks**: If a real model fails to load or constraints are too strict, the system gracefully falls back to a popularity baseline or relaxed constraints, rather than crashing with unhandled errors.
