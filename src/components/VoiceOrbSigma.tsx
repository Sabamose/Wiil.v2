import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * VoiceOrbSigma (Listening Theme) + Accessible Status Label
 * - Blue neon orb with animated waves (from your Sigma spec)
 * - Adds an accessible, state-driven label under the orb
 * - No external libs; inline styles / CSS-module friendly
 */

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted"
  | "error";

export default function VoiceOrbSigma({
  width = 562,
  height = 517,
  orb = 350,
  paused = false,
  state = "idle",
  muted = false,
}: {
  width?: number; // container width from Sigma ("Ai listening")
  height?: number; // container height
  orb?: number; // bubble size
  paused?: boolean;
  state?: VoiceState;
  muted?: boolean; // optional muted flag
}) {
  // --- ANIMATION CLOCK ---
  const [phase, setPhase] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (paused) return;
    const tick = () => {
      setPhase((p) => p + 0.016); // ~60fps
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [paused]);

  // --- GEOMETRY ---
  const W = width;
  const H = height;
  const cx = W / 2;
  const cy = Math.round(H * 0.42); // eyeballed from Sigma top offsets
  const r = orb / 2;

  // --- WAVES ---
  // amplitude reacts to state: bigger when listening/speaking, calmer when idle
  const ampBase = useMemo(() => {
    if (muted) return r * 0.06;
    switch (state) {
      case "listening": return r * 0.18;
      case "speaking": return r * 0.20;
      case "thinking": return r * 0.10;
      case "error": return r * 0.14;
      case "idle":
      default: return r * 0.08;
    }
  }, [state, muted, r]);

  const build = (amp: number, freq = 1, speed = 1, y = cy) => {
    const pts = 120;
    const step = W / (pts - 1);
    let d = "";
    for (let i = 0; i < pts; i++) {
      const x = i * step;
      const yv =
        y +
        Math.sin(i * 0.14 * freq + phase * speed) * amp +
        Math.sin(i * 0.045 * (freq * 0.6) + phase * (speed * 0.7)) * (amp * 0.35);
      d += i === 0 ? `M ${x.toFixed(2)} ${yv.toFixed(2)}` : ` L ${x.toFixed(2)} ${yv.toFixed(2)}`;
    }
    return d;
  };

  const defsId = useMemo(() => `defs-${Math.random().toString(36).slice(2)}`, []);

  // --- ACCESSIBLE LABEL ---
  const labelText = useMemo(() => {
    if (muted) return "Muted";
    switch (state) {
      case "idle": return "Tap to start";
      case "listening": return "Listening…";
      case "thinking": return "Thinking…";
      case "speaking": return "Speaking…";
      case "error": return "Something went wrong";
      default: return "";
    }
  }, [state, muted]);

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {/* Side blur bars ("blur sides") */}
      <div style={{ position: "absolute", left: 0, top: H * 0.2, width: 70, height: 181, background: "rgba(24,25,53,0.96)", filter: "blur(15px)" }} />
      <div style={{ position: "absolute", right: 0, top: H * 0.2, width: 70, height: 181, background: "rgba(24,25,53,0.96)", filter: "blur(15px)" }} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* Orb gradients */}
          <radialGradient id={`${defsId}-bubble`} cx="50%" cy="50%" r="60%">
            <stop offset="7.81%" stopColor="#0A0E1C" />
            <stop offset="73.44%" stopColor="#0A0E1C" stopOpacity="0" />
            <stop offset="100%" stopColor="#0C82A8" stopOpacity="0.81" />
          </radialGradient>
          <radialGradient id={`${defsId}-highlight`} cx="40%" cy="40%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${defsId}-wave`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1AB4CC" />
            <stop offset="100%" stopColor="#FF65E6" />
          </linearGradient>
          <clipPath id={`${defsId}-clip`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Bubble core with highlight */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${defsId}-bubble)`} />
        <circle cx={cx - r * 0.2} cy={cy - r * 0.15} r={r * 0.28} fill={`url(#${defsId}-highlight)`} opacity={0.6} />
        <circle cx={cx} cy={cy} r={r} fill="#000" opacity={0.2} />

        {/* Waves clipped inside the orb */}
        <g clipPath={`url(#${defsId}-clip)`}>
          {[0.9, 0.7, 0.5, 0.35].map((alpha, i) => (
            <path key={`back-${i}`} d={build(ampBase * (0.9 - i * 0.15), 1 + i * 0.3, 0.7 + i * 0.2)} stroke={`url(#${defsId}-wave)`} strokeOpacity={alpha} strokeWidth={2.5 + i * 0.6} fill="none" />
          ))}
          {[0,1,2,3,4].map((i) => (
            <path key={`front-${i}`} d={build(ampBase * 0.65, 1.2 + i * 0.18, 1 + i * 0.12, cy + (i-2)*3)} stroke={`url(#${defsId}-wave)`} strokeOpacity={0.28 + i * 0.08} strokeWidth={1 + i * 0.4} fill="none" />
          ))}
        </g>

        {/* Outer halo ring */}
        <circle cx={cx} cy={cy} r={r + 10} fill="rgba(28,192,209,0.10)" />
      </svg>

      {/* Accessible, state-driven label (centered below the orb) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "absolute",
          left: "50%",
          top: cy + r + 24, // just below the orb
          transform: "translateX(-50%)",
          padding: "6px 10px",
          borderRadius: 999,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue'",
          fontSize: 14,
          fontWeight: 500,
          color: "#fff",
          background: "rgba(0,0,0,.55)",
          border: "1px solid rgba(255,255,255,.12)",
          transition: "opacity .2s ease, transform .2s ease",
          pointerEvents: "none",
          opacity: labelText ? 1 : 0,
          whiteSpace: "nowrap",
        }}
      >
        {labelText}
      </div>
    </div>
  );
}