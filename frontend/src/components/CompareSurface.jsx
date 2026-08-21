import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

export function CompareSurface({ selectedItems, domain, onBack, csrfToken, user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      setLoading(false);
      return;
    }

    const itemIds = selectedItems.map(i => i.item_id);

    setLoading(true);
    fetch(`/api/compare/${domain}`, {
      method: "POST",
      credentials: "include",
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
        const mergedItems = data.items.map(apiItem => {
          const selectedItem = selectedItems.find(i => String(i.item_id) === String(apiItem.item_id));
          return {
            ...apiItem,
            similarity_basis: selectedItem ? selectedItem.similarity_basis : null,
            popularity_score: selectedItem ? selectedItem.score : apiItem.popularity_score
          };
        });
        setItems(mergedItems);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [domain, selectedItems, csrfToken]);

  const renderDomainIcon = () => {
    if (domain === "bookcrossing") return <span className="material-symbols-outlined text-tertiary">menu_book</span>;
    if (domain === "steam") return <span className="material-symbols-outlined text-tertiary">sports_esports</span>;
    return <span className="material-symbols-outlined text-tertiary">shopping_bag</span>;
  };

  const domainName = domain === "bookcrossing" ? "BookCrossing" : domain === "steam" ? "Steam" : "Retailrocket";

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-tertiary font-body-md flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Loading comparison data...
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-tertiary font-body-md">No items selected for comparison.</div>
        <button onClick={onBack} className="text-primary hover:underline font-label-md">Go back to Browse</button>
      </div>
    );
  }

  // Determine grid columns. 1 for labels + up to 3 items = max 4 cols.
  const gridColsClass = items.length === 1 ? "md:grid-cols-2" 
                      : items.length === 2 ? "md:grid-cols-3" 
                      : "md:grid-cols-4";

  return (
    <div className="bg-background min-h-screen text-on-background font-body-md flex flex-col flex-1">
      {/* TopNavBar */}
      <nav className="bg-surface/80 backdrop-blur-md dark:bg-surface-dim/80 sticky top-0 w-full z-50 border-b border-secondary/10 dark:border-outline-variant shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full max-w-container-max-width mx-auto">
          <div className="flex items-center gap-6">
            <a className="font-display-lg text-display-lg text-primary dark:text-primary-fixed tracking-tight" href="#" style={{fontSize: '24px', lineHeight: '32px'}}>CompareX</a>
            <div className="hidden md:flex items-center gap-4 ml-8">
              <button onClick={onBack} className="text-on-surface-variant font-label-md hover:text-primary transition-colors rounded-lg p-2">Browse</button>
              <button className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md">Compare</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-label-md text-primary">{user.email}</span>
                <button onClick={onLogout} className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Log Out</button>
              </div>
            ) : (
              <button onClick={onBack} className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-[16px] hover:shadow-ambient-lvl1 transition-all hover:-translate-y-[2px]">Back to Home</button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-[40px] md:py-[64px]">
        {/* Header */}
        <div className="text-center mb-[48px] max-w-2xl mx-auto relative">
          <button onClick={onBack} className="absolute left-0 top-0 mt-2 flex items-center gap-1 text-tertiary font-label-md hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </button>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-[16px]">Compare Items</h1>
          <p className="font-body-lg text-tertiary">Evaluate your top picks side-by-side to find your next favorite thing.</p>
        </div>

        {error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-[16px] border border-error">
            Error loading comparison: {error}
          </div>
        ) : (
          /* Comparison Matrix (Bento-style Grid) */
          <div className={`grid grid-cols-1 ${gridColsClass} gap-gutter`}>
            
            {/* Labels Column (Hidden on mobile, visible on tablet/desktop) */}
            <div className="hidden md:flex flex-col space-y-4 pt-[240px]">
              <div className="h-[64px] flex items-center font-label-md text-tertiary">Domain</div>
              <div className="h-[64px] flex items-center font-label-md text-tertiary">{renderCreatorLabel()}</div>
              <div className="h-[64px] flex items-center font-label-md text-tertiary">Rating</div>
              <div className="h-[64px] flex items-center font-label-md text-tertiary">Why Recommended</div>
            </div>

            {items.map((item, idx) => {
              const coverUrl = item.image_url_l !== "not specified" && item.image_url_l ? item.image_url_l : (item.image_url_m !== "not specified" ? item.image_url_m : null);
              const title = item.title !== "not specified" && item.title ? item.title : `Item #${item.item_id}`;
              const creatorVal = getCreatorValue(item);
              const score = item.popularity_score > 0 ? item.popularity_score.toFixed(2) : '0';
              const isTopPick = idx === 0;

              return (
                <div key={item.item_id} className={`bg-surface-container-lowest rounded-[16px] p-6 flex flex-col relative transition-all duration-300 ${isTopPick ? 'border-2 border-primary shadow-[0_12px_32px_-4px_hsla(260,40%,40%,0.12)] -translate-y-[2px]' : 'border border-secondary/10 shadow-[0_4px_20px_-2px_hsla(260,40%,40%,0.08)] hover:shadow-[0_12px_32px_-4px_hsla(260,40%,40%,0.12)] hover:-translate-y-[2px]'}`}>
                  {isTopPick && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary font-label-sm px-3 py-1 rounded-full whitespace-nowrap z-10">
                      Top Pick
                    </div>
                  )}

                  <div className="h-[180px] bg-surface-container rounded-lg mb-6 overflow-hidden relative flex items-center justify-center">
                    {coverUrl ? (
                      <img className="object-cover max-w-full max-h-full" src={coverUrl} alt={title} />
                    ) : (
                      renderDomainIcon()
                    )}
                  </div>
                  
                  <h3 className="font-headline-sm text-on-background mb-1 line-clamp-2" title={title}>{title}</h3>
                  <p className="font-body-sm text-secondary mb-6 line-clamp-1">{domainName}</p>
                  
                  <div className="flex flex-col space-y-4 flex-grow">
                    
                    {/* Domain / Category */}
                    <div className="flex justify-between items-center h-auto md:h-[64px] border-b border-secondary/10 pb-2 md:pb-0 md:border-none">
                      <span className="md:hidden font-label-sm text-tertiary">Domain</span>
                      <span className="font-body-md text-on-surface">{domainName}</span>
                    </div>

                    {/* Creator / Format */}
                    <div className="flex justify-between items-center h-auto md:h-[64px] border-b border-secondary/10 pb-2 md:pb-0 md:border-none">
                      <span className="md:hidden font-label-sm text-tertiary">{renderCreatorLabel()}</span>
                      <span className="font-body-md text-on-surface line-clamp-2 text-right" title={creatorVal}>
                        {creatorVal !== "not specified" && creatorVal ? creatorVal : "—"}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex justify-between items-center h-auto md:h-[64px] border-b border-secondary/10 pb-2 md:pb-0 md:border-none">
                      <span className="md:hidden font-label-sm text-tertiary">Rating</span>
                      <div className="flex items-center text-primary-container">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                        <span className="ml-2 font-label-md text-on-background">{score}</span>
                      </div>
                    </div>

                    {/* Why Recommended */}
                    <div className="flex justify-between items-center h-auto md:h-[64px]">
                      <span className="md:hidden font-label-sm text-tertiary">Why Recommended</span>
                      <div className="font-body-sm text-on-background bg-surface-container-low p-2 rounded max-h-[60px] overflow-y-auto text-right w-full md:w-auto">
                         {item.similarity_basis ? item.similarity_basis : "Recommended for you"}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
