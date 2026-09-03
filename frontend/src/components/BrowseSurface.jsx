import React, { useState } from "react";
import { useRecommendations } from "../hooks/useRecommendations";
import { DomainProductCard } from "./DomainProductCard";
import { ChatPanel } from "./ChatPanel";
import { ProfileModal } from "./ProfileModal";

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
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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
  } = useRecommendations(selectedDomain, filters, csrfToken, 12);

  const rawItems = coldStartItems || items;
  
  // Real-time search filter
  const displayItems = searchQuery.trim()
    ? rawItems.filter(item => {
        const q = searchQuery.toLowerCase().trim();
        const title = (item.title || item.metadata?.title || '').toLowerCase();
        const author = (item.metadata?.author || item.metadata?.publisher || item.metadata?.developer || '').toLowerCase();
        const category = (item.metadata?.category || item.metadata?.genre || '').toLowerCase();
        const id = String(item.item_id).toLowerCase();
        return title.includes(q) || author.includes(q) || category.includes(q) || id.includes(q);
      })
    : rawItems;

  const handleDomainChange = (newDomain) => {
    setSelectedDomain(newDomain);
    setFilters({ budget_max: null, category: "", tags: [] });
    clearColdStartItems?.();
    setSelectedItems([]);
    setSearchQuery("");
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

  const FILTER_OPTIONS = {
    bookcrossing: {
      category: ['Fiction', 'Non-Fiction', 'Academic', 'Poetry'],
      author: ['J.K. Rowling', 'Stephen King', 'Agatha Christie', 'George R.R. Martin', 'J.R.R. Tolkien', 'Jane Austen', 'Dan Brown', 'Isaac Asimov'],
      year: ['2020-2024', '2015-2019', '2010-2014', 'Before 2010']
    },
    steam: {
      genre: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Multiplayer'],
      rating: ['80-89', '90-100'],
      platform: ['PC', 'Console', 'Mobile']
    }
  };

  const activeFilters = FILTER_OPTIONS[selectedDomain] || {};
  const activeCount = Object.values(filters || {}).filter(v => v && (!Array.isArray(v) || v.length > 0)).length;

  const handleResetFilters = () => {
    setFilters({ budget_max: null, category: "", tags: [] });
    setSearchQuery("");
  };

  // Generate Apple-style pagination page numbers
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
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            p === page
              ? 'bg-[#2D7D7D] text-white shadow-md shadow-[#2D7D7D]/25 scale-105'
              : 'bg-white text-[#192A2A] border border-[#2D7D7D]/15 hover:border-[#2D7D7D]/50 hover:text-[#2D7D7D] shadow-2xs'
          }`}
        >
          {p}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="bg-[#F7F5F0] text-[#192A2A] min-h-screen flex flex-col antialiased selection:bg-[#2D7D7D] selection:text-white font-sans">
      
      {/* 🌟 UNIFIED TOP NAVBAR IN A SINGLE LINE ACROSS THE WHOLE SCREEN WITH SEPARATION LINE */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#2D7D7D]/15 h-16 flex items-center shadow-2xs">
        
        {/* Left segment: Logo & Brand (Matching sidebar width with clear separation border) */}
        <div className="w-72 xl:w-80 h-full px-6 flex items-center justify-between border-r border-[#2D7D7D]/15 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D7D7D] text-white flex items-center justify-center shadow-md shadow-[#2D7D7D]/25">
              <span className="material-symbols-outlined text-2xl font-bold">swap_horiz</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#192A2A]">CompareX</h1>
              <p className="text-[10px] font-semibold text-[#8A8680]">Collaborative Recommender</p>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg bg-[#E7F2F2] text-[#2D7D7D]"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        </div>

        {/* Right segment: Navigation Tabs (Browse | Compare), Search Bar, Assistant & Profile */}
        <div className="flex-1 h-full px-4 sm:px-8 flex items-center justify-between gap-4 min-w-0">
          
          {/* Nav Tabs (Browse | Compare) */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              type="button"
              onClick={() => {}}
              className="text-sm font-extrabold text-[#2D7D7D] relative pb-1 border-b-2 border-[#2D7D7D] cursor-pointer flex items-center gap-1.5"
            >
              <span>Browse</span>
            </button>

            <button
              type="button"
              onClick={onCompare}
              className="text-sm font-semibold text-[#586666] hover:text-[#2D7D7D] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Compare</span>
              {selectedItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#E8935C] text-white text-[10px] font-bold">
                  {selectedItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] text-[18px]">
                search
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedDomain === 'bookcrossing' ? 'books, authors...' : 'games, titles...'}`}
                className="w-full pl-10 pr-9 py-2 bg-[#F7F5F0] hover:bg-white focus:bg-white border border-[#2D7D7D]/15 focus:border-[#2D7D7D] rounded-xl text-xs font-semibold text-[#192A2A] placeholder:text-[#8A8680] focus:outline-none focus:ring-2 focus:ring-[#2D7D7D]/10 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8680] hover:text-[#192A2A] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons: Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Profile Trigger */}
            {user && (
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                title="View Profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#E7F2F2] border border-[#2D7D7D]/20 transition-all shadow-2xs cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2D7D7D] to-[#6B9B7A] text-white flex items-center justify-center font-extrabold text-xs uppercase shadow-2xs">
                  {user.email[0]}
                </div>
                <span className="hidden md:inline text-xs font-bold text-[#192A2A] group-hover:text-[#2D7D7D] max-w-[120px] truncate">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#8A8680] group-hover:text-[#2D7D7D]">account_circle</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🏛️ MAIN APP BODY: SIDEBAR + CATALOG WORKSPACE */}
      <div className="flex-1 flex min-h-0">
        
        {/* 🏛️ LEFT PERSISTENT SIDEBAR */}
        <aside className="hidden lg:flex w-72 xl:w-80 bg-white border-r border-[#2D7D7D]/15 flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20 shadow-[4px_0_24px_rgba(45,125,125,0.02)]">
          
          {/* Sidebar: Dynamic Filters */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A8680]">Filters</span>
                  {activeCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#2D7D7D] text-white text-[10px] font-bold">
                      {activeCount}
                    </span>
                  )}
                </div>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-[#2D7D7D] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Dynamic filter dropdowns */}
              <div className="space-y-4">
                {Object.entries(activeFilters).map(([filterKey, filterValues]) => {
                  const currentValue = filters[filterKey] || '';
                  return (
                    <div key={filterKey} className="space-y-1.5">
                      <label className="text-xs font-bold text-[#192A2A] capitalize">
                        {filterKey === 'author' ? 'Author' : filterKey}
                      </label>
                      <div className="relative">
                        <select
                          className={`w-full appearance-none bg-[#F7F5F0] border text-xs font-semibold rounded-xl py-2 pl-3 pr-8 transition-all focus:outline-none focus:ring-2 focus:ring-[#2D7D7D]/20 cursor-pointer ${
                            currentValue 
                              ? 'border-[#2D7D7D] text-[#2D7D7D] bg-[#E7F2F2]' 
                              : 'border-[#2D7D7D]/15 text-[#192A2A] hover:border-[#2D7D7D]/30'
                          }`}
                          value={currentValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFilters(prev => ({ 
                              ...prev, 
                              [filterKey]: val.startsWith('Any ') ? '' : val 
                            }));
                          }}
                        >
                          <option value="">{filterKey === 'author' ? 'All Authors' : `Any ${filterKey}`}</option>
                          {filterValues.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8680] text-[16px]">
                          unfold_more
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 🔻 SIDEBAR BOTTOM-LEFT CORNER: Direct Logout Button */}
          <div className="p-4 border-t border-[#2D7D7D]/10 bg-[#FAF8F5]">
            {/* Prominent Direct Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* 🌐 MAIN CATALOG WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-y-auto">
          
          {/* Main Content Area */}
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
            
            {/* Subheader with Domain Switcher Tabs (Matching Screenshot) & Page Size Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#2D7D7D]/15">
              <div className="flex items-center gap-2">
                {/* Tab: BookCrossing */}
                <button
                  type="button"
                  onClick={() => handleDomainChange('bookcrossing')}
                  className={`px-5 py-3 text-sm transition-all cursor-pointer relative ${
                    selectedDomain === 'bookcrossing'
                      ? 'text-[#192A2A] font-extrabold bg-white rounded-t-xl border-t border-x border-[#2D7D7D]/15 -mb-[1px] shadow-2xs after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2D7D7D]'
                      : 'text-[#586666] hover:text-[#192A2A] font-bold'
                  }`}
                >
                  BookCrossing
                </button>

                {/* Tab: Steam */}
                <button
                  type="button"
                  onClick={() => handleDomainChange('steam')}
                  className={`px-5 py-3 text-sm transition-all cursor-pointer relative ${
                    selectedDomain === 'steam'
                      ? 'text-[#192A2A] font-extrabold bg-white rounded-t-xl border-t border-x border-[#2D7D7D]/15 -mb-[1px] shadow-2xs after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2D7D7D]'
                      : 'text-[#586666] hover:text-[#192A2A] font-bold'
                  }`}
                >
                  Steam
                </button>

                {searchQuery && (
                  <span className="text-xs text-[#586666] font-medium bg-[#E7F2F2] px-2.5 py-1 rounded-lg border border-[#2D7D7D]/15 ml-3">
                    Filtering by "{searchQuery}" ({displayItems.length} found)
                  </span>
                )}
              </div>
            </div>

            {/* Relaxation Notification Banner */}
            {isRelaxed && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3 shadow-2xs animate-fade-in">
                <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">info</span>
                <div>
                  <p className="text-xs font-bold text-amber-900">Constraint boundary automatically relaxed</p>
                  <p className="text-xs text-amber-800/90 mt-0.5 font-medium">
                    No strict matches found for "{relaxedConstraint}". Showing highest probability recommendations from adjacent categories.
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F2F2] text-[#2D7D7D] flex items-center justify-center border border-[#2D7D7D]/20 shadow-md animate-spin">
                  <span className="material-symbols-outlined text-2xl">sync</span>
                </div>
                <p className="text-sm font-bold text-[#586666]">Computing collaborative ranking vectors...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                  <span className="material-symbols-outlined text-2xl">error</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#192A2A]">Failed to load recommendations</h3>
                <p className="text-xs text-[#586666] max-w-sm">{error}</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] text-[#8A8680] flex items-center justify-center border border-[#2D7D7D]/15">
                  <span className="material-symbols-outlined text-2xl">search_off</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#192A2A]">No items match your criteria</h3>
                <p className="text-xs text-[#586666] max-w-sm font-medium">Try clearing the search query or adjusting your filters.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#2D7D7D] text-white text-xs font-bold shadow-md shadow-[#2D7D7D]/20 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {displayItems.map((item) => (
                    <DomainProductCard
                      key={item.item_id}
                      domain={selectedDomain}
                      item={item}
                      isSelected={selectedItems.some(i => i.item_id === item.item_id)}
                      onToggleSelect={() => handleToggleSelect(item)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-10 pt-6 border-t border-[#2D7D7D]/10 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevPage}
                      disabled={!hasPrevPage}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#2D7D7D]/15 text-[#192A2A] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2D7D7D]/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {renderPaginationButtons()}
                    </div>

                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#2D7D7D]/15 text-[#192A2A] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2D7D7D]/40 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span>Next</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating Compare Basket (When items are selected) */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-xl border border-[#2D7D7D]/20 rounded-2xl p-4 shadow-[0_12px_40px_rgba(45,125,125,0.18)] flex items-center gap-4 animate-spring">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#E7F2F2] text-[#2D7D7D] flex items-center justify-center font-bold text-xs">
              {selectedItems.length}/4
            </span>
            <div>
              <p className="text-xs font-extrabold text-[#192A2A]">Ready to compare</p>
              <p className="text-[10px] text-[#586666]">Select up to 4 items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedItems([])}
              className="text-xs font-bold text-[#8A8680] hover:text-[#192A2A] px-2 py-1.5 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onCompare}
              disabled={selectedItems.length < 2}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                selectedItems.length >= 2 
                  ? 'bg-[#E8935C] hover:bg-[#d68048] text-white shadow-[#E8935C]/30 cursor-pointer scale-105' 
                  : 'bg-[#EAE8E4] text-[#8A8680] cursor-not-allowed'
              }`}
            >
              <span>Compare Now</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer */}
      {chatOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white shadow-2xl border-l border-[#2D7D7D]/15 animate-slide-left flex flex-col">
          <div className="p-4 border-b border-[#2D7D7D]/10 flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D7D7D] text-white flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#192A2A]">CompareX Assistant</h3>
                <span className="text-[10px] text-[#2D7D7D] font-bold">Grounded ML Agent</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-lg text-[#8A8680] hover:text-[#192A2A] hover:bg-slate-100 transition-colors cursor-pointer"
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

      {/* Mobile Left Sidebar Drawer */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={() => setSidebarMobileOpen(false)} 
          />
          <div className="relative w-80 max-w-full bg-white h-full flex flex-col z-10 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D7D7D] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                </div>
                <span className="font-extrabold text-sm">CompareX</span>
              </div>
              <button 
                onClick={() => setSidebarMobileOpen(false)}
                className="p-1.5 rounded-lg text-[#8A8680] hover:text-[#192A2A]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {/* Mobile Domain Selection */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => { handleDomainChange('bookcrossing'); setSidebarMobileOpen(false); }}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  selectedDomain === 'bookcrossing' ? 'bg-[#E7F2F2] text-[#2D7D7D]' : 'bg-[#F7F5F0]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>BookCrossing</span>
              </button>
              <button
                onClick={() => { handleDomainChange('steam'); setSidebarMobileOpen(false); }}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  selectedDomain === 'steam' ? 'bg-[#E7F2F2] text-[#2D7D7D]' : 'bg-[#F7F5F0]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">sports_esports</span>
                <span>Steam Games</span>
              </button>
            </div>

            {/* Mobile Logout */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👤 Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onLogout={onLogout}
        selectedDomain={selectedDomain}
        selectedItemsCount={selectedItems.length}
      />
    </div>
  );
}
