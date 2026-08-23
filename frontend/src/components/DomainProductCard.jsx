import React from "react";

export function DomainProductCard({ domain, item, isSelected, onToggleSelect }) {
  // Normalize score to percentage for the progress bar
  let percentage = 50;
  if (item.score !== undefined) {
    if (item.score <= 1) {
      percentage = Math.round(item.score * 100);
    } else {
      const maxScore = domain === 'bookcrossing' ? 10 : (domain === 'steam' ? 30000 : 1000);
      percentage = Math.min(100, Math.round((item.score / maxScore) * 100));
    }
  }

  return (
    <div 
      onClick={onToggleSelect}
      className={`bg-surface-container-lowest border p-card-padding rounded-lg flex flex-col gap-4 transition-all duration-200 group relative cursor-pointer ${isSelected ? 'border-primary bg-surface-bright' : 'border-outline-variant hover:bg-surface-bright hover:border-outline'}`}
    >
      {/* Left border stroke on hover indicating selection/focus */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-primary transition-transform origin-top ${isSelected ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'}`}></div>
      
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          {item.metadata?.image_url_m && (
            <img src={item.metadata.image_url_m} alt={item.title || item.metadata?.title || "Cover"} className="w-16 h-24 object-cover rounded shadow-sm border border-outline-variant/30" />
          )}
          <div>
            <div className="font-label-caps text-label-caps text-tertiary mb-1 uppercase">
              {domain === 'steam' ? (item.title ? 'Game ID' : 'Item ID') : 
               domain === 'bookcrossing' ? (item.title || item.metadata?.title ? 'Book ID' : 'Item ID') : 
               'Item ID'}
            </div>
            <div className="font-data-mono text-data-mono text-on-surface text-lg">
              {item.item_id}
            </div>
            {(item.title || item.metadata?.title) && (
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2" title={item.title || item.metadata?.title}>
                {item.title || item.metadata?.title}
              </div>
            )}
            {item.metadata?.author && (
              <div className="font-body-sm text-body-sm text-tertiary mt-0.5 line-clamp-1">
                {item.metadata.author} {item.metadata?.year ? `(${item.metadata.year})` : ''}
              </div>
            )}
          </div>
        </div>
        <button 
          aria-label={isSelected ? "Remove from Compare" : "Add to Compare"} 
          className={`transition-colors ${isSelected ? 'text-primary' : 'text-tertiary hover:text-primary'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
        >
          <span className="material-symbols-outlined">
            {isSelected ? 'check_circle' : 'add_circle'}
          </span>
        </button>
      </div>

      {/* Score Bar */}
      <div className="w-full mt-2">
        <div className="flex justify-between items-end mb-1">
          <span className="font-label-caps text-label-caps text-tertiary">
            {domain === 'steam' ? 'Match Score' : domain === 'retailrocket' ? 'Popularity' : 'Relevance'}
          </span>
          <span className="font-data-mono text-data-mono text-primary">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-bright rounded-full overflow-hidden border border-outline-variant/30">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>

      {/* Reasoning Chip */}
      {item.similarity_basis && (
        <div className="mt-auto pt-2">
          <span className="inline-block bg-secondary-container/50 text-slate-800 font-body-sm text-body-sm px-2 py-1 rounded-sm line-clamp-2">
            {item.similarity_basis}
          </span>
        </div>
      )}
    </div>
  );
}
