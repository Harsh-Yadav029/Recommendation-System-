import React, { useState, useRef, useEffect } from "react";
import { DomainProductCard } from "./DomainProductCard";

export function ChatPanel({ domain, csrfToken, onToggleSelect, selectedItems }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm the CompareX assistant. Ask me for recommendations, explanations, or comparisons." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role === "user")
        .map(m => m.text);

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          domain,
          message: trimmed,
          history,
          user_profile: { user_id: "anonymous", history: [] },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        text: data.response,
        recommendations: data.data?.recommendations?.items || null,
        llmUnavailable: data.data?.error === "llm_unavailable",
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "The assistant is temporarily unavailable. Please use Browse or Compare directly.",
          llmUnavailable: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="h-[600px] sticky top-24 bg-surface-container-lowest border border-secondary/10 rounded-[16px] card-shadow flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-surface-container-low border-b border-secondary/10 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">smart_toy</span>
        </div>
        <div>
          <h3 className="font-label-md text-label-md text-on-surface m-0">CompareX Assistant</h3>
          <span className="text-[10px] text-primary font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-1 flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px] text-primary">smart_toy</span>
              </div>
            )}
            
            <div className={`max-w-[85%] rounded-[16px] p-3 font-body-sm text-body-sm shadow-sm ${
              msg.role === "user"
                ? "bg-primary text-on-primary rounded-tr-sm"
                : msg.llmUnavailable
                ? "bg-error-container text-on-error-container border border-error rounded-tl-sm"
                : "bg-surface-container-low border border-surface-variant text-on-surface rounded-tl-sm"
            }`}>
              {msg.text}
              
              {/* Inline recommendation cards */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="font-label-sm text-label-sm opacity-70 uppercase tracking-wider block">Recommendations</span>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.recommendations.slice(0, 3).map((item) => (
                      <DomainProductCard
                        key={item.item_id}
                        domain={domain}
                        item={item}
                        isSelected={selectedItems?.some(i => i.item_id === item.item_id)}
                        onToggleSelect={() => onToggleSelect?.(item)}
                      />
                    ))}
                  </div>
                  {msg.recommendations.length > 3 && (
                    <p className="font-label-sm text-label-sm opacity-70 mt-2">
                      + {msg.recommendations.length - 3} more results available in Browse
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-primary">smart_toy</span>
            </div>
            <div className="bg-surface-container-low border border-surface-variant rounded-[16px] rounded-tl-sm p-3 font-body-sm text-body-sm text-on-surface shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-tertiary text-sm">sync</span>
                <span className="text-tertiary">Analyzing features...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-surface-variant bg-surface-container-lowest mt-auto">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full bg-surface-container-lowest border border-surface-variant rounded-full py-2.5 pl-4 pr-10 font-body-sm text-body-sm text-on-surface input-focus-ring outline-none shadow-sm transition-all placeholder:text-tertiary" 
            placeholder="Ask about products..." 
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">send</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
