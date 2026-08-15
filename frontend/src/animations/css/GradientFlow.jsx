import React from 'react';
import { motion } from 'framer-motion';

export default function GradientFlow({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  
  // Calculate duration based on speed and intensity
  const duration = 20 / (speed * Math.max(0.1, intensity));

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: `#${theme.bg}` }}>
      <motion.div
        className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] opacity-40 blur-3xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration
        }}
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, #${theme.accent} 25%, transparent 50%, #${theme.highlight || theme.accent} 75%, transparent 100%)`,
        }}
      />
    </div>
  );
}
