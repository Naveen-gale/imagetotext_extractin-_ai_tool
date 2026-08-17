import React, { useRef } from 'react';

export default function CyberGrid({ theme, config }) {
  const speed = config.speed || 1;
  const intensity = config.intensity || 1;
  const bg = `#${theme.bg}`;
  const color = theme.accent.startsWith('#') ? theme.accent : `#${theme.accent}`;
  const highlight = theme.highlight ? (theme.highlight.startsWith('#') ? theme.highlight : `#${theme.highlight}`) : color;
  const uid = useRef(`cg_${Math.random().toString(36).slice(2)}`).current;

  const gridStep = 5 / speed;
  const scanSpeed = 3.5 / speed;
  const glowOpacity = Math.min(0.9, 0.3 * intensity);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ perspective: '1200px', backgroundColor: bg }}
    >
      <style>{`
        @keyframes ${uid}_grid {
          0%   { transform: rotateX(72deg) translateY(0); }
          100% { transform: rotateX(72deg) translateY(60px); }
        }
        @keyframes ${uid}_gridH {
          0%   { transform: rotateX(72deg) translateY(0); }
          100% { transform: rotateX(72deg) translateY(60px); }
        }
        @keyframes ${uid}_scan {
          0%   { top: -5%; opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { top: 105%; opacity: 0; }
        }
        @keyframes ${uid}_scan2 {
          0%   { top: -5%; opacity: 0; }
          8%   { opacity: 0.5; }
          88%  { opacity: 0.3; }
          100% { top: 105%; opacity: 0; }
        }
        @keyframes ${uid}_flicker {
          0%,100% { opacity: ${glowOpacity}; }
          92%      { opacity: ${glowOpacity}; }
          93%      { opacity: ${glowOpacity * 0.2}; }
          94%      { opacity: ${glowOpacity}; }
          97%      { opacity: ${glowOpacity}; }
          98%      { opacity: ${glowOpacity * 0.4}; }
          99%      { opacity: ${glowOpacity}; }
        }
        @keyframes ${uid}_pulse {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes ${uid}_horizon {
          0%,100% { opacity: 0.3; transform: scaleX(1); }
          50%      { opacity: 0.8; transform: scaleX(1.1); }
        }
      `}</style>

      {/* Main perspective grid floor */}
      <div
        style={{
          position: 'absolute',
          width: '220%',
          height: '220%',
          bottom: '-50%',
          left: '-60%',
          backgroundImage: `
            linear-gradient(to right, ${color}55 1.5px, transparent 1.5px),
            linear-gradient(to top,   ${color}55 1.5px, transparent 1.5px)
          `,
          backgroundSize: '60px 60px',
          animation: `${uid}_grid ${gridStep}s linear infinite`,
          boxShadow: `0 0 40px 10px ${color}33`,
          opacity: glowOpacity
        }}
      />

      {/* Secondary finer grid */}
      <div
        style={{
          position: 'absolute',
          width: '220%',
          height: '220%',
          bottom: '-50%',
          left: '-60%',
          backgroundImage: `
            linear-gradient(to right, ${color}22 1px, transparent 1px),
            linear-gradient(to top,   ${color}22 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          animation: `${uid}_grid ${gridStep * 0.5}s linear infinite`,
          opacity: glowOpacity * 0.5
        }}
      />

      {/* Horizon glow line */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '-10%',
          width: '120%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${highlight}, ${color}, ${highlight}, transparent)`,
          boxShadow: `0 0 20px 8px ${highlight}88, 0 0 60px 20px ${color}44`,
          animation: `${uid}_horizon ${gridStep * 0.8}s ease-in-out infinite`,
          zIndex: 5
        }}
      />

      {/* Scanline beam 1 */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${highlight}cc, ${color}, ${highlight}cc, transparent)`,
          boxShadow: `0 0 15px 5px ${color}99, 0 0 40px 15px ${color}55`,
          animation: `${uid}_scan ${scanSpeed}s linear infinite`,
          zIndex: 10
        }}
      />

      {/* Scanline beam 2 — slower, dimmer */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}88, transparent)`,
          animation: `${uid}_scan2 ${scanSpeed * 1.7}s linear infinite`,
          animationDelay: `${scanSpeed * 0.4}s`,
          zIndex: 10
        }}
      />

      {/* Neon glow corner accents */}
      {[
        { top: '5%', left: '3%' },
        { top: '5%', right: '3%' },
        { bottom: '5%', left: '3%' },
        { bottom: '5%', right: '3%' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '40px', height: '40px',
            ...pos,
            borderTop: i < 2 ? `2px solid ${color}` : 'none',
            borderBottom: i >= 2 ? `2px solid ${color}` : 'none',
            borderLeft: i % 2 === 0 ? `2px solid ${color}` : 'none',
            borderRight: i % 2 === 1 ? `2px solid ${color}` : 'none',
            boxShadow: `0 0 10px 3px ${color}66`,
            animation: `${uid}_pulse ${1.5 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`
          }}
        />
      ))}

      {/* Fade gradient — top half fade to background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom, ${bg} 0%, transparent 45%, transparent 60%, ${bg}cc 100%)`,
          zIndex: 8,
          pointerEvents: 'none'
        }}
      />

      {/* Flicker effect overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)`,
          animation: `${uid}_flicker 4s linear infinite`,
          zIndex: 9,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
