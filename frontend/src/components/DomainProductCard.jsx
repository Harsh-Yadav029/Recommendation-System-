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

  // Domain metadata color accents
  const getDomainTheme = () => {
    switch (domain) {
      case 'steam':
        return {
          label: 'Steam Game',
          scoreLabel: 'Match Score',
          accent: 'from-[#2D7D7D] to-[#6B9B7A]',
          badgeBg: 'bg-[#E7F2F2] text-[#2D7D7D] border-[#2D7D7D]/20',
          idBadge: 'bg-[#E7F2F2] text-[#2D7D7D] border-[#2D7D7D]/20'
        };
      case 'bookcrossing':
      default:
        return {
          label: 'Book Title',
          scoreLabel: 'Relevance Score',
          accent: 'from-[#2D7D7D] via-[#468B8B] to-[#6B9B7A]',
          badgeBg: 'bg-[#E7F2F2] text-[#2D7D7D] border-[#2D7D7D]/20',
          idBadge: 'bg-[#E7F2F2] text-[#2D7D7D] border-[#2D7D7D]/20'
        };
    }
  };

  const theme = getDomainTheme();
  const title = item.title || item.metadata?.title || (domain === 'steam' ? `Game #${item.item_id}` : `Item #${item.item_id}`);
  const authorOrDev = item.metadata?.author || item.metadata?.publisher || item.metadata?.developer;
  const year = item.metadata?.year || item.metadata?.release_date;
  const category = item.metadata?.category || item.metadata?.genre;

  // Calculate star count (1 to 5)
  const calculateStars = (rating) => {
    if (!rating) return 0;
    if (typeof rating === 'string' && rating.includes('-')) {
      const parts = rating.split('-').map(Number);
      const avg = (parts[0] + parts[1]) / 2;
      return Math.min(5, Math.max(1, Math.round((avg / 100) * 5)));
    }
    const num = Number(rating);
    if (isNaN(num)) return 4;
    if (num > 5) return Math.min(5, Math.max(1, Math.round(num / 2)));
    return Math.min(5, Math.max(1, Math.round(num)));
  };

  const starCount = calculateStars(item.metadata?.rating);

  return (
    <div 
      onClick={onToggleSelect}
      className={`group relative flex flex-col justify-between bg-white border rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected 
          ? 'border-[#2D7D7D] ring-2 ring-[#2D7D7D]/20 shadow-[0_12px_32px_rgba(45,125,125,0.12)] bg-[#E7F2F2]/30 -translate-y-1' 
          : 'border-[#2D7D7D]/15 hover:border-[#2D7D7D]/40 hover:shadow-[0_12px_30px_-4px_rgba(45,125,125,0.08)] hover:-translate-y-1 shadow-2xs'
      }`}
    >
      {/* Top selection indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
        isSelected ? 'bg-gradient-to-r from-[#2D7D7D] to-[#E8935C]' : 'bg-transparent group-hover:bg-[#E7F2F2]'
      }`} />

      {/* Main Content Area */}
      <div>
        {/* Top meta & Action Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.idBadge}`}>
              ID: {item.item_id}
            </span>
            {category && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F7F5F0] text-[#586666] border border-[#2D7D7D]/10">
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
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
              isSelected 
                ? 'bg-[#2D7D7D] text-white shadow-md shadow-[#2D7D7D]/30 scale-105' 
                : 'bg-[#F7F5F0] text-[#8A8680] hover:text-[#2D7D7D] hover:bg-[#E7F2F2] border border-[#2D7D7D]/10'
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
            <div className="w-16 h-22 shrink-0 rounded-xl overflow-hidden shadow-2xs border border-[#2D7D7D]/15 bg-[#F7F5F0] relative">
              <img 
                src={item.metadata.image_url_m.replace(/^http:\/\//i, 'https://')} 
                alt={title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  const fb = e.currentTarget.nextElementSibling;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              {/* Fallback art with clean ID */}
              <div className="absolute inset-0 hidden flex-col items-center justify-center p-2 text-center bg-[#E7F2F2] text-[#2D7D7D]">
                <span className="text-[11px] font-extrabold font-mono text-[#2D7D7D] leading-tight break-all">ID<br/>{item.item_id}</span>
              </div>
            </div>
          ) : (
            <div className="w-16 h-22 shrink-0 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-[#E7F2F2] border border-[#2D7D7D]/20 text-[#2D7D7D] group-hover:border-[#2D7D7D]/40 transition-all shadow-2xs">
              <span className="text-[11px] font-extrabold font-mono text-[#2D7D7D] leading-tight break-all">ID<br/>{item.item_id}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-extrabold text-[#192A2A] leading-snug line-clamp-2 group-hover:text-[#2D7D7D] transition-colors" title={title}>
              {title}
            </h3>
            
            {(authorOrDev || year) && (
              <p className="text-xs font-semibold text-[#586666] mt-1 truncate">
                {authorOrDev} {year ? `• ${year}` : ''}
              </p>
            )}

            {/* Multiple Black Stars Rating */}
            {item.metadata?.rating && (
              <div className="flex items-center gap-0.5 text-black mt-2">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <span 
                    key={starIndex} 
                    className={`text-[13px] leading-none ${
                      starIndex <= starCount ? 'text-black opacity-100' : 'text-slate-300 opacity-50'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Score */}
      <div className="mt-4 pt-3.5 border-t border-[#2D7D7D]/10">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-semibold text-[#586666]">{theme.scoreLabel}</span>
          <span className="font-extrabold text-[#2D7D7D] font-mono">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#E7F2F2] rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${theme.accent} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
