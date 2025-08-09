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
    "How is pricing structured?",
    "Show me a quick demo.",
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
  // --- typewriter controller ---
  const [text, setText] = useState("");
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
    if (phase === "idle") setPhase("typing");
  }, [autoStart, prompts.length, phase]);

  useEffect(() => {
    if (phase !== "typing") return;
    const target = prompts[iPrompt] || "";
    const delay = 26 + Math.random() * 40; // natural cadence

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
  }, [text, phase, iPrompt, prompts, onSend]);

  useEffect(() => {
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
  }, [phase, iPrompt, prompts.length]);

  // --- styles ---
  const styles: Record<string, React.CSSProperties> = {
    wrap: { maxWidth: 920, margin: "0 auto", padding: "4px 0" },
    bar: {
      borderRadius: 24,
      border: "1px solid rgba(0,0,0,.06)",
      background: "rgba(255,255,255,.85)",
      backdropFilter: "saturate(120%) blur(8px)",
      boxShadow: "0 8px 30px rgba(0,0,0,.06)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: 12,
    },
    inputText: { flex: 1, color: "#111827", fontSize: 16, lineHeight: "22px", minHeight: 22 },
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
      {/* Chat bar */}
      <div style={styles.bar} role="form" aria-label="Ask Will">
        <div style={styles.inputText} aria-live="polite">
          {text || <span style={{ color: "#9ca3af" }}>Ask anything about AI assistants…</span>}
          <span style={styles.caret} />
        </div>
        <button style={styles.sendBtn} onClick={() => onSend && onSend(text || prompts[iPrompt] || "") } aria-label="Send">
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