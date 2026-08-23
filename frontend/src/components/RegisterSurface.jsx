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
    <div className="flex items-center justify-center font-sans text-gray-900 p-6 min-h-screen relative bg-gray-50 selection:bg-emerald-500/30">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold z-20"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back
      </button>

      <main className="w-full max-w-[480px]">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">CompareX</h1>
          <p className="text-gray-500">Join CompareX to start saving today.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-200 relative overflow-hidden transition-all duration-300">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h2>
            <p className="text-sm text-gray-500">Please fill in the details below to register.</p>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0f7632] focus:ring-4 focus:ring-emerald-500/10 transition-all [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]" 
                  id="fullName" 
                  name="fullName"
                  placeholder="Enter your name" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0f7632] focus:ring-4 focus:ring-emerald-500/10 transition-all [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]" 
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



            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0f7632] focus:ring-4 focus:ring-emerald-500/10 transition-all [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]" 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Must be at least 8 characters.</p>
            </div>

            <div className="pt-2">
              <button 
                className="w-full flex items-center justify-center gap-2 bg-[#0f7632] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
                <span className="material-symbols-outlined text-[20px]" data-weight="fill">arrow_forward</span>
              </button>
            </div>
            
            <div className="flex justify-center mt-4">
              <button type="button" onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Back to home
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <button onClick={onSwitchToLogin} className="text-sm font-semibold text-[#0f7632] hover:underline hover:text-emerald-700 ml-1 transition-colors">Back to Login</button>
          </p>
        </div>
      </main>
    </div>
  );
}
