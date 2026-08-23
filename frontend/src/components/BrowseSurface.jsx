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

  const { items, loading, error, isRelaxed, relaxedConstraint, loadMore, hasMore } = useRecommendations(selectedDomain, filters, csrfToken);

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
    setFilters({ budget_max: null, category: "", tags: [] });
    setSelectedItems([]);
  };

  const handleToggleSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.item_id === item.item_id);
      if (isSelected) {
        return prev.filter(i => i.item_id !== item.item_id);
      }
      return [...prev, item];
    });
  };

  const renderFloatingCompareBar = () => {
    if (selectedItems.length === 0) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_-2px_hsla(260,40%,40%,0.08)] z-50 transition-transform duration-300">
        <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-headline-sm text-headline-sm text-on-surface">Compare <span className="text-on-surface-variant font-normal">({selectedItems.length})</span></span>
            <div className="hidden sm:flex items-center gap-2">
              {/* Selected Item Thumbnails */}
              {selectedItems.map(item => (
                <div key={item.item_id} onClick={() => handleToggleSelect(item)} className="w-12 h-12 rounded-[8px] border border-outline-variant bg-surface-container flex items-center justify-center text-on-surface-variant overflow-hidden relative group cursor-pointer hover:border-error transition-colors">
                  <span className="text-xs text-center leading-tight">Item<br/>#{item.item_id.substring(0,4)}</span>
                  <div className="absolute inset-0 bg-error/90 hidden group-hover:flex items-center justify-center text-on-error transition-all">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </div>
                </div>
              ))}
              {/* Empty Slots */}
              {Array.from({ length: 4 - selectedItems.length }).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-[8px] border border-dashed border-outline-variant flex items-center justify-center opacity-50"></div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedItems([])} className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hidden sm:block transition-colors">Clear All</button>
            <button 
              onClick={onCompare} 
              disabled={selectedItems.length < 2}
              className={`px-6 py-2.5 font-label-md text-label-md rounded-[16px] transition-colors flex items-center gap-2 shadow-sm ${selectedItems.length >= 2 ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'}`}
            >
              <span className="material-symbols-outlined text-[18px]">compare</span>
              Compare Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* TopNavBar */}
      <header className="hidden md:flex bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline flex w-full h-row-height-standard max-w-full top-0 z-50">
        <div className="w-64 flex items-center pl-container-margin shrink-0">
          <div className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed tracking-tight">CompareX</div>
        </div>
        <div className="flex-1 flex justify-between items-center px-container-margin">
          <nav className="flex gap-4">
            <a className="font-title-md text-title-md text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1 hover:text-primary dark:hover:text-primary-fixed transition-colors scale-95 duration-100" href="#">Browse</a>
            <button onClick={onCompare} disabled={selectedItems.length < 2} className={`font-title-md text-title-md transition-colors scale-95 duration-100 ${selectedItems.length >= 2 ? 'text-primary dark:text-primary-fixed hover:opacity-80' : 'text-tertiary dark:text-tertiary-fixed-dim opacity-50 cursor-not-allowed'}`}>Compare ({selectedItems.length})</button>
          </nav>
          <div className="flex items-center gap-4 relative">
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-8 h-8 rounded-full border border-outline-variant bg-primary text-on-primary flex items-center justify-center font-bold text-xs uppercase cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {user.email[0]}
                </button>
                
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Banner */}
                      <div className="h-24 bg-purple-200 dark:bg-purple-900/30 w-full relative">
                        {/* Avatar */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                          <div className="w-16 h-16 rounded-2xl border-4 border-surface bg-primary text-on-primary flex items-center justify-center font-bold text-3xl uppercase shadow-sm">
                            {user.email[0]}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-10 pb-4 px-4 text-center border-b border-outline-variant/60">
                        <h3 className="font-title-lg text-title-lg font-bold text-on-surface capitalize">
                          {user.email.split('@')[0].replace(/[._-]/g, ' ')}
                        </h3>
                        <p className="font-body-sm text-body-sm text-tertiary mt-1">
                          {user.email}
                        </p>
                      </div>

                      <div className="px-6 py-4">
                        <h4 className="font-title-md text-title-md text-on-surface font-bold mb-4">Personal Info</h4>
                        
                        <div className="flex justify-between items-center py-2 border-b border-outline-variant/40">
                          <div>
                            <p className="font-body-sm text-body-sm font-medium text-on-surface mb-0.5">Full Name</p>
                            <p className="font-body-sm text-body-sm text-tertiary capitalize">{user.email.split('@')[0].replace(/[._-]/g, ' ')}</p>
                          </div>
                          <span className="material-symbols-outlined text-tertiary text-[20px]">chevron_right</span>
                        </div>

                        <div className="flex justify-between items-center py-2 mt-2">
                          <div>
                            <p className="font-body-sm text-body-sm font-medium text-on-surface mb-0.5">Email Address</p>
                            <p className="font-body-sm text-body-sm text-tertiary">{user.email}</p>
                          </div>
                          <span className="material-symbols-outlined text-tertiary text-[20px]">chevron_right</span>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2">
                        <button 
                          onClick={onLogout}
                          className="w-full py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-label-lg rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">logout</span>
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

      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar */}
        <aside className="hidden md:flex bg-surface-bright dark:bg-surface-dim border-r border-outline-variant dark:border-outline h-screen w-64 flex-col gap-unit py-gutter overflow-y-auto shrink-0">
          <FilterSidebar filters={filters} setFilters={setFilters} domain={selectedDomain} onNavigate={onNavigate} />
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 flex flex-col p-container-margin overflow-y-auto bg-surface-container-lowest">
          
          {/* Domain Switcher Tabs */}
          <div className="flex border-b border-outline-variant mb-6 pb-2 gap-6">
            <button 
              onClick={() => handleDomainChange({target: {value: 'bookcrossing'}})}
              className={`font-title-md text-title-md pb-2 transition-colors relative z-10 ${selectedDomain === 'bookcrossing' ? 'text-slate-800 border-b-2 border-secondary-container -mb-[9px]' : 'text-tertiary hover:text-slate-800'}`}
            >
              BookCrossing
            </button>
            <button 
              onClick={() => handleDomainChange({target: {value: 'steam'}})}
              className={`font-title-md text-title-md pb-2 transition-colors relative z-10 ${selectedDomain === 'steam' ? 'text-slate-800 border-b-2 border-secondary-container -mb-[9px]' : 'text-tertiary hover:text-slate-800'}`}
            >
              Steam
            </button>
            <button 
              onClick={() => handleDomainChange({target: {value: 'retailrocket'}})}
              className={`font-title-md text-title-md pb-2 transition-colors relative z-10 ${selectedDomain === 'retailrocket' ? 'text-slate-800 border-b-2 border-secondary-container -mb-[9px]' : 'text-tertiary hover:text-slate-800'}`}
            >
              Retailrocket
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2 capitalize">{selectedDomain} Sparsity View</h1>
            <p className="font-body-md text-body-md text-tertiary max-w-2xl">High-density ID-based representation. Missing attributes omitted for data honesty.</p>
          </div>

          {isRelaxed && (
            <div className="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-lg flex items-start gap-4 border border-secondary-fixed-dim mb-6 shadow-sm">
              <span className="material-symbols-outlined text-secondary mt-0.5">info</span>
              <div>
                <h4 className="font-title-md text-title-md mb-1">Showing broader results</h4>
                <p className="font-body-sm text-body-sm opacity-90">
                  {relaxedConstraint === 'all_exhausted' 
                    ? 'We relaxed multiple constraints to find enough items for you.' 
                    : `We relaxed the constraint on [${relaxedConstraint}] to find enough items for you.`}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg border border-error mb-6">
              Error loading recommendations: {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter auto-rows-max">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-surface-container-high h-[120px] rounded-lg w-full border border-outline-variant/30"></div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter auto-rows-max">
              {items.map(item => (
                <DomainProductCard 
                  key={item.item_id} 
                  domain={selectedDomain} 
                  item={item} 
                  isSelected={selectedItems.some(i => i.item_id === item.item_id)}
                  onToggleSelect={() => handleToggleSelect(item)}
                />
              ))}
              {/* Load More Card */}
              {hasMore && (
                <div onClick={loadMore} className={`bg-surface-bright border border-outline-variant/50 p-card-padding rounded-lg flex flex-col justify-center items-center gap-2 border-dashed opacity-70 cursor-pointer transition-colors ${loading ? 'opacity-50' : 'hover:bg-surface-variant'}`}>
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl">data_exploration</span>
                  <div className="font-body-sm text-body-sm text-tertiary text-center">{loading ? "Loading..." : "Load more items"}</div>
                </div>
              )}
            </div>
          ) : (
            !error && (
              <div className="text-center py-16 px-4 text-tertiary border border-dashed border-outline-variant rounded-lg bg-surface-bright">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
                <p className="font-body-md text-body-md">No items found matching your filters.</p>
                <button onClick={() => setFilters({ budget_max: null, category: "", tags: [] })} className="mt-4 text-primary font-title-md text-title-md hover:underline">Clear Filters</button>
              </div>
            )
          )}
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden bg-surface-container-high dark:bg-surface-container-highest fixed bottom-0 w-full z-50 border-t border-outline-variant dark:border-outline shadow-lg flex justify-around items-center h-row-height-standard px-gutter">
        <a onClick={() => handleDomainChange({target: {value: 'bookcrossing'}})} className={`flex flex-col items-center justify-center w-full h-full pb-1 active:scale-95 transition-transform hover:opacity-100 ${selectedDomain === 'bookcrossing' ? 'text-secondary dark:text-secondary-fixed-dim border-b-2 border-secondary dark:border-secondary-fixed-dim' : 'text-on-surface-variant dark:text-on-surface-variant opacity-70'}`}>
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-caps text-label-caps mt-1">Book</span>
        </a>
        <a onClick={() => handleDomainChange({target: {value: 'steam'}})} className={`flex flex-col items-center justify-center w-full h-full pb-1 active:scale-95 transition-transform hover:opacity-100 ${selectedDomain === 'steam' ? 'text-secondary dark:text-secondary-fixed-dim border-b-2 border-secondary dark:border-secondary-fixed-dim' : 'text-on-surface-variant dark:text-on-surface-variant opacity-70'}`}>
          <span className="material-symbols-outlined">sports_esports</span>
          <span className="font-label-caps text-label-caps mt-1">Steam</span>
        </a>
        <a onClick={() => handleDomainChange({target: {value: 'retailrocket'}})} className={`flex flex-col items-center justify-center w-full h-full pb-1 active:scale-95 transition-transform hover:opacity-100 ${selectedDomain === 'retailrocket' ? 'text-secondary dark:text-secondary-fixed-dim border-b-2 border-secondary dark:border-secondary-fixed-dim' : 'text-on-surface-variant dark:text-on-surface-variant opacity-70'}`}>
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-label-caps text-label-caps mt-1">Retailrocket</span>
        </a>
        <a onClick={onCompare} className={`flex flex-col items-center justify-center w-full h-full pb-1 active:scale-95 transition-transform hover:opacity-100 ${selectedItems.length >= 2 ? 'text-primary' : 'text-on-surface-variant dark:text-on-surface-variant opacity-70'}`}>
          <span className="material-symbols-outlined">compare_arrows</span>
          <span className="font-label-caps text-label-caps mt-1">Compare</span>
        </a>
      </nav>
      
      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline flex flex-col md:flex-row justify-between items-center px-container-margin py-gutter w-full mt-auto mb-14 md:mb-0">
        <div className="font-display-id text-display-id text-tertiary dark:text-tertiary-fixed-dim mb-4 md:mb-0">
          © 2026 CompareX. Functionalist Analytical Suite.
        </div>
        <div className="flex gap-4">
          <a className="font-body-sm text-body-sm text-tertiary dark:text-tertiary-fixed-dim no-underline hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">Privacy</a>
          <a className="font-body-sm text-body-sm text-tertiary dark:text-tertiary-fixed-dim no-underline hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">Terms</a>
          <a className="font-body-sm text-body-sm text-tertiary dark:text-tertiary-fixed-dim no-underline hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">API</a>
        </div>
      </footer>

      {/* Floating Action Button for Compare */}
      {selectedItems.length > 0 && (
        <button
          onClick={onCompare}
          className="fixed bottom-20 md:bottom-10 right-6 md:right-10 z-[100] flex items-center gap-3 bg-emerald-500 text-white font-label-lg px-6 py-4 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[24px]">compare_arrows</span>
          <span>Compare ({selectedItems.length})</span>
        </button>
      )}
    </div>
  );
}
