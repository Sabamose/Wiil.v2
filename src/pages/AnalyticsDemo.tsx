import React, { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useResponsive } from "@/hooks/use-responsive";

const series = Array.from({ length: 14 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  calls: 40 + Math.round(Math.sin(i / 2) * 18) + Math.round(Math.random() * 8),
  success: 70 + Math.round(Math.cos(i / 2) * 10),
}));

export default function AnalyticsDemo() {
  useEffect(() => {
    document.title = "Analytics Demo – Voice Assistant";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Demo analytics for your AI assistant: calls, success rate, and trends.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Demo analytics for your AI assistant: calls, success rate, and trends.";
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

  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 animate-fade-in`}>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-brand-teal">Analytics (Demo)</h1>
          <p className="text-sm text-muted-foreground mt-1">Static, UI-only example to feel the experience.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3 mb-6">
          {[{ kpi: "Calls", v: "1,284" }, { kpi: "Success Rate", v: "92%" }, { kpi: "Avg. Duration", v: "36s" }].map((x) => (
            <Card key={x.kpi}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{x.kpi}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{x.v}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Daily Calls</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="calls" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorCalls)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--brand-teal))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--brand-teal))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="success" stroke="hsl(var(--brand-teal))" fillOpacity={1} fill="url(#colorSuccess)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
