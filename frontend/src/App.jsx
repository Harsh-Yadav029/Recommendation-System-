import React, { useEffect, useState } from 'react';

function App() {
  const [gatewayStatus, setGatewayStatus] = useState('checking...');

  useEffect(() => {
    fetch('http://localhost:4000/health')
      .then(res => res.json())
      .then(data => setGatewayStatus(data.status))
      .catch(_err => setGatewayStatus('error/unreachable'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          CompareX
        </h1>
        <p className="text-lg text-slate-300">
          Frontend is live. Gateway status: <span className={gatewayStatus === 'ok' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{gatewayStatus}</span>
        </p>
      </div>
    </div>
  );
}

export default App;
