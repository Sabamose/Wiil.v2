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
      className="group relative select-none px-5 py-3 rounded-2xl text-white font-medium shadow-lg bg-gradient-to-b from-teal-500 to-teal-700 ring-0 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="relative z-10">{primaryText}</span>
        {/* shine sweep */}
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-white/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </span>
      </button>

      <button
        onClick={onSecondary}
        className="px-5 py-3 rounded-2xl border border-teal-300/60 text-teal-700 bg-white hover:bg-teal-50/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {secondaryText}
      </button>
    </div>
  );
}