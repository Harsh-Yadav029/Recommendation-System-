import React, { useState } from "react";
import { useRecommendations } from "../hooks/useRecommendations";
import { DomainProductCard } from "./DomainProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { Alert } from "./Alert";
import { ChatPanel } from "./ChatPanel";

export function BrowseSurface({ 
  csrfToken, 
  selectedItems, 
  setSelectedItems, 
  selectedDomain, 
  setSelectedDomain, 
  onCompare 
}) {
  const [filters, setFilters] = useState({ budget_max: null, category: "", tags: [] });
  const [chatOpen, setChatOpen] = useState(false);

  const { items, loading, error, isRelaxed, relaxedConstraint } = useRecommendations(selectedDomain, filters, csrfToken);

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
    setFilters({ budget_max: null, category: "", tags: [] }); // reset filters on domain change
    setSelectedItems([]); // Clear selected items when domain changes
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
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-[24px] py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold text-on-surface">Compare <span className="text-on-surface-variant font-normal">({selectedItems.length}/4)</span></span>
            <div className="hidden sm:flex items-center gap-2">
              {/* Selected Item Thumbnails */}
              {selectedItems.map(item => (
                <div key={item.item_id} onClick={() => handleToggleSelect(item)} className="w-12 h-12 rounded border border-outline-variant bg-surface-container flex items-center justify-center text-on-surface-variant overflow-hidden relative group cursor-pointer">
                  <span className="text-xs text-center leading-tight">Item<br/>#{item.item_id.substring(0,4)}</span>
                  <div className="absolute inset-0 bg-error/90 hidden group-hover:flex items-center justify-center text-on-error">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </div>
                </div>
              ))}
              {/* Empty Slots */}
              {Array.from({ length: 4 - selectedItems.length }).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded border border-dashed border-outline-variant flex items-center justify-center opacity-50"></div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedItems([])} className="text-sm font-semibold text-on-surface-variant hover:text-on-surface hidden sm:block">Clear All</button>
            <button 
              onClick={onCompare} 
              disabled={selectedItems.length < 2}
              className={`px-6 py-2 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 ${selectedItems.length >= 2 ? 'bg-primary text-on-primary hover:bg-surface-tint' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'}`}
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
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex flex-col relative overflow-x-hidden">
      
      {/* TopAppBar (CompareX) - Simplified for BrowseSurface */}
      <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-4 md:px-8 lg:px-[24px] w-full mx-auto h-16 sticky top-0 z-40">
        <div className="flex items-center gap-8 h-full">
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">CompareX</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-on-surface-variant hidden md:block">Select Domain</label>
          <select 
            value={selectedDomain} 
            onChange={handleDomainChange}
            className="px-3 py-1.5 border border-outline-variant rounded bg-surface text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="retailrocket">Retailrocket (Minimal)</option>
            <option value="steam">Steam (Medium)</option>
            <option value="bookcrossing">BookCrossing (Rich)</option>
          </select>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1280px] mx-auto w-full">
        {/* Sidebar */}
        <FilterSidebar filters={filters} setFilters={setFilters} domain={selectedDomain} />

        {/* Main Content */}
        <main className="flex-1 w-full p-4 md:p-6 lg:p-[24px] pb-32">
          
          {isRelaxed && (
            <div className="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-lg mb-6 flex items-start gap-4 border border-secondary-fixed-dim">
              <span className="material-symbols-outlined text-secondary mt-0.5">info</span>
              <div>
                <h4 className="text-sm font-semibold mb-1">Showing broader results</h4>
                <p className="text-sm opacity-90">We relaxed the constraint on [{relaxedConstraint}] to find enough items for you.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg border border-error mb-6">
              Error loading recommendations: {error}
            </div>
          )}

          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-semibold text-on-background">Recommended Entities</h2>
            {!loading && !error && items.length > 0 && (
              <span className="text-sm text-on-surface-variant">Showing {items.length} results</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-[16px]">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-surface-variant h-48 rounded-lg w-full border border-outline-variant"></div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-[16px]">
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
              <div className="text-center py-12 text-on-surface-variant border border-dashed border-outline-variant rounded-lg bg-surface-container-lowest">
                No items found matching your filters.
              </div>
            )
          )}
        </main>
      </div>
      {renderFloatingCompareBar()}

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${chatOpen ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary hover:bg-surface-tint'} ${selectedItems.length > 0 ? 'bottom-24' : 'bottom-6'}`}
      >
        <span className="material-symbols-outlined text-[24px]">{chatOpen ? 'close' : 'smart_toy'}</span>
      </button>

      {/* Chat Panel */}
      <ChatPanel
        domain={selectedDomain}
        csrfToken={csrfToken}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onToggleSelect={handleToggleSelect}
        selectedItems={selectedItems}
      />
    </div>
  );
}
