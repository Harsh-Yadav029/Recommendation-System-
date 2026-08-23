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

  return (
    <>
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary">filter_alt</span>
          <h2 className="font-title-md text-title-md text-on-surface dark:text-on-surface-variant font-bold">Filters</h2>
        </div>
        <p className="font-body-md text-body-md text-tertiary">Refine your results</p>
      </div>

      <div className="flex flex-col gap-4 px-4 overflow-y-auto">
        <h3 className="font-label-md text-label-md text-on-surface uppercase border-b border-surface-variant pb-2">{domain}</h3>
        
        {Object.entries(activeFilters).map(([filterKey, filterValues]) => (
          <div key={filterKey} className="flex flex-col">
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2 capitalize">{filterKey}</label>
            <select 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-body-sm py-2 px-3 focus:outline-none focus:border-primary transition-colors"
              value={filters?.[filterKey] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setFilters?.(prev => ({ 
                  ...prev, 
                  [filterKey]: val.startsWith('Any ') ? '' : val 
                }));
              }}
            >
              {filterKey === 'author' ? (
                <option value="">All Authors</option>
              ) : (
                <option value="">Any {filterKey}</option>
              )}
              {filterValues.map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        ))}
        {Object.keys(activeFilters).length === 0 && (
          <div className="font-body-sm text-body-sm text-tertiary py-4 text-center border border-dashed border-outline-variant rounded-lg">No filters available for {domain}.</div>
        )}
      </div>


    </>
  );
}
