import React, { useEffect, useState } from 'react';
import { BrowseSurface } from './components/BrowseSurface';
import { CompareSurface } from './components/CompareSurface';
import { ColdStartSurface } from './components/ColdStartSurface';
import { LoginSurface } from './components/LoginSurface';
import { RegisterSurface } from './components/RegisterSurface';
import { LandingSurface } from './components/LandingSurface';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'onboarding' | 'browse' | 'compare' | 'login' | 'register'
  const [user, setUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('retailrocket');
  const [coldStartItems, setColdStartItems] = useState(null); // null = not from cold-start

  useEffect(() => {
    fetch('/api/auth/session', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrfToken);
        if (data.user) {
          setUser(data.user);
          setCurrentView('browse');
        } else {
          setCurrentView('landing');
        }
        setAuthReady(true);
      })
      .catch(err => console.error('Auth failed', err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setCurrentView('landing');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

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
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="bg-surface-container-low border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl">compare_arrows</span>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">CompareX</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium">
          {user && (
            <>
              <span className="text-primary font-semibold mr-4">Signed in as {user.email}</span>
              <button onClick={handleLogout} className="hover:text-primary transition-colors font-semibold">Log Out</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {currentView === 'landing' && (
          <LandingSurface 
            onStart={() => setCurrentView('login')}
            onSignIn={() => setCurrentView('login')}
          />
        )}

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
            onNavigate={(view) => setCurrentView(view)}
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

        {currentView === 'login' && (
          <LoginSurface 
            onLoginSuccess={(userData) => { setUser(userData); setCurrentView('browse'); }}
            onSwitchToRegister={() => setCurrentView('register')}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'register' && (
          <RegisterSurface 
            onRegisterSuccess={(userData) => { setUser(userData); setCurrentView('onboarding'); }}
            onSwitchToLogin={() => setCurrentView('login')}
            onBack={() => setCurrentView('landing')}
          />
        )}

      </main>
    </div>
  );
}

export default App;

