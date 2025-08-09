import React, { useEffect, useMemo, useRef, useState } from "react";

// Tailwind-first, teal-600 accents. This is a self-contained homepage.
// NEW: more teal in the widget + subtle "breathing" + energy-reactive waves.

// ---------- Types ----------
type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "muted" | "error";

// ---------- Extended background waves (hero flourish) ----------
function ExtendedWavesTeal({ running = true }: { running?: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return; let raf = 0;
    const tick = () => { setT((p) => p + 0.01); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [running]);

  const build = (w: number, h: number, amp: number, freq: number, speed: number, y: number) => {
    const pts = 140, step = w / (pts - 1); let d = "";
    for (let i = 0; i < pts; i++) {
      const x = i * step;
      const yv = y + Math.sin(i * 0.075 * freq + t * speed) * amp + Math.sin(i * 0.02 * (freq * 0.7) + t * (speed * 0.7)) * (amp * 0.45);
      d += i ? ` L ${x} ${yv}` : `M ${x} ${yv}`;
    }
    return d;
  };

  return (
    <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none" height={240} width="100%" viewBox="0 0 1200 240">
      <defs>
        <linearGradient id="waveTeal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      {[0.28, 0.2, 0.14].map((op, i) => (
        <path key={i}
          d={build(1200, 240, 16 + i * 6, 1 + i * 0.25, 0.9 + i * 0.18, 120 + i * 10)}
          stroke="url(#waveTeal)" strokeOpacity={op} strokeWidth={2 + i} fill="none" />
      ))}
    </svg>
  );
}

// ---------- Orb widget (more teal + breathing + energy hook) ----------
function TealBreathingOrb({ width = 480, height = 400, orb = 330, state = "idle", energy = 0, simulate = false, onStateChange, }: {
  width?: number; height?: number; orb?: number; state?: VoiceState; energy?: number; simulate?: boolean; onStateChange?: (s: VoiceState) => void;
}) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { let id = 0; const tick = () => { setPhase((p) => p + 0.016); id = requestAnimationFrame(tick); }; id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id); }, []);

  const W = width, H = height, cx = W / 2, cy = Math.round(H * 0.42), r = orb / 2;
  // Generate stable id for defs
  const defsId = useMemo(() => `defs-${Math.random().toString(36).slice(2)}`, []);

  // breathing factor 0.98..1.02
  const breathe = 1 + 0.02 * Math.sin(phase * 0.9);

  // combine state-driven baseline with live energy (0..1)
  const baseline = state === "speaking" ? 0.22 : state === "listening" ? 0.16 : state === "thinking" ? 0.10 : 0.06;
  const ampBase = r * (baseline + energy * 0.25) * (1 + (state === "speaking" || state === "listening" ? 0.15 * Math.max(0, Math.sin(phase * (state === "speaking" ? 3.2 : 2.1))) : 0));
  const speedMul = (state === "speaking" ? 1.6 : state === "listening" ? 1.1 : 0.6) * (1 + energy * 0.4);

  const build = (amp: number, freq = 1, speed = 1, y = cy) => {
    const pts = 120, step = W / (pts - 1); let d = "";
    for (let i = 0; i < pts; i++) {
      const x = i * step;
      const yv = y + Math.sin(i * 0.14 * freq + phase * speed) * amp + Math.sin(i * 0.045 * (freq * 0.6) + phase * (speed * 0.7)) * (amp * 0.35);
      d += i ? ` L ${x.toFixed(2)} ${yv.toFixed(2)}` : `M ${x.toFixed(2)} ${yv.toFixed(2)}`;
    }
    return d;
  };

  const label = useMemo(() => {
    switch (state) {
      case "idle": return "Tap to start";
      case "listening": return "Listening…";
      case "thinking": return "Thinking…";
      case "speaking": return "Talk to interrupt";
      case "muted": return "Muted";
      case "error": return "Something went wrong";
      default: return "";
    }
  }, [state]);

  const runDemo = () => {
    onStateChange?.("listening");
    setTimeout(() => onStateChange?.("thinking"), 1100);
    setTimeout(() => onStateChange?.("speaking"), 2300);
    setTimeout(() => onStateChange?.("idle"), 4200);
  };

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0">
        <defs>
          <radialGradient id={`${defsId}-bubble`} cx="50%" cy="50%" r="60%">
            <stop offset="8%" stopColor="#0A0E1C" />
            <stop offset="73%" stopColor="#0A0E1C" stopOpacity="0" />
            <stop offset="100%" stopColor="#0ea5a6" stopOpacity="0.28" />
          </radialGradient>
          <radialGradient id={`${defsId}-highlight`} cx="40%" cy="40%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${defsId}-wave`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <clipPath id={`${defsId}-clip`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* breathing halo + ring (scaled) */}
        <g transform={`translate(${cx} ${cy}) scale(${breathe}) translate(${-cx} ${-cy})`}>
          <circle cx={cx} cy={cy} r={r + 14} fill="rgba(13,148,136,0.10)" />
          <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="#14b8a6" strokeOpacity={0.9} strokeWidth={2} />
        </g>

        {/* core */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${defsId}-bubble)`} />
        <circle cx={cx - r * 0.2} cy={cy - r * 0.15} r={r * 0.28} fill={`url(#${defsId}-highlight)`} opacity={0.7} />

        {/* animated teal waves */}
        <g clipPath={`url(#${defsId}-clip)`}>
          {[0.7, 0.5, 0.35].map((alpha, i) => (
            <path key={`back-${i}`} d={build(ampBase * (0.9 - i * 0.15), 1 + i * 0.3, (0.7 + i * 0.2) * speedMul)} stroke={`url(#${defsId}-wave)`} strokeOpacity={alpha} strokeWidth={2.5 + i * 0.6} fill="none" />
          ))}
          {[0,1,2,3,4].map((i) => (
            <path key={`front-${i}`} d={build(ampBase * 0.65, 1.2 + i * 0.18, (1 + i * 0.12) * speedMul, cy + (i-2)*3)} stroke={`url(#${defsId}-wave)`} strokeOpacity={0.22 + i * 0.06} strokeWidth={1 + i * 0.4} fill="none" />
          ))}
        </g>

        {/* CTA pill on the orb */}
        <foreignObject x={Math.max(0, cx - 160)} y={cy - 22} width={320} height={44}>
          <div className="w-full h-full grid place-items-center">
            <button
              onClick={() => (simulate ? runDemo() : onStateChange?.(state === "idle" ? "listening" : "thinking"))}
              className="px-4 py-2 rounded-full bg-white text-neutral-900 border border-black/5 shadow-md text-sm font-medium"
              aria-label={label}
            >
              {label}
            </button>
          </div>
        </foreignObject>
      </svg>

      {/* Accessible label below */}
      <div role="status" aria-live="polite" className="absolute left-1/2" style={{ top: cy + r + 24, transform: "translateX(-50%)" }}>
        <div className="px-3 py-1 rounded-full text-white bg-black/60 border border-white/10 text-sm font-medium whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}

// ---------- Tiny analytics (non‑technical friendly) ----------
function MiniAnalytics() {
  const [n1, setN1] = useState(0); const [n2, setN2] = useState(0); const [n3, setN3] = useState(0);
  useEffect(() => {
    const to = setInterval(() => {
      setN1((v) => Math.min(128, v + 2));
      setN2((v) => Math.min(0.92, +(v + 0.01).toFixed(2)));
      setN3((v) => Math.min(36, v + 1));
    }, 50);
    return () => clearInterval(to);
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-3">
      {[{t:"Calls handled today",v:n1},{t:"Success rate",v:`${Math.round(n2*100)}%`},{t:"Avg. seconds to answer",v:n3}].map((x,i)=>(
        <div key={i} className="rounded-3xl border border-neutral-200 p-5 flex items-center justify-between">
          <div className="text-sm text-neutral-500">{x.t}</div>
          <div className="text-2xl font-semibold text-teal-600">{x.v}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Simple video block (drop your mp4/loom later) ----------
function DemoVideo() {
  return (
    <div className="max-w-4xl mx-auto px-6 mt-10">
      <div className="rounded-3xl overflow-hidden border border-neutral-200">
        <div className="aspect-video bg-neutral-50 grid place-items-center">
          <button className="px-4 py-2 rounded-full bg-teal-600 text-white font-medium shadow-sm">Play 30‑sec demo</button>
        </div>
      </div>
    </div>
  );
}

// ---------- 3‑step guide (non‑technical) ----------
function QuickGuide() {
  const steps = [
    {h:"Pick a template", d:"Sales, support, bookings — start from a proven flow."},
    {h:"Name it & tweak", d:"Edit tone and key answers. No code required."},
    {h:"Go live", d:"Click connect. Get a number or embed on your site."},
  ];
  return (
    <div className="max-w-5xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-4">
      {steps.map((s,i)=> (
        <div key={i} className="rounded-3xl border border-neutral-200 p-5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white grid place-items-center mb-3">{i+1}</div>
          <div className="font-medium">{s.h}</div>
          <div className="text-neutral-600 text-sm mt-1">{s.d}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Page ----------
export default function HomePageTealV2() {
  const [state, setState] = useState<VoiceState>("idle");
  const [energy, setEnergy] = useState(0); // 0..1 — hook this to your backend later

  // Simulate conversation energy while speaking/listening
  useEffect(() => {
    let id: number | null = null;
    if (state === "speaking" || state === "listening") {
      id = window.setInterval(() => setEnergy(() => Math.random()*0.9), 200) as any;
    } else { setEnergy(0); }
    return () => { if (id) clearInterval(id); };
  }, [state]);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Topbar */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-semibold"><span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-teal-600 text-white">W</span> Will</div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-6 pb-14">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Meet your assistant</h1>
          <p className="mt-3 text-neutral-600">No docs. Tap the orb, feel it respond, then create yours.</p>
        </div>

        <div className="relative grid place-items-center">
          <ExtendedWavesTeal running={state === "speaking" || state === "listening"} />
          <TealBreathingOrb state={state} energy={energy} simulate onStateChange={setState} />
        </div>

        {/* Primary actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-medium shadow-sm hover:bg-teal-700 transition" onClick={() => alert("Create assistant")}>Create my assistant</button>
          <button className="px-5 py-3 rounded-2xl border border-teal-200 text-teal-700 hover:bg-teal-50" onClick={() => alert("Explore templates")}>Explore templates</button>
          <button className="px-5 py-3 rounded-2xl border border-neutral-200 text-neutral-800 hover:bg-neutral-50" onClick={() => alert("See analytics")}>See analytics demo</button>
        </div>
      </section>

      {/* Immediate value row */}
      <MiniAnalytics />

      {/* Demo video */}
      <DemoVideo />

      {/* 3-step quick guide */}
      <QuickGuide />

      <footer className="max-w-7xl mx-auto px-6 py-14 text-sm text-neutral-500">© {new Date().getFullYear()} Will — minimal, modern, and fast.</footer>
    </main>
  );
}