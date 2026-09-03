import React, { useState } from "react";

const DOMAIN_OPTIONS = [
  { 
    id: "bookcrossing", 
    label: "Books & Reading", 
    icon: "menu_book", 
    description: "Book recommendations powered by community ratings and reading patterns.",
    interests: [
      { label: "Fiction", icon: "auto_stories" },
      { label: "Non-Fiction", icon: "school" },
      { label: "Mystery / Thriller", icon: "search" },
      { label: "Sci-Fi / Fantasy", icon: "rocket_launch" },
      { label: "Romance", icon: "favorite" },
      { label: "Biography", icon: "person" },
    ]
  },
  { 
    id: "steam", 
    label: "Games & Entertainment", 
    icon: "sports_esports", 
    description: "Game recommendations based on play history and community trends.",
    interests: [
      { label: "Strategy", icon: "psychology" },
      { label: "Action / FPS", icon: "local_fire_department" },
      { label: "RPG / Adventure", icon: "explore" },
      { label: "Simulation", icon: "flight" },
      { label: "Puzzle / Casual", icon: "extension" },
      { label: "Multiplayer", icon: "groups" },
    ]
  },
];

export function ColdStartSurface({ csrfToken, onComplete, onSkip }) {
  const [step, setStep] = useState(1); // 1 = domain, 2 = interests
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const domainConfig = DOMAIN_OPTIONS.find(d => d.id === selectedDomain);

  const handleInterestToggle = (label) => {
    setSelectedInterests(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cold-start/${selectedDomain}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          interests: selectedInterests,
          session_items: [],
        }),
      });

      if (!response.ok) throw new Error("Cold-start request failed");

      const data = await response.json();
      onComplete(selectedDomain, data.items || []);
    } catch (err) {
      console.error("Cold-start error:", err);
      onComplete(selectedDomain, []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#192A2A] flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#2D7D7D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 bg-white border border-[#2D7D7D]/15 rounded-3xl p-8 sm:p-12 shadow-[0_12px_40px_rgba(45,125,125,0.06)] animate-spring">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#2D7D7D] text-white flex items-center justify-center mb-3 shadow-md shadow-[#2D7D7D]/25">
            <span className="material-symbols-outlined text-2xl text-white">swap_horiz</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#192A2A] tracking-tight">CompareX</h1>
          <p className="text-xs text-[#586666] font-semibold mt-1">Personalized Recommendation Calibration</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-[#2D7D7D] scale-110 shadow-2xs' : 'bg-[#EAE8E4]'}`} />
          <div className={`w-10 h-1 rounded-full transition-all ${step >= 2 ? 'bg-[#2D7D7D]' : 'bg-[#EAE8E4]'}`} />
          <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-[#2D7D7D] scale-110 shadow-2xs' : 'bg-[#EAE8E4]'}`} />
        </div>

        {/* Step 1: Choose Domain */}
        {step === 1 && (
          <div className="animate-spring">
            <h2 className="text-lg font-black text-[#192A2A] text-center mb-1">Select Domain to Explore</h2>
            <p className="text-xs text-[#586666] text-center mb-6">Choose an initial dataset to calibrate recommendations.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOMAIN_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSelectedDomain(opt.id); setSelectedInterests([]); }}
                  className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    selectedDomain === opt.id 
                      ? 'border-[#2D7D7D] bg-[#E7F2F2] ring-2 ring-[#2D7D7D]/20 shadow-xs' 
                      : 'border-[#2D7D7D]/15 bg-white hover:border-[#2D7D7D]/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    selectedDomain === opt.id ? 'bg-[#2D7D7D] text-white shadow-xs' : 'bg-[#F7F5F0] text-[#8A8680] group-hover:text-[#2D7D7D]'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#192A2A]">{opt.label}</h3>
                  <p className="text-xs text-[#586666] text-center leading-relaxed font-medium">{opt.description}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2D7D7D]/10">
              <button 
                onClick={onSkip} 
                className="text-xs text-[#586666] hover:text-[#2D7D7D] transition-colors font-bold cursor-pointer"
              >
                Skip Onboarding →
              </button>
              <button
                onClick={() => step === 1 && selectedDomain && setStep(2)}
                disabled={!selectedDomain}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  selectedDomain 
                    ? 'bg-[#2D7D7D] text-white hover:bg-[#1E5C5C] shadow-md shadow-[#2D7D7D]/25' 
                    : 'bg-[#EAE8E4] text-[#8A8680] cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pick Interests */}
        {step === 2 && domainConfig && (
          <div className="animate-spring">
            <h2 className="text-lg font-black text-[#192A2A] text-center mb-1">
              Select Interests in <span className="text-[#2D7D7D]">{domainConfig.label}</span>
            </h2>
            <p className="text-xs text-[#586666] text-center mb-6">Select candidate categories to prioritize in the catalog.</p>

            <div className="grid grid-cols-2 gap-3">
              {domainConfig.interests.map(interest => {
                const isActive = selectedInterests.includes(interest.label);
                return (
                  <button
                    key={interest.label}
                    onClick={() => handleInterestToggle(interest.label)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                      isActive
                        ? 'border-[#2D7D7D] bg-[#E7F2F2] text-[#2D7D7D] font-bold shadow-2xs'
                        : 'border-[#2D7D7D]/15 bg-white text-[#192A2A] hover:border-[#2D7D7D]/30'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#2D7D7D]' : 'text-[#8A8680]'}`}>
                      {interest.icon}
                    </span>
                    <span className="text-xs font-bold truncate">
                      {interest.label}
                    </span>
                    {isActive && (
                      <span className="material-symbols-outlined text-[#2D7D7D] text-[16px] ml-auto">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2D7D7D]/10">
              <button 
                onClick={() => setStep(1)} 
                className="text-xs text-[#586666] hover:text-[#192A2A] transition-colors font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back</span>
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={onSkip} 
                  className="text-xs text-[#586666] hover:text-[#2D7D7D] transition-colors font-bold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white shadow-md shadow-[#2D7D7D]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Calibrating...</span>
                  ) : (
                    <>
                      <span>Get Recommendations</span>
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
