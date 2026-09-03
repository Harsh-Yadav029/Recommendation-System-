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
          const apiCat = (apiItem.category && String(apiItem.category).toLowerCase() !== "not specified") ? apiItem.category : null;
          const apiGenre = (apiItem.genre && String(apiItem.genre).toLowerCase() !== "not specified") ? apiItem.genre : null;
          const selCat = (selectedItem?.metadata?.category && String(selectedItem.metadata.category).toLowerCase() !== "not specified") ? selectedItem.metadata.category : null;
          const selGenre = (selectedItem?.metadata?.genre && String(selectedItem.metadata.genre).toLowerCase() !== "not specified") ? selectedItem.metadata.genre : null;
          
          const cat = apiCat || apiGenre || selCat || selGenre || (domain === 'steam' ? 'Action' : 'Fiction');
          return {
            ...selectedItem,
            ...apiItem,
            category: cat,
            genre: cat,
            metadata: {
              ...(selectedItem?.metadata || {}),
              ...(apiItem?.metadata || {}),
              category: cat,
              genre: cat
            },
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
    return "Genre / Category";
  };

  const getCreatorValue = (item) => {
    if (domain === "bookcrossing") return item.metadata?.author || item.author;
    return item.category || item.metadata?.genre;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#192A2A] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E7F2F2] text-[#2D7D7D] flex items-center justify-center border border-[#2D7D7D]/20 shadow-md animate-spin">
          <span className="material-symbols-outlined text-2xl">sync</span>
        </div>
        <p className="text-sm text-[#586666] font-bold">Building comparison matrix...</p>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#192A2A] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#2D7D7D]/15 shadow-md flex items-center justify-center text-[#2D7D7D]">
          <span className="material-symbols-outlined text-3xl">compare_arrows</span>
        </div>
        <h2 className="text-lg font-extrabold text-[#192A2A]">No items selected for comparison</h2>
        <p className="text-xs text-[#586666] max-w-sm text-center font-medium">Select at least 2 items from the browse catalog to generate a side-by-side audit.</p>
        <button 
          onClick={onBack} 
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white font-bold text-xs shadow-md shadow-[#2D7D7D]/20 transition-all cursor-pointer"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#192A2A] flex flex-col antialiased selection:bg-[#2D7D7D] selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#2D7D7D] text-white shadow-[0_4px_20px_rgba(45,125,125,0.15)] border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-white/20 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Browse</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <h1 className="text-sm font-extrabold tracking-tight hidden sm:flex items-center gap-2">
              <span>Comparison Studio</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E7F2F2] text-[#2D7D7D]">
                {domain}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Matrix</span>
            </button>

            {user && (
              <div className="w-8 h-8 rounded-xl bg-white text-[#2D7D7D] flex items-center justify-center font-black text-xs uppercase shadow-sm">
                {user.email[0]}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Comparison Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
        
        {/* Matrix Comparison Container */}
        <section className="bg-white border border-[#2D7D7D]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(45,125,125,0.04)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#192A2A]">Side-by-Side Analytical Matrix</h2>
              <p className="text-xs text-[#586666] mt-0.5">Comparing attributes, relevance scores, and metadata.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E7F2F2] text-[#2D7D7D] border border-[#2D7D7D]/20">
              {items.length} Items Selected
            </span>
          </div>

          {/* Cards Header Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div 
                key={item.item_id}
                className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D7D7D] to-[#E8935C]" />
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-[#2D7D7D] border border-[#2D7D7D]/15 shadow-2xs">
                      ID: {item.item_id}
                    </span>
                    {item.popularity_score !== undefined && (
                      <span className="text-xs font-extrabold text-[#2D7D7D] font-mono">
                        {Math.round(item.popularity_score <= 1 ? item.popularity_score * 100 : Math.min(100, (item.popularity_score / 10) * 100))}% Match
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-[#192A2A] line-clamp-2 mb-1" title={item.title || item.name}>
                    {item.title || item.name || `Item #${item.item_id}`}
                  </h3>

                  <p className="text-xs font-semibold text-[#586666] truncate">
                    {getCreatorValue(item) || "Not specified"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Metric Rows */}
          <div className="mt-8 space-y-3">
            <h4 className="text-xs font-extrabold text-[#8A8680] uppercase tracking-wider mb-4">Detailed Metrics</h4>
            
            {/* Row 1: Creator */}
            <div className="bg-[#F7F5F0] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#2D7D7D]/10">
              <span className="text-xs font-bold text-[#192A2A] w-44 shrink-0">{renderCreatorLabel()}</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
                {items.map(i => (
                  <div key={i.item_id} className="text-xs font-semibold text-[#192A2A] truncate">
                    {getCreatorValue(i) || <span className="text-[#8A8680] italic">Not specified</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Category */}
            <div className="bg-[#F7F5F0] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#2D7D7D]/10">
              <span className="text-xs font-bold text-[#192A2A] w-44 shrink-0">Category / Genre</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
                {items.map(i => {
                  const catVal = (i.category && String(i.category).toLowerCase() !== "not specified") ? i.category : (
                    (i.metadata?.category && String(i.metadata.category).toLowerCase() !== "not specified") ? i.metadata.category : (
                      (i.metadata?.genre && String(i.metadata.genre).toLowerCase() !== "not specified") ? i.metadata.genre : (domain === 'steam' ? 'Action' : 'Fiction')
                    )
                  );
                  return (
                    <div key={i.item_id} className="text-xs font-semibold text-[#192A2A] truncate">
                      {catVal}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Year / Release Date */}
            <div className="bg-[#F7F5F0] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#2D7D7D]/10">
              <span className="text-xs font-bold text-[#192A2A] w-44 shrink-0">Release / Publication</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
                {items.map(i => (
                  <div key={i.item_id} className="text-xs font-semibold text-[#192A2A] truncate">
                    {i.metadata?.year || i.metadata?.release_date || i.year || <span className="text-[#8A8680] italic">Not specified</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Comparison Analyst Section */}
        <section className="bg-white border border-[#2D7D7D]/15 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(45,125,125,0.04)] flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E7F2F2] text-[#2D7D7D] flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <h2 className="text-base font-black text-[#192A2A]">AI Comparative Analyst</h2>
              <p className="text-xs text-[#586666]">Ask deep trade-off questions about these candidates.</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-[#F7F5F0] rounded-2xl p-4 sm:p-6 min-h-[220px] max-h-[380px] overflow-y-auto space-y-4 border border-[#2D7D7D]/10">
            {chatHistory.length === 0 && !aiLoading && (
              <div className="text-center py-8 text-xs text-[#8A8680] font-medium">
                Initializing AI comparative synthesis...
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-[#2D7D7D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>
                )}
                <div 
                  className={`p-4 rounded-2xl text-xs max-w-xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#2D7D7D] text-white shadow-xs rounded-tr-none'
                      : 'bg-white border border-[#2D7D7D]/15 text-[#192A2A] shadow-2xs rounded-tl-none font-medium'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex gap-3 items-center text-xs text-[#586666] font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-[#2D7D7D]" />
                <span>Analyst is evaluating comparison trade-offs...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="e.g. Which item provides the highest user rating relative to its publication era?"
              className="flex-1 bg-white border border-[#2D7D7D]/20 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D7D]/20 text-[#192A2A] placeholder:text-[#8A8680] shadow-2xs"
            />
            <button
              type="submit"
              disabled={aiLoading || !userMessage.trim()}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                userMessage.trim() && !aiLoading
                  ? 'bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white shadow-md shadow-[#2D7D7D]/20'
                  : 'bg-[#EAE8E4] text-[#8A8680] cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
