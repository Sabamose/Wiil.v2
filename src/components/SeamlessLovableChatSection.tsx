import React, { useEffect, useRef, useState } from "react";

/**
 * SeamlessLovableChatSection
 * A long, seamless, Lovable‑style chat bar that blends with a white background,
 * positioned ABOVE the CTA buttons (drop this under your voice widget).
 *
 * Features
 * - No dependencies, inline styles only (Canvas/Lovable ready)
 * - Auto‑typing through a finite list of prompts (runs once, no loop)
 * - Sends each prompt via onSend() as soon as it finishes typing
 * - Blinking caret, light frosted surface, subtle shadow
 * - No microphone icon (per request)
 * - Below the chat bar: punchier primary + secondary CTAs
 */
export default function SeamlessLovableChatSection({
  prompts = [
    "What can I build with Will?",
    "What kind of assistants can I build?",
    "How can I use these assistants?",
    "How are assistants helpful for my business?",
    "What are the stats for today?",
    "How many calls came in?",
    "How much does it cost to run an AI assistant?",
    "Can I create a sales assistant that books meetings?",
    "How do I train my assistant with my company data?", 
    "Can assistants handle customer support calls 24/7?",
    "What's the setup time for a medical receptionist assistant?",
    "How does voice AI compare to chatbots for conversions?",
    "Can I integrate assistants with my CRM and calendar?",
    "What industries see the best ROI with voice assistants?",
    "How many concurrent calls can one assistant handle?",
    "Can assistants transfer calls to human agents when needed?",
    "What's included in the analytics dashboard?",
    "How do I customize the voice, accent, and speaking style?",
    "Can assistants work in multiple languages for global customers?",
    "What's the difference between inbound and outbound campaigns?",
    "How do I ensure data privacy and compliance with voice AI?"
  ],
  autoStart = true,
  accent = "#0d9488", // teal-600
  onSend,
  onPrimary,
  onSecondary,
  primaryText = "+ Create Assistant",
  secondaryText = "See Analytics",
}: {
  prompts?: string[];
  autoStart?: boolean;
  accent?: string;
  onSend?: (text: string) => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryText?: string;
  secondaryText?: string;
}) {
  // --- typewriter + interactive controller ---
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'assistant', message: string}>>([]);
  const [iPrompt, setIPrompt] = useState(0);
  const [phase, setPhase] = useState<"idle" | "typing" | "hold" | "clear" | "done">("idle");

  const typingRef = useRef<number | null>(null);

  useEffect(() => {
    // inject keyframes once
    const id = "slc-keyframes";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes caretBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes btnPulse { 0%,100%{ transform: translateY(0); box-shadow: 0 8px 20px rgba(13,148,136,.15)} 50%{ transform: translateY(-2px); box-shadow: 0 16px 32px rgba(13,148,136,.22)} }
        @keyframes shine { 0%{ transform: translateX(-120%) rotate(12deg)} 100%{ transform: translateX(120%) rotate(12deg)} }
      `;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (!autoStart || !prompts.length) return;
    if (phase === "idle" && !isUserTyping) setPhase("typing");
  }, [autoStart, prompts.length, phase, isUserTyping]);

  useEffect(() => {
    if (phase !== "typing" || isUserTyping) return;
    const target = prompts[iPrompt] || "";
    const delay = 45 + Math.random() * 35; // slower, more natural cadence

    typingRef.current = window.setTimeout(() => {
      const next = target.slice(0, text.length + 1);
      setText(next);
      if (next.length >= target.length) {
        // finished this prompt
        setPhase("hold");
        try { onSend && onSend(target); } catch {}
      }
    }, delay) as any;

    return () => typingRef.current && clearTimeout(typingRef.current);
  }, [text, phase, iPrompt, prompts, onSend, isUserTyping]);

  useEffect(() => {
    if (isUserTyping) return; // Don't auto-clear if user is typing
    
    if (phase === "hold") {
      const t = window.setTimeout(() => setPhase("clear"), 900); // brief hold before clearing
      return () => clearTimeout(t);
    }
    if (phase === "clear") {
      // nice clearing animation: fast backspacing
      const t = window.setInterval(() => {
        setText((p) => {
          if (!p) {
            clearInterval(t);
            const nextIdx = iPrompt + 1;
            if (nextIdx >= prompts.length) setPhase("done"); else { setIPrompt(nextIdx); setPhase("typing"); }
            return p;
          }
          return p.slice(0, -1);
        });
      }, 12);
      return () => clearInterval(t);
    }
  }, [phase, iPrompt, prompts.length, isUserTyping]);

  // Handle user input and chat simulation
  const handleUserInput = (value: string) => {
    setUserInput(value);
    setIsUserTyping(value.length > 0);
    if (value.length > 0) {
      setText(value);
      setPhase("done"); // Stop auto-typing when user types
    }
  };

  const handleSendMessage = () => {
    const messageToSend = userInput || text || prompts[iPrompt] || "";
    if (!messageToSend.trim()) return;
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', message: messageToSend }]);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you build an AI assistant! You can create voice assistants for customer support, sales, or any custom use case.",
        "Our pricing is flexible based on usage. Would you like to see a detailed breakdown of our plans?",
        "Let me show you a quick demo! Click 'Create Assistant' to get started with our intuitive setup process.",
        "That's a great question! Our AI assistants can handle complex conversations and integrate with your existing systems.",
        "I can help you with that! Our platform supports multiple industries and use cases. What specific scenario are you looking to address?"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatHistory(prev => [...prev, { type: 'assistant', message: response }]);
    }, 1000);
    
    // Clear input and reset
    setUserInput("");
    setText("");
    setIsUserTyping(false);
    
    // Call original onSend
    try { onSend && onSend(messageToSend); } catch {}
  };

  // --- styles ---
  const styles: Record<string, React.CSSProperties> = {
    wrap: { maxWidth: 1200, margin: "0 auto", padding: "4px 0" },
    bar: {
      borderRadius: 24,
      border: "1px solid rgba(0,0,0,.06)",
      background: "rgba(255,255,255,.85)",
      backdropFilter: "saturate(120%) blur(8px)",
      boxShadow: "0 8px 30px rgba(0,0,0,.06)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 24px",
      width: "100%",
      minWidth: "800px",
    },
    inputText: { flex: 1, color: "#0d9488", fontSize: 16, lineHeight: "22px", minHeight: 22, background: "transparent", border: "none", outline: "none" },
    caret: { display: "inline-block", width: 1.5, height: 18, background: "#9ca3af", marginLeft: 2, animation: "caretBlink 1s step-end infinite" },
    sendBtn: {
      position: "relative", padding: "10px 14px", borderRadius: 18, color: "#fff", fontWeight: 600,
      background: `linear-gradient(180deg, ${lighten(accent, .1)} 0%, ${accent} 100%)`,
      border: 0, cursor: "pointer", boxShadow: "0 10px 22px rgba(13,148,136,.18)",
    },
    shineWrap: { position: "absolute", inset: 0, overflow: "hidden", borderRadius: 18, pointerEvents: "none" },
    shine: { position: "absolute", top: 0, left: "-50%", width: "50%", height: "100%", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)", filter: "blur(6px)", animation: "shine 2.6s linear infinite" },
    ctaRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 14 },
    primary: { position: "relative", padding: "12px 20px", borderRadius: 16, color: "#fff", fontWeight: 600, background: `linear-gradient(180deg, ${lighten(accent, .1)} 0%, ${accent} 100%)`, boxShadow: "0 12px 24px rgba(13,148,136,.18)", border: 0, cursor: "pointer" },
    secondary: { padding: "12px 20px", borderRadius: 16, background: "#fff", color: accent, border: `1px solid ${hexWithAlpha(accent, .35)}`, boxShadow: "0 4px 10px rgba(0,0,0,.06)", cursor: "pointer", fontWeight: 500 },
  };

  return (
    <section style={styles.wrap}>
      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div style={{ marginBottom: 16, maxHeight: 200, overflowY: "auto", background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: 12 }}>
          {chatHistory.map((chat, i) => (
            <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: chat.type === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ 
                background: chat.type === "user" ? accent : "#f3f4f6", 
                color: chat.type === "user" ? "#fff" : "#111827",
                padding: "8px 12px", 
                borderRadius: 12, 
                maxWidth: "70%",
                fontSize: 14
              }}>
                {chat.message}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Chat bar */}
      <div style={styles.bar} role="form" aria-label="Ask Will">
        <input
          style={styles.inputText}
          value={userInput}
          onChange={(e) => handleUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={!isUserTyping && !userInput ? (text || "Ask anything about AI assistants…") : ""}
          aria-label="Message"
        />
        {!isUserTyping && !userInput && (
          <span style={styles.caret} />
        )}
        <button style={styles.sendBtn} onClick={handleSendMessage} aria-label="Send">
          <span style={styles.shineWrap}><span style={styles.shine} /></span>
          Send
        </button>
      </div>

      {/* CTA buttons (below chat) */}
      <div style={styles.ctaRow}>
        <button style={styles.primary} onClick={onPrimary}>{primaryText}</button>
        <button style={styles.secondary} onClick={onSecondary}>{secondaryText}</button>
      </div>
    </section>
  );
}

// ---------- small helpers ----------
function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  const L = (v: number) => Math.round(v + (255 - v) * amt);
  return `rgb(${L(r)}, ${L(g)}, ${L(b)})`;
}
function hexToRgb(hex: string) {
  const n = hex.replace('#','');
  const v = n.length === 3 ? n.split('').map(c=>parseInt(c + c,16)) : [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)];
  return { r: v[0], g: v[1], b: v[2] };
}
function hexWithAlpha(hex: string, a = .3) { const {r,g,b} = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }