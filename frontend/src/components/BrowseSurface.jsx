import React, { useState } from "react";
import { useRecommendations } from "../hooks/useRecommendations";
import { DomainProductCard } from "./DomainProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { ChatPanel } from "./ChatPanel";

export function BrowseSurface({ 
  csrfToken, 
  selectedItems, 
  setSelectedItems, 
  selectedDomain, 
  setSelectedDomain, 
  onCompare,
  onNavigate,
  coldStartItems,
  clearColdStartItems,
  user,
  onLogout
}) {
  const [filters, setFilters] = useState({ budget_max: null, category: "", tags: [] });
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const { 
    items, 
    loading, 
    error, 
    isRelaxed, 
    relaxedConstraint, 
    page, 
    pageSize, 
    hasNextPage, 
    hasPrevPage, 
    goToPage, 
    nextPage, 
    prevPage, 
    setPageSize 
  } = useRecommendations(selectedDomain, filters, csrfToken, 24);

  const displayItems = coldStartItems || items;

  const handleDomainChange = (newDomain) => {
    setSelectedDomain(newDomain);
    setFilters({ budget_max: null, category: "", tags: [] });
    clearColdStartItems?.();
    setSelectedItems([]);
  };

  const handleToggleSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.item_id === item.item_id);
      if (isSelected) {
        return prev.filter(i => i.item_id !== item.item_id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, item];
    });
  };

  // Generate pagination page numbers
  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = startPage + maxVisible - 1;

    if (!hasNextPage && endPage > page) {
      endPage = page;
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <button
          key={p}
          type="button"
          onClick={() => goToPage(p)}
          className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all duration-200 ${
            p === page
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          {p}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800/80 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('landing')} 
              className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <span className="material-symbols-outlined text-slate-950 font-bold text-[20px]">swap_horiz</span>
              </div>
              <span className="text-white font-bold tracking-tight">CompareX</span>
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                Browse Catalog
              </span>
              <button 
                onClick={onCompare} 
                disabled={selectedItems.length < 2}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedItems.length >= 2 
                    ? 'text-white bg-slate-800 hover:bg-slate-700 cursor-pointer' 
                    : 'text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                <span>Compare</span>
                <span className="text-slate-400 text-xs">{selectedItems.length}</span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Toggle Button */}
            <button
              type="button"
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                chatOpen 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30' 
                  : 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Filters"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>

            {/* User Avatar & Dropdown */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs uppercase shadow-sm hover:opacity-90 transition-opacity"
                >
                  {user.email[0]}
                </button>
                
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-800">
                      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                        <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Signed in as</p>
                        <p className="font-bold text-sm truncate mt-0.5">{user.email}</p>
                      </div>
                      
                      <div className="p-3 space-y-1">
                        <div className="px-3 py-2 text-xs text-slate-500 flex items-center justify-between">
                          <span>Active Domain</span>
                          <span className="font-semibold text-emerald-600 capitalize">{selectedDomain}</span>
                        </div>
                        <div className="px-3 py-2 text-xs text-slate-500 flex items-center justify-between">
                          <span>Items in Compare</span>
                          <span className="font-semibold text-slate-700">{selectedItems.length}/4</span>
                        </div>
                      </div>

                      <div className="p-3 border-t border-slate-100">
                        <button 
                          onClick={onLogout}
                          className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden md:block w-72 shrink-0 bg-white border border-slate-200/80 rounded-2xl shadow-sm h-fit sticky top-24">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            domain={selectedDomain} 
            onNavigate={onNavigate} 
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {sidebarMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSidebarMobileOpen(false)} />
            <div className="relative w-4/5 max-w-sm bg-white h-full p-4 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                domain={selectedDomain} 
                onNavigate={onNavigate} 
              />
              <button 
                onClick={() => setSidebarMobileOpen(false)}
                className="mt-6 w-full py-2.5 bg-emerald-500 text-white font-semibold text-xs rounded-xl"
              >
                Apply & Close
              </button>
            </div>
          </div>
        )}

        {/* Center / Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          
          {/* Top Domain Switcher Tabs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { id: 'bookcrossing', name: 'BookCrossing', icon: 'menu_book', subtitle: 'Books, Authors & Years' },
              { id: 'steam', name: 'Steam Games', icon: 'sports_esports', subtitle: 'Playtime, Genres & Reviews' },
            ].map((d) => {
              const active = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDomainChange(d.id)}
                  className={`flex flex-col sm:flex-row items-center sm:items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 text-left ${
                    active 
                      ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                      : 'bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    active 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{d.icon}</span>
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <p className={`text-sm font-bold truncate ${active ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {d.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {d.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Catalog Title & Page Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                  {selectedDomain} Recommendations
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Page {page}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic collaborative filtering scores with constraint-aware ranking.
              </p>
            </div>

            {/* Items Per Page Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">Show:</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-2xs">
                {[12, 24, 48].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPageSize(size)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      pageSize === size 
                        ? 'bg-emerald-500 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cold Start Notice Banner (if active) */}
          {coldStartItems && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Personalized Onboarding Recommendations</h3>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Ranked according to your initial cold-start preference quiz.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={clearColdStartItems}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
              >
                Reset to Standard
              </button>
            </div>
          )}

          {/* Constraint Relaxation Notification */}
          {isRelaxed && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5">info</span>
              <div className="text-xs">
                <h4 className="font-bold">Expanded Matching Active</h4>
                <p className="mt-0.5 opacity-90">
                  {relaxedConstraint === 'all_exhausted' 
                    ? 'Strict filters produced limited matches. Automatically relaxed constraints to show optimal alternatives.' 
                    : `Relaxed constraint on [${relaxedConstraint}] to ensure relevant items are available.`}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>Error retrieving recommendations: {error}</span>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayItems.map(item => (
                  <DomainProductCard 
                    key={item.item_id} 
                    domain={selectedDomain} 
                    item={item} 
                    isSelected={selectedItems.some(i => i.item_id === item.item_id)}
                    onToggleSelect={() => handleToggleSelect(item)}
                  />
                ))}
              </div>

              {/* Enhanced Pagination Controls Bar */}
              <div className="mt-10 mb-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-800">{(page - 1) * pageSize + 1} - {(page - 1) * pageSize + displayItems.length}</span> items
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevPage}
                    disabled={!hasPrevPage || loading}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      hasPrevPage && !loading
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 shadow-2xs'
                        : 'bg-slate-100 border-slate-200/60 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {renderPaginationButtons()}
                  </div>

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={!hasNextPage || loading}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      hasNextPage && !loading
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 shadow-2xs'
                        : 'bg-slate-100 border-slate-200/60 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            !error && (
              <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-slate-200 bg-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  Try adjusting or resetting your category or author filters to view more recommendations.
                </p>
                <button 
                  type="button"
                  onClick={() => setFilters({ budget_max: null, category: "", tags: [] })}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Floating Bottom Comparison Tray */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#0f172a] border border-slate-800 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Compare Basket</p>
                <p className="text-sm font-semibold">{selectedItems.length} of 4 items selected</p>
              </div>

              {/* Selected Thumbnails */}
              <div className="hidden sm:flex items-center gap-2">
                {selectedItems.map((item) => (
                  <div 
                    key={item.item_id}
                    onClick={() => handleToggleSelect(item)}
                    className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] font-mono cursor-pointer hover:border-red-400 transition-colors"
                    title={item.title || item.item_id}
                  >
                    {item.metadata?.image_url_m ? (
                      <img src={item.metadata.image_url_m} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>#{item.item_id.substring(0, 3)}</span>
                    )}
                    <div className="absolute inset-0 bg-red-600/90 text-white hidden group-hover:flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedItems([])}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={onCompare}
                disabled={selectedItems.length < 2}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedItems.length >= 2
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                <span>Compare Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant Drawer */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[550px] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-300">
          <div className="p-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              </div>
              <div>
                <h4 className="text-xs font-bold">CompareX AI Assistant</h4>
                <p className="text-[10px] text-emerald-400">Grounded in {selectedDomain} dataset</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setChatOpen(false)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel 
              domain={selectedDomain} 
              csrfToken={csrfToken}
              selectedItems={selectedItems}
              onToggleSelect={handleToggleSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}


