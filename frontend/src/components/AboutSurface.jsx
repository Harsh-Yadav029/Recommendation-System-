import React from 'react';

export function AboutSurface({ onNavigate, onSignIn, onSignUp, user, onLogout, onStart }) {
  return (
    <div className="min-h-screen flex flex-col font-sans w-full antialiased selection:bg-emerald-500/30 bg-gray-50 relative">
      {/* Hero Background with Gradient Fade */}
      <div className="absolute top-0 left-0 w-full h-[65vh] z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/hero_bg.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-gray-50"></div>
      </div>

      {/* TopNavBar */}
      <nav className="bg-black/30 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 shadow-sm">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          {/* Logo - Left */}
          <div className="flex items-center w-1/3">
            <button 
              onClick={() => onNavigate('landing')} 
              className="font-bold text-2xl text-emerald-400 tracking-tight drop-shadow-md text-left cursor-pointer transition-transform hover:scale-105"
            >
              CompareX
            </button>
          </div>
          
          {/* Nav Links - Center */}
          <div className="hidden md:flex items-center justify-center gap-8 w-1/3">
            <button 
              onClick={() => onNavigate('landing')} 
              className="text-white/70 font-medium hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('about')} 
              className="text-emerald-300 font-semibold border-b-2 border-emerald-400 pb-1 cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => onNavigate('features')} 
              className="text-white/70 font-medium hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
          </div>

          {/* Profile / Actions - Right */}
          <div className="flex items-center justify-end gap-5 w-1/3">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('browse')}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                >
                  Go to App
                </button>
                <button onClick={onLogout} className="text-white/70 hover:text-red-400 transition-colors font-medium text-sm">
                  Sign Out
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center uppercase text-sm border border-emerald-500/30">
                  {user.email[0]}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={onSignIn} className="text-white/80 hover:text-white font-medium px-4 py-2 transition-colors cursor-pointer">
                  Sign In
                </button>
                <button onClick={onSignUp} className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-5 py-2 rounded-md transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="relative pt-36 pb-16 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-xl">
            Bridging Heterogeneous Data with Algorithmic Honesty
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            CompareX is an advanced multi-domain recommendation and comparison platform engineered to resolve the structural disparity between sparse, heterogeneous datasets and deliver explainable decision intelligence.
          </p>
        </div>
      </section>

      {/* Mission & Core Philosophy */}
      <section className="py-12 px-6 relative z-10 -mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Data Honesty Philosophy</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Traditional recommenders often mask dataset sparsity with artificial imputations. CompareX adopts a functionalist approach: we highlight missing metadata with explicit indicators, preventing misleading conclusions while preserving data integrity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Domain Harmonization</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Whether handling implicit playtime engagement (Steam) or sparse explicit review matrices (BookCrossing), CompareX applies domain-tailored collaborative filtering models.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">LLM-Assisted Synthesis</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Algorithmic scores alone cannot explain trade-offs. Powered by Google Gemini Flash, CompareX converts mathematical similarities into natural language justifications, comparison matrices, and interactive reasoning chips.
            </p>
          </div>
        </div>
      </section>

      {/* Dataset & Domain Deep Dive */}
      <section className="py-16 px-6 bg-white border-y border-gray-200 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Supported Analytical Domains</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base">
              Each domain in CompareX represents a distinct data challenge requiring specialized processing and algorithmic modeling.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto gap-8">
            {/* Domain 1: BookCrossing */}
            <div className="bg-gray-50 rounded-2xl p-7 border border-gray-200 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Explicit Feedback</span>
                  <span className="text-xs text-gray-500 font-medium">SVD Matrix Factorization</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">menu_book</span>
                  BookCrossing
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Real-world book rating ecosystem with rich metadata (titles, authors, publication years, ISBNs, and cover imagery). Models reader preferences across high sparsity.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600"><span className="font-medium">Interaction Type:</span><span>1–10 Explicit Ratings</span></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Sparsity Index:</span><span className="text-emerald-600 font-semibold">99.8%</span></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Primary Recommender:</span><span>Surprise SVD / Popularity</span></div>
              </div>
            </div>

            {/* Domain 2: Steam Games */}
            <div className="bg-gray-50 rounded-2xl p-7 border border-gray-200 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">Playtime Dynamics</span>
                  <span className="text-xs text-gray-500 font-medium">Implicit ALS</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600">sports_esports</span>
                  Steam Games
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Analyzes game purchases and accumulated play hours as implicit confidence signals. Features rich categorical metadata including tags, genres, reviews, and developer trees.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600"><span className="font-medium">Interaction Type:</span><span>Purchases & Hours Played</span></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Sparsity Index:</span><span className="text-emerald-600 font-semibold">Moderate</span></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Primary Recommender:</span><span>Implicit Matrix Factorization</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">System Architecture & Engineering</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-base">
              Built as a decoupled, asynchronous microservices architecture prioritizing sub-second latency and military-grade security.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                <div className="text-emerald-400 font-mono text-xs uppercase tracking-wider mb-2">Layer 1: Client</div>
                <h4 className="text-lg font-bold text-white mb-2">React 19 & Tailwind</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ultra-fast single page application utilizing Vite bundler, custom reactive hooks, and responsive design systems.
                </p>
              </div>

              <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">Layer 2: Gateway</div>
                <h4 className="text-lg font-bold text-white mb-2">Node / Express Gateway</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Centralized reverse proxy with Helmet hardening, rate limiting, Double-Submit CSRF cookies, and JWT HttpOnly session protection.
                </p>
              </div>

              <div>
                <div className="text-purple-400 font-mono text-xs uppercase tracking-wider mb-2">Layer 3: ML Engine</div>
                <h4 className="text-lg font-bold text-white mb-2">FastAPI + Gemini LLM</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Asynchronous recommendation pipeline serving Implicit ALS, Surprise SVD, and Gemini 2.5 Flash comparison synthesis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-emerald-900 text-white relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Exploring CompareX Today</h2>
          <p className="text-emerald-100 mb-8 text-base">
            Discover tailored recommendations and generate AI-driven multi-item comparisons in seconds.
          </p>
          <button 
            onClick={onStart}
            className="bg-white text-emerald-900 font-bold px-8 py-3.5 rounded-lg shadow-lg hover:bg-emerald-50 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Launch Analytical Suite
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">
            © 2026 CompareX. Multi-Domain Analytical Suite.
          </div>
          <div className="flex gap-6">
            <button onClick={() => onNavigate('landing')} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Home</button>
            <button onClick={() => onNavigate('about')} className="text-sm text-emerald-600 font-medium">About</button>
            <button onClick={() => onNavigate('features')} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Features</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
