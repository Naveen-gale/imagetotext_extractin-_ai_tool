import React, { Suspense, lazy } from 'react';
import { TEMPLATES } from '../utils/pptGenerator';

// Lazy load Three.js components to prevent bloating the main bundle
const ParticleNetwork = lazy(() => import('./three/ParticleNetwork'));

// Static CSS components (cheap to load, can be static imports or lazy)
const GradientFlow = lazy(() => import('./css/GradientFlow'));
const FloatingBlobs = lazy(() => import('./css/FloatingBlobs'));
const ScanLine = lazy(() => import('./css/ScanLine'));
const Glassmorphism = lazy(() => import('./css/Glassmorphism'));
const CyberGrid = lazy(() => import('./css/CyberGrid'));
const Starfield = lazy(() => import('./css/Starfield'));

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

  // Render the requested animation
  const renderBackground = () => {
    if (intensity === 0 || animType === 'none') {
      return <div className="absolute inset-0 z-0" style={{ backgroundColor: `#${theme.bg}` }} />;
    }

    // Default static fallback while loading
    const fallback = <div className="absolute inset-0 z-0" style={{ backgroundColor: `#${theme.bg}` }} />;

    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Solid background base */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: `#${theme.bg}` }} />
        {/* Subtle animation overlay */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen">
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
