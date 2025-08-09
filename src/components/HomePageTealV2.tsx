import React, { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "./Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// ---------- Analytics Modal Content ----------
// Incoming calls data (customer support focus)
const incomingData = Array.from({ length: 14 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  calls: 45 + Math.round(Math.sin(i / 2) * 20) + Math.round(Math.random() * 10),
  satisfaction: 85 + Math.round(Math.sin(i / 3) * 8),
  resolved: 88 + Math.round(Math.cos(i / 2.5) * 6),
  avgResponseTime: 1.2 + Math.sin(i / 4) * 0.3,
}));

// Outgoing calls data (campaign/sales focus)
const outgoingData = Array.from({ length: 14 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  calls: 35 + Math.round(Math.cos(i / 2) * 15) + Math.round(Math.random() * 8),
  contactRate: 65 + Math.round(Math.sin(i / 3) * 10),
  conversions: 15 + Math.round(Math.cos(i / 2.5) * 5),
  revenue: 2400 + Math.round(Math.sin(i / 2) * 800),
}));

const supportPeakHours = [
  { hour: '9 AM', calls: 42 },
  { hour: '10 AM', calls: 58 },
  { hour: '11 AM', calls: 71 },
  { hour: '12 PM', calls: 52 },
  { hour: '1 PM', calls: 45 },
  { hour: '2 PM', calls: 68 },
  { hour: '3 PM', calls: 79 },
  { hour: '4 PM', calls: 63 }
];

const campaignPerformance = [
  { campaign: 'Holiday Sale', contacts: 156, conversions: 28, revenue: 4200 },
  { campaign: 'Product Launch', contacts: 142, conversions: 22, revenue: 3600 },
  { campaign: 'Renewal Reminder', contacts: 98, conversions: 45, revenue: 6750 },
  { campaign: 'Survey Follow-up', contacts: 87, conversions: 12, revenue: 1800 }
];

const costBreakdown = [
  { day: 'Day 1', incomingCost: 0.08, outgoingCost: 0.14 },
  { day: 'Day 2', incomingCost: 0.07, outgoingCost: 0.12 },
  { day: 'Day 3', incomingCost: 0.09, outgoingCost: 0.11 },
  { day: 'Day 4', incomingCost: 0.08, outgoingCost: 0.13 },
  { day: 'Day 5', incomingCost: 0.06, outgoingCost: 0.10 },
  { day: 'Day 6', incomingCost: 0.07, outgoingCost: 0.12 },
  { day: 'Day 7', incomingCost: 0.05, outgoingCost: 0.09 }
];

function IncomingCallsAnalytics() {
  return (
    <div className="space-y-6">
      {/* Incoming Call KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { kpi: "Support Calls", v: "892", change: "+8%" },
          { kpi: "Customer Satisfaction", v: "4.8★", change: "+0.2" },
          { kpi: "First-Call Resolution", v: "89%", change: "+3%" },
          { kpi: "Avg. Response Time", v: "1.1s", change: "-0.2s" }
        ].map((x, i) => (
          <Card key={x.kpi} className="animate-scale-in" style={{animationDelay: `${i * 0.1}s`}}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{x.kpi}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">{x.v}</div>
              <div className="text-xs text-teal-600 mt-1">{x.change} vs last week</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Charts section */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Daily Support Calls */}
        <Card className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Daily Support Calls</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomingData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorIncoming)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Satisfaction Trend */}
        <Card className="animate-fade-in" style={{animationDelay: '0.5s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomingData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis domain={[75, 95]} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="satisfaction" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorSatisfaction)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Support Peak Hours */}
        <Card className="animate-fade-in" style={{animationDelay: '0.7s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Support Peak Hours</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supportPeakHours} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPeakSupport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="calls" fill="url(#colorPeakSupport)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Rate Trend */}
        <Card className="animate-fade-in" style={{animationDelay: '0.9s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Issue Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomingData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis domain={[80, 95]} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="resolved" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function OutgoingCallsAnalytics() {
  return (
    <div className="space-y-6">
      {/* Outgoing Call KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { kpi: "Campaign Calls", v: "1,547", change: "+18%" },
          { kpi: "Contact Rate", v: "68%", change: "+5%" },
          { kpi: "Conversion Rate", v: "16.2%", change: "+2.1%" },
          { kpi: "Revenue Generated", v: "$28.4K", change: "+23%" }
        ].map((x, i) => (
          <Card key={x.kpi} className="animate-scale-in" style={{animationDelay: `${i * 0.1}s`}}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{x.kpi}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">{x.v}</div>
              <div className="text-xs text-teal-600 mt-1">{x.change} vs last week</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Charts section */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Daily Campaign Calls */}
        <Card className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Daily Campaign Calls</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outgoingData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorOutgoing)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contact Rate Trend */}
        <Card className="animate-fade-in" style={{animationDelay: '0.5s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Contact Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outgoingData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorContactRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 80]} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="contactRate" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorContactRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card className="animate-fade-in" style={{animationDelay: '0.7s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformance} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCampaign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="campaign" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="conversions" fill="url(#colorCampaign)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="animate-fade-in" style={{animationDelay: '0.9s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Revenue Generated</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outgoingData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AnalyticsModalContent() {
  return (
    <div className="animate-fade-in">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-semibold text-teal-700">Analytics (Demo)</DialogTitle>
        <p className="text-sm text-muted-foreground mt-1">Static, UI-only example to feel the experience.</p>
      </DialogHeader>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            <PhoneIncoming size={16} />
            Incoming Calls
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            <PhoneOutgoing size={16} />
            Outgoing calls
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="space-y-6">
          <IncomingCallsAnalytics />
        </TabsContent>
        
        <TabsContent value="outgoing" className="space-y-6">
          <OutgoingCallsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Page ----------
export default function HomePageTealV2() {
  const [state, setState] = useState<VoiceState>("idle");
  const [energy, setEnergy] = useState(0); // 0..1 — hook this to your backend later
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Chat with an AI Assistant – Instant Demo";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Try a unique voice + chat assistant demo, explore templates, and see analytics UI.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Try a unique voice + chat assistant demo, explore templates, and see analytics UI.";
      document.head.appendChild(m);
    }
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) link.href = window.location.href;
    else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = window.location.href;
      document.head.appendChild(l);
    }
  }, []);

  // Simulate conversation energy while speaking/listening
  useEffect(() => {
    let id: number | null = null;
    if (state === "speaking" || state === "listening") {
      id = window.setInterval(() => setEnergy(() => Math.random()*0.9), 200) as any;
    } else { setEnergy(0); }
    return () => { if (id) clearInterval(id); };
  }, [state]);

  return (
    <>
      <Navigation />
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

        <div className="relative flex items-center justify-center min-h-[500px]">
          {/* Main background waves - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ExtendedWavesTeal running={state === "speaking" || state === "listening"} />
          </div>
          
          {/* Additional wave nets - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="pointer-events-none opacity-40" height={180} width={600} viewBox="0 0 600 180">
              <defs>
                <linearGradient id="waveNet1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5eead4" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {Array.from({length: 5}).map((_, i) => (
                <circle key={i} 
                  cx={300 + Math.sin(Date.now() * 0.001 + i) * 50} 
                  cy={90 + Math.cos(Date.now() * 0.0008 + i) * 15} 
                  r={20 + i * 8} 
                  fill="none" 
                  stroke="url(#waveNet1)" 
                  strokeWidth={1}
                  className="animate-pulse"
                  style={{animationDelay: `${i * 0.5}s`}}
                />
              ))}
            </svg>
          </div>

          {/* Outer ripple rings - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="pointer-events-none opacity-25" height={400} width={400} viewBox="0 0 400 400">
              <defs>
                <radialGradient id="ripple" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
                  <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                </radialGradient>
              </defs>
              {[80, 120, 160, 200].map((r, i) => (
                <circle key={i} 
                  cx={200} 
                  cy={200} 
                  r={r} 
                  fill="none" 
                  stroke="url(#ripple)" 
                  strokeWidth={2}
                  className="animate-pulse"
                  style={{animationDelay: `${i * 0.8}s`, animationDuration: '3s'}}
                />
              ))}
            </svg>
          </div>

          {/* Floating particles - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="pointer-events-none opacity-60" height={300} width={500} viewBox="0 0 500 300">
              {Array.from({length: 12}).map((_, i) => (
                <circle key={i} 
                  cx={100 + i * 30 + Math.sin(Date.now() * 0.002 + i) * 20} 
                  cy={150 + Math.cos(Date.now() * 0.0015 + i) * 40} 
                  r={2 + Math.sin(Date.now() * 0.003 + i) * 1} 
                  fill="#14b8a6" 
                  opacity={0.4 + Math.sin(Date.now() * 0.004 + i) * 0.3}
                  className="animate-fade-in"
                />
              ))}
            </svg>
          </div>

          {/* Voice orb - centered */}
          <div className="relative z-10">
            <TealBreathingOrb state={state} energy={energy} simulate onStateChange={setState} />
          </div>
        </div>

        {/* Primary actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-teal to-brand-teal-hover text-brand-teal-foreground font-semibold shadow-lg hover:shadow-xl hover:shadow-brand-teal/25 hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none relative overflow-hidden group"
            onClick={() => {
              navigate("/");
              setTimeout(() => window.dispatchEvent(new Event("create-assistant")), 75);
            }}
          >
            <span className="relative z-10">Create my assistant</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            className="px-5 py-3 rounded-2xl border border-neutral-200 text-neutral-800 hover:bg-neutral-50"
            onClick={() => setAnalyticsOpen(true)}
          >
            See analytics demo
          </button>
        </div>
      </section>

      {/* Immediate value row */}
      <MiniAnalytics />

      {/* Analytics modal */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto succession-modal">
          <AnalyticsModalContent />
        </DialogContent>
      </Dialog>

    </main>
    </>
  );
}