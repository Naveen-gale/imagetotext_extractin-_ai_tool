import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ config, theme, isPreview }) {
  const points = useRef();
  
  // Scale down particles for the preview cards to maintain performance
  const particleCount = isPreview ? 30 : (config.particleCount || 100);
  const speed = config.speed || 1;
  const intensity = config.intensity || 1;

  // Generate random positions
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const color = new THREE.Color(`#${theme.accent}`);
    const highlight = new THREE.Color(`#${theme.highlight || theme.accent}`);

    for (let i = 0; i < particleCount; i++) {
      // Spread particles across the screen
      pos[i * 3] = (Math.random() - 0.5) * 20;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

      // Mix colors
      const mixedColor = color.clone().lerp(highlight, Math.random());
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }
    return [pos, col];
  }, [particleCount, theme.accent, theme.highlight]);

  useFrame((state) => {
    if (!points.current) return;
    // Slow rotation
    points.current.rotation.x = state.clock.elapsedTime * 0.05 * speed;
    points.current.rotation.y = state.clock.elapsedTime * 0.03 * speed;
    
    // Slight breathing effect on scale
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05 * intensity;
    points.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1 * intensity}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleNetwork({ config, theme, isPreview }) {
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: `#${theme.bg}` }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <fog attach="fog" args={[`#${theme.bg}`, 2, 10]} />
        <Particles config={config} theme={theme} isPreview={isPreview} />
      </Canvas>
      {/* Overlay to ensure text readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, #${theme.bg} 100%)`,
          opacity: 0.6
        }}
      />
    </div>
  );
}
