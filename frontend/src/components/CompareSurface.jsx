import React, { useEffect, useState, useRef } from "react";
import { Loader2, Send } from "lucide-react";

export function CompareSurface({ selectedItems, domain, onBack, csrfToken, user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // AI Chat states
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const chatEndRef = useRef(null);

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
        const mergedItems = (data.items || []).map(apiItem => {
          const selectedItem = selectedItems.find(i => String(i.item_id) === String(apiItem.item_id));
          return {
            ...apiItem,
            similarity_basis: selectedItem ? selectedItem.similarity_basis : null,
            popularity_score: selectedItem ? selectedItem.score : apiItem.popularity_score
          };
        });
        setItems(mergedItems);
        setLoading(false);
        
        // Trigger initial AI Comparison Summary
        fetchAiResponse(itemIds, null);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [domain, selectedItems, csrfToken]);

  const fetchAiResponse = async (itemIds, message) => {
    setAiLoading(true);
    if (message) {
      setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    }
    
    try {
      const res = await fetch(`/api/assistant/compare_chat`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken
        },
        body: JSON.stringify({ domain, item_ids: itemIds, user_message: message || undefined })
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      
      setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Failed to get AI response. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [chatHistory, aiLoading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userMessage.trim() || aiLoading) return;
    const msg = userMessage;
    setUserMessage("");
    const itemIds = selectedItems.map(i => i.item_id);
    fetchAiResponse(itemIds, msg);
  };

  const renderCreatorLabel = () => {
    if (domain === "bookcrossing") return "Author";
    if (domain === "steam") return "Genre / Category";
    return "Price";
  };

  const getCreatorValue = (item) => {
    if (domain === "bookcrossing") return item.metadata?.author || item.author;
    if (domain === "steam") return item.category || item.metadata?.genre;
    return item.price || item.metadata?.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center animate-spin">
          <span className="material-symbols-outlined text-2xl">sync</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">Building comparison matrix...</p>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined text-3xl">compare_arrows</span>
        </div>
        <h2 className="text-base font-bold">No items selected for comparison</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">Select at least 2 items from the browse catalog to generate a side-by-side audit.</p>
        <button 
          onClick={onBack} 
          className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-xl font-black tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <span className="material-symbols-outlined text-slate-950 font-bold text-[20px]">swap_horiz</span>
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">CompareX</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Catalog</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Comparing {selectedItems.length} items
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                {user.email[0]}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Title & Domain Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Side-by-Side Comparison Matrix</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                {domain}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic feature extraction with grounded AI comparative analysis.
            </p>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Modify Selection</span>
          </button>
        </div>

        {/* 2-Column Layout: Cards Matrix on Left + AI Chat on Right */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* Left Column: Product Spec Cards */}
          <div className="flex-1 w-full min-w-0">
            {error ? (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span>Error loading comparison: {error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map((item) => {
                  const title = item.title && item.title !== "not specified" ? item.title : (item.metadata?.title || `Item #${item.item_id}`);
                  const creatorVal = getCreatorValue(item);
                  const score = item.popularity_score > 0 
                    ? (item.popularity_score <= 1 ? Math.round(item.popularity_score * 100) : Math.min(100, Math.round((item.popularity_score / 10) * 100))) 
                    : 75;
                  
                  return (
                    <div 
                      key={item.item_id} 
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                      
                      <div>
                        {/* Cover image or fallback */}
                        {item.image_url_l && item.image_url_l !== "not specified" ? (
                          <div className="mb-4 h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                            <img src={item.image_url_l} alt={title} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="mb-4 h-32 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined text-3xl text-emerald-400 mb-1">menu_book</span>
                            <span className="text-xs font-mono">#{item.item_id}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                            ID: {item.item_id}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{score}% match</span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug line-clamp-2" title={title}>
                          {title}
                        </h3>

                        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">{renderCreatorLabel()}</span>
                            <span className="font-semibold text-slate-200 truncate max-w-[180px]">{creatorVal || "—"}</span>
                          </div>
                          {item.year && item.year !== "not specified" && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Year</span>
                              <span className="font-semibold text-slate-200">{item.year}</span>
                            </div>
                          )}
                          {item.publisher && item.publisher !== "not specified" && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Publisher</span>
                              <span className="font-semibold text-slate-200 truncate max-w-[180px]">{item.publisher}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Insight */}
                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mb-1">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          <span>Recommendation Basis</span>
                        </div>
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                          {item.similarity_basis || "Popularity baseline recommendation."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: AI Assistant Chat */}
          <div className="w-full xl:w-[420px] shrink-0 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] xl:sticky xl:top-24">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">AI Comparative Analyst</h3>
                  <p className="text-[10px] text-emerald-400">Gemini 2.5 Flash grounded evaluation</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
              {chatHistory.length === 0 && !aiLoading && (
                <div className="text-center text-slate-500 text-xs py-10">
                  <span className="material-symbols-outlined text-3xl mb-2 text-slate-600">forum</span>
                  <p>Comparing selected items...</p>
                </div>
              )}
              
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60'
                  }`}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </div>
              ))}
              
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 text-emerald-400 rounded-2xl px-3.5 py-2.5 rounded-tl-sm border border-slate-700/60 flex items-center gap-2 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing comparison matrix...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
                placeholder="Ask a question about these items..."
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                disabled={aiLoading}
              />
              <button 
                type="submit" 
                disabled={!userMessage.trim() || aiLoading}
                className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
          
        </div>
      </main>
    </div>
  );
}

