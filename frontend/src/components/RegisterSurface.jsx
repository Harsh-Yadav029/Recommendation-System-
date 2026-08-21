import React, { useState } from 'react';

export function RegisterSurface({ onRegisterSuccess, onSwitchToLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, username }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      onRegisterSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] flex items-center justify-center p-margin-mobile md:p-margin-desktop font-body-md text-body-md text-on-background relative overflow-hidden flex-1">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-fixed opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-secondary-fixed opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* Registration Card */}
      <main className="w-full max-w-[480px]">
        {/* Brand / Logo Area */}
        <div className="text-center mb-[32px]">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight mb-[8px]">CompareX</h1>
          <p className="font-body-lg text-body-lg text-tertiary">Join CompareX to start saving today.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-[16px] p-[32px] md:p-[40px] shadow-ambient-card border border-secondary-fixed-dim/20 transition-all duration-300 hover:shadow-ambient-card-hover hover:-translate-y-[2px] card-shadow hover:card-shadow-hover">
          <div className="mb-[32px]">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-[8px]">Create an Account</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Please fill in the details below to register.</p>
          </div>

          <form className="space-y-[24px]" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-[16px] text-sm">
                {error}
              </div>
            )}
            {/* Full Name */}
            <div className="relative group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-[8px]" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors">person</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-[16px] py-[12px] pl-[48px] pr-[16px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-secondary-fixed-dim/50 transition-all placeholder:text-tertiary-fixed-dim input-focus-ring" 
                  id="fullName" 
                  name="fullName"
                  placeholder="Jane Doe" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="relative group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-[8px]" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-[16px] py-[12px] pl-[48px] pr-[16px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-secondary-fixed-dim/50 transition-all placeholder:text-tertiary-fixed-dim input-focus-ring" 
                  id="email" 
                  name="email"
                  placeholder="jane@example.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Username */}
            <div className="relative group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-[8px]" htmlFor="username">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors">alternate_email</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-[16px] py-[12px] pl-[48px] pr-[16px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-secondary-fixed-dim/50 transition-all placeholder:text-tertiary-fixed-dim input-focus-ring" 
                  id="username" 
                  name="username"
                  placeholder="janedoe99" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-[8px]" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-[16px] py-[12px] pl-[48px] pr-[16px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-secondary-fixed-dim/50 transition-all placeholder:text-tertiary-fixed-dim input-focus-ring" 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="font-body-sm text-body-sm text-tertiary mt-[8px]">Must be at least 8 characters.</p>
            </div>

            {/* Submit Button */}
            <div className="pt-[16px]">
              <button 
                className="w-full flex items-center justify-center gap-[8px] bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-[14px] px-[24px] rounded-[16px] transition-colors shadow-sm hover:shadow-md disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
                <span className="material-symbols-outlined text-[20px]" data-weight="fill">arrow_forward</span>
              </button>
            </div>
            
            <div className="flex justify-center mt-[16px]">
              <button type="button" onClick={onBack} className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors">
                Back to home
              </button>
            </div>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-[24px]">
          <p className="font-body-sm text-body-sm text-tertiary">
            Already have an account? 
            <button onClick={onSwitchToLogin} className="ml-1 font-label-md text-label-md text-primary hover:text-primary-container hover:underline transition-colors">Back to Login</button>
          </p>
        </div>
      </main>
    </div>
  );
}
