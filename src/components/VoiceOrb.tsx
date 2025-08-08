import React from 'react';

interface VoiceOrbProps {
  state?: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  level?: number; // 0..1
  size?: number; // px
}

// A lightweight, theme-aware voice orb animation
// Uses design-system tokens (primary, destructive, muted) and smooth transitions
const VoiceOrb: React.FC<VoiceOrbProps> = ({ state = 'idle', level = 0, size = 240 }) => {
  const clamped = Math.max(0, Math.min(1, level || 0));

  // Base radii scale with level for listening state and gently pulse for speaking
  const outerScale = state === 'listening' ? 1 + clamped * 0.35 : state === 'speaking' ? 1.08 : 1;
  const midScale = state === 'listening' ? 1 + clamped * 0.25 : state === 'speaking' ? 1.04 : 1;
  const innerScale = state === 'listening' ? 1 + clamped * 0.15 : 1;

  const dim = Math.max(96, size);

  const colorClasses =
    state === 'error'
      ? {
          base: 'from-destructive/30 to-destructive/10',
          ring: 'ring-destructive/30',
          glow: 'shadow-[0_0_40px_theme(colors.destructive/30)]',
        }
      : state === 'listening'
      ? {
          base: 'from-primary/40 to-primary/10',
          ring: 'ring-primary/30',
          glow: 'shadow-[0_0_40px_theme(colors.primary/30)]',
        }
      : state === 'speaking'
      ? {
          base: 'from-primary/60 to-primary/20',
          ring: 'ring-primary/40',
          glow: 'shadow-[0_0_50px_theme(colors.primary/40)]',
        }
      : state === 'thinking'
      ? {
          base: 'from-muted-foreground/30 to-muted-foreground/10',
          ring: 'ring-muted-foreground/20',
          glow: 'shadow-[0_0_30px_theme(colors.muted.DEFAULT/20)]',
        }
      : {
          // idle
          base: 'from-primary/20 to-primary/5',
          ring: 'ring-primary/20',
          glow: 'shadow-none',
        };

  const statusDot =
    state === 'speaking'
      ? 'bg-primary'
      : state === 'listening'
      ? 'bg-primary'
      : state === 'thinking'
      ? 'bg-muted-foreground'
      : state === 'error'
      ? 'bg-destructive'
      : 'bg-border';

  return (
    <div
      className="relative select-none"
      style={{ width: dim, height: dim }}
      aria-label={`Voice orb ${state}`}
    >
      {/* Outer */}
      <div
        className={`absolute inset-0 rounded-full ring ${colorClasses.ring} ${colorClasses.glow} transition-transform duration-300 ease-out`}
        style={{ transform: `scale(${outerScale})` }}
      />

      {/* Middle */}
      <div
        className={`absolute inset-[6%] rounded-full ring ${colorClasses.ring} transition-transform duration-300 ease-out`}
        style={{ transform: `scale(${midScale})` }}
      />

      {/* Inner gradient core */}
      <div
        className={`absolute inset-[14%] rounded-full bg-gradient-to-br ${colorClasses.base} backdrop-blur`} 
        style={{ transform: `scale(${innerScale})` }}
      />

      {/* Center pulse */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${statusDot}`}
        style={{ width: dim * 0.08, height: dim * 0.08 }}
      />

      {/* Subtle motion overlays */}
      {state === 'speaking' && (
        <div className="absolute inset-[10%] rounded-full ring-1 ring-primary/20 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      )}
      {state === 'thinking' && (
        <div className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none">
          <div className="absolute inset-[8%] rounded-full ring-1 ring-muted-foreground/15" />
          <div className="absolute inset-[18%] rounded-full ring-1 ring-muted-foreground/10" />
        </div>
      )}
    </div>
  );
};

export default VoiceOrb;
