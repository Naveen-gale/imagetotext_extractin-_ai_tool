import React, { useRef, useMemo } from 'react';

export default function Starfield({ theme, config }) {
  const speed = config.speed || 1;
  const intensity = config.intensity || 1;
  const bg = `#${theme.bg}`;
  const color = theme.accent.startsWith('#') ? theme.accent : `#${theme.accent}`;
  const highlight = theme.highlight ? (theme.highlight.startsWith('#') ? theme.highlight : `#${theme.highlight}`) : color;
  const uid = useRef(`sf_${Math.random().toString(36).slice(2)}`).current;

  // Generate stars with fixed random positions (useMemo for stability across re-renders)
  const stars = useMemo(() => {
    const layers = [
      { count: 80, size: 1, opacityBase: 0.6 },
      { count: 50, size: 2, opacityBase: 0.8 },
      { count: 20, size: 3, opacityBase: 1.0 },
    ];
    return layers.map(layer =>
      Array.from({ length: layer.count }).map((_, i) => ({
        x: ((i * 137.5) % 100).toFixed(2), // golden angle distribution, no random() = stable
        y: ((i * 97.3) % 100).toFixed(2),
        opacity: (layer.opacityBase * (0.4 + ((i * 73) % 60) / 100)).toFixed(2),
        size: layer.size,
        twinkleDur: (2 + ((i * 31) % 30) / 10).toFixed(1),
        twinkleDelay: ((i * 17) % 30 / 10).toFixed(1),
        col: i % 3 === 0 ? highlight : color
      }))
    );
  }, [color, highlight]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${uid}_twinkle {
          0%,100% { opacity: var(--star-op); transform: scale(1); }
          50%      { opacity: calc(var(--star-op) * 0.2); transform: scale(0.6); }
        }
        @keyframes ${uid}_rise {
          0%   { transform: translateY(0vh); }
          100% { transform: translateY(-100vh); }
        }
        @keyframes ${uid}_shoot {
          0%   { transform: translateX(-10vw) translateY(-5vh) rotate(15deg); opacity: 0; width: 0; }
          5%   { opacity: 1; width: 80px; }
          40%  { opacity: 0.8; width: 120px; }
          60%  { opacity: 0; width: 0; }
          100% { transform: translateX(110vw) translateY(50vh) rotate(15deg); opacity: 0; }
        }
        @keyframes ${uid}_shoot2 {
          0%   { transform: translateX(-5vw) translateY(-10vh) rotate(20deg); opacity: 0; width: 0; }
          8%   { opacity: 0.7; width: 60px; }
          35%  { opacity: 0; width: 0; }
          100% { transform: translateX(105vw) translateY(60vh) rotate(20deg); opacity: 0; }
        }
      `}</style>

      {/* Star layers — each as a single div using box-shadow trick for performance */}
      {stars.map((layer, li) => {
        const shadows = layer.map(s => `${s.x}vw ${s.y}vh 0 ${s.size * 0.5}px ${s.col}`).join(', ');
        const riseSpeed = (40 / speed / (li + 1)).toFixed(1);
        return (
          <div
            key={li}
            style={{
              position: 'absolute',
              width: `${stars[li][0]?.size || 1}px`,
              height: `${stars[li][0]?.size || 1}px`,
              borderRadius: '50%',
              boxShadow: shadows,
              opacity: 0.7 + li * 0.1,
              animation: `${uid}_rise ${riseSpeed}s linear infinite`,
              animationDelay: `${li * -5}s`
            }}
          />
        );
      })}

      {/* Individual twinkling stars for sparkle effect */}
      {stars[2].slice(0, 12).map((s, i) => (
        <div
          key={`tw_${i}`}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            borderRadius: '50%',
            backgroundColor: s.col,
            boxShadow: `0 0 ${6 + i % 6}px 2px ${s.col}`,
            '--star-op': s.opacity,
            opacity: s.opacity,
            animation: `${uid}_twinkle ${s.twinkleDur}s ease-in-out infinite`,
            animationDelay: `${s.twinkleDelay}s`
          }}
        />
      ))}

      {/* Shooting star 1 */}
      <div style={{
        position: 'absolute',
        top: '20%', left: 0,
        height: '2px',
        borderRadius: '100px',
        background: `linear-gradient(90deg, transparent, ${highlight}, white)`,
        boxShadow: `0 0 6px 2px ${highlight}`,
        animation: `${uid}_shoot ${12 / speed}s ease-in-out infinite`,
        animationDelay: `${2 / speed}s`
      }} />

      {/* Shooting star 2 */}
      <div style={{
        position: 'absolute',
        top: '55%', left: 0,
        height: '1.5px',
        borderRadius: '100px',
        background: `linear-gradient(90deg, transparent, ${color}, white)`,
        animation: `${uid}_shoot2 ${9 / speed}s ease-in-out infinite`,
        animationDelay: `${6 / speed}s`
      }} />

      {/* Nebula glow at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '35%',
        background: `linear-gradient(to top, ${color}22, transparent)`,
        pointerEvents: 'none'
      }} />
    </div>
  );
}
