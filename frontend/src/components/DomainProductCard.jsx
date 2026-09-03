import React from "react";

export function DomainProductCard({ domain, item, isSelected, onToggleSelect }) {
  // Normalize score to percentage for the progress bar
  let percentage = 75;
  if (item.score !== undefined && item.score !== null) {
    if (item.score <= 1) {
      percentage = Math.round(item.score * 100);
    } else {
      const maxScore = domain === 'bookcrossing' ? 10 : (domain === 'steam' ? 30000 : 1000);
      percentage = Math.min(100, Math.round((item.score / maxScore) * 100));
    }
  }

  // Domain metadata color accents and icons
  const getDomainTheme = () => {
    switch (domain) {
      case 'steam':
        return {
          icon: 'sports_esports',
          label: 'Steam Game',
          scoreLabel: 'Match Score',
          accent: 'from-cyan-500 to-blue-600',
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        };
      case 'bookcrossing':
      default:
        return {
          icon: 'menu_book',
          label: 'Book Title',
          scoreLabel: 'Relevance Score',
          accent: 'from-emerald-500 to-teal-600',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
    }
  };

  const theme = getDomainTheme();
  const title = item.title || item.metadata?.title || (domain === 'steam' ? `Game #${item.item_id}` : `Item #${item.item_id}`);
  const authorOrDev = item.metadata?.author || item.metadata?.publisher || item.metadata?.developer;
  const year = item.metadata?.year || item.metadata?.release_date;
  const category = item.metadata?.category || item.metadata?.genre;

  return (
    <div 
      onClick={onToggleSelect}
      className={`group relative flex flex-col justify-between bg-white border rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected 
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10 bg-emerald-50/20 -translate-y-1' 
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 shadow-sm'
      }`}
    >
      {/* Top selection indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
        isSelected ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-transparent group-hover:bg-slate-200'
      }`} />

      {/* Main Content Area */}
      <div>
        {/* Top meta & Action Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
              <span className="material-symbols-outlined text-[13px]">{theme.icon}</span>
              <span>ID: {item.item_id}</span>
            </span>
            {category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                {category}
              </span>
            )}
          </div>

          <button 
            type="button"
            aria-label={isSelected ? "Remove from comparison" : "Add to comparison"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
              isSelected 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105' 
                : 'bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSelected ? 'check' : 'add'}
            </span>
          </button>
        </div>

        {/* Thumbnail and Info Section */}
        <div className="flex gap-4 items-start">
          {item.metadata?.image_url_m ? (
            <div className="w-16 h-22 shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-100 relative">
              <img 
                src={item.metadata.image_url_m} 
                alt={title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  const fb = e.currentTarget.nextElementSibling;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              {/* Fallback art if image fails to load */}
              <div className="absolute inset-0 hidden flex-col items-center justify-center p-1 text-center bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-xl text-emerald-500 mb-0.5">{theme.icon}</span>
                <span className="text-[9px] font-mono leading-none text-slate-400 truncate w-full">#{item.item_id}</span>
              </div>
            </div>
          ) : (
            <div className="w-16 h-22 shrink-0 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:border-emerald-500/40 transition-all shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-lg">{theme.icon}</span>
              </div>
              <span className="text-[10px] font-bold font-mono text-slate-500 truncate w-full">#{item.item_id}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors" title={title}>
              {title}
            </h3>
            
            {(authorOrDev || year) && (
              <p className="text-xs font-medium text-slate-500 mt-1 truncate">
                {authorOrDev} {year ? `• ${year}` : ''}
              </p>
            )}

            {item.metadata?.rating && (
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-semibold">
                <span className="material-symbols-outlined text-[14px]">star</span>
                <span>{item.metadata.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Score & Similarity Basis */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Score Bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-500">{theme.scoreLabel}</span>
            <span className="font-bold text-slate-800 font-mono">{percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${theme.accent} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Similarity / Recommendation Tag */}
        {item.similarity_basis && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0">auto_awesome</span>
            <span className="truncate">{item.similarity_basis}</span>
          </div>
        )}
      </div>
    </div>
  );
}


