import React, { useState, useRef, useEffect } from "react";
import { DomainProductCard } from "./DomainProductCard";

export function ChatPanel({ domain, csrfToken, onToggleSelect, selectedItems }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm the CompareX assistant. Ask me for recommendations, explanations, or comparisons across the dataset." }
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
    <div className="h-full flex flex-col justify-between bg-white">
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-[#E7F2F2] text-[#2D7D7D] flex-shrink-0 mt-0.5 flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs">
                <span className="material-symbols-outlined text-[15px]">smart_toy</span>
              </div>
            )}
            
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
              msg.role === "user"
                ? "bg-[#2D7D7D] text-white rounded-tr-none font-medium"
                : msg.llmUnavailable
                ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-none font-medium"
                : "bg-[#F7F5F0] border border-[#2D7D7D]/10 text-[#192A2A] rounded-tl-none font-medium"
            }`}>
              {msg.text}
              
              {/* Inline recommendation cards */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D7D7D] block">
                    Grounded Recommendations
                  </span>
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
                    <p className="text-[10px] text-[#8A8680] mt-1 font-semibold">
                      + {msg.recommendations.length - 3} more results in catalog
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#E7F2F2] text-[#2D7D7D] flex-shrink-0 mt-0.5 flex items-center justify-center border border-[#2D7D7D]/20 shadow-2xs">
              <span className="material-symbols-outlined text-[15px]">smart_toy</span>
            </div>
            <div className="bg-[#F7F5F0] border border-[#2D7D7D]/10 rounded-2xl rounded-tl-none p-3 text-xs text-[#586666] shadow-2xs flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-sm text-[#2D7D7D]">sync</span>
              <span>Synthesizing recommendations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#2D7D7D]/10 bg-[#FAF8F5]">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full bg-white border border-[#2D7D7D]/20 rounded-xl py-2.5 pl-4 pr-10 text-xs text-[#192A2A] focus:outline-none focus:ring-2 focus:ring-[#2D7D7D]/20 shadow-2xs placeholder:text-[#8A8680]" 
            placeholder="Ask about products, authors, genres..." 
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-[#2D7D7D] text-white hover:bg-[#1E5C5C] transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[15px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
