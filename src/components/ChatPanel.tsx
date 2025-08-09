import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// UI-only, local mock chat that "streams" assistant replies
export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m0", role: "assistant", content: "Hi! Ask me anything and I’ll show you how I respond." },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Mock assistant streaming
    const reply = pickReply(text);
    const assistantId = crypto.randomUUID();
    setIsStreaming(true);
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: reply.slice(0, i) } : msg)));
      if (i >= reply.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 12);
  };

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-brand-teal/20 bg-background shadow-sm">
      <header className="px-4 py-3 border-b border-border/60">
        <h2 className="text-sm font-medium text-foreground">Quick Chat (demo)</h2>
      </header>
      <div className="p-3">
        <ScrollArea className="h-56 pr-2">
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-brand-teal text-white"
                      : "bg-muted text-foreground"
                  }`}
                  aria-live={m.role === "assistant" ? "polite" : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </div>
      <form
        className="flex items-center gap-2 p-3 border-t border-border/60"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          placeholder="Type a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message"
        />
        <Button type="submit" disabled={!input.trim() || isStreaming}>
          Send
        </Button>
      </form>
    </section>
  );
}

function pickReply(q: string): string {
  // ultra-simple canned responses
  const lower = q.toLowerCase();
  if (lower.includes("pricing")) return "Our pricing is flexible—start free, then pay as you scale. The demo shows UI only.";
  if (lower.includes("voice")) return "The voice experience is simulated here. In production, it reacts in real-time.";
  if (lower.includes("template")) return "Templates help you start faster. Pick one, then tweak tone and goals.";
  return "Here’s a quick mock response. In this demo, messages stream locally so you can feel the UX.";
}
