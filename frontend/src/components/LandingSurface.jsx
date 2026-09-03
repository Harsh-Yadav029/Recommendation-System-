import React from 'react';

export function LandingSurface({ onStart, onSignIn, onSignUp, user, onLogout, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col font-sans w-full antialiased selection:bg-[#2D7D7D] selection:text-white bg-[#F7F5F0] relative text-[#192A2A]">
      
      {/* 🌊 Hero Background with User's Abstract Wave Image */}
      <div className="absolute top-0 left-0 w-full h-[90vh] z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: "url('/landing_bg.png')" }}
        />
        {/* Soft frosted gradient overlay ensuring pristine contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#192A2A]/40 via-[#192A2A]/20 to-[#F7F5F0]" />
      </div>

      {/* Top Navbar in Frosted Glass Pine Teal */}
      <nav className="bg-[#2D7D7D]/90 text-white fixed top-0 w-full z-50 border-b border-white/20 shadow-[0_4px_24px_rgba(45,125,125,0.2)] backdrop-blur-2xl">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          {/* Logo - Left */}
          <div className="flex items-center w-1/3">
            <button 
              onClick={() => onNavigate ? onNavigate('landing') : null} 
              className="flex items-center hover:opacity-95 transition-opacity cursor-pointer group"
            >
              <img src="/logo.png" alt="Compare X" className="h-10 scale-[1.35] object-contain drop-shadow-sm" />
            </button>
          </div>
          
          {/* Nav Links - Center */}
          <div className="hidden md:flex items-center justify-center gap-8 w-1/3">
            <button 
              onClick={() => onNavigate ? onNavigate('landing') : null}
              className="text-white font-bold border-b-2 border-[#E8935C] pb-1 cursor-pointer text-xs uppercase tracking-wider"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('about') : null}
              className="text-white/80 font-semibold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-wider"
            >
              About
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('features') : null}
              className="text-white/80 font-semibold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-wider"
            >
              Features
            </button>
          </div>

          {/* Profile / Actions - Right */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate ? onNavigate('browse') : null}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Go to App
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={onLogout} className="text-white/80 hover:text-red-200 transition-colors font-bold text-xs cursor-pointer">Sign Out</button>
                  <div className="w-8 h-8 rounded-xl bg-[#E8935C] text-white font-black flex items-center justify-center uppercase text-xs shadow-sm">
                    {user.email[0]}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={onSignIn} className="text-white/90 hover:text-white font-bold text-xs px-4 py-2 transition-colors cursor-pointer">
                  Sign In
                </button>
                <button onClick={onSignUp} className="bg-[#E8935C] hover:bg-[#d68048] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-black/10 cursor-pointer">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden text-white z-10">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-md">
            Heterogeneous Data, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8935C] via-amber-200 to-[#E7F2F2]">
              Unified Analytical Insights.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow">
            The analytical bridge for high-sparsity datasets. Browse, recommend, and compare candidates across BookCrossing and Steam with deterministic precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onStart} 
              className="bg-[#E8935C] hover:bg-[#d68048] text-white font-black text-sm px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-2xl shadow-black/25 hover:scale-102 cursor-pointer"
            >
              <span>Launch Recommendation Engine</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Cards Grid with Uniform Alignment */}
      <section id="features" className="pb-20 px-6 relative z-10 -mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1 */}
          <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl shadow-[0_8px_30px_rgba(45,125,125,0.08)] border border-[#2D7D7D]/15 hover:shadow-[0_16px_36px_rgba(45,125,125,0.14)] hover:-translate-y-1 transition-all flex flex-col h-full">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 bg-[#E7F2F2] text-[#2D7D7D] rounded-xl flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-xl">dataset</span>
              </div>
              <h3 className="text-base font-extrabold text-[#192A2A]">
                Data Honesty
              </h3>
            </div>
            <p className="text-[#586666] leading-relaxed text-xs font-medium flex-1">
              Clear visibility into missing attributes. We never mask sparsity, ensuring your analysis is grounded in verified metadata.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl shadow-[0_8px_30px_rgba(45,125,125,0.08)] border border-[#2D7D7D]/15 hover:shadow-[0_16px_36px_rgba(45,125,125,0.14)] hover:-translate-y-1 transition-all flex flex-col h-full">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 bg-[#E7F2F2] text-[#2D7D7D] rounded-xl flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-xl">account_tree</span>
              </div>
              <h3 className="text-base font-extrabold text-[#192A2A]">
                Cross-Domain Matching
              </h3>
            </div>
            <p className="text-[#586666] leading-relaxed text-xs font-medium flex-1">
              Normalize metrics across diverse domains. Compare video game playtime engagement directly against book ratings and author catalog trends.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl shadow-[0_8px_30px_rgba(45,125,125,0.08)] border border-[#2D7D7D]/15 hover:shadow-[0_16px_36px_rgba(45,125,125,0.14)] hover:-translate-y-1 transition-all flex flex-col h-full">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 bg-[#E7F2F2] text-[#2D7D7D] rounded-xl flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-xl">psychology</span>
              </div>
              <h3 className="text-base font-extrabold text-[#192A2A]">
                Relevance Transparency
              </h3>
            </div>
            <p className="text-[#586666] leading-relaxed text-xs font-medium flex-1">
              Understand algorithmic rationale. Our similarity basis tags explain exact collaborative and constraint vectors.
            </p>
          </div>
        </div>
      </section>

      {/* Production Domains Section with Uniform Alignment */}
      <section id="about" className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#192A2A] mb-4">Supported Production Domains</h2>
            <p className="text-sm md:text-base text-[#586666] max-w-2xl mx-auto font-medium">
              Browse and compare items seamlessly across BookCrossing and Steam with isolated collaborative filtering pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* BookCrossing */}
            <div className="bg-white border border-[#2D7D7D]/15 rounded-3xl p-7 shadow-[0_4px_24px_rgba(45,125,125,0.04)] hover:shadow-[0_12px_32px_rgba(45,125,125,0.1)] transition-all group flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] font-extrabold tracking-wider text-[#8A8680]">DOMAIN</span>
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-[#E7F2F2] text-[#2D7D7D] rounded-full border border-[#2D7D7D]/20">Explicit Meta</span>
                </div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#2D7D7D] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-xl">menu_book</span>
                  </div>
                  <h3 className="text-lg font-black text-[#192A2A]">BookCrossing</h3>
                </div>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-[#586666]">Ratings System</span>
                    <span className="text-xs font-bold text-[#192A2A]">Explicit (1–10 Scale)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-[#586666]">Metadata</span>
                    <span className="text-xs font-bold text-[#192A2A]">Author, Year, Publisher</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs font-semibold text-[#586666]">Visuals</span>
                    <span className="text-xs font-bold text-[#192A2A]">CDN Cover Art</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steam */}
            <div className="bg-white border border-[#2D7D7D]/15 rounded-3xl p-7 shadow-[0_4px_24px_rgba(45,125,125,0.04)] hover:shadow-[0_12px_32px_rgba(45,125,125,0.1)] transition-all group flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] font-extrabold tracking-wider text-[#8A8680]">DOMAIN</span>
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-[#E7F2F2] text-[#2D7D7D] rounded-full border border-[#2D7D7D]/20">Behavioral</span>
                </div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#2D7D7D] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-xl">sports_esports</span>
                  </div>
                  <h3 className="text-lg font-black text-[#192A2A]">Steam Games</h3>
                </div>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-[#586666]">Interaction Type</span>
                    <span className="text-xs font-bold text-[#192A2A]">Implicit Playtime Hours</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-[#586666]">Community Sentiment</span>
                    <span className="text-xs font-bold text-[#192A2A]">Overwhelmingly Positive</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs font-semibold text-[#586666]">Matrix Sparsity</span>
                    <span className="text-xs font-bold text-[#2D7D7D]">Low / Dense</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white border-y border-[#2D7D7D]/10 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-[#192A2A] mb-4">Ready to unify your analytical view?</h2>
          <p className="text-sm text-[#586666] mb-8 leading-relaxed font-medium">
            Experience deterministic recommendations, transparent constraint reasoning, and AI-grounded multi-item comparisons.
          </p>
          <button 
            onClick={onStart} 
            className="bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#2D7D7D]/25 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>Start Your Analysis</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10 border-t border-[#2D7D7D]/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-[#586666] font-semibold">
            © 2026 CompareX. Analytical Multi-Domain Recommendation Engine.
          </div>
          <div className="flex gap-6">
            <button onClick={() => onNavigate ? onNavigate('landing') : null} className="text-xs font-bold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer">Home</button>
            <button onClick={() => onNavigate ? onNavigate('about') : null} className="text-xs font-bold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigate ? onNavigate('features') : null} className="text-xs font-bold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer">Features</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
