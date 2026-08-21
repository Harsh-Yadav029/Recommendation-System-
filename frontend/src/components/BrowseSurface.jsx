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

  const { items, loading, error, isRelaxed, relaxedConstraint } = useRecommendations(selectedDomain, filters, csrfToken);

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
      if (prev.length < 4) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const renderFloatingCompareBar = () => {
    if (selectedItems.length === 0) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_-2px_hsla(260,40%,40%,0.08)] z-50 transition-transform duration-300">
        <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-headline-sm text-headline-sm text-on-surface">Compare <span className="text-on-surface-variant font-normal">({selectedItems.length}/4)</span></span>
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
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col w-full">
      
      {/* TopNavBar */}
      <header className="bg-surface/80 backdrop-blur-md dark:bg-surface-dim/80 sticky top-0 w-full z-40 border-b border-secondary/10 dark:border-outline-variant shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full max-w-container-max-width mx-auto">
          <div className="flex items-center gap-6">
            <a className="font-display-lg text-display-lg text-primary dark:text-primary-fixed tracking-tight" href="#" style={{fontSize: '24px', lineHeight: '32px'}}>CompareX</a>
            <div className="hidden md:flex relative ml-4 w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" style={{fontVariationSettings: "'FILL' 0"}}>search</span>
              <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-xl py-2 pl-10 pr-4 text-body-sm font-body-sm input-focus-ring transition-all outline-none" placeholder="Search products..." type="text"/>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4 border-r border-surface-variant pr-6">
              <label className="text-label-sm font-label-sm text-tertiary">Domain</label>
              <select 
                value={selectedDomain} 
                onChange={handleDomainChange}
                className="bg-surface-container-lowest border border-surface-variant rounded-xl py-1.5 px-3 text-body-sm font-body-sm input-focus-ring outline-none cursor-pointer"
              >
                <option value="retailrocket">Retailrocket</option>
                <option value="steam">Steam</option>
                <option value="bookcrossing">BookCrossing</option>
              </select>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <span className="font-label-md text-label-md text-primary">{user.email}</span>
                <button onClick={onLogout} className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Log Out</button>
              </div>
            )}
          </nav>
          <button className="md:hidden p-2 text-on-surface">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>menu</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-8 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto w-full flex flex-col xl:flex-row gap-gutter relative items-start">
        
        {/* Left Sidebar: Filters */}
        <div className="w-full xl:w-64 flex-shrink-0 flex flex-col gap-6">
          <FilterSidebar filters={filters} setFilters={setFilters} domain={selectedDomain} onNavigate={onNavigate} />
        </div>

        {/* Center Grid: Product Cards */}
        <section className="flex-grow flex flex-col min-w-0">
          {isRelaxed && (
            <div className="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-[16px] flex items-start gap-4 border border-secondary-fixed-dim mb-6 card-shadow">
              <span className="material-symbols-outlined text-secondary mt-0.5">info</span>
              <div>
                <h4 className="font-label-md text-label-md mb-1">Showing broader results</h4>
                <p className="font-body-sm text-body-sm opacity-90">We relaxed the constraint on [{relaxedConstraint}] to find enough items for you.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-[16px] border border-error mb-6">
              Error loading recommendations: {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface">Recommended for You</h2>
            {!loading && !error && items.length > 0 && (
              <div className="flex items-center gap-2 hidden sm:flex">
                <span className="font-label-sm text-label-sm text-tertiary">Sort by:</span>
                <select className="bg-surface-container-lowest border border-surface-variant rounded-xl py-1 px-3 text-body-sm font-body-sm input-focus-ring outline-none cursor-pointer">
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Rating</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-surface-container-high h-[320px] rounded-[16px] w-full border border-secondary/10"></div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.map(item => (
                <DomainProductCard 
                  key={item.item_id} 
                  domain={selectedDomain} 
                  item={item} 
                  isSelected={selectedItems.some(i => i.item_id === item.item_id)}
                  onToggleSelect={() => handleToggleSelect(item)}
                />
              ))}
            </div>
          ) : (
            !error && (
              <div className="text-center py-16 px-4 text-tertiary border border-dashed border-surface-variant rounded-[16px] bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
                <p className="font-body-md text-body-md">No items found matching your filters.</p>
                <button onClick={() => setFilters({ budget_max: null, category: "", tags: [] })} className="mt-4 text-primary font-label-md text-label-md hover:underline">Clear Filters</button>
              </div>
            )
          )}
        </section>

        {/* Right Side: Assistant Chat Panel */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <ChatPanel
            domain={selectedDomain}
            csrfToken={csrfToken}
            onToggleSelect={handleToggleSelect}
            selectedItems={selectedItems}
          />
        </div>
      </main>

      {renderFloatingCompareBar()}
    </div>
  );
}
