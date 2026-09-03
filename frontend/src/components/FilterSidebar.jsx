import React from 'react';

export function FilterSidebar({ domain, filters, setFilters, onNavigate }) {
  // Filter fields that exist for this domain
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

  const activeFilters = FILTER_OPTIONS[domain] || {};
  const activeCount = Object.values(filters || {}).filter(v => v && (!Array.isArray(v) || v.length > 0)).length;

  const handleReset = () => {
    setFilters?.({ budget_max: null, category: "", tags: [] });
  };

  const getDomainIcon = () => {
    switch (domain) {
      case 'steam': return 'sports_esports';
      case 'bookcrossing':
      default: return 'menu_book';
    }
  };

  return (
    <div className="flex flex-col h-full px-5 py-5">
      {/* Filters Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EBF4FC] text-[#10367D] flex items-center justify-center border border-[#70B4E8]/40 shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0D1F42]">Filters</h2>
            <p className="text-[11px] font-medium text-slate-500">Refine recommendation</p>
          </div>
        </div>

        {activeCount > 0 && (
          <button 
            type="button"
            onClick={handleReset}
            className="text-[11px] font-bold text-[#10367D] hover:text-[#0C285E] hover:underline transition-all cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Domain Indicator Pill */}
      <div className="mt-4 mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F4F6FA] border border-slate-200/80 text-xs font-bold text-[#10367D] capitalize shadow-2xs">
        <span className="material-symbols-outlined text-[16px] text-[#10367D]">{getDomainIcon()}</span>
        <span>{domain} Attributes</span>
        {activeCount > 0 && (
          <span className="ml-auto bg-[#10367D] text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-2xs">
            {activeCount} active
          </span>
        )}
      </div>

      {/* Dynamic Filter Selectors */}
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
        {Object.entries(activeFilters).map(([filterKey, filterValues]) => {
          const currentValue = filters?.[filterKey] || "";
          
          return (
            <div key={filterKey} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 capitalize flex items-center justify-between">
                <span>{filterKey}</span>
                {currentValue && (
                  <button 
                    type="button"
                    onClick={() => setFilters?.(prev => ({ ...prev, [filterKey]: '' }))}
                    className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    clear
                  </button>
                )}
              </label>

              <div className="relative">
                <select 
                  className={`w-full appearance-none bg-white border text-xs font-semibold rounded-xl py-2.5 pl-3.5 pr-8 transition-all focus:outline-none focus:ring-2 focus:ring-[#10367D]/20 cursor-pointer ${
                    currentValue 
                      ? 'border-[#10367D] text-[#10367D] bg-[#EBF4FC]/40 shadow-2xs' 
                      : 'border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-2xs'
                  }`}
                  value={currentValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters?.(prev => ({ 
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
                <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>
          );
        })}

        {Object.keys(activeFilters).length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
            <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">filter_none</span>
            <p className="text-xs text-slate-500">Pure collaborative filtering domain — no manual filters required.</p>
          </div>
        )}
      </div>
    </div>
  );
}
