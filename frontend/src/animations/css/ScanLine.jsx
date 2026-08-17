import React, { useRef } from 'react';

export default function ScanLine({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  const bg = `#${theme.bg}`;
  const color = theme.accent.startsWith('#') ? theme.accent : `#${theme.accent}`;
  const highlight = theme.highlight ? (theme.highlight.startsWith('#') ? theme.highlight : `#${theme.highlight}`) : color;
  const uid = useRef(`sl_${Math.random().toString(36).slice(2)}`).current;

  const scanDur = 4 / speed;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${uid}_scan1 {
          0%   { top: -3%; opacity: 0; }
          3%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 103%; opacity: 0; }
        }
        @keyframes ${uid}_scan2 {
          0%   { top: -3%; opacity: 0; }
          5%   { opacity: 0.5; }
          90%  { opacity: 0.3; }
          100% { top: 103%; opacity: 0; }
        }
        @keyframes ${uid}_scan3 {
          0%   { top: -3%; opacity: 0; }
          4%   { opacity: 0.15; }
          92%  { opacity: 0.1; }
          100% { top: 103%; opacity: 0; }
        }
        @keyframes ${uid}_glitch {
          0%,93%,100% { transform: translateX(0) skewX(0deg); opacity: 1; }
          94%          { transform: translateX(-4px) skewX(-1deg); opacity: 0.7; }
          95%          { transform: translateX(4px) skewX(2deg); opacity: 0.9; }
          96%          { transform: translateX(-2px) skewX(0deg); opacity: 0.8; }
          97%          { transform: translateX(0) skewX(0deg); opacity: 1; }
        }
        @keyframes ${uid}_hud {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }
        @keyframes ${uid}_gridScroll {
          0%   { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
      `}</style>

      {/* Glitchy background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${color}20 1px, transparent 1px),
            linear-gradient(to bottom, ${color}20 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: `${uid}_gridScroll ${5 / speed}s linear infinite`,
          opacity: 0.4 * intensity
        }}
      />

      {/* Glitch wrapper for the whole scene */}
      <div style={{
        position: 'absolute',
        inset: 0,
        animation: `${uid}_glitch ${8 / speed}s linear infinite`
      }}>
        {/* Primary scanline beam */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0,
            height: `${3 + intensity}px`,
            background: `linear-gradient(90deg, transparent, ${highlight}bb, white, ${color}bb, transparent)`,
            boxShadow: `
              0 0 10px 3px ${highlight}99,
              0 0 30px 10px ${color}66,
              0 0 60px 20px ${color}33
            `,
            animation: `${uid}_scan1 ${scanDur}s linear infinite`
          }}
        />

        {/* Secondary dimmer scanline */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${color}77, transparent)`,
            boxShadow: `0 0 8px 2px ${color}55`,
            animation: `${uid}_scan2 ${scanDur * 1.6}s linear infinite`,
            animationDelay: `${scanDur * 0.3}s`
          }}
        />

        {/* Trailing afterglow */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '20px',
            background: `linear-gradient(to bottom, ${color}22, transparent)`,
            animation: `${uid}_scan3 ${scanDur}s linear infinite`
          }}
        />
      </div>

      {/* CRT scanlines overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)`,
          pointerEvents: 'none',
          zIndex: 5
        }}
      />

      {/* HUD corner brackets */}
      {[
        { top: '6%', left: '4%', borderTop: true, borderLeft: true },
        { top: '6%', right: '4%', borderTop: true, borderRight: true },
        { bottom: '6%', left: '4%', borderBottom: true, borderLeft: true },
        { bottom: '6%', right: '4%', borderBottom: true, borderRight: true },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '30px', height: '30px',
            top: b.top, left: b.left, right: b.right, bottom: b.bottom,
            borderTop: b.borderTop ? `2px solid ${color}cc` : 'none',
            borderBottom: b.borderBottom ? `2px solid ${color}cc` : 'none',
            borderLeft: b.borderLeft ? `2px solid ${color}cc` : 'none',
            borderRight: b.borderRight ? `2px solid ${color}cc` : 'none',
            boxShadow: `0 0 8px 2px ${color}44`,
            animation: `${uid}_hud ${2 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            zIndex: 6
          }}
        />
      ))}

      {/* HUD center crosshair dot */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: '6px', height: '6px',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: color,
        boxShadow: `0 0 10px 4px ${color}aa`,
        animation: `${uid}_hud 1.5s ease-in-out infinite`,
        zIndex: 6
      }} />

      {/* Vignette corners */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${bg}cc 100%)`,
          pointerEvents: 'none',
          zIndex: 4
        }}
      />
    </div>
  );
}
