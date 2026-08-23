import React, { useEffect, useState, useRef } from "react";
import { ImageOff, Loader2, Send } from "lucide-react";

export function CompareSurface({ selectedItems, domain, onBack, csrfToken, user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // AI Chat states
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // {role: 'ai'|'user', content: string}
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
    // Fetch comparison data from DB
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

  const domainName = domain === "bookcrossing" ? "BookCrossing" : domain === "steam" ? "Steam" : "Retailrocket";

  const renderCreatorLabel = () => {
    if (domain === "bookcrossing") return "Author";
    if (domain === "steam") return "Category";
    return "Price";
  };

  const getCreatorValue = (item) => {
    if (domain === "bookcrossing") return item.metadata?.author;
    if (domain === "steam") return item.category;
    return item.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-tertiary font-body-md flex items-center gap-2">
          <Loader2 className="animate-spin" />
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

  return (
    <div className="bg-background min-h-screen text-on-background font-body-md flex flex-col flex-1">
      {/* TopNavBar */}
      <header className="hidden md:flex bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline flex w-full h-row-height-standard max-w-full top-0 z-50">
        <div className="w-64 flex items-center pl-container-margin shrink-0">
          <div className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed tracking-tight">CompareX</div>
        </div>
        <div className="flex-1 flex justify-between items-center px-container-margin">
          <nav className="flex gap-4">
            <button onClick={onBack} className="font-title-md text-title-md text-tertiary dark:text-tertiary-fixed-dim hover:opacity-80 transition-colors scale-95 duration-100">Browse</button>
            <span className="font-title-md text-title-md text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1 scale-95 duration-100">Compare ({selectedItems.length})</span>
          </nav>
          <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-8 h-8 rounded-full border border-outline-variant bg-primary text-on-primary flex items-center justify-center font-bold text-xs uppercase cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {user.email[0]}
                </button>
                
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Banner */}
                      <div className="h-24 bg-purple-200 dark:bg-purple-900/30 w-full relative">
                        {/* Avatar */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                          <div className="w-16 h-16 rounded-2xl border-4 border-surface bg-primary text-on-primary flex items-center justify-center font-bold text-3xl uppercase shadow-sm">
                            {user.email[0]}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-10 pb-4 px-4 text-center border-b border-outline-variant/60">
                        <h3 className="font-title-lg text-title-lg font-bold text-on-surface capitalize">
                          {user.email.split('@')[0].replace(/[._-]/g, ' ')}
                        </h3>
                        <p className="font-body-sm text-body-sm text-tertiary mt-1">
                          {user.email}
                        </p>
                      </div>

                      <div className="px-6 py-4">
                        <h4 className="font-title-md text-title-md text-on-surface font-bold mb-4">Personal Info</h4>
                        
                        <div className="flex justify-between items-center py-2 border-b border-outline-variant/40">
                          <div>
                            <p className="font-body-sm text-body-sm font-medium text-on-surface mb-0.5">Full Name</p>
                            <p className="font-body-sm text-body-sm text-tertiary capitalize">{user.email.split('@')[0].replace(/[._-]/g, ' ')}</p>
                          </div>
                          <span className="material-symbols-outlined text-tertiary text-[20px]">chevron_right</span>
                        </div>

                        <div className="flex justify-between items-center py-2 mt-2">
                          <div>
                            <p className="font-body-sm text-body-sm font-medium text-on-surface mb-0.5">Email Address</p>
                            <p className="font-body-sm text-body-sm text-tertiary">{user.email}</p>
                          </div>
                          <span className="material-symbols-outlined text-tertiary text-[20px]">chevron_right</span>
                        </div>
                      </div>

                      <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant/60">
                        <button 
                          onClick={onLogout}
                          className="w-full flex items-center justify-center gap-2 bg-error-container text-on-error-container hover:bg-error hover:text-on-error py-2.5 rounded-lg transition-colors font-label-lg font-bold"
                        >
                          <span className="material-symbols-outlined text-[20px]">logout</span>
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={onBack} className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-[16px] hover:bg-primary-container hover:text-on-primary-container transition-all">Back to Home</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-container-max-width mx-auto px-4 md:px-8 py-8 flex flex-col">
        {/* Header (Back button + Title) */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="flex items-center gap-1 text-tertiary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <h1 className="font-display-sm text-on-background">Comparison Audit</h1>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Side: Comparison Grid */}
          <div className="flex-1 w-full xl:w-2/3">

          {error ? (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg border border-error">
              Error loading comparison: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
              {items.map((item, idx) => {
                const title = item.title && item.title !== "not specified" ? item.title : (item.metadata?.title || `Item #${item.item_id}`);
                const creatorVal = getCreatorValue(item);
                const score = item.popularity_score > 0 ? (item.popularity_score <= 1 ? Math.round(item.popularity_score * 100) : Math.min(100, Math.round((item.popularity_score / 5) * 100))) : 50;
                
                return (
                  <div key={item.item_id} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg flex flex-col gap-4 relative">
                    {/* Left border stroke */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary scale-y-100 origin-top"></div>
                    
                    <div>
                      {item.image_url_l && item.image_url_l !== "not specified" && (
                        <div className="mb-4">
                          <img src={item.image_url_l} alt={title || "Cover"} className="w-full h-48 object-contain bg-surface-bright rounded border border-outline-variant/30" />
                        </div>
                      )}
                      <div className="font-label-caps text-label-caps text-tertiary mb-1 uppercase">
                        {domain === 'steam' ? 'Game' : domain === 'bookcrossing' ? 'Book' : 'Product'} ID: {item.item_id}
                      </div>
                      <div className="font-data-mono text-data-mono text-on-surface text-lg mb-2 line-clamp-2" title={title}>
                        {title}
                      </div>
                      <div className="font-body-sm text-tertiary line-clamp-1">
                        <span className="font-semibold text-on-surface-variant">{renderCreatorLabel()}:</span> {creatorVal || "—"}
                      </div>
                    </div>

                    <div className="w-full mt-2">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-label-caps text-label-caps text-tertiary">Relevance / Score</span>
                        <span className="font-data-mono text-data-mono text-primary">{score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-bright rounded-full overflow-hidden border border-outline-variant/30">
                        <div className="h-full bg-primary" style={{ width: `${score}%` }}></div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {item.user_feedback && Object.keys(item.user_feedback).length > 0 && (
                        <div className="mt-4">
                          <div className="font-label-caps text-tertiary mb-2 uppercase text-[10px]">Metadata / Feedback</div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(item.user_feedback).map(([key, value]) => (
                              <div key={key} className="bg-surface-bright p-2 rounded border border-outline-variant/30 flex flex-col">
                                <span className="font-label-sm text-tertiary text-[10px] uppercase">{key}</span>
                                <span className="font-data-mono text-on-surface font-semibold text-sm">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-outline-variant/50">
                        <div className="font-label-caps text-tertiary mb-2 uppercase text-[10px]">Why Recommended</div>
                        <div className="font-body-sm text-on-surface bg-surface-container-low p-3 rounded-md border border-outline-variant/30">
                          {item.similarity_basis || "General recommendation based on your profile."}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: AI Assistant Chat */}
        <div className="w-full xl:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm h-[600px] xl:h-[calc(100vh-120px)] sticky top-24">
          <div className="p-4 border-b border-outline-variant bg-surface-bright flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <h2 className="font-title-md text-on-surface font-bold">AI Comparison Insights</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface/50">
            {chatHistory.length === 0 && !aiLoading && (
              <div className="text-center text-tertiary font-body-sm py-8">
                No insights available. Send a message to start analyzing!
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 font-body-sm ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container-highest text-on-surface rounded-tl-sm border border-outline-variant/30'}`}>
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}
            
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container text-tertiary rounded-lg p-3 rounded-tl-sm border border-outline-variant/30 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-body-sm">Analyzing items...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-outline-variant bg-surface-bright flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-tertiary"
              placeholder="Ask about these items..."
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              disabled={aiLoading}
            />
            <button 
              type="submit" 
              disabled={!userMessage.trim() || aiLoading}
              className="bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
        
        </div>
      </main>
    </div>
  );
}
