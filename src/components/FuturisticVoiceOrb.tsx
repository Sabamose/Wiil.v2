import React from "react";

export type OrbState = "idle" | "connecting" | "active";

interface FuturisticVoiceOrbProps {
  size?: number; // recommended 200–400
  state?: OrbState;
  className?: string;
  colorVar?: string; // CSS variable token name (e.g., --brand-teal)
}

/**
 * FuturisticVoiceOrb
 * - Cinematic, premium-tech orb with layered vector groups for Rive-ready animation
 * - Layers: outer-glow, rays, core, highlights, particles
 * - Colors use design tokens (primary, accent, foreground) for light/dark themes
 */
const FuturisticVoiceOrb: React.FC<FuturisticVoiceOrbProps> = ({
  size = 256,
  state = "idle",
  className,
  colorVar = "--brand-teal",
}) => {
const glowOpacity = state === "active" ? 0.55 : state === "connecting" ? 0.4 : 0.28;
const rayOpacity = state === "active" ? 0.22 : state === "connecting" ? 0.16 : 0.1;
const particleOpacity = state === "active" ? 0.35 : state === "connecting" ? 0.25 : 0.18;
const color = `hsl(var(${colorVar}))`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label="Futuristic voice assistant orb"
      className={className}
    >
      <title>Voice Assistant Orb</title>
      <defs>
        {/* Core gradient (deep to electric) using theme tokens */}
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="45%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.85} />
        </radialGradient>

        {/* Subtle vignette for rim lighting */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="55%">
          <stop offset="65%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.35" />
        </radialGradient>

        {/* Outer glow gradient */}
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="60%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>

        {/* Electric rim highlight */}
        <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Light ray blur */}
        <filter id="rayBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        {/* Specular highlight blur */}
        <filter id="specBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Background disc (dark glass feel if used on light bg) */}
      <g id="background-disc" opacity="0.1">
        <circle cx="200" cy="200" r="180" fill={`hsl(var(--background))`} />
      </g>

      {/* Outer atmospheric glow */}
      <g id="outer-glow" filter="url(#softGlow)" opacity={glowOpacity}>
        <circle cx="200" cy="200" r="180" fill="url(#glowGrad)" />
      </g>

      {/* Wave net (concentric rings + spokes) */}
      <g
        id="wave-net"
        opacity={state === "active" ? 0.35 : state === "connecting" ? 0.25 : 0.18}
      >
        {/* Concentric rings */}
        <circle cx="200" cy="200" r="160" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="6 10" />
        <circle cx="200" cy="200" r="172" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.25" strokeDasharray="4 8" />
        <circle cx="200" cy="200" r="184" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />

        {/* Radial spokes */}
        <line x1="200" y1="200" x2="384" y2="200" stroke={color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="200" y1="200" x2="16" y2="200" stroke={color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="200" y1="200" x2="200" y2="16" stroke={color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="200" y1="200" x2="200" y2="384" stroke={color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="200" y1="200" x2="330.1" y2="69.9" stroke={color} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 7" />
        <line x1="200" y1="200" x2="69.9" y2="69.9" stroke={color} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 7" />
        <line x1="200" y1="200" x2="69.9" y2="330.1" stroke={color} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 7" />
        <line x1="200" y1="200" x2="330.1" y2="330.1" stroke={color} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 7" />
      </g>

      {/* Volumetric light rays */}
      <g id="rays" filter="url(#rayBlur)" opacity={rayOpacity}>
        <path d="M200 20 L230 180 L170 180 Z" fill={color} />
        <path d="M380 200 L220 230 L220 170 Z" fill={color} />
        <path d="M200 380 L230 220 L170 220 Z" fill={color} />
        <path d="M20 200 L180 230 L180 170 Z" fill={color} />
      </g>

      {/* Core sphere */}
      <g id="core">
        <circle cx="200" cy="200" r="150" fill="url(#coreGrad)" />
        {/* Vignette for subtle rim lighting */}
        <circle cx="200" cy="200" r="150" fill="url(#vignette)" />
        {/* Electric rim sweep */}
        <ellipse cx="250" cy="150" rx="120" ry="40" fill="url(#rimGrad)" opacity="0.35" transform="rotate(25 250 150)" />
      </g>

      {/* Glossy specular highlights */}
      <g id="highlights" filter="url(#specBlur)">
        <ellipse cx="150" cy="130" rx="60" ry="28" fill={`hsl(var(--foreground))`} opacity="0.18" />
        <ellipse cx="260" cy="250" rx="40" ry="18" fill={`hsl(var(--foreground))`} opacity="0.08" />
      </g>

      {/* Minimal particle field */}
      <g id="particles" opacity={particleOpacity}>
        <circle cx="95" cy="205" r="2.5" fill={color} />
        <circle cx="310" cy="110" r="2" fill={color} />
        <circle cx="330" cy="260" r="3" fill={color} />
        <circle cx="80" cy="130" r="2" fill={color} />
        <circle cx="200" cy="40" r="1.8" fill={color} />
        <circle cx="360" cy="200" r="2.2" fill={color} />
        <circle cx="200" cy="360" r="2" fill={color} />
      </g>
    </svg>
  );
};

export default FuturisticVoiceOrb;
