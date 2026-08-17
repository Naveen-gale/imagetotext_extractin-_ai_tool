import React from 'react';

export default function CyberGrid({ theme, config }) {
  const speed = config.speed || 1;
  const opacity = (config.intensity || 1) * 0.15;
  const color = theme.accent.startsWith('#') ? theme.accent : `#${theme.accent}`;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1000px', backgroundColor: `#${theme.bg}` }}>
      <div 
        className="absolute w-[200%] h-[200%] bottom-[-50%] left-[-50%]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${color}44 1px, transparent 1px),
            linear-gradient(to top, ${color}44 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'rotateX(75deg)',
          transformOrigin: 'bottom center',
          animation: `gridMove ${5 / speed}s linear infinite`,
          opacity: opacity
        }}
      />
      <div 
        className="absolute inset-0 z-10 opacity-80" 
        style={{ backgroundImage: `linear-gradient(to top, transparent, #${theme.bg})` }} 
      />
      <style>{`
        @keyframes gridMove {
          0% { transform: rotateX(75deg) translateY(0); }
          100% { transform: rotateX(75deg) translateY(40px); }
        }
      `}</style>
    </div>
  );
}
