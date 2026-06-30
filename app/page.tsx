"use client";

import { useEffect, useRef, useState } from "react";
import { Message, type ChatMessage } from "@/components/Message";

const SUGGESTIONS = [
  "I've never coded before. Where do I start?",
  "Explain what a variable is, like I'm five.",
  "What's the difference between a list and a dictionary in Python?",
  "Help me understand this error: 'TypeError: cannot read property of undefined'",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const history: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Request failed." }));
        throw new Error(err.error || "Request failed.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `_⚠️ ${msg}_`,
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <span className="logo">🤖</span>
        <div>
          <h1>CodeTutor</h1>
          <p>Your patient AI guide to learning how to code</p>
        </div>
      </header>

      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>👋 Ready to learn to code?</h2>
            <p>
              Ask me anything — from your very first line of code to tricky bugs.
              I&apos;ll explain the <em>why</em>, not just the <em>how</em>.
            </p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="suggestion"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <Message
              key={i}
              message={m}
              streaming={
                isStreaming &&
                i === messages.length - 1 &&
                m.role === "assistant"
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="composer">
        <form onSubmit={onSubmit}>
          <textarea
            ref={textareaRef}
            value={input}
            placeholder="Ask a coding question…"
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              autoGrow();
            }}
            onKeyDown={onKeyDown}
            disabled={isStreaming}
          />
          <button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? "…" : "Send"}
          </button>
        </form>
        <p className="hint">
          Press Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </main>
  );
}
