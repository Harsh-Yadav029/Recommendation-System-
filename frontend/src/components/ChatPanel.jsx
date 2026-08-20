import React, { useState, useRef, useEffect } from "react";
import { DomainProductCard } from "./DomainProductCard";

export function ChatPanel({ domain, csrfToken, isOpen, onClose, onToggleSelect, selectedItems }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-surface-container-lowest border-l border-outline-variant shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          <h3 className="text-sm font-semibold text-on-surface">Expert Assistant</h3>
          <span className="text-xs text-on-surface-variant">({domain})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx}>
            {/* Message bubble */}
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-on-primary rounded-br-sm"
                    : msg.llmUnavailable
                    ? "bg-error-container text-on-error-container border border-error rounded-bl-sm"
                    : "bg-surface-container text-on-surface border border-outline-variant rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>

            {/* Inline recommendation cards */}
            {msg.recommendations && msg.recommendations.length > 0 && (
              <div className="mt-3 space-y-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Recommendations</span>
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
                  <p className="text-xs text-on-surface-variant">
                    + {msg.recommendations.length - 3} more results available in Browse
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container text-on-surface-variant border border-outline-variant rounded-xl rounded-bl-sm px-4 py-2.5 text-sm flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></span>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant p-3 bg-surface-container-low">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for recommendations, explanations..."
            className="flex-1 px-3 py-2 text-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-primary text-on-primary rounded-lg hover:bg-surface-tint transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
