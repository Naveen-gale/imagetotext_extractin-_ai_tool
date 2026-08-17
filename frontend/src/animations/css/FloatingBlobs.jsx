import React, { useRef } from 'react';

export default function FloatingBlobs({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  const dur = 28 / (speed * Math.max(0.1, intensity));
  const a = `#${theme.accent}`;
  const h = `#${theme.highlight || theme.accent}`;
  const bg = `#${theme.bg}`;
  const uid = useRef(`fb_${Math.random().toString(36).slice(2)}`).current;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${uid}_blob1 {
          0%   { transform: translate(0%, 0%) scale(1); border-radius: 60% 40% 70% 30% / 50% 60% 40% 60%; }
          25%  { transform: translate(15%, -10%) scale(1.1); border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
          50%  { transform: translate(5%, 15%) scale(0.95); border-radius: 70% 30% 60% 40% / 40% 70% 30% 60%; }
          75%  { transform: translate(-10%, 8%) scale(1.05); border-radius: 30% 70% 40% 60% / 70% 30% 70% 30%; }
          100% { transform: translate(0%, 0%) scale(1); border-radius: 60% 40% 70% 30% / 50% 60% 40% 60%; }
        }
        @keyframes ${uid}_blob2 {
          0%   { transform: translate(0%, 0%) scale(1.1); border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%; }
          33%  { transform: translate(-12%, 15%) scale(0.9); border-radius: 70% 30% 40% 60% / 30% 70% 50% 50%; }
          66%  { transform: translate(10%, -8%) scale(1.2); border-radius: 30% 70% 60% 40% / 50% 50% 40% 60%; }
          100% { transform: translate(0%, 0%) scale(1.1); border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%; }
        }
        @keyframes ${uid}_blob3 {
          0%   { transform: translate(0%, 0%) scale(0.9); border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%; }
          40%  { transform: translate(20%, 10%) scale(1.15); border-radius: 60% 40% 70% 30% / 60% 40% 30% 70%; }
          80%  { transform: translate(-5%, -15%) scale(0.85); border-radius: 30% 70% 50% 50% / 70% 30% 60% 40%; }
          100% { transform: translate(0%, 0%) scale(0.9); border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%; }
        }
        @keyframes ${uid}_blob4 {
          0%   { transform: translate(0%, 0%) scale(1); border-radius: 45% 55% 60% 40% / 55% 45% 55% 45%; }
          50%  { transform: translate(-15%, -12%) scale(1.1); border-radius: 55% 45% 40% 60% / 45% 55% 45% 55%; }
          100% { transform: translate(0%, 0%) scale(1); border-radius: 45% 55% 60% 40% / 55% 45% 55% 45%; }
        }
        @keyframes ${uid}_grain {
          0%,100% { transform: translate(0,0); }
          10%      { transform: translate(-2%,-3%); }
          30%      { transform: translate(3%,2%); }
          50%      { transform: translate(-1%,4%); }
          70%      { transform: translate(4%,-1%); }
          90%      { transform: translate(-3%,3%); }
        }
      `}</style>

      {/* Blob 1 — top-left */}
      <div
        style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          top: '-15%',
          left: '-15%',
          background: `radial-gradient(circle at 40% 40%, ${a}ee, ${a}44 70%, transparent)`,
          filter: `blur(${55 * intensity}px)`,
          animation: `${uid}_blob1 ${dur}s ease-in-out infinite`,
          willChange: 'transform'
        }}
      />

      {/* Blob 2 — bottom-right */}
      <div
        style={{
          position: 'absolute',
          width: '65%',
          height: '65%',
          bottom: '-15%',
          right: '-15%',
          background: `radial-gradient(circle at 60% 60%, ${h}dd, ${h}33 70%, transparent)`,
          filter: `blur(${50 * intensity}px)`,
          animation: `${uid}_blob2 ${dur * 1.3}s ease-in-out infinite`,
          willChange: 'transform'
        }}
      />

      {/* Blob 3 — center */}
      <div
        style={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          top: '25%',
          left: '25%',
          background: `radial-gradient(circle at 50% 50%, ${a}99, ${h}44 60%, transparent)`,
          filter: `blur(${40 * intensity}px)`,
          animation: `${uid}_blob3 ${dur * 1.7}s ease-in-out infinite`,
          willChange: 'transform'
        }}
      />

      {/* Blob 4 — top-right accent */}
      <div
        style={{
          position: 'absolute',
          width: '45%',
          height: '45%',
          top: '-10%',
          right: '-10%',
          background: `radial-gradient(circle at 50% 50%, ${h}bb, transparent 70%)`,
          filter: `blur(${45 * intensity}px)`,
          animation: `${uid}_blob4 ${dur * 1.1}s ease-in-out infinite`,
          willChange: 'transform'
        }}
      />

      {/* Film-grain SVG texture overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, animation: `${uid}_grain 0.3s steps(1) infinite`, pointerEvents: 'none' }}>
        <filter id={`${uid}_noise`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${uid}_noise)`} />
      </svg>
    </div>
  );
}
