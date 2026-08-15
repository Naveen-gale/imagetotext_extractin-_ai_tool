import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingBlobs({ config, theme }) {
  const intensity = config.intensity || 1;
  const speed = config.speed || 1;
  const duration = 25 / (speed * intensity);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: `#${theme.bg}` }}>
      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-20"
        style={{ backgroundColor: `#${theme.accent}` }}
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-20%", "10%", "-20%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "easeInOut",
          duration: duration
        }}
      />
      
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-10 right-[-10%] bottom-[-20%]"
        style={{ backgroundColor: `#${theme.highlight || theme.accent}` }}
        animate={{
          x: ["20%", "-10%", "20%"],
          y: ["10%", "-30%", "10%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "easeInOut",
          duration: duration * 1.2
        }}
      />
    </div>
  );
}
