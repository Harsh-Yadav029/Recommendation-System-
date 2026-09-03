import React, { useState } from 'react';

export function RegisterSurface({ onRegisterSuccess, onSwitchToLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
        body: JSON.stringify({ email, password, fullName }),
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
    <div className="flex items-center justify-center font-sans text-[#192A2A] p-6 min-h-screen relative bg-[#F7F5F0] selection:bg-[#2D7D7D] selection:text-white">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-[#586666] hover:text-[#2D7D7D] transition-colors text-xs font-bold z-20 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Home
      </button>

      <main className="w-full max-w-[440px]">
        <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgba(45,125,125,0.08)] p-8 md:p-10 border border-[#2D7D7D]/15 relative overflow-hidden animate-spring">
          <div className="text-center mb-8 relative z-10">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#2D7D7D] text-white flex items-center justify-center mb-3 shadow-md shadow-[#2D7D7D]/25">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <h1 className="text-2xl font-black text-[#192A2A] tracking-tight">Create Account</h1>
            <p className="text-xs text-[#586666] font-semibold mt-1">Join CompareX Analytical Suite</p>
          </div>

          <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#192A2A] mb-1.5" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] text-[18px]">badge</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-xl text-xs font-semibold text-[#192A2A] placeholder:text-[#8A8680] focus:outline-none focus:border-[#2D7D7D] focus:bg-white focus:ring-4 focus:ring-[#2D7D7D]/10 transition-all" 
                  id="fullName" 
                  name="fullName"
                  placeholder="Your Full Name" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#192A2A] mb-1.5" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] text-[18px]">mail</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-xl text-xs font-semibold text-[#192A2A] placeholder:text-[#8A8680] focus:outline-none focus:border-[#2D7D7D] focus:bg-white focus:ring-4 focus:ring-[#2D7D7D]/10 transition-all" 
                  id="email" 
                  name="email"
                  placeholder="name@company.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#192A2A] mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] text-[18px]">lock</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-xl text-xs font-semibold text-[#192A2A] placeholder:text-[#8A8680] focus:outline-none focus:border-[#2D7D7D] focus:bg-white focus:ring-4 focus:ring-[#2D7D7D]/10 transition-all" 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-[#8A8680] mt-1 font-medium">Must be at least 8 characters.</p>
            </div>

            <div className="pt-2">
              <button 
                className="w-full bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-[#2D7D7D]/25 active:scale-[0.99] transition-all text-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center relative z-10 border-t border-slate-100 pt-6">
            <p className="text-xs text-[#586666] font-medium">
              Already have an account? 
              <button onClick={onSwitchToLogin} className="text-xs font-bold text-[#2D7D7D] hover:underline ml-1.5 transition-colors cursor-pointer">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
