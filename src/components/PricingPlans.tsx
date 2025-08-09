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
      {/* Estimator Controls */}
      <div style={s.estimator}>
        <div style={s.row}>
          <Control
            label="Expected minutes / month"
            value={expectedMins}
            onChange={(v) => setExpectedMins(safeInt(v, 0))}
            step={100}
          />
          <Control
            label="Phone numbers"
            value={neededNumbers}
            onChange={(v) => setNeededNumbers(safeInt(v, 0))}
          />
          <Control
            label="Assistants"
            value={neededAssistants}
            onChange={(v) => setNeededAssistants(safeInt(v, 0))}
          />
        </div>
        <div style={s.help}>
          Overage for all plans: <b>${OVERAGE_PER_MIN.toFixed(2)}/min</b>. Extra
          numbers: <b>${EXTRA_NUMBER_PM.toFixed(2)}/mo</b>. Extra assistants:{" "}
          <b>${EXTRA_ASSISTANT_PM.toFixed(2)}/mo</b>.
        </div>
      </div>

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
            <div style={s.cardHead}>
              <div style={s.planNameRow}>
                <span style={s.planName}>{p.name}</span>
                {p.id === bestId && <span style={s.badge}>Best value</span>}
              </div>
              <div style={s.priceRow}>
                <span style={s.price}>${p.price}</span>
                <span style={s.per}>/mo</span>
              </div>
            </div>

            <ul style={s.features}>
              <li style={s.li}>
                <strong>{fmt(p.mins)}</strong> minutes included
              </li>
              <li style={s.li}>
                <strong>{p.assistants}</strong> assistants
              </li>
              <li style={s.li}>
                <strong>{p.numbers}</strong> numbers included (US)
              </li>
              <li style={s.li}>
                Overage <b>${OVERAGE_PER_MIN.toFixed(2)}/min</b>
              </li>
              <li style={s.li}>
                Extra number <b>${EXTRA_NUMBER_PM.toFixed(2)}/mo</b>
              </li>
              <li style={s.li}>
                Extra assistant <b>${EXTRA_ASSISTANT_PM.toFixed(2)}/mo</b>
              </li>
            </ul>

            <div style={s.divider} />

            <div style={s.estimateBox} aria-live="polite">
              <div style={s.estimateLine}>
                Est. monthly with your inputs:
                <span style={s.estimateCost}>${p.cost.toFixed(2)}</span>
              </div>
              {p.overageMins > 0 && (
                <div style={s.estimateNote}>
                  {fmt(p.overageMins)} mins overage • $
                  {(p.overageMins * OVERAGE_PER_MIN).toFixed(2)}
                </div>
              )}
              {(p.extraNumbers > 0 || p.extraAssist > 0) && (
                <div style={s.estimateNote}>
                  {!!p.extraNumbers && (
                    <>
                      {p.extraNumbers} extra numbers • $
                      {(p.extraNumbers * EXTRA_NUMBER_PM).toFixed(2)}
                    </>
                  )}
                  {!!p.extraNumbers && !!p.extraAssist && "  ·  "}
                  {!!p.extraAssist && (
                    <>
                      {p.extraAssist} extra assistants • $
                      {(p.extraAssist * EXTRA_ASSISTANT_PM).toFixed(2)}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => onSelect && onSelect(p.id, p)}
              style={{
                ...s.btn,
                ...(p.id === bestId ? s.btnPrimary : s.btnSecondary),
              }}
              aria-label={`Choose ${p.name}`}
            >
              {p.id === "free" ? "Start free" : `Choose ${p.name}`}
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
    wrap: { maxWidth: 1100, margin: "0 auto", padding: "8px 16px 32px" },
    estimator: {
      border: "1px solid rgba(0,0,0,.06)",
      background: "rgba(255,255,255,.9)",
      backdropFilter: "saturate(120%) blur(6px)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,.04)",
    },
    row: { display: "flex", gap: 12, flexWrap: "wrap" as const },
    help: { marginTop: 6, fontSize: 12, color: "#64748b" },

    cards: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap" as const,
      alignItems: "stretch",
      justifyContent: "center",
    },
    card: {
      flex: "1 1 240px",
      maxWidth: 260,
      border: "1px solid rgba(0,0,0,.06)",
      background: "#fff",
      borderRadius: 20,
      padding: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,.04)",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
    },
    cardBest: {
      outline: `2px solid ${accent}`,
      boxShadow: "0 20px 36px rgba(13,148,136,.15)",
      transform: "translateY(-2px)",
    },
    cardHead: { marginBottom: 6 },
    planNameRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    planName: { fontWeight: 700, fontSize: 16, color: "#0f172a" },
    badge: {
      fontSize: 11,
      color: accent,
      background: "rgba(13,148,136,.08)",
      border: `1px solid ${accent}33`,
      padding: "3px 6px",
      borderRadius: 999,
    },
    priceRow: { display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 },
    price: { fontSize: 28, fontWeight: 700, color: "#0f172a" },
    per: { fontSize: 12, color: "#64748b" },

    features: { listStyle: "none", padding: 0, margin: "10px 0 12px" },
    li: { fontSize: 14, color: "#334155", margin: "6px 0" },

    divider: { height: 1, background: "rgba(0,0,0,.06)", margin: "8px 0 10px" },

    estimateBox: {
      background: "rgba(13,148,136,.05)",
      border: `1px solid ${accent}22`,
      borderRadius: 12,
      padding: "8px 10px",
      marginBottom: 12,
    },
    estimateLine: { fontSize: 13, color: "#0f172a", display: "flex", justifyContent: "space-between" },
    estimateCost: { fontWeight: 700, color: accent, marginLeft: 8 },
    estimateNote: { marginTop: 4, fontSize: 12, color: "#475569" },

    btn: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      fontWeight: 600,
      cursor: "pointer",
      border: "1px solid rgba(0,0,0,.06)",
    },
    btnPrimary: {
      background: `linear-gradient(180deg, ${lighten(accent, .1)} 0%, ${accent} 100%)`,
      color: "#fff",
      boxShadow: "0 12px 24px rgba(13,148,136,.18)",
      border: "0",
    },
    btnSecondary: {
      background: "#fff",
      color: accent,
      border: `1px solid ${accent}55`,
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