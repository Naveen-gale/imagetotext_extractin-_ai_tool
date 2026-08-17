import React, { useRef } from 'react';

export default function Glassmorphism({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  const dur = 18 / (speed * Math.max(0.1, intensity));
  const a = `#${theme.accent}`;
  const h = `#${theme.highlight || theme.accent}`;
  const bg = `#${theme.bg}`;
  const uid = useRef(`glass_${Math.random().toString(36).slice(2)}`).current;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${uid}_orb1 {
          0%,100% { transform: translate(0%,0%) scale(1); }
          33%      { transform: translate(30%,15%) scale(1.1); }
          66%      { transform: translate(-10%,25%) scale(0.9); }
        }
        @keyframes ${uid}_orb2 {
          0%,100% { transform: translate(0%,0%) scale(1); }
          40%      { transform: translate(-25%,-20%) scale(1.2); }
          80%      { transform: translate(15%,-10%) scale(0.85); }
        }
        @keyframes ${uid}_orb3 {
          0%,100% { transform: translate(0%,0%) scale(1.05); }
          50%      { transform: translate(10%,30%) scale(0.9); }
        }
        @keyframes ${uid}_sweep {
          0%   { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(250%) skewX(-20deg); opacity: 0; }
        }
        @keyframes ${uid}_panel {
          0%,100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>

      {/* Color orb 1 */}
      <div style={{
        position: 'absolute', width: '70%', height: '70%',
        top: '-10%', left: '-10%',
        background: `radial-gradient(circle at 40% 40%, ${a}cc, transparent 70%)`,
        filter: `blur(${70 * intensity}px)`,
        animation: `${uid}_orb1 ${dur}s ease-in-out infinite`
      }} />
      
      {/* Color orb 2 */}
      <div style={{
        position: 'absolute', width: '60%', height: '60%',
        bottom: '-10%', right: '-10%',
        background: `radial-gradient(circle at 60% 60%, ${h}bb, transparent 70%)`,
        filter: `blur(${60 * intensity}px)`,
        animation: `${uid}_orb2 ${dur * 1.4}s ease-in-out infinite`
      }} />

      {/* Color orb 3 — center accent */}
      <div style={{
        position: 'absolute', width: '45%', height: '45%',
        top: '30%', left: '30%',
        background: `radial-gradient(circle at 50% 50%, ${a}66, ${h}44 50%, transparent 80%)`,
        filter: `blur(${50 * intensity}px)`,
        animation: `${uid}_orb3 ${dur * 1.8}s ease-in-out infinite`
      }} />

      {/* Frosted glass panels */}
      {[
        { top: '10%', left: '5%', w: '40%', h: '38%', rotate: '-3deg' },
        { top: '50%', right: '6%', w: '35%', h: '32%', rotate: '4deg' },
        { top: '20%', right: '15%', w: '25%', h: '22%', rotate: '8deg' },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: p.top, left: p.left, right: p.right,
            width: p.w, height: p.h,
            backdropFilter: `blur(${20 + i * 8}px)`,
            WebkitBackdropFilter: `blur(${20 + i * 8}px)`,
            background: `rgba(255,255,255,${0.04 + i * 0.02})`,
            border: `1px solid rgba(255,255,255,${0.08 + i * 0.03})`,
            borderRadius: '16px',
            transform: `rotate(${p.rotate})`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)`,
            animation: `${uid}_panel ${dur * 0.6 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`
          }}
        />
      ))}

      {/* Light sweep across the panels */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '30%', height: '150%',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)`,
          animation: `${uid}_sweep ${dur * 1.2}s ease-in-out infinite`,
          animationDelay: `${dur * 0.3}s`
        }} />
      </div>

      {/* Vignette edge softening */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${bg}99 100%)`,
        pointerEvents: 'none'
      }} />
    </div>
  );
}
