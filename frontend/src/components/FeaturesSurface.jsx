import React from 'react';

export function FeaturesSurface({ onNavigate, onSignIn, onSignUp, user, onLogout, onStart }) {
  return (
    <div className="min-h-screen flex flex-col font-sans w-full antialiased selection:bg-[#2D7D7D] selection:text-white bg-[#F7F5F0] relative text-[#192A2A]">
      
      {/* 🌊 Background Artwork */}
      <div className="absolute top-0 left-0 w-full h-[75vh] z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: "url('/landing_bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#192A2A]/40 via-[#192A2A]/20 to-[#F7F5F0]" />
      </div>

      {/* Top Navbar */}
      <nav className="bg-[#2D7D7D]/90 text-white fixed top-0 w-full z-50 border-b border-white/20 shadow-[0_4px_24px_rgba(45,125,125,0.2)] backdrop-blur-2xl">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center w-1/3">
            <button 
              onClick={() => onNavigate('landing')} 
              className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white hover:opacity-95 transition-opacity cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white font-bold text-[20px]">swap_horiz</span>
              </div>
              <span className="font-extrabold tracking-tight text-white">CompareX</span>
            </button>
          </div>
          
          {/* Nav Links */}
          <div className="hidden md:flex items-center justify-center gap-8 w-1/3">
            <button 
              onClick={() => onNavigate('landing')} 
              className="text-white/80 font-semibold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-wider"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('about')} 
              className="text-white/80 font-semibold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-wider"
            >
              About
            </button>
            <button 
              onClick={() => onNavigate('features')} 
              className="text-white font-bold border-b-2 border-[#E8935C] pb-1 cursor-pointer text-xs uppercase tracking-wider"
            >
              Features
            </button>
          </div>

          {/* Profile / Actions */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('browse')}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Go to App
                </button>
                <button onClick={onLogout} className="text-white/80 hover:text-red-200 transition-colors font-bold text-xs cursor-pointer">
                  Sign Out
                </button>
                <div className="w-8 h-8 rounded-xl bg-[#E8935C] text-white font-black flex items-center justify-center uppercase text-xs shadow-sm">
                  {user.email[0]}
                </div>
              </div>
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

      {/* Hero Header */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden text-white z-10">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
            Features Designed for Analytical Precision.
          </h1>
          <p className="text-sm sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow">
            Explore the specialized features powering CompareX's multi-domain recommendation architecture.
          </p>
        </div>
      </section>

      {/* Features Grid with Uniform Alignment */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full relative z-10 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1 */}
          <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl border border-[#2D7D7D]/15 shadow-[0_8px_30px_rgba(45,125,125,0.08)] hover:-translate-y-1 transition-all flex flex-col h-full">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 bg-[#E7F2F2] text-[#2D7D7D] rounded-xl flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-xl">tune</span>
              </div>
              <h3 className="text-base font-extrabold text-[#192A2A]">
                Dynamic Constraint Relaxer
              </h3>
            </div>
            <p className="text-xs text-[#586666] leading-relaxed font-medium flex-1">
              When specific filters yield zero results, our engine automatically relaxes constraint boundaries and flags the exact relaxed criterion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl border border-[#2D7D7D]/15 shadow-[0_8px_30px_rgba(45,125,125,0.08)] hover:-translate-y-1 transition-all flex flex-col h-full">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 bg-[#E7F2F2] text-[#2D7D7D] rounded-xl flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-xl">compare_arrows</span>
              </div>
              <h3 className="text-base font-extrabold text-[#192A2A]">
                Side-by-Side Matrix Studio
              </h3>
            </div>
            <p className="text-xs text-[#586666] leading-relaxed font-medium flex-1">
              Compare 2 to 4 candidates across dimensions: engagement metrics, author metadata, ratings, and similarity scores.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl border border-[#2D7D7D]/15 shadow-[0_8px_30px_rgba(45,125,125,0.08)] hover:-translate-y-1 transition-all flex flex-col h-full">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 bg-[#E7F2F2] text-[#2D7D7D] rounded-xl flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <h3 className="text-base font-extrabold text-[#192A2A]">
                Grounded AI Comparative Chat
              </h3>
            </div>
            <p className="text-xs text-[#586666] leading-relaxed font-medium flex-1">
              Natural language assistant grounded directly in the live MongoDB dataset without hallucinating unverified items.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={onStart}
            className="bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#2D7D7D]/25 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Launch CompareX Engine</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#2D7D7D]/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-[#586666] font-semibold">
            © 2026 CompareX. Analytical Multi-Domain Recommendation Engine.
          </div>
          <div className="flex gap-6">
            <button onClick={() => onNavigate('landing')} className="text-xs font-bold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer">Home</button>
            <button onClick={() => onNavigate('about')} className="text-xs font-bold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigate('features')} className="text-xs font-bold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer">Features</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
