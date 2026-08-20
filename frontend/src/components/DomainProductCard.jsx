import React from "react";
import { ImageOff } from "lucide-react";

export function DomainProductCard({ domain, item, isSelected, onToggleSelect }) {
  const selectedRing = isSelected ? "ring-2 ring-primary ring-offset-2" : "";
  const CheckboxOverlay = () => (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggleSelect();
      }}
      className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest/80 border-outline backdrop-blur-sm hover:border-primary'}`}
    >
      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
    </div>
  );

  // Retailrocket (Minimal) — only item_id + score, no rich metadata
  if (domain.toLowerCase() === "retailrocket") {
    return (
      <div 
        onClick={onToggleSelect}
        className={`bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:shadow-sm transition-all group relative flex flex-col justify-center cursor-pointer ${selectedRing}`}
      >
        <CheckboxOverlay />
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-surface-container-low px-2 py-1 rounded text-xs font-medium text-on-surface flex items-center gap-1 border border-outline-variant">
            Retailrocket
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center pr-8">
          <h3 className="text-sm font-semibold text-on-surface-variant mb-1">Item #{item.item_id}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 flex-1 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary-fixed-dim w-[85%]"></div>
            </div>
            <span className="text-xs font-medium text-primary-fixed-variant">
              {item.score?.toFixed(2)} Score
            </span>
          </div>
          {item.similarity_basis && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-medium border border-secondary-fixed-dim w-fit">
              {item.similarity_basis}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Steam (Medium) — item_id + score + similarity_basis
  if (domain.toLowerCase() === "steam") {
    return (
      <div 
        onClick={onToggleSelect}
        className={`bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:shadow-sm transition-all group relative flex flex-col cursor-pointer ${selectedRing}`}
      >
        <CheckboxOverlay />
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-surface-container-low px-2 py-1 rounded text-xs font-medium text-on-surface flex items-center gap-1 border border-outline-variant">
            Steam
          </div>
          <span className="text-xs text-on-surface-variant ml-auto pr-8">ID: {item.item_id}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-on-surface mb-1 pr-6">{item.title || `Steam Item #${item.item_id}`}</h3>
          <div className="flex items-center gap-2 mb-4 mt-4">
             <div className="h-1.5 flex-1 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[92%]"></div>
             </div>
             <span className="text-xs font-medium text-primary flex items-center gap-1">
                {item.score?.toFixed(2)} Score
             </span>
          </div>
          {item.similarity_basis && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-medium border border-secondary-fixed-dim">
              {item.similarity_basis}
            </div>
          )}
        </div>
      </div>
    );
  }

  // BookCrossing (Rich) — item_id + score + metadata if available
  const metadata = item.metadata || {};
  const coverUrl = metadata["image_url_l"] || metadata["image_url_m"];
  const title = item.title || metadata["title"] || `Book #${item.item_id}`;
  const author = metadata["author"] || "Not specified";
  const year = metadata["year"] || "Not specified";

  return (
    <div 
      onClick={onToggleSelect}
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:shadow-sm transition-all group relative flex flex-col h-full cursor-pointer ${selectedRing}`}
    >
      <CheckboxOverlay />
      {/* Column 1: Image (Top) */}
      <div className="w-full h-48 bg-surface-variant rounded-md mb-4 overflow-hidden relative border border-outline-variant shrink-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant p-4 text-center" style={{ display: coverUrl ? 'none' : 'flex' }}>
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] font-medium uppercase tracking-wider">No cover</span>
        </div>
        <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-on-surface flex items-center gap-1 border border-outline-variant">
          BookCrossing
        </div>
      </div>

      {/* Column 2: Details (Bottom) */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-on-surface pr-2 mb-1 line-clamp-2" title={title}>
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant mb-1 line-clamp-1">{author}</p>
        <p className="text-xs text-outline mb-4">Published in {year} • ID: {item.item_id}</p>
        
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-1.5 flex-1 bg-surface-variant rounded-full overflow-hidden">
               <div className="h-full bg-primary w-[98%]"></div>
             </div>
             <span className="text-xs font-semibold text-primary flex items-center gap-1">
               {item.score?.toFixed(4)} Score
             </span>
          </div>
          {item.similarity_basis && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-medium border border-secondary-fixed-dim whitespace-normal break-words">
              {item.similarity_basis}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
