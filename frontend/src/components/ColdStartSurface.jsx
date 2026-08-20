import React, { useState } from "react";

const DOMAIN_OPTIONS = [
  { 
    id: "retailrocket", 
    label: "Shopping & Retail", 
    icon: "shopping_bag", 
    description: "Product recommendations based on browsing and purchase patterns.",
    interests: [
      { label: "Electronics", icon: "devices" },
      { label: "Home & Garden", icon: "home" },
      { label: "Fashion", icon: "checkroom" },
      { label: "Sports & Outdoor", icon: "fitness_center" },
      { label: "Toys & Games", icon: "smart_toy" },
      { label: "Office Supplies", icon: "business_center" },
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
      // Call the cold-start endpoint with preferences
      const response = await fetch(`/api/cold-start/${selectedDomain}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          // The backend expects preference_answers dict with session_items
          // Since our chips are thematic (not real item IDs), we pass interests as context
          // and let the backend fall back to baseline recommendations
          interests: selectedInterests,
          session_items: [],
        }),
      });

      if (!response.ok) throw new Error("Cold-start request failed");

      const data = await response.json();
      // Transition to Browse with these cold-start results available
      onComplete(selectedDomain, data.items || []);
    } catch (err) {
      console.error("Cold-start error:", err);
      // Even on error, transition to Browse with the selected domain
      onComplete(selectedDomain, []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-3">CompareX</h1>
          <p className="text-lg text-on-surface-variant">Analytical Recommendation Engine</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
          <div className={`w-8 h-0.5 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
        </div>

        {/* Step 1: Choose Domain */}
        {step === 1 && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-2xl font-semibold text-on-surface text-center mb-2">What are you exploring today?</h2>
            <p className="text-sm text-on-surface-variant text-center mb-8">Pick a domain to get personalized recommendations.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DOMAIN_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSelectedDomain(opt.id); setSelectedInterests([]); }}
                  className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    selectedDomain === opt.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-outline-variant bg-surface-container-lowest hover:border-primary/40 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    selectedDomain === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">{opt.icon}</span>
                  </div>
                  <h3 className="text-base font-semibold text-on-surface">{opt.label}</h3>
                  <p className="text-xs text-on-surface-variant text-center leading-relaxed">{opt.description}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-10">
              <button 
                onClick={onSkip} 
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium"
              >
                Skip onboarding →
              </button>
              <button
                onClick={() => step === 1 && selectedDomain && setStep(2)}
                disabled={!selectedDomain}
                className={`px-8 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  selectedDomain 
                    ? 'bg-primary text-on-primary hover:bg-surface-tint shadow-sm' 
                    : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'
                }`}
              >
                Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pick Interests */}
        {step === 2 && domainConfig && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-2xl font-semibold text-on-surface text-center mb-2">
              What interests you in <span className="text-primary">{domainConfig.label}</span>?
            </h2>
            <p className="text-sm text-on-surface-variant text-center mb-8">Select any that apply — this helps us tune your first set of recommendations.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {domainConfig.interests.map(interest => {
                const isActive = selectedInterests.includes(interest.label);
                return (
                  <button
                    key={interest.label}
                    onClick={() => handleInterestToggle(interest.label)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-outline-variant bg-surface-container-lowest hover:border-primary/40'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {interest.icon}
                    </span>
                    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                      {interest.label}
                    </span>
                    {isActive && (
                      <span className="material-symbols-outlined text-primary text-[18px] ml-auto">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-10">
              <button 
                onClick={() => setStep(1)} 
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={onSkip} 
                  className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="px-8 py-2.5 rounded-lg font-semibold text-sm bg-primary text-on-primary hover:bg-surface-tint shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      Get Recommendations <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
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
