import React, { useRef, useState } from "react";

export function ChatDock({
  onSend,
  suggestions = ["What can I build?", "Pricing", "Show a quick demo"],
  placeholder = "Ask anything…",
}: {
  onSend?: (text: string) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const send = () => {
    const t = val.trim();
    if (!t) return;
    onSend?.(t);
    setVal("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setVal(s); inputRef.current?.focus(); }}
              className="px-3 py-1.5 rounded-full border border-neutral-200 text-sm bg-white hover:bg-neutral-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* dock */}
      <div className={["group relative rounded-3xl border border-neutral-200/80",
        "bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur-sm",
        "shadow-[0_2px_20px_rgba(0,0,0,0.04)]",
        focused ? "ring-2 ring-teal-600/20" : ""
      ].join(" ")}
        role="form" aria-label="Chat input"
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {/* mic icon */}
          <MicIcon className="w-5 h-5 text-neutral-500" />

          <input
            ref={inputRef}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400"
            aria-label="Message"
          />

          <button
            onClick={send}
            disabled={!val.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-teal-700 transition-colors"
            aria-label="Send message"
          >
            <ArrowIcon className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}