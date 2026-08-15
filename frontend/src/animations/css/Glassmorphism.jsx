import React from 'react';
import { motion } from 'framer-motion';

export default function Glassmorphism({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  const duration = 20 / (speed * intensity);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: `#${theme.bg}` }}>
      
      {/* Moving Shape 1 */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full"
        style={{ backgroundColor: `#${theme.accent}`, opacity: 0.8 }}
        animate={{
          x: ["0%", "50%", "0%"],
          y: ["0%", "20%", "0%"],
          scale: [1, 1.2, 1]
        }}
        transition={{
          repeat: Infinity,
          ease: "easeInOut",
          duration: duration
        }}
      />
      
      {/* Moving Shape 2 */}
      <motion.div
        className="absolute w-[35vw] h-[35vw] rounded-full bottom-[10%] right-[10%]"
        style={{ backgroundColor: `#${theme.highlight || 'ffffff'}`, opacity: 0.6 }}
        animate={{
          x: ["0%", "-40%", "0%"],
          y: ["0%", "-30%", "0%"],
          scale: [1, 1.3, 1]
        }}
        transition={{
          repeat: Infinity,
          ease: "easeInOut",
          duration: duration * 1.5
        }}
      />
      
      {/* Glass Overlay (Backdrop Filter) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          backgroundColor: `rgba(255, 255, 255, 0.1)`,
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}
      />
    </div>
  );
}
