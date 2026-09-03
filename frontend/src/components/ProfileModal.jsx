import React from 'react';

export function ProfileModal({ isOpen, onClose, user, onLogout, selectedDomain, selectedItemsCount }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(45,125,125,0.15)] border border-[#2D7D7D]/15 p-6 sm:p-8 relative overflow-hidden animate-spring text-[#192A2A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E7F2F2] text-[#2D7D7D] flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs">
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </div>
            <h2 className="text-base font-black text-[#192A2A]">User Profile</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F5F0] hover:bg-[#EAE8E4] text-[#8A8680] hover:text-[#192A2A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="py-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#2D7D7D] to-[#6B9B7A] text-white flex items-center justify-center font-black text-2xl uppercase shadow-lg shadow-[#2D7D7D]/20 mb-3.5">
            {user.email ? user.email[0] : 'U'}
          </div>
          <h3 className="text-lg font-black text-[#192A2A]">{user.fullName || user.email.split('@')[0]}</h3>
          <p className="text-xs font-semibold text-[#8A8680] mt-0.5">{user.email}</p>
          <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E7F2F2] text-[#2D7D7D] border border-[#2D7D7D]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D7D7D] inline-block animate-pulse" />
            Verified Analyst Account
          </span>
        </div>

        {/* Workspace Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#F7F5F0] rounded-2xl p-3.5 border border-[#2D7D7D]/10 text-center">
            <span className="text-[10px] font-bold text-[#8A8680] uppercase tracking-wider block mb-1">Active Domain</span>
            <span className="text-xs font-black text-[#2D7D7D] capitalize">{selectedDomain}</span>
          </div>
          <div className="bg-[#F7F5F0] rounded-2xl p-3.5 border border-[#2D7D7D]/10 text-center">
            <span className="text-[10px] font-bold text-[#8A8680] uppercase tracking-wider block mb-1">In Compare Matrix</span>
            <span className="text-xs font-black text-[#E8935C]">{selectedItemsCount} Items</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
