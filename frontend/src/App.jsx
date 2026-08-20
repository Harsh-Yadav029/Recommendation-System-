import React, { useEffect, useState } from 'react';
import { BrowseSurface } from './components/BrowseSurface';
import { CompareSurface } from './components/CompareSurface';
import { ColdStartSurface } from './components/ColdStartSurface';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  
  const [currentView, setCurrentView] = useState('onboarding'); // 'onboarding' | 'browse' | 'compare'
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('retailrocket');
  const [coldStartItems, setColdStartItems] = useState(null); // null = not from cold-start

  useEffect(() => {
    fetch('/api/auth/session', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrfToken);
        setAuthReady(true);
      })
      .catch(err => console.error('Auth failed', err));
  }, []);

  // Called when onboarding finishes with cold-start results
  const handleColdStartComplete = (domain, items) => {
    setSelectedDomain(domain);
    setColdStartItems(items.length > 0 ? items : null);
    setCurrentView('browse');
  };

  // Called when user skips onboarding
  const handleSkip = () => {
    setColdStartItems(null);
    setCurrentView('browse');
  };

  if (!authReady) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Authenticating...</div>;

  return (
    <div>
      {currentView === 'onboarding' && (
        <ColdStartSurface 
          csrfToken={csrfToken}
          onComplete={handleColdStartComplete}
          onSkip={handleSkip}
        />
      )}
      {currentView === 'browse' && (
        <BrowseSurface 
          csrfToken={csrfToken} 
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          selectedDomain={selectedDomain}
          setSelectedDomain={setSelectedDomain}
          onCompare={() => setCurrentView('compare')}
          coldStartItems={coldStartItems}
          clearColdStartItems={() => setColdStartItems(null)}
        />
      )}
      {currentView === 'compare' && (
        <CompareSurface 
          selectedItems={selectedItems}
          domain={selectedDomain}
          onBack={() => setCurrentView('browse')}
          csrfToken={csrfToken}
        />
      )}
    </div>
  );
}

export default App;

