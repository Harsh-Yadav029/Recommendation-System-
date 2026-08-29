import React, { useEffect, useState } from 'react';
import { BrowseSurface } from './components/BrowseSurface';
import { CompareSurface } from './components/CompareSurface';
import { ColdStartSurface } from './components/ColdStartSurface';
import { LoginSurface } from './components/LoginSurface';
import { RegisterSurface } from './components/RegisterSurface';
import { LandingSurface } from './components/LandingSurface';
import { AboutSurface } from './components/AboutSurface';
import { FeaturesSurface } from './components/FeaturesSurface';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'about' | 'features' | 'onboarding' | 'browse' | 'compare' | 'login' | 'register'
  const [user, setUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('bookcrossing');
  const [coldStartItems, setColdStartItems] = useState(null); // null = not from cold-start

  useEffect(() => {
    let isMounted = true;
    
    fetch('/api/auth/session', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setCsrfToken(data.csrfToken);
        if (data.user) {
          setUser(data.user);
          setCurrentView('browse');
        } else {
          setCurrentView('landing');
        }
        setAuthReady(true);
      })
      .catch(err => {
        if (isMounted) console.error('Auth failed', err);
      });
      
    return () => {
      isMounted = false;
    };
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {currentView === 'landing' && (
          <LandingSurface 
            onStart={() => setCurrentView(user ? 'browse' : 'login')}
            onSignIn={() => setCurrentView('login')}
            onSignUp={() => setCurrentView('register')}
            user={user}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'about' && (
          <AboutSurface 
            onStart={() => setCurrentView(user ? 'browse' : 'login')}
            onSignIn={() => setCurrentView('login')}
            onSignUp={() => setCurrentView('register')}
            user={user}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'features' && (
          <FeaturesSurface 
            onStart={() => setCurrentView(user ? 'browse' : 'login')}
            onSignIn={() => setCurrentView('login')}
            onSignUp={() => setCurrentView('register')}
            user={user}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
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
            user={user}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'compare' && (
          <CompareSurface 
            selectedItems={selectedItems}
            domain={selectedDomain}
            onBack={() => setCurrentView('browse')}
            csrfToken={csrfToken}
            user={user}
            onLogout={handleLogout}
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

