import React, { useRef, useEffect } from 'react';

export default function GradientFlow({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  const duration = 20 / (speed * Math.max(0.1, intensity));
  const a = `#${theme.accent}`;
  const h = `#${theme.highlight || theme.accent}`;
  const bg = `#${theme.bg}`;

  // Create a unique animation ID so multiple instances don't clash
  const uid = useRef(`gf_${Math.random().toString(36).slice(2)}`).current;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${uid}_rotate {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes ${uid}_rotate2 {
          0%   { transform: rotate(60deg) scale(1.1); }
          50%  { transform: rotate(240deg) scale(0.9); }
          100% { transform: rotate(420deg) scale(1.1); }
        }
        @keyframes ${uid}_rotate3 {
          0%   { transform: rotate(120deg) scale(0.95); }
          50%  { transform: rotate(300deg) scale(1.2); }
          100% { transform: rotate(480deg) scale(0.95); }
        }
        @keyframes ${uid}_shimmer {
          0%   { transform: translateX(-100%) rotate(-45deg); }
          100% { transform: translateX(200%) rotate(-45deg); }
        }
        @keyframes ${uid}_pulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.75; }
        }
      `}</style>

      {/* Orb 1 — main accent */}
      <div
        style={{
          position: 'absolute',
          width: '160%',
          height: '160%',
          top: '-30%',
          left: '-30%',
          background: `conic-gradient(from 0deg, transparent 0%, ${a}cc 20%, transparent 45%, ${h}99 65%, transparent 100%)`,
          animation: `${uid}_rotate ${duration}s linear infinite`,
          filter: `blur(${60 * intensity}px)`,
          opacity: 0.6
        }}
      />

      {/* Orb 2 — highlight counter-rotation */}
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          background: `conic-gradient(from 120deg, transparent 0%, ${h}bb 30%, transparent 60%, ${a}77 80%, transparent 100%)`,
          animation: `${uid}_rotate2 ${duration * 1.4}s linear infinite`,
          filter: `blur(${45 * intensity}px)`,
          opacity: 0.5
        }}
      />

      {/* Orb 3 — accent slow spin */}
      <div
        style={{
          position: 'absolute',
          width: '140%',
          height: '140%',
          top: '-20%',
          left: '-20%',
          background: `conic-gradient(from 240deg, transparent 0%, ${a}55 40%, transparent 70%, ${h}44 90%, transparent 100%)`,
          animation: `${uid}_rotate3 ${duration * 1.8}s linear infinite`,
          filter: `blur(${80 * intensity}px)`,
          opacity: 0.4
        }}
      />

      {/* Pulsing glow overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${a}33 0%, transparent 70%)`,
          animation: `${uid}_pulse ${duration * 0.4}s ease-in-out infinite`
        }}
      />

      {/* Light streak / shimmer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '40%',
            height: '200%',
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)`,
            animation: `${uid}_shimmer ${duration * 0.8}s ease-in-out infinite`,
          }}
        />
      </div>
    </div>
  );
}
