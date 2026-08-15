import React from 'react';

export default function Starfield({ theme, config }) {
  const speed = config.speed || 1;
  const opacity = (config.intensity || 1) * 0.3;
  const color = theme.accent.startsWith('#') ? theme.accent : `#${theme.accent}`;

  // Generate a random starfield pattern for the background
  const stars = Array.from({ length: 50 }).map(() => {
    return `${Math.random() * 100}vw ${Math.random() * 100}vh ${color}`;
  }).join(', ');

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ backgroundColor: `#${theme.bg}` }}>
      <div 
        className="absolute w-2 h-2 rounded-full"
        style={{
          boxShadow: stars,
          animation: `starsMove ${20 / speed}s linear infinite`,
          opacity: opacity
        }}
      />
      <div 
        className="absolute w-1 h-1 rounded-full"
        style={{
          boxShadow: stars,
          animation: `starsMove ${10 / speed}s linear infinite`,
          opacity: opacity * 0.7
        }}
      />
      <style>{`
        @keyframes starsMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100vh); }
        }
      `}</style>
    </div>
  );
}
