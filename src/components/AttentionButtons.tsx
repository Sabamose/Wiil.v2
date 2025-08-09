import React from "react";

export function AttentionButtons({
  onPrimary,
  onSecondary,
  primaryText = "+ Create Assistant",
  secondaryText = "See Analytics",
  pulse = true,
}: {
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryText?: string;
  secondaryText?: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onPrimary}
        className={[
          "relative select-none px-5 py-3 rounded-2xl text-white font-medium shadow-lg",
          "bg-gradient-to-b from-teal-500 to-teal-700",
          "ring-0 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200",
          pulse ? "animate-[btnPulse_6s_ease-in-out_infinite]" : "",
        ].join(" ")}
      >
        <span className="relative z-10">{primaryText}</span>
        {/* shine sweep */}
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-white/25 blur-md opacity-0 hover:opacity-60 transition-opacity duration-200" />
        </span>
      </button>

      <button
        onClick={onSecondary}
        className="px-5 py-3 rounded-2xl border border-teal-300/60 text-teal-700 bg-white hover:bg-teal-50/60 shadow-sm hover:shadow-md transition-all"
      >
        {secondaryText}
      </button>

      {/* keyframes */}
      <style>{`
        @keyframes btnPulse { 0%, 100% { transform: translateY(0); box-shadow: 0 8px 20px rgba(13,148,136,.15) } 50% { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(13,148,136,.22) } }
      `}</style>
    </div>
  );
}