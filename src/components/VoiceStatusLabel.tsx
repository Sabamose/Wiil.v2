import React, { useMemo } from "react";

export type Phase =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted"
  | "error";

interface VoiceStatusLabelProps {
  state: Phase;
  muted?: boolean;
}

export default function VoiceStatusLabel({ state, muted = false }: VoiceStatusLabelProps) {
  const text = useMemo(() => {
    if (muted) return "Muted";
    switch (state) {
      case "idle":
        return "Tap to conversate";
      case "listening":
        return "Listening…";
      case "thinking":
        return "Thinking…";
      case "speaking":
        return "Speaking…";
      case "error":
        return "Something went wrong";
      default:
        return "";
    }
  }, [state, muted]);

  return (
    <div
      aria-live="polite"
      role="status"
      style={{
        position: "absolute",
        left: "50%",
        transform: "translate(-50%, 140%)",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 500,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans", sans-serif',
        color: "white",
        background: "rgba(0,0,0,.55)",
        border: "1px solid rgba(255,255,255,.12)",
        transition: "opacity .2s ease",
        pointerEvents: "none",
        opacity: text ? 1 : 0,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}
