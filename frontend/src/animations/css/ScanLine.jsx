import React from 'react';
import { motion } from 'framer-motion';

export default function ScanLine({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: `#${theme.bg}` }}>
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #${theme.accent} 1px, transparent 1px),
            linear-gradient(to bottom, #${theme.accent} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Scanline */}
      <motion.div
        className="absolute w-full h-1"
        style={{ 
          backgroundColor: `#${theme.highlight || theme.accent}`,
          boxShadow: `0 0 15px 3px #${theme.highlight || theme.accent}`
        }}
        animate={{
          top: ["-5%", "105%"]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 4 / speed
        }}
      />
      
      {/* Overlay CRT effect */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)"
        }}
      />
    </div>
  );
}
