import React from 'react';

export function FeaturesSurface({ onNavigate, onSignIn, onSignUp, user, onLogout, onStart }) {
  const featureList = [
    {
      icon: "hub",
      color: "bg-emerald-100 text-emerald-700",
      tag: "CORE ALGORITHM",
      title: "Dual-Domain Collaborative Filtering",
      description: "Customized models per data structure: Implicit ALS for gaming playtime (Steam) plus SVD matrix factorization for explicit ratings (BookCrossing)."
    },
    {
      icon: "compare_arrows",
      color: "bg-blue-100 text-blue-700",
      tag: "LLM REASONING",
      title: "AI-Powered Multi-Item Comparison",
      description: "Select up to 4 items and let Google Gemini Flash construct a side-by-side trade-off matrix, highlight key differentiators, and generate personalized decision summaries."
    },
    {
      icon: "tune",
      color: "bg-purple-100 text-purple-700",
      tag: "SMART RELAXATION",
      title: "Constraint Relaxation Engine",
      description: "Never hit a dead end. When multi-attribute filters or stringent budget limits yield zero matches, our algorithm intelligently relaxes the least sensitive constraints and explains why."
    },
    {
      icon: "chat_bubble",
      color: "bg-amber-100 text-amber-700",
      tag: "INTERACTIVE AGENT",
      title: "Context-Aware Chat Assistant",
      description: "Ask natural questions like 'Which of these games is best for casual play?' or 'Compare the price-to-playtime ratio' with direct access to current item context."
    },
    {
      icon: "visibility",
      color: "bg-cyan-100 text-cyan-700",
      tag: "TRANSPARENCY",
      title: "Explainable Reasoning Chips",
      description: "Every recommended item includes clear attribution badges detailing why it surfaced—such as 'High Playtime Similarity', 'Frequent Co-Occurrence', or 'Popular in Category'."
    },
    {
      icon: "shield",
      color: "bg-rose-100 text-rose-700",
      tag: "ENTERPRISE SECURITY",
      title: "Zero-Trust Security Gateway",
      description: "Strict isolation between the client and ML engines with Double-Submit Cookie CSRF protection, cryptographic JWT session cookies, rate-limiting, and sanitized inputs."
    }
  ];

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
              className="text-white/70 font-medium hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => onNavigate('features')} 
              className="text-emerald-300 font-semibold border-b-2 border-emerald-400 pb-1 cursor-pointer"
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
            Intelligent Tools for High-Dimensional Comparison
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Explore the end-to-end feature suite engineered to power intuitive discovery, deep cross-attribute comparison, and transparent AI reasoning.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 px-6 relative z-10 -mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded bg-gray-100 text-gray-600">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{item.description}</p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>Integrated in CompareX Suite</span>
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Workflow Demo Banner */}
      <section className="py-16 px-6 bg-white border-y border-gray-200 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How CompareX Works in 3 Steps</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-base">A seamless flow from sparse data discovery to AI-verified decision making.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-md">1</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Browse & Select</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Filter by category, author, or genres across BookCrossing and Steam. Click to pin candidates to the comparison tray.
              </p>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-md">2</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Matrix Comparison</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Open Compare view to see normalized metrics side-by-side with clear indicators for unavailable or domain-specific parameters.
              </p>
            </div>

            <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100 text-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-md">3</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">AI Synthesis & Chat</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Receive Gemini Flash pros & cons breakdowns, or open the Chat Drawer to ask detailed clarifying questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-slate-900 text-white relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Experience all features in action</h2>
          <p className="text-slate-400 mb-8 text-base">
            Jump directly into the live recommendation workspace and try the comparison engine.
          </p>
          <button 
            onClick={onStart}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Open Recommender Console
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
            <button onClick={() => onNavigate('about')} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">About</button>
            <button onClick={() => onNavigate('features')} className="text-sm text-emerald-600 font-medium">Features</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
