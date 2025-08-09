import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * TealVortexRing — v2 (complex, satisfying motion)
 *
 * Additions over v1:
 *  - Particle halo with flowing trails (energy-reactive)
 *  - Tap ripple (shockwave ring) + soft aurora pulse
 *  - Caustic shimmer inside the orb
 *  - Keeps luminous vortex ring + orbiting ribbons
 *
 * No external deps. Lovable/Next ready.
 */
export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "muted" | "error";

export default function TealVortexRing({
  width = 960,
  height = 420,
  orb = 320,
  state = "idle",
  energy = 0,
  accent = "#0d9488", // teal-600
  label = "Tap to start",
  onTap,
}: {
  width?: number;
  height?: number;
  orb?: number;
  state?: VoiceState;
  energy?: number; // 0..1 suggested
  accent?: string;
  label?: string;
  onTap?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particles = useRef<Array<{ a: number; rOff: number; sp: number; x: number; y: number }>>([]);
  const ripples = useRef<Array<{ t0: number }>>([]);

  // Geometry
  const W = width; const H = height; const cx = W / 2; const cy = Math.min(Math.round(H * 0.46), H - 100); const r = orb / 2;

  // SSR-safe id
  // @ts-ignore
  const uid: string = (React as any).useId ? (React as any).useId() : `vortex-${Math.random().toString(36).slice(2)}`;

  // Motion params by state
  const params = useMemo(() => {
    switch (state) {
      case "speaking": return { amp: 0.055, speed: 1.6, glow: 0.9, halo: 0.7 };
      case "listening": return { amp: 0.04, speed: 1.1, glow: 0.75, halo: 0.55 };
      case "thinking": return { amp: 0.03, speed: 0.85, glow: 0.7, halo: 0.45 };
      case "muted": return { amp: 0.015, speed: 0.4, glow: 0.35, halo: 0.2 };
      case "error": return { amp: 0.05, speed: 1.2, glow: 0.9, halo: 0.6 };
      default: return { amp: 0.02, speed: 0.6, glow: 0.6, halo: 0.3 };
    }
  }, [state]);

  // Particles disabled
  // useEffect(() => {
  //   const count = 420; // safe on laptops
  //   particles.current = new Array(count).fill(0).map((_, i) => ({
  //     a: (i / count) * Math.PI * 2 + Math.random() * 0.5,
  //     rOff: (Math.random() * 2 - 1) * (r * 0.14),
  //     sp: (0.6 + Math.random() * 0.8) * (Math.random() < 0.5 ? -1 : 1),
  //     x: 0, y: 0,
  //   }));
  // }, [r]);

  // Tap ripple trigger
  const triggerRipple = () => { ripples.current.push({ t0: performance.now() }); if (ripples.current.length > 4) ripples.current.shift(); };

  // Canvas draw: glow ring + particles + ripple + inner body
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = typeof window !== "undefined" ? Math.max(1, Math.min(2, window.devicePixelRatio || 1)) : 1;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    function resize() { canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr); canvas.style.width = W + "px"; canvas.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize();

    let t = 0;
    const draw = () => {
      t += 0.016 * params.speed;
      ctx.clearRect(0, 0, W, H);

      // --- single subtle background wave ---
      ctx.save();
      ctx.beginPath();
      const yBase = cy + r + 26; const w = W; const ampWave = 18;
      for (let i = 0; i <= 240; i++) {
        const x = (i / 240) * w;
        const y = yBase + Math.sin(i * 0.08 + t * 0.8) * ampWave * 0.55 + Math.sin(i * 0.022 + t * 0.56) * ampWave * 0.25;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const grd = ctx.createLinearGradient(0, 0, W, 0);
      grd.addColorStop(0, "#99f6e4"); grd.addColorStop(0.5, accent); grd.addColorStop(1, "#5eead4");
      ctx.strokeStyle = grd; ctx.globalAlpha = 0.25; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

      // --- aurora pulse (soft radial wash) ---
      const breathe = 1 + 0.02 * Math.sin(t * 0.9);
      const baseR = r * breathe;
      const aur = ctx.createRadialGradient(cx, cy, baseR * 0.6, cx, cy, baseR * 1.6);
      aur.addColorStop(0, `rgba(13,148,136,${0.02 + params.halo * 0.04 + energy * 0.05})`);
      aur.addColorStop(1, "rgba(13,148,136,0)");
      ctx.fillStyle = aur; ctx.beginPath(); ctx.arc(cx, cy, baseR * 1.6, 0, Math.PI * 2); ctx.fill();

      // --- luminous vortex ring ---
      const amp = r * (params.amp + energy * 0.18);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";
      for (let pass = 0; pass < 3; pass++) {
        const alpha = [0.18, 0.12, 0.08][pass];
        const lw = [26, 18, 12][pass];
        ctx.beginPath();
        const steps = 360;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const n = Math.sin(a * 3 + t * 1.2) * 0.55 + Math.sin(a * 7 - t * 0.9) * 0.25 + Math.cos(a * 11 + t * 0.6) * 0.2;
          const rr = baseR + amp * n + Math.sin(a + t * 0.3) * (amp * 0.25);
          const x = Math.cos(a) * rr; const y = Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const g = ctx.createLinearGradient(-baseR, 0, baseR, 0);
        g.addColorStop(0, "rgba(153,246,228,1)");
        g.addColorStop(0.5, accent);
        g.addColorStop(1, "rgba(94,234,212,1)");
        ctx.strokeStyle = g; ctx.globalAlpha = alpha * 0.9; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.stroke();
      }
      ctx.restore();

      // --- particle halo with trails --- DISABLED
      // ctx.save();
      // ctx.globalCompositeOperation = "lighter";
      // const baseSpeed = 0.006 * params.speed * (1 + energy * 0.8);
      // const trailAlpha = 0.18 + energy * 0.25;
      // for (let i = 0; i < particles.current.length; i++) {
      //   const p = particles.current[i];
      //   const noise = Math.sin(p.a * 4 + t * 1.3) * 0.006 + Math.sin(p.a * 9 - t * 0.7) * 0.003;
      //   p.a += (baseSpeed * p.sp) + noise;
      //   const rr = baseR + p.rOff + Math.sin(t * 0.9 + i) * 1.2;
      //   const x = cx + Math.cos(p.a) * rr;
      //   const y = cy + Math.sin(p.a) * rr;
      //   // trail
      //   if (p.x || p.y) {
      //     const g = ctx.createLinearGradient(p.x, p.y, x, y);
      //     g.addColorStop(0, `rgba(153,246,228,${trailAlpha * 0.5})`);
      //     g.addColorStop(1, `rgba(13,148,136,${trailAlpha})`);
      //     ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x, y); ctx.stroke();
      //   }
      //   // spark
      //   ctx.fillStyle = `rgba(13,148,136,${0.35 + energy * 0.35})`;
      //   ctx.beginPath(); ctx.arc(x, y, 0.9 + energy * 0.9, 0, Math.PI * 2); ctx.fill();
      //   p.x = x; p.y = y;
      // }
      // ctx.restore();

      // --- crisp ring outline ---
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, baseR + 2, 0, Math.PI * 2); ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.9; ctx.stroke(); ctx.restore();

      // --- inner glass body + caustic shimmer ---
      const rg = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.15, 0, cx, cy, r * 1.08);
      rg.addColorStop(0, "rgba(255,255,255,0.65)"); rg.addColorStop(0.35, "rgba(10,14,28,0.18)"); rg.addColorStop(1, "rgba(13,148,136,0.06)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      // caustics: few faint inner arcs
      ctx.save(); ctx.globalAlpha = 0.15 + energy * 0.1; ctx.strokeStyle = "#14b8a6"; for (let k = 0; k < 3; k++) { ctx.beginPath(); const rr2 = r * (0.68 + k * 0.08); for (let i = 0; i <= 140; i++) { const a = (i / 140) * Math.PI * 2; const wob = Math.sin(a * (3 + k) + t * (1.2 + k * 0.4)) * (r * 0.012); const x = cx + Math.cos(a) * (rr2 + wob); const y = cy + Math.sin(a) * (rr2 + wob); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.lineWidth = 1; ctx.stroke(); } ctx.restore();

      // --- ripples ---
      const now = performance.now();
      for (let i = 0; i < ripples.current.length; i++) {
        const life = (now - ripples.current[i].t0) / 1200; // 1.2s
        if (life >= 1) { ripples.current.splice(i, 1); i--; continue; }
        const rr3 = baseR * (1 + life * 0.6);
        ctx.beginPath(); ctx.arc(cx, cy, rr3, 0, Math.PI * 2);
        ctx.strokeStyle = accent; ctx.globalAlpha = (1 - life) * 0.35; ctx.lineWidth = 2 + life * 12; ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [W, H, cx, cy, r, accent, params, energy]);

  // Ribbons — rotate via CSS; faster with energy
  const ribbons = useMemo(() => {
    const make = (mult = 1, phase = 0) => {
      const steps = 220; const amp = r * 0.18 * mult; const rad = r * 0.78;
      let d = ""; for (let i = 0; i <= steps; i++) { const a = (i / steps) * Math.PI * 2; const wobble = Math.sin(a * 2 + phase) * amp * 0.5 + Math.sin(a * 5 - phase) * amp * 0.25; const rr = rad + wobble; const x = cx + Math.cos(a) * rr; const y = cy + Math.sin(a) * rr; d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`; }
      return d;
    };
    return [make(0.9, 0.0), make(0.7, 1.2), make(0.6, -0.8)];
  }, [cx, cy, r]);

  return (
    <div style={{ position: "relative", width: W, height: H, background: "#fff" }}>
      {/* Canvas: vortex, particles, ripple, shimmer */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      {/* SVG: orbiting ribbons + CTA + status */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${uid}-rib`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#99f6e4" />
            <stop offset="55%" stopColor={accent} />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} className="rib slow">
          <path d={ribbons[0]} fill="none" stroke={`url(#${uid}-rib)`} strokeOpacity={0.22} strokeWidth={2.4} />
        </g>
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} className="rib mid">
          <path d={ribbons[1]} fill="none" stroke={`url(#${uid}-rib)`} strokeOpacity={0.3} strokeWidth={2.2} />
        </g>
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} className="rib fast">
          <path d={ribbons[2]} fill="none" stroke={`url(#${uid}-rib)`} strokeOpacity={0.28} strokeWidth={1.8} />
        </g>

        {/* CTA pill at center */}
        <foreignObject x={cx - 160} y={cy - 22} width={320} height={44}>
          <div style={{ display: "grid", placeItems: "center", width: "100%", height: "100%" }}>
            <button
              onClick={() => { triggerRipple(); onTap?.(); }}
              aria-label={label}
              style={{ padding: "10px 16px", borderRadius: 999, background: "#fff", color: "#111", border: "1px solid rgba(0,0,0,.06)", boxShadow: "0 2px 10px rgba(0,0,0,.08)", font: "500 14px/1.1 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto" }}
            >
              {label}
            </button>
          </div>
        </foreignObject>

        {/* Accessible status below (visual only; wire externally if needed) */}
        <text x={cx} y={cy + r + 40} textAnchor="middle" fill="#0f172a" fillOpacity="0.65" fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto" fontSize="12">{niceState(state)}</text>
      </svg>

      {/* Local styles for rotation (energy-reaction) */}
      <style>{`
        @keyframes spin360 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rib.slow { animation: spin360 ${18 / Math.max(0.2, (1 + energy * 0.6))}s linear infinite; }
        .rib.mid  { animation: spin360 ${12 / Math.max(0.2, (1 + energy * 0.6))}s linear infinite; }
        .rib.fast { animation: spin360 ${8  / Math.max(0.2, (1 + energy * 0.6))}s linear infinite; }
      `}</style>
    </div>
  );
}

function niceState(s: VoiceState) {
  switch (s) {
    case "idle": return "Tap to start";
    case "listening": return "Listening…";
    case "thinking": return "Thinking…";
    case "speaking": return "Talk to interrupt";
    case "muted": return "Muted";
    case "error": return "Something went wrong";
    default: return "";
  }
}