import React from 'react';

export function FilterSidebar({ domain, filters, setFilters, onNavigate }) {
  // Filter fields that exist for this domain
  const validFilters = filters || [];
  
  // Domain-specific filter options
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

  const applyFilters = (filterKey, value) => {
    console.log(`Filter applied: ${domain} - ${filterKey}: ${value}`);
    // This would update the recommendations filter
  };

  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-64px)] w-64 sticky top-16 py-6 bg-surface-container-low border-r border-outline-variant shrink-0">
      <div className="px-4 mb-8">
        <h2 className="text-xl font-semibold text-primary mb-1">Expert Assistant</h2>
        <p className="text-sm text-on-surface-variant">Analytical Engine</p>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1 px-2">
        <button onClick={() => onNavigate && onNavigate('browse')} className="flex items-center gap-2 p-2 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold mx-2">
          <span className="material-symbols-outlined text-[20px]">search</span>
          Browse
        </button>
        <button onClick={() => onNavigate && onNavigate('compare')} className="flex items-center gap-2 p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all text-sm font-semibold mx-2">
          <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
          Comparison
        </button>
      </nav>

      <div className="px-4 mt-auto pt-8 border-t border-outline-variant">
        <h3 className="text-xs font-medium text-outline mb-2 uppercase tracking-wider">{domain} Filters</h3>
        <div className="space-y-4">
          {Object.entries(activeFilters).map(([filterKey, filterValues]) => (
            <div key={filterKey}>
              <label className="text-xs font-medium text-on-surface-variant block mb-1 capitalize">{filterKey}</label>
              <select 
                className="w-full bg-surface border-outline-variant rounded text-sm py-1"
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
        </div>
        <button className="w-full mt-8 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-surface-tint transition-colors">
          New Analysis
        </button>
      </div>
    </aside>
  );
}
