"use client";

import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const nextMessages = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages }),
    });

    if (!res.ok || !res.body) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: failed to get response." }]);
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = value ? decoder.decode(value, { stream: true }) : "";
      if (chunkValue) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              role: "assistant",
              content: (updated[lastIndex].content || "") + chunkValue,
            };
          }
          return updated;
        });
      }
    }

    setLoading(false);
  }

  function Message({ role, content }) {
    const isUser = role === "user";
    return (
      <div className={isUser ? "msg user" : "msg assistant"}>
        <div className="avatar" aria-hidden>
          {isUser ? "🧑" : "🤖"}
        </div>
        <div className="bubble" role="status">
          {content}
        </div>
      </div>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Agentic Chat</h1>
        <p className="subtitle">A minimal ChatGPT-like web app</p>
      </header>

      <section className="chat" ref={listRef}>
        {messages.length === 0 ? (
          <div className="empty">
            <p>Start by asking a question. No key? A local model will answer.</p>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)
        )}
      </section>

      <form className="composer" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={loading ? "Thinking..." : "Ask anything"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label="Message"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>

      <footer className="footer">
        <span>
          {process.env.NEXT_PUBLIC_APP_FOOTER || "Built with Next.js"}
        </span>
      </footer>
    </main>
  );
}
