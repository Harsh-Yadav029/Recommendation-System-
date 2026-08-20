import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

export function CompareSurface({ selectedItems, domain, onBack, csrfToken }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no items selected, we still attempt to fetch if we had IDs, 
    // but in this setup selectedItems is the source of truth.
    if (!selectedItems || selectedItems.length === 0) {
      setLoading(false);
      return;
    }

    const itemIds = selectedItems.map(i => i.item_id);

    setLoading(true);
    fetch(`/api/compare/${domain}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken
      },
      body: JSON.stringify({ item_ids: itemIds })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch comparison data");
        return res.json();
      })
      .then(data => {
        // Merge the similarity_basis from selectedItems into the fetched data
        const mergedItems = data.items.map(apiItem => {
          const selectedItem = selectedItems.find(i => String(i.item_id) === String(apiItem.item_id));
          return {
            ...apiItem,
            similarity_basis: selectedItem ? selectedItem.similarity_basis : null
          };
        });
        setItems(mergedItems);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [domain, selectedItems]);

  const renderDomainIcon = () => {
    if (domain === "bookcrossing") return <span className="material-symbols-outlined text-tertiary">menu_book</span>;
    if (domain === "steam") return <span className="material-symbols-outlined text-tertiary">sports_esports</span>;
    return <span className="material-symbols-outlined text-tertiary">shopping_bag</span>;
  };

  const domainName = domain === "bookcrossing" ? "BookCrossing" : domain === "steam" ? "Steam Ecosystem" : "Retailrocket Data";

  const renderCreatorLabel = () => {
    if (domain === "bookcrossing") return "Author";
    if (domain === "steam") return "Category";
    return "Price";
  };

  const getCreatorValue = (item) => {
    if (domain === "bookcrossing") return item.author;
    if (domain === "steam") return item.category;
    return item.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-4 md:px-8 lg:px-[24px] w-full mx-auto h-16 sticky top-0 z-40">
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">CompareX</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-on-surface-variant font-medium">Loading comparison data...</div>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-4 md:px-8 lg:px-[24px] w-full mx-auto h-16 sticky top-0 z-40">
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">CompareX</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-on-surface-variant font-medium">No items selected for comparison.</div>
          <button onClick={onBack} className="text-primary hover:underline font-medium">Go back to Browse</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col">
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-4 md:px-8 lg:px-[24px] w-full mx-auto h-16 sticky top-0 z-40">
        <div className="flex items-center gap-8 h-full">
          <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">CompareX</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Mock user actions */}
          <button className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined">notifications</span></button>
          <button className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined">settings</span></button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 p-4 md:p-6 lg:p-[24px] max-w-[1280px] mx-auto w-full flex flex-col gap-8">
        
        {/* Page Header & Action */}
        <div className="flex justify-between items-end pb-4 border-b border-surface-variant">
          <div>
            <h2 className="text-3xl font-semibold text-on-surface">Cross-Domain Analysis</h2>
            <p className="text-base text-on-surface-variant mt-1">Synthesizing data points across the {domainName} ecosystem.</p>
          </div>
          <button onClick={onBack} className="flex items-center gap-1 text-primary font-medium hover:underline py-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Browse
          </button>
        </div>

        {error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg border border-error">
            Error loading comparison: {error}
          </div>
        ) : (
          /* Comparison Table Container */
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
            
            {/* Headers (Domain) */}
            <div className={`grid grid-cols-1 md:grid-cols-${items.length} bg-surface-container-low border-b border-surface-variant`}>
              {items.map((item, idx) => (
                <div key={`header-${idx}`} className={`p-4 ${idx < items.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''} border-surface-variant flex items-center gap-2`}>
                  {renderDomainIcon()}
                  <h3 className="text-sm font-semibold text-on-surface">{domainName}</h3>
                </div>
              ))}
            </div>

            {/* Row 1: Adaptive Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-${items.length} border-b border-surface-variant`}>
              {items.map((item, idx) => {
                const coverUrl = item.image_url_l !== "not specified" ? item.image_url_l : (item.image_url_m !== "not specified" ? item.image_url_m : null);
                return (
                  <div key={`card-${idx}`} className={`p-4 ${idx < items.length - 1 ? 'md:border-r' : ''} border-surface-variant flex flex-col gap-2`}>
                    {domain === "bookcrossing" && (
                      <div className="w-full h-32 bg-surface-variant rounded-md overflow-hidden relative border border-outline-variant shrink-0 mb-2">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant p-4 text-center" style={{ display: coverUrl ? 'none' : 'flex' }}>
                          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">No cover</span>
                        </div>
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-on-surface line-clamp-2">{item.title !== "not specified" ? item.title : `Item #${item.item_id}`}</h4>
                  </div>
                );
              })}
            </div>

            {/* Row 2: Title (Specific) */}
            <div className={`grid grid-cols-1 md:grid-cols-${items.length} border-b border-surface-variant bg-surface-bright`}>
              {items.map((item, idx) => (
                <div key={`title-${idx}`} className={`p-3 px-4 ${idx < items.length - 1 ? 'md:border-r' : ''} border-surface-variant`}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-outline block mb-1">Title</span>
                  <p className="text-sm font-medium text-on-surface">
                    {item.title !== "not specified" ? item.title : <span className="text-outline-variant">— Not specified</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 3: Creator / Metadata */}
            <div className={`grid grid-cols-1 md:grid-cols-${items.length} border-b border-surface-variant`}>
              {items.map((item, idx) => {
                const val = getCreatorValue(item);
                return (
                  <div key={`creator-${idx}`} className={`p-3 px-4 ${idx < items.length - 1 ? 'md:border-r' : ''} border-surface-variant`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-outline block mb-1">{renderCreatorLabel()}</span>
                    <p className="text-sm font-medium text-on-surface">
                      {val !== "not specified" ? val : <span className="text-outline-variant">— Not specified</span>}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Row 4: Why Recommended (Logic Vector) */}
            <div className={`grid grid-cols-1 md:grid-cols-${items.length} border-b border-surface-variant bg-surface-bright`}>
              {items.map((item, idx) => (
                <div key={`logic-${idx}`} className={`p-3 px-4 ${idx < items.length - 1 ? 'md:border-r' : ''} border-surface-variant`}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-outline block mb-2">Logic Vector</span>
                  {item.similarity_basis ? (
                    <div className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded-full text-xs font-medium border border-secondary-fixed-dim">
                      <span className="material-symbols-outlined text-[14px]">psychology</span> {item.similarity_basis}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-variant px-2 py-1 rounded-full text-xs font-medium border border-outline-variant">
                      <span className="material-symbols-outlined text-[14px]">help</span> Reasoning not available
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Row 5: Relevance Score */}
            <div className={`grid grid-cols-1 md:grid-cols-${items.length}`}>
              {items.map((item, idx) => (
                <div key={`score-${idx}`} className={`p-4 ${idx < items.length - 1 ? 'md:border-r' : ''} border-surface-variant`}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-outline block mb-2">Relevance Score</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, item.popularity_score))}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {item.popularity_score > 0 ? `${item.popularity_score.toFixed(2)}` : '0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-4 px-4 md:px-8 flex justify-between items-center mt-auto">
        <div className="text-sm font-bold text-outline">CompareX</div>
        <p className="hidden md:block text-xs text-on-surface-variant">© 2024 CompareX Analytical Recommendation Engine. Precise. Impartial. Efficient.</p>
        <div className="flex gap-4">
          <a className="text-xs text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">Documentation</a>
        </div>
      </footer>
    </div>
  );
}
