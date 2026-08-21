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
      className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest/80 border-surface-variant backdrop-blur-sm hover:border-primary'}`}
    >
      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
    </div>
  );

  // Common card container wrapper
  const Wrapper = ({ children }) => (
    <article 
      onClick={onToggleSelect}
      className={`bg-surface-container-lowest rounded-[16px] border border-secondary/10 card-shadow card-shadow-hover transition-all duration-300 p-6 flex flex-col group cursor-pointer ${selectedRing} relative overflow-hidden`}
    >
      <CheckboxOverlay />
      {children}
    </article>
  );

  // Retailrocket (Minimal) — only item_id + score, no rich metadata
  if (domain.toLowerCase() === "retailrocket") {
    return (
      <Wrapper>
        <div className="w-full aspect-[4/3] sm:aspect-square bg-surface-container-high rounded-lg mb-4 flex items-center justify-center relative">
          <span className="material-symbols-outlined text-4xl text-tertiary opacity-20 group-hover:scale-110 transition-transform">shopping_cart</span>
          <div className="absolute top-2 right-2 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm">
            Retail
          </div>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Item #{item.item_id}</h3>
        <div className="flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined fill text-primary text-sm">star</span>
          <span className="text-xs font-medium text-on-surface">{item.score?.toFixed(2)} Score</span>
        </div>
        {item.similarity_basis && (
          <div className="mt-auto pt-4 flex items-center">
             <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-medium border border-secondary-fixed-dim">
                {item.similarity_basis}
             </div>
          </div>
        )}
      </Wrapper>
    );
  }

  // Steam (Medium) — item_id + score + similarity_basis
  if (domain.toLowerCase() === "steam") {
    return (
      <Wrapper>
        <div className="w-full aspect-[4/3] sm:aspect-square bg-surface-container-high rounded-lg mb-4 flex items-center justify-center relative">
          <span className="material-symbols-outlined text-4xl text-tertiary opacity-20 group-hover:scale-110 transition-transform">sports_esports</span>
          <div className="absolute top-2 right-2 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm">
            Gaming
          </div>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 line-clamp-1" title={item.title || `Steam Item #${item.item_id}`}>
          {item.title || `Steam Item #${item.item_id}`}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined fill text-primary text-sm">star</span>
          <span className="text-xs font-medium text-on-surface">{item.score?.toFixed(2)} Score</span>
          <span className="text-xs text-tertiary ml-1">ID: {item.item_id}</span>
        </div>
        {item.similarity_basis && (
          <div className="mt-auto pt-4 flex items-center">
             <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-medium border border-secondary-fixed-dim">
                {item.similarity_basis}
             </div>
          </div>
        )}
      </Wrapper>
    );
  }

  // BookCrossing (Rich) — item_id + score + metadata if available
  const metadata = item.metadata || {};
  const coverUrl = metadata["image_url_l"] || metadata["image_url_m"];
  const title = item.title || metadata["title"] || `Book #${item.item_id}`;
  const author = metadata["author"] || "Not specified";
  const year = metadata["year"] || "Not specified";

  return (
    <Wrapper>
      <div className="w-full aspect-[4/3] sm:aspect-square bg-surface-container-high rounded-lg mb-4 overflow-hidden relative flex items-center justify-center">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            onLoad={(e) => {
              if (e.target.naturalWidth <= 1) {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-tertiary p-4 text-center" style={{ display: coverUrl ? 'none' : 'flex' }}>
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] font-medium uppercase tracking-wider">No cover</span>
        </div>
        <div className="absolute top-2 right-2 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm z-10">
          Media
        </div>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 line-clamp-1" title={title}>
        {title}
      </h3>
      <p className="text-xs text-tertiary mb-1 line-clamp-1">{author}</p>
      <div className="flex items-center gap-1 mb-2">
        <span className="material-symbols-outlined fill text-primary text-sm">star</span>
        <span className="text-xs font-medium text-on-surface">{item.score?.toFixed(2)}</span>
        <span className="text-xs text-tertiary ml-1">({year})</span>
      </div>
      {item.similarity_basis && (
        <div className="mt-auto pt-4 flex items-center">
           <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-[11px] font-medium border border-secondary-fixed-dim whitespace-normal break-words line-clamp-2">
              {item.similarity_basis}
           </div>
        </div>
      )}
    </Wrapper>
  );
}
