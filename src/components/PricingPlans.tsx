import React, { useMemo, useState } from "react";

/**
 * PricingPlans – $0.09/min, US numbers $1.25/mo, extra assistant $5/mo
 * Plans: Free / Starter / Pro / Business
 * - Live estimator: minutes, numbers, assistants
 * - Highlights the cheapest plan
 * - No external dependencies; inline styles only
 */

export default function PricingPlans({
  accent = "#0d9488",
  onSelect, // (planId, estimate) => void
}: {
  accent?: string;
  onSelect?: (planId: string, estimate: any) => void;
}) {
  const PLANS = [
    { id: "free",     name: "Free",     price: 0,   mins: 10,   assistants: 1,  numbers: 0 },
    { id: "starter",  name: "Starter",  price: 29,  mins: 300,  assistants: 3,  numbers: 1 },
    { id: "pro",      name: "Pro",      price: 149, mins: 1600, assistants: 10, numbers: 3 },
    { id: "business", name: "Business", price: 399, mins: 4300, assistants: 25, numbers: 10 },
  ];
  const OVERAGE_PER_MIN = 0.09;
  const EXTRA_NUMBER_PM = 1.25;
  const EXTRA_ASSISTANT_PM = 5;

  // Estimator inputs
  const [expectedMins, setExpectedMins] = useState(600);
  const [neededNumbers, setNeededNumbers] = useState(2);
  const [neededAssistants, setNeededAssistants] = useState(3);

  // Estimate cost for each plan
  const estimates = useMemo(() => {
    return PLANS.map((p) => {
      const overageMins = Math.max(0, expectedMins - p.mins);
      const extraNumbers = Math.max(0, neededNumbers - p.numbers);
      const extraAssist  = Math.max(0, neededAssistants - p.assistants);
      const cost =
        p.price +
        overageMins * OVERAGE_PER_MIN +
        extraNumbers * EXTRA_NUMBER_PM +
        extraAssist * EXTRA_ASSISTANT_PM;

      return {
        ...p,
        overageMins,
        extraNumbers,
        extraAssist,
        cost,
      };
    });
  }, [expectedMins, neededNumbers, neededAssistants]);

  // Find cheapest
  const bestId = useMemo(
    () => estimates.slice().sort((a, b) => a.cost - b.cost)[0]?.id,
    [estimates]
  );

  const s = styles(accent);

  return (
    <section style={s.wrap} aria-label="Pricing">
      {/* Cards */}
      <div style={s.cards}>
        {estimates.map((p) => (
          <div
            key={p.id}
            style={{
              ...s.card,
              ...(p.id === bestId ? s.cardBest : null),
            }}
            aria-label={`${p.name} plan`}
          >
            {/* Plan header with price */}
            <div style={s.cardHead}>
              <div style={s.planNameRow}>
                <h3 style={s.planName}>{p.name}</h3>
                {p.id === bestId && <span style={s.badge}>Most popular</span>}
              </div>
              <div style={s.priceRow}>
                <span style={s.price}>${p.price}</span>
                <span style={s.per}>/month</span>
              </div>
            </div>

            {/* Key features - simplified */}
            <ul style={s.features}>
              <li style={s.featureItem}>
                <span style={s.featureValue}>{fmt(p.mins)}</span> minutes
              </li>
              <li style={s.featureItem}>
                <span style={s.featureValue}>{p.assistants}</span> {p.assistants === 1 ? 'assistant' : 'assistants'}
              </li>
              <li style={s.featureItem}>
                <span style={s.featureValue}>{p.numbers}</span> {p.numbers === 1 ? 'phone number' : 'phone numbers'}
              </li>
              <li style={s.featureItem}>
                ${OVERAGE_PER_MIN.toFixed(2)}/min overage
              </li>
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => onSelect && onSelect(p.id, p)}
              style={{
                ...s.btn,
                ...(p.id === bestId ? s.btnPrimary : s.btnSecondary),
              }}
              aria-label={`Choose ${p.name}`}
            >
              {p.id === "free" ? "Get started" : `Choose ${p.name}`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Controls ---------- */

function Control({ label, value, onChange, step = 1 }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  const s = controlStyles;
  return (
    <label style={s.wrap}>
      <span style={s.label}>{label}</span>
      <div style={s.inputRow}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, Number(value) - step))}
          style={s.step}
          aria-label="Decrease"
        >
          –
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={0}
          step={step}
          style={s.input}
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => onChange(Number(value) + step)}
          style={s.step}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </label>
  );
}

/* ---------- Helpers & Styles ---------- */

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);
const safeInt = (v: any, d = 0) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

function styles(accent: string) {
  return {
    wrap: { maxWidth: 1000, margin: "0 auto", padding: "0 16px 32px" },

    cards: {
      display: "flex",
      gap: 24,
      flexWrap: "wrap" as const,
      alignItems: "stretch",
      justifyContent: "center",
    },
    card: {
      flex: "1 1 260px",
      maxWidth: 280,
      background: "#fff",
      borderRadius: 24,
      padding: 32,
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      transition: "all 0.2s ease",
      cursor: "pointer",
    },
    cardBest: {
      background: "linear-gradient(135deg, rgba(13,148,136,0.02) 0%, rgba(13,148,136,0.08) 100%)",
      border: `1px solid ${accent}20`,
      transform: "translateY(-4px)",
      boxShadow: "0 16px 40px rgba(13,148,136,.12)",
    },
    cardHead: { marginBottom: 24 },
    planNameRow: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: 8 
    },
    planName: { 
      fontWeight: 600, 
      fontSize: 20, 
      color: "#0f172a",
      margin: 0 
    },
    badge: {
      fontSize: 11,
      fontWeight: 500,
      color: accent,
      background: `${accent}15`,
      padding: "4px 8px",
      borderRadius: 12,
    },
    priceRow: { display: "flex", alignItems: "baseline", gap: 4 },
    price: { fontSize: 36, fontWeight: 700, color: "#0f172a" },
    per: { fontSize: 14, color: "#64748b", fontWeight: 500 },

    features: { 
      listStyle: "none", 
      padding: 0, 
      margin: "0 0 32px", 
      flex: 1 
    },
    featureItem: { 
      fontSize: 15, 
      color: "#475569", 
      margin: "12px 0",
      display: "flex",
      alignItems: "center"
    },
    featureValue: { 
      fontWeight: 600, 
      color: "#0f172a", 
      marginRight: 6,
      minWidth: "fit-content"
    },

    btn: {
      width: "100%",
      padding: "14px 20px",
      borderRadius: 16,
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
      border: "none",
      transition: "all 0.2s ease",
    },
    btnPrimary: {
      background: `linear-gradient(135deg, ${accent} 0%, ${lighten(accent, -0.1)} 100%)`,
      color: "#fff",
      boxShadow: "0 8px 24px rgba(13,148,136,.25)",
    },
    btnSecondary: {
      background: "#f8fafc",
      color: accent,
      border: `1px solid ${accent}30`,
    },
  };
}

const controlStyles = {
  wrap: { flex: "1 1 220px", minWidth: 220 },
  label: { display: "block", fontSize: 12, color: "#475569", marginBottom: 6 },
  inputRow: {
    display: "flex",
    alignItems: "center",
    border: "1px solid rgba(0,0,0,.08)",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
  },
  step: {
    width: 40,
    height: 36,
    border: "0",
    background: "rgba(0,0,0,.02)",
    cursor: "pointer",
    fontSize: 18,
    color: "#0f172a",
  },
  input: {
    flex: 1,
    height: 36,
    border: "0",
    padding: "0 10px",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
  },
};

/* small util */
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