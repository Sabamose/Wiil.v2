import React, { useEffect, useRef, useState } from "react";

/** EmphasizedChatAndCTAs — classy teal-600 emphasis, no deps */
export default function EmphasizedChatAndCTAs({
  onSend,
  onCreate,
  onAnalytics,
  accent = "#0d9488",
}: {
  onSend?: (text: string) => void;
  onCreate?: () => void;
  onAnalytics?: () => void;
  accent?: string;
}) {
  const [val, setVal] = useState("");
  const send = () => {
    const t = val.trim();
    if (!t) return;
    onSend?.(t);
    setVal("");
  };

  // inject keyframes once
  useEffect(() => {
    const id = "emph-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes btnPulse { 0%,100%{ transform: translateY(0); box-shadow: 0 10px 26px rgba(13,148,136,.16)} 50%{ transform: translateY(-1px); box-shadow: 0 16px 36px rgba(13,148,136,.24)} }
        @keyframes sheen { 0%{ transform: translateX(-130%) rotate(12deg)} 100%{ transform: translateX(130%) rotate(12deg)} }
        @keyframes stickyIn { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `;
      document.head.appendChild(s);
    }
  }, []);

  // styles
  const halo = {
    position: "absolute" as const,
    inset: "-40px -80px -80px",
    background:
      "radial-gradient(60% 50% at 50% 0%, rgba(20,184,166,.10) 0%, rgba(20,184,166,0) 70%)",
    filter: "blur(12px)",
    pointerEvents: "none" as const,
  };
  const wrap = {
    position: "relative" as const,
    maxWidth: 920,
    margin: "12px auto 0",
    padding: "0 8px 10px",
  };
  const guide = {
    textAlign: "center" as const,
    fontSize: 13,
    color: "#0f766e",
    marginBottom: 8,
    fontWeight: 500,
  };
  const bar = {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 24,
    background: "rgba(255,255,255,.9)",
    backdropFilter: "saturate(120%) blur(8px)",
    boxShadow: "0 16px 40px rgba(0,0,0,.06)",
    // gradient hairline + inner shadow
    border: `2px solid transparent`,
    backgroundImage:
      "linear-gradient(#fff,#fff), linear-gradient(90deg, rgba(153,246,228,1), rgba(13,148,136,1), rgba(94,234,212,1))",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };
  const input = {
    flex: 1,
    border: 0,
    outline: "none",
    background: "transparent",
    fontSize: 16,
    color: "#0f172a",
  };
  const sendBtn = {
    position: "relative" as const,
    padding: "10px 14px",
    borderRadius: 16,
    background: `linear-gradient(180deg, ${lighten(accent,.1)} 0%, ${accent} 100%)`,
    color: "#fff",
    border: 0,
    fontWeight: 600,
    cursor: val.trim() ? "pointer" as const : "default" as const,
    opacity: val.trim() ? 1 : 0.6,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
  const ctaRow = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center" as const,
    gap: 12,
    marginTop: 14,
  };
  const primary = {
    position: "relative" as const,
    padding: "12px 20px",
    borderRadius: 16,
    color: "#fff",
    fontWeight: 700,
    background: `linear-gradient(180deg, ${lighten(accent,.1)} 0%, ${accent} 100%)`,
    border: 0,
    cursor: "pointer" as const,
    animation: "btnPulse 8s ease-in-out infinite",
    boxShadow: "0 14px 30px rgba(13,148,136,.20)",
  };
  const secondary = {
    padding: "12px 20px",
    borderRadius: 16,
    background: "#fff",
    color: accent,
    border: `1px solid ${hexWithAlpha(accent,.45)}`,
    cursor: "pointer" as const,
  };

  return (
    <section style={wrap} aria-label="Primary actions">
      <div style={halo} />
      <div style={guide}>Start here → Ask anything about assistants</div>

      {/* Chat bar */}
      <div style={bar} role="form" aria-label="Ask Will">
        <input
          style={input}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything about AI assistants…"
          aria-label="Message"
        />
        <button onClick={send} style={sendBtn} aria-label="Send">
          <span style={{ opacity: 0.8 }}>↵</span>
          Send
          {/* sheen on hover */}
          <span
            style={{
              position: "absolute" as const,
              inset: 0,
              overflow: "hidden",
              borderRadius: 16,
              pointerEvents: "none" as const,
            }}
          >
            <span
              style={{
                position: "absolute" as const,
                top: 0,
                left: "-55%",
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                filter: "blur(6px)",
                animation: "sheen 3s linear infinite",
                opacity: 0,
              }}
              className="sheen"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            />
          </span>
        </button>
      </div>

      {/* CTAs */}
      <div style={ctaRow}>
        <button style={primary} onClick={onCreate}>
          <span
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 18,
              height: 18,
              marginRight: 8,
              borderRadius: 999,
              background: "#fff",
              color: accent,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            +
          </span>
          Create Assistant
          {/* progress hint bubble (optional): Setup 1/3 */}
          <span
            style={{
              marginLeft: 10,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(255,255,255,.18)",
              border: "1px solid rgba(255,255,255,.35)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Setup 1/3
          </span>
        </button>

        <button style={secondary} onClick={onAnalytics}>
          See Analytics
        </button>
      </div>

      {/* OPTIONAL: sticky mini-dock on scroll (enable by removing the comments)
      <StickyMiniDock accent={accent} onCreate={onCreate} onSend={onSend} />
      */}
    </section>
  );
}

/* ------- Optional sticky mini-dock ------- */
function StickyMiniDock({ accent, onCreate, onSend }: { accent: string; onCreate?: () => void; onSend?: (text: string) => void; }) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed" as const,
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 16,
        zIndex: 50,
        animation: "stickyIn .18s ease-out",
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "rgba(255,255,255,.92)",
        backdropFilter: "saturate(120%) blur(8px)",
        border: "1px solid rgba(0,0,0,.06)",
        borderRadius: 999,
        padding: "8px 10px",
        boxShadow: "0 12px 28px rgba(0,0,0,.12)",
      }}
    >
      <input
        style={{
          width: 260,
          border: 0,
          outline: "none",
          background: "transparent",
          fontSize: 14,
        }}
        placeholder="Ask Will…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && val.trim() && (onSend?.(val), setVal(""))}
      />
      <button
        onClick={() => val.trim() && (onSend?.(val), setVal(""))}
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          background: `linear-gradient(180deg, ${lighten(accent,.1)} 0%, ${accent} 100%)`,
          color: "#fff",
          border: 0,
          fontWeight: 600,
        }}
      >
        Send
      </button>
      <button
        onClick={onCreate}
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          background: `linear-gradient(180deg, ${lighten(accent,.1)} 0%, ${accent} 100%)`,
          color: "#fff",
          border: 0,
          fontWeight: 700,
        }}
      >
        + Create
      </button>
    </div>
  );
}

/* ------- tiny color helpers ------- */
function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  const L = (v: number) => Math.round(v + (255 - v) * amt);
  return `rgb(${L(r)}, ${L(g)}, ${L(b)})`;
}
function hexToRgb(hex: string) {
  const n = hex.replace("#", "");
  const v =
    n.length === 3
      ? n.split("").map((c) => parseInt(c + c, 16))
      : [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  return { r: v[0], g: v[1], b: v[2] };
}

function hexWithAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}