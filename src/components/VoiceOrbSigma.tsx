import React, { useEffect, useMemo, useRef, useState } from "react";

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted"
  | "error";

/**
 * VoiceOrbSigma — cleaned for white UI, no side shadows
 * - Animated waves
 * - Clickable CTA pill centered on the orb
 * - Label text by state:
 *    idle → Tap to start
 *    listening → Listening…
 *    speaking → Talk to interrupt
 *    thinking → Thinking…
 *    muted → Muted (override)
 *    error → Something went wrong
 */
export default function VoiceOrbSigma({
  width = 562,
  height = 517,
  orb = 350,
  paused = false,
  state: controlledState,
  muted = false,
  onStateChange,
  simulate = false, // if true, auto-runs a tap→listen→think→speak→idle loop
}: {
  width?: number;
  height?: number;
  orb?: number;
  paused?: boolean;
  state?: VoiceState; // optional controlled state
  muted?: boolean;
  onStateChange?: (s: VoiceState) => void;
  simulate?: boolean;
}) {
  // --- animation clock ---
  const [phase, setPhase] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (paused) return;
    const tick = () => { setPhase((p) => p + 0.016); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [paused]);

  // controlled/uncontrolled state
  const [internalState, setInternalState] = useState<VoiceState>("idle");
  const state: VoiceState = controlledState ?? internalState;
  const setState = (s: VoiceState) => {
    onStateChange?.(s);
    if (controlledState === undefined) setInternalState(s);
  };

  // geometry
  const W = width;
  const H = height;
  const cx = W / 2;
  const cy = Math.round(H * 0.42);
  const r = orb / 2;

  // ID for <defs>
  // @ts-ignore
  const defsId: string = (React as any).useId ? (React as any).useId() : `defs-${Math.random().toString(36).slice(2)}`;

  // wave amplitude varies by state
  const ampBase = useMemo(() => {
    // base amplitude by state
    let base = r * 0.07;
    if (muted) base = r * 0.05;
    else if (state === 'listening') base = r * 0.18;
    else if (state === 'speaking') base = r * 0.22;
    else if (state === 'thinking') base = r * 0.10;
    else if (state === 'error') base = r * 0.14;

    // add subtle pulsing to simulate mic input / TTS energy
    const pulse = state === 'listening' ? (0.25 * Math.max(0, Math.sin(phase * 2.0)))
                 : state === 'speaking' ? (0.15 * Math.max(0, Math.sin(phase * 3.2)))
                 : 0.0;
    return base * (1 + pulse);
  }, [state, muted, r, phase]);

  // build poly-sine path
  const build = (amp: number, freq = 1, speed = 1, y = cy) => {
    const pts = 120;
    const step = W / (pts - 1);
    let d = "";
    for (let i = 0; i < pts; i++) {
      const x = i * step;
      const yv = y
        + Math.sin(i * 0.14 * freq + phase * speed) * amp
        + Math.sin(i * 0.045 * (freq * 0.6) + phase * (speed * 0.7)) * (amp * 0.35);
      d += i === 0 ? `M ${x.toFixed(2)} ${yv.toFixed(2)}` : ` L ${x.toFixed(2)} ${yv.toFixed(2)}`;
    }
    return d;
  };

  // label text
  const labelText = useMemo(() => {
    if (muted) return "Muted";
    switch (state) {
      case "idle": return "Tap to start";
      case "listening": return "Listening…";
      case "thinking": return "Thinking…";
      case "speaking": return "Talk to interrupt";
      case "error": return "Something went wrong";
      default: return "";
    }
  }, [state, muted]);

  // wave speed by state
  const speedMul = state === "speaking" ? 1.6 : state === "listening" ? 1.1 : 0.6;

  return (
    <div style={{ position: "relative", width: W, height: H, background: "transparent" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* Orb gradients tuned for white/light UI */}
          <radialGradient id={`${defsId}-bubble`} cx="50%" cy="50%" r="60%">
            <stop offset="7.81%" stopColor="#0A0E1C" />
            <stop offset="73.44%" stopColor="#0A0E1C" stopOpacity="0" />
            <stop offset="100%" stopColor="#0C82A8" stopOpacity="0.35" />
          </radialGradient>
          <radialGradient id={`${defsId}-highlight`} cx="40%" cy="40%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${defsId}-wave`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2E90FF" />
            <stop offset="50%" stopColor="#7A5CF5" />
            <stop offset="100%" stopColor="#36C2FF" />
          </linearGradient>
          <clipPath id={`${defsId}-clip`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Orb core */}
        <circle cx={cx} cy={cy} r={r + 12} fill={"rgba(0,123,255,0.08)"} />
        <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="#DFF1FF" strokeOpacity={1} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${defsId}-bubble)`} />
        <circle cx={cx - r * 0.2} cy={cy - r * 0.15} r={r * 0.28} fill={`url(#${defsId}-highlight)`} opacity={0.65} />

        {/* Waves inside orb */}
        <g clipPath={`url(#${defsId}-clip)`}>
          {[0.9, 0.65, 0.45, 0.3].map((alpha, i) => (
            <path key={`back-${i}`} d={build(ampBase * (0.9 - i * 0.15), 1 + i * 0.3, (0.7 + i * 0.2) * speedMul)} stroke={`url(#${defsId}-wave)`} strokeOpacity={alpha} strokeWidth={2.5 + i * 0.6} fill="none" />
          ))}
          {[0,1,2,3,4].map((i) => (
            <path key={`front-${i}`} d={build(ampBase * 0.65, 1.2 + i * 0.18, (1 + i * 0.12) * speedMul, cy + (i-2)*3)} stroke={`url(#${defsId}-wave)`} strokeOpacity={0.28 + i * 0.08} strokeWidth={1 + i * 0.4} fill="none" />
          ))}
        </g>

        {/* CTA (centered on orb) */}
        <foreignObject x={Math.max(0, cx - 180)} y={cy - 24} width={360} height={48}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (state === 'idle') setState('listening');
                else if (state === 'speaking') setState('listening');
                else if (state === 'listening') setState('thinking');
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px 18px', borderRadius: 999,
                background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,.08)',
                boxShadow: '0 2px 10px rgba(0,0,0,.12)', cursor: 'pointer',
                font: "500 16px/1.1 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
                minWidth: 200
              }}
              aria-label={labelText}
            >
              {labelText}
            </button>
            <button
              onClick={() => setState(state === 'muted' ? 'idle' : 'muted')}
              aria-label={state === 'muted' ? 'Unmute' : 'Mute'}
              style={{ width: 44, height: 44, borderRadius: 999, background: '#fff', border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 2px 10px rgba(0,0,0,.12)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {state === 'muted' ? (
                  <>
                    <rect x="9" y="2" width="6" height="11" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <rect x="9" y="2" width="6" height="11" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </foreignObject>
      </svg>

      {/* Accessible status label just below orb (fades based on text) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "absolute",
          left: "50%",
          top: cy + r + 24,
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