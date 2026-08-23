/**
 * PptSwiper.jsx — Production-ready Swiper.js wrapper for PPT slide transitions
 *
 * Architecture:
 * - Bidirectional sync: React state → Swiper (programmatic slideTo) and
 *   Swiper → React state (onSlideChange callback), with a loop-guard ref
 * - Virtual slides: only active slide ±1 neighbor is rendered in the DOM
 * - GPU-accelerated transitions via transform/opacity only (no layout props)
 * - Touch, swipe, keyboard all work; external keyboard handled by parent
 * - Robust cleanup on unmount and reinit on slide count changes
 */

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, EffectCreative, EffectFade, A11y } from "swiper/modules";

// ── CSS Imports (Swiper 14 correct export paths) ──────────────────────────────
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/effect-fade";

// ── Transition Presets ────────────────────────────────────────────────────────
// All use transform + opacity ONLY — GPU-accelerated, zero layout reflow
const PRESETS = {
  /**
   * "slide" — clean, fast horizontal slide.
   * Feels like Google Slides / PowerPoint default.
   */
  slide: {
    effect: "slide",
    speed: 460,
  },

  /**
   * "creative" — slide with subtle depth-scale and fade.
   * Outgoing: exits left, shrinks slightly, fades.
   * Incoming: enters from right, grows into view, fades in.
   * This is the primary preset — cinematic and smooth.
   */
  creative: {
    effect: "creative",
    speed: 500,
    creativeEffect: {
      prev: {
        translate: ["-110%", 0, -180],
        opacity: 0,
      },
      next: {
        translate: ["110%", 0, -180],
        opacity: 0,
      },
    },
  },

  /**
   * "fade" — soft cross-dissolve.
   * Best for image-heavy or dark slides.
   */
  fade: {
    effect: "fade",
    speed: 400,
    fadeEffect: { crossFade: true },
  },
};

// ── PptSwiper ─────────────────────────────────────────────────────────────────
/**
 * @param {object}   props
 * @param {Array}    props.slides         Array of slide data objects
 * @param {number}   props.currentIndex   Controlled active slide index
 * @param {function} props.onSlideChange  Called with new index when user swipes
 * @param {function} props.renderSlide    Render prop: (slide, index, total) → ReactNode
 * @param {"slide"|"creative"|"fade"} [props.preset="creative"]
 * @param {boolean}  [props.allowTouch=true]
 * @param {string}   [props.className]
 * @param {object}   [props.style]
 */
const PptSwiper = forwardRef(function PptSwiper(
  {
    slides,
    currentIndex,
    onSlideChange,
    renderSlide,
    preset = "creative",
    allowTouch = true,
    className = "",
    style = {},
  },
  ref
) {
  const swiperRef = useRef(null);
  /** Prevent Swiper onSlideChange → setState → useEffect → slideTo feedback loop */
  const programmaticRef = useRef(false);
  /** Track the last index we sent to Swiper so we don't repeat no-ops */
  const lastSentIndexRef = useRef(currentIndex);

  // ── Imperative API (optional parent usage) ───────────────────────────────
  useImperativeHandle(
    ref,
    () => ({
      slideTo: (index, speed = 480) => {
        const sw = swiperRef.current;
        if (!sw || sw.destroyed) return;
        sw.slideTo(index, speed);
      },
      slideNext: () => {
        const sw = swiperRef.current;
        if (!sw || sw.destroyed) return;
        sw.slideNext();
      },
      slidePrev: () => {
        const sw = swiperRef.current;
        if (!sw || sw.destroyed) return;
        sw.slidePrev();
      },
      get activeIndex() {
        return swiperRef.current?.activeIndex ?? 0;
      },
    }),
    []
  );

  // ── Sync: external currentIndex prop → Swiper ────────────────────────────
  useEffect(() => {
    const sw = swiperRef.current;
    if (!sw || sw.destroyed) return;

    // Only act if the index genuinely changed and differs from Swiper's current
    if (
      currentIndex !== lastSentIndexRef.current &&
      sw.activeIndex !== currentIndex
    ) {
      programmaticRef.current = true;
      lastSentIndexRef.current = currentIndex;
      sw.slideTo(currentIndex, 500);

      // Clear the guard after the animation completes + small buffer
      const t = setTimeout(() => {
        programmaticRef.current = false;
      }, 650);
      return () => clearTimeout(t);
    }
    // If Swiper is already there, just update the ref
    lastSentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // ── Sync: slides array length changed (regen / delete / insert) ──────────
  useEffect(() => {
    const sw = swiperRef.current;
    if (!sw || sw.destroyed) return;

    // Tell virtual module about the new slide list
    if (sw.virtual) {
      sw.virtual.slides = slides;
      sw.virtual.update(true);
    }

    // Clamp active index if slides were deleted
    const safeIndex = Math.min(currentIndex, Math.max(0, slides.length - 1));
    if (sw.activeIndex !== safeIndex) {
      programmaticRef.current = true;
      sw.slideTo(safeIndex, 0); // instant, no animation on structural changes
      setTimeout(() => {
        programmaticRef.current = false;
      }, 100);
    }
  }, [slides.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swiper event: user swiped/touched → notify parent ────────────────────
  const handleSlideChange = useCallback(
    (sw) => {
      if (programmaticRef.current) return; // ignore our own programmatic moves
      const newIndex = sw.activeIndex;
      lastSentIndexRef.current = newIndex;
      onSlideChange?.(newIndex);
    },
    [onSlideChange]
  );

  // ── Capture Swiper instance on init ──────────────────────────────────────
  const handleSwiper = useCallback((sw) => {
    swiperRef.current = sw;
  }, []);

  // ── Cleanup: destroy Swiper on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      const sw = swiperRef.current;
      if (sw && !sw.destroyed) {
        sw.destroy(true, true);
      }
      swiperRef.current = null;
    };
  }, []);

  // ── Guard: nothing to render ──────────────────────────────────────────────
  if (!slides || slides.length === 0) return null;

  const safeIndex = Math.min(
    Math.max(0, currentIndex),
    slides.length - 1
  );

  const { effect, speed, creativeEffect, fadeEffect } =
    PRESETS[preset] ?? PRESETS.creative;

  return (
    <Swiper
      modules={[Virtual, EffectCreative, EffectFade, A11y]}
      // ── Core ─────────────────────────────────────────────────────────────
      initialSlide={safeIndex}
      speed={speed}
      effect={effect}
      // ── Effect params (spread only if defined) ────────────────────────────
      {...(creativeEffect ? { creativeEffect } : {})}
      {...(fadeEffect ? { fadeEffect } : {})}
      // ── Touch / Swipe ─────────────────────────────────────────────────────
      allowTouchMove={allowTouch}
      touchRatio={1}
      threshold={10}               // minimum px to register a swipe intent
      touchStartPreventDefault={false} // don't hijack outer page scroll
      resistance={true}
      resistanceRatio={0.75}       // rubber-band at slide edges
      longSwipesRatio={0.25}       // easier to commit a swipe
      shortSwipes={true}
      // ── Keyboard: parent handles all keyboard, disable Swiper's own ────────
      keyboard={{ enabled: false }}
      // ── Accessibility ──────────────────────────────────────────────────────
      a11y={{
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        enabled: true,
      }}
      // ── Virtual slides: DOM only contains active ±1 ────────────────────────
      virtual={{
        slides,
        addSlidesAfter: 1,
        addSlidesBefore: 1,
        renderExternal: false,
      }}
      // ── Layout / resize awareness ─────────────────────────────────────────
      observer={true}
      observeParents={true}
      observeSlideChildren={false} // avoid expensive child mutation watching
      // ── Events ────────────────────────────────────────────────────────────
      onSwiper={handleSwiper}
      onSlideChange={handleSlideChange}
      // ── Container styles ──────────────────────────────────────────────────
      className={`ppt-swiper-container${className ? ` ${className}` : ""}`}
      style={{
        width: "100%",
        height: "100%",
        // CSS containment: tell browser this subtree is isolated
        contain: "layout style paint",
        overflow: "hidden",
        ...style,
      }}
    >
      {slides.map((slide, index) => (
        <SwiperSlide
          key={index}
          virtualIndex={index}
          style={{
            // Promote each slide to its own GPU compositing layer
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // Prevent overflow from slide content
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          {renderSlide(slide, index, slides.length)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

export default memo(PptSwiper);
