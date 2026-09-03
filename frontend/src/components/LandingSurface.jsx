import React from 'react';

export function LandingSurface({ onStart, onSignIn, onSignUp, user, onLogout, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col font-sans w-full antialiased selection:bg-emerald-500/30 bg-gray-50 relative">
      {/* Hero Background with Gradient Fade */}
      <div className="absolute top-0 left-0 w-full h-[85vh] z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/hero_bg.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-gray-50"></div>
      </div>
      {/* TopNavBar */}
      <nav className="bg-black/20 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 shadow-sm">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          {/* Logo - Left */}
          <div className="flex items-center w-1/3">
            <button 
              onClick={() => onNavigate ? onNavigate('landing') : null} 
              className="font-bold text-2xl text-emerald-400 tracking-tight drop-shadow-md text-left cursor-pointer transition-transform hover:scale-105"
            >
              CompareX
            </button>
          </div>
          
          {/* Nav Links - Center */}
          <div className="hidden md:flex items-center justify-center gap-8 w-1/3">
            <button 
              onClick={() => onNavigate ? onNavigate('landing') : null}
              className="text-emerald-300 font-semibold border-b-2 border-emerald-400 pb-1 cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('about') : null}
              className="text-white/70 font-medium hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('features') : null}
              className="text-white/70 font-medium hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
          </div>

          {/* Profile / Actions - Right */}
          <div className="flex items-center justify-end gap-5 w-1/3">
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate ? onNavigate('browse') : null}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                >
                  Go to App
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={onLogout} className="text-white/70 hover:text-red-400 transition-colors font-medium text-sm cursor-pointer">Sign Out</button>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center uppercase text-sm border border-emerald-500/30">
                    {user.email[0]}
                  </div>
                </div>
              </>
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

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden z-10">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-xl">
            Heterogeneous Data, Unified Insights.
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed drop-shadow-md font-medium">
            The analytical bridge for sparse datasets. Browse and compare items seamlessly across Retailrocket, Steam, and BookCrossing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onStart} className="bg-[#0f7632] text-white font-bold text-sm px-6 py-3 rounded-md hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg">
              Start Your Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section id="features" className="pb-16 px-6 relative z-10 -mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-sm">dataset</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Data Honesty</h3>
            <p className="text-gray-600 leading-relaxed text-xs">
              Clear visibility into missing data points. We never mask sparsity, ensuring your analysis is grounded in reality with prominent "Not Specified" states.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-sm">account_tree</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Cross-Domain Analysis</h3>
            <p className="text-gray-600 leading-relaxed text-xs">
              Normalize metrics across vastly different datasets. Compare a game's playtime engagement directly against a book's rating metadata.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-sm">visibility</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Relevance Transparency</h3>
            <p className="text-gray-600 leading-relaxed text-xs">
              Understand exactly why an item is recommended. Our reasoning chips break down complex algorithmic decisions into digestible insights.
            </p>
          </div>
        </div>
      </section>

      {/* Mastering Domains Section */}
      <section id="about" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mastering Heterogeneous Domains</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The analytical bridge for sparse datasets. Browse and compare items seamlessly across BookCrossing and Steam.
            </p>
          </div>

          {/* 2-Domain Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* BookCrossing */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-bold tracking-wider text-gray-500">DOMAIN</span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md">Rich Meta</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-emerald-500 transition-colors">book</span>
                <h3 className="text-lg font-bold text-gray-900">BookCrossing</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Ratings</span>
                  <span className="text-sm font-medium text-gray-900">Explicit (1-10)</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Metadata</span>
                  <span className="text-sm font-medium text-gray-900">Author, Year, Publisher</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-gray-500">Visuals</span>
                  <span className="text-sm font-medium text-gray-900">Cover Art</span>
                </div>
              </div>
            </div>

            {/* Steam */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-bold tracking-wider text-gray-500">DOMAIN</span>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-md">Hybrid</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-emerald-500 transition-colors">sports_esports</span>
                <h3 className="text-lg font-bold text-gray-900">Steam</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Feedback</span>
                  <span className="text-sm font-medium text-gray-900">Implicit Playtime Hours</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Reviews</span>
                  <span className="text-sm font-medium text-gray-900">Overwhelmingly Positive</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-gray-500">Sparsity</span>
                  <span className="text-sm font-bold text-emerald-500">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white border-y border-gray-200 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to unify your analytical view?</h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Experience the functionalist approach to data comparison. Clean interfaces, honest missing data representation, and powerful insights.
          </p>
          <button onClick={onStart} className="bg-[#0f7632] text-white font-bold text-sm px-8 py-3.5 rounded-md hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2 mx-auto">
            Start Your Analysis 
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent py-8 relative z-10 border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">
            © 2026 CompareX. Functionalist Analytical Suite.
          </div>
          <div className="flex gap-6">
            <button onClick={() => onNavigate ? onNavigate('landing') : null} className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">Home</button>
            <button onClick={() => onNavigate ? onNavigate('about') : null} className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigate ? onNavigate('features') : null} className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">Features</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
