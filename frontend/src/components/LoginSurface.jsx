import React, { useState } from 'react';

export function LoginSurface({ onLoginSuccess, onSwitchToRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center font-body-md text-on-background p-margin-mobile md:p-margin-desktop min-h-screen bg-background">
      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-[16px] shadow-ambient-lvl1 p-8 md:p-10 border border-secondary/10 relative overflow-hidden transition-all duration-300 hover:shadow-ambient-lvl2 hover:-translate-y-0.5 card-shadow hover:card-shadow-hover">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="text-center mb-8 relative z-10">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight mb-2">CompareX</h1>
          <p className="font-body-md text-body-md text-tertiary">Welcome back. Please log in to your account.</p>
        </div>
        
        <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="email">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">person</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-[16px] font-body-md text-body-md text-on-surface placeholder:text-tertiary focus:outline-none focus:border-primary focus:ring-4 focus:ring-secondary-container/50 transition-all input-focus-ring" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">lock</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-[16px] font-body-md text-body-md text-on-surface placeholder:text-tertiary focus:outline-none focus:border-primary focus:ring-4 focus:ring-secondary-container/50 transition-all input-focus-ring" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={onBack} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface">
              Back to home
            </button>
            <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
          </div>
          <button 
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 px-6 rounded-[16px] shadow-sm hover:bg-primary/90 hover:shadow-ambient-lvl1 active:scale-[0.98] transition-all duration-200 disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-8 text-center relative z-10">
          <p className="font-body-sm text-body-sm text-tertiary">
            Don't have an account? 
            <button onClick={onSwitchToRegister} className="font-label-md text-label-md text-primary hover:underline hover:text-primary-container ml-1 transition-colors">Register</button>
          </p>
        </div>
      </div>
    </div>
  );
}
