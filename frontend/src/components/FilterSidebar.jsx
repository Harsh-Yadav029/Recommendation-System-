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
    },
    retailrocket: {}
  };

  const activeFilters = FILTER_OPTIONS[domain] || {};
  const activeCount = Object.values(filters || {}).filter(v => v && (!Array.isArray(v) || v.length > 0)).length;

  const handleReset = () => {
    setFilters?.({ budget_max: null, category: "", tags: [] });
  };

  const getDomainIcon = () => {
    switch (domain) {
      case 'steam': return 'sports_esports';
      case 'retailrocket': return 'shopping_bag';
      case 'bookcrossing':
      default: return 'menu_book';
    }
  };

  return (
    <div className="flex flex-col h-full px-5 py-4">
      {/* Filters Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Refine recommendation</p>
          </div>
        </div>

        {activeCount > 0 && (
          <button 
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-all"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Domain Indicator Pill */}
      <div className="mt-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
        <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">{getDomainIcon()}</span>
        <span>{domain} Attributes</span>
        {activeCount > 0 && (
          <span className="ml-auto bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize flex items-center justify-between">
                <span>{filterKey}</span>
                {currentValue && (
                  <button 
                    type="button"
                    onClick={() => setFilters?.(prev => ({ ...prev, [filterKey]: '' }))}
                    className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                  >
                    clear
                  </button>
                )}
              </label>

              <div className="relative">
                <select 
                  className={`w-full appearance-none bg-white dark:bg-slate-900 border text-xs font-medium rounded-xl py-2.5 pl-3 pr-8 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    currentValue 
                      ? 'border-emerald-500 text-emerald-900 dark:text-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/30' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
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
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">filter_none</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pure collaborative filtering domain — no manual filters required.</p>
          </div>
        )}
      </div>
    </div>
  );
}

