import React from 'react';

export function LandingSurface({ onStart, onSignIn }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface overflow-y-auto">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <span className="material-symbols-outlined text-6xl text-primary mb-4">compare_arrows</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-on-surface">
            Real recommendations,<br />grounded in real data.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-on-surface-variant">
            A transparent, multi-domain recommendation engine powered by real user interactions—not LLM hallucinations. Compare products across e-commerce, gaming, and literature.
          </p>
        </div>

        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-outline-variant my-8 text-left">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
            <span className="material-symbols-outlined text-3xl text-primary">model_training</span>
            <h3 className="font-bold text-on-surface">Deterministic Models</h3>
            <p className="text-sm text-on-surface-variant">Hybrid collaborative filtering models trained on real interaction datasets.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
            <span className="material-symbols-outlined text-3xl text-primary">category</span>
            <h3 className="font-bold text-on-surface">Cross-Domain</h3>
            <p className="text-sm text-on-surface-variant">Seamlessly switch between Retailrocket, Steam, and BookCrossing datasets.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
            <span className="material-symbols-outlined text-3xl text-primary">offline_bolt</span>
            <h3 className="font-bold text-on-surface">Always Reliable</h3>
            <p className="text-sm text-on-surface-variant">Core functionality remains available even if the AI assistant layer goes offline.</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3 text-lg font-bold rounded-md bg-primary text-on-primary shadow-sm hover:bg-surface-tint focus:outline-none transition-colors"
          >
            Get Started
          </button>
          <button 
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-3 text-lg font-medium rounded-md border border-outline text-on-surface hover:bg-surface-container focus:outline-none transition-colors"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
}
