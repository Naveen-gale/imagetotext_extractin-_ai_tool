import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SmoothScroll component integrates Lenis with GSAP ScrollTrigger
 * to provide ultra-smooth, premium scrolling behavior.
 */
const SmoothScroll = () => {
  useEffect(() => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for premium feel
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1, // Slightly higher for responsiveness
      smoothTouch: false, // Default browser touch behavior is usually better
      touchMultiplier: 2,
      infinite: false,
    });

    // Synchronize ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Continuous update loop using GSAP ticker for performance
    const update = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Store lenis globally for external access (like anchor links)
    window.lenis = lenis;

    // Fix for anchor links and internal navigation
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.hash && target.origin === window.location.origin) {
        // Only handle internal anchors
        const element = document.querySelector(target.hash);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element, {
            offset: -80, // Account for fixed headers if any
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Cleanup on unmount
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      window.lenis = null;
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
};

export default SmoothScroll;
