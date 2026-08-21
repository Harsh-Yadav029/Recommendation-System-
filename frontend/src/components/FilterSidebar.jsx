import React from 'react';

export function FilterSidebar({ domain, filters, setFilters, onNavigate }) {
  // Filter fields that exist for this domain
  const FILTER_OPTIONS = {
    bookcrossing: {
      category: ['Fiction', 'Non-Fiction', 'Academic', 'Poetry'],
      author: ['Various Authors'],
      year: ['2020-2024', '2015-2019', '2010-2014', 'Before 2010']
    },
    steam: {
      genre: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Multiplayer'],
      rating: ['80-89', '90-100'],
      platform: ['PC', 'Console', 'Mobile']
    },
    retailrocket: {
      category: [], // No categories available
      price: [] // No prices available
    }
  };

  const activeFilters = FILTER_OPTIONS[domain] || {};

  return (
    <aside className="bg-surface-container-lowest border border-secondary/10 rounded-[16px] p-6 card-shadow sticky top-24 w-full">
      <h2 className="font-headline-md text-headline-md mb-4 text-primary">Filters</h2>
      
      {/* Navigation links inside the sidebar since TopNav doesn't have them yet */}
      <nav className="flex flex-col gap-2 mb-6 border-b border-surface-variant pb-4">
        <button onClick={() => onNavigate && onNavigate('browse')} className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-primary font-label-md transition-colors hover:bg-primary/20">
          <span className="material-symbols-outlined text-[20px]">search</span>
          Browse
        </button>
        <button onClick={() => onNavigate && onNavigate('compare')} className="flex items-center gap-2 p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-label-md">
          <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
          Comparison
        </button>
      </nav>

      <div className="space-y-6">
        {/* Dynamic Domain Filters */}
        <div className="space-y-4">
          <h3 className="font-label-md text-label-md mb-3 text-on-surface uppercase border-b border-surface-variant pb-2">{domain}</h3>
          
          {Object.entries(activeFilters).map(([filterKey, filterValues]) => (
            <div key={filterKey} className="mb-4">
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2 capitalize">{filterKey}</label>
              <select 
                className="w-full bg-surface-container-lowest border border-surface-variant rounded-xl text-body-sm font-body-sm py-2 px-3 input-focus-ring outline-none transition-colors"
                value={filters?.[filterKey] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters?.(prev => ({ 
                    ...prev, 
                    [filterKey]: val.startsWith('Any ') ? '' : val 
                  }));
                }}
              >
                <option value="">Any {filterKey}</option>
                {filterValues.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          ))}
          {Object.keys(activeFilters).length === 0 && (
            <div className="font-body-sm text-body-sm text-tertiary">No filters available.</div>
          )}
        </div>
      </div>
    </aside>
  );
}
