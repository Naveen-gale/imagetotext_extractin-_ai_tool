import React, { Suspense, lazy, useState, useEffect } from 'react';
import { TEMPLATES } from '../utils/pptGenerator';

// Lazy load Three.js components to prevent bloating the main bundle
const ParticleNetwork = lazy(() => import('./three/ParticleNetwork'));

// Static CSS components (cheap to load, so we use static imports to avoid Vercel chunk errors)
import GradientFlow from './css/GradientFlow';
import FloatingBlobs from './css/FloatingBlobs';
import ScanLine from './css/ScanLine';
import Glassmorphism from './css/Glassmorphism';
import CyberGrid from './css/CyberGrid';
import Starfield from './css/Starfield';

export default function AnimationEngine({ 
  themeKey = 'corporate', 
  customBg = null,
  children,
  isPreview = false // true when hovering in theme selector
}) {
  const baseTheme = TEMPLATES[themeKey] || TEMPLATES.corporate;
  // If a custom slide background color is provided, override the theme's background
  const theme = customBg ? { ...baseTheme, bg: customBg.replace("#", "") } : baseTheme;
  const animConfig = theme.animation || {};
  const renderer = theme.renderer || 'css';
  const animType = animConfig.type || 'none';
  
  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intensity = prefersReducedMotion ? 0 : (animConfig.intensity !== undefined ? animConfig.intensity : 1);

  // Mouse tracking for parallax effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disable parallax for tiny preview cards to save performance
    if (isPreview) return;

    const handleMouseMove = (e) => {
      // Normalize mouse position to range [-1, 1]
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPreview]);

  // Apply a subtle parallax translation to the animation layer
  const parallaxStyle = isPreview ? {} : {
    transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) scale(1.05)`,
    transition: 'transform 0.15s ease-out'
  };

  // Render the requested animation
  const renderBackground = () => {
    if (intensity === 0 || animType === 'none') {
      return <div className="absolute inset-0 z-0" style={{ backgroundColor: `#${theme.bg}` }} />;
    }

    // Default static fallback while loading
    const fallback = <div className="absolute inset-0 z-0" style={{ backgroundColor: `#${theme.bg}` }} />;

    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* The animation components render their own background base with parallax */}
        <div className="absolute inset-0 z-0" style={parallaxStyle}>
          <Suspense fallback={fallback}>
            {animType === 'gradient-flow' && <GradientFlow config={animConfig} theme={theme} />}
            {animType === 'floating-blobs' && <FloatingBlobs config={animConfig} theme={theme} />}
            {animType === 'particle-network' && <ParticleNetwork config={animConfig} theme={theme} isPreview={isPreview} />}
            {animType === 'scan-line' && <ScanLine config={animConfig} theme={theme} />}
            {animType === 'glassmorphism' && <Glassmorphism config={animConfig} theme={theme} />}
            {animType === 'cyber-grid' && <CyberGrid config={animConfig} theme={theme} />}
            {animType === 'starfield' && <Starfield config={animConfig} theme={theme} />}
          </Suspense>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      {renderBackground()}
      
      {/* Background Overlay for contrast if needed */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          backgroundColor: theme.overlayColor || 'transparent',
          opacity: theme.overlayOpacity || 0
        }}
      />
      
      {/* Slide Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
