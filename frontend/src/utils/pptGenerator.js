import pptxgen from "pptxgenjs";
import { compileSlideToElements } from "./templateCompiler";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPLATES = {
  // ── Original 16 ──────────────────────────────────────────────────────────────
  corporate: {
    name: "Corporate Blue", emoji: "🏢",
    bg: "f8fafc", accent: "3b82f6", title: "0f172a", body: "334155", sub: "64748b", highlight: "2563eb",
    renderer: "css",
    animation: { type: "gradient-flow", speed: 0.5, intensity: 1 },
    text: { preferred: "dark", primary: "0f172a", secondary: "334155" }
  },
  modern: {
    name: "Modern Minimal", emoji: "✨",
    bg: "ffffff", accent: "10b981", title: "18181b", body: "3f3f46", sub: "71717a", highlight: "059669",
    renderer: "css",
    animation: { type: "floating-blobs", speed: 0.3, intensity: 1 },
    text: { preferred: "dark", primary: "18181b", secondary: "3f3f46" }
  },
  dark: {
    name: "Dark Tech", emoji: "🌙",
    bg: "0f172a", accent: "8b5cf6", title: "f8fafc", body: "cbd5e1", sub: "94a3b8", highlight: "a78bfa",
    renderer: "css",
    animation: { type: "starfield", speed: 1.0, intensity: 2 },
    text: { preferred: "light", primary: "f8fafc", secondary: "cbd5e1" }
  },
  creative: {
    name: "Creative Studio", emoji: "🎨",
    bg: "fff1f2", accent: "f43f5e", title: "4c0519", body: "881337", sub: "9f1239", highlight: "e11d48",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.6, intensity: 2 },
    text: { preferred: "dark", primary: "4c0519", secondary: "881337" }
  },
  elegant: {
    name: "Elegant Serif", emoji: "🖋️",
    bg: "fdfbf7", accent: "b45309", title: "451a03", body: "78350f", sub: "92400e", highlight: "d97706",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.2, intensity: 1 },
    text: { preferred: "dark", primary: "451a03", secondary: "78350f" }
  },
  nature: {
    name: "Organic Green", emoji: "🌿",
    bg: "f0fdf4", accent: "22c55e", title: "064e3b", body: "0f766e", sub: "115e59", highlight: "16a34a",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.2, intensity: 1 },
    text: { preferred: "dark", primary: "064e3b", secondary: "0f766e" }
  },
  cyber: {
    name: "Cyberpunk", emoji: "🤖",
    bg: "000000", accent: "06b6d4", title: "f0fdfa", body: "a5f3fc", sub: "67e8f9", highlight: "22d3ee",
    renderer: "css", animation: { type: "cyber-grid", speed: 1.0, intensity: 3 },
    text: { preferred: "light", primary: "f0fdfa", secondary: "a5f3fc" }
  },
  sunset: {
    name: "Warm Sunset", emoji: "🌅",
    bg: "fff7ed", accent: "ea580c", title: "7c2d12", body: "9a3412", sub: "c2410c", highlight: "f97316",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.4, intensity: 2 },
    text: { preferred: "dark", primary: "7c2d12", secondary: "9a3412" }
  },
  ocean: {
    name: "Deep Ocean", emoji: "🌊",
    bg: "ecfeff", accent: "0891b2", title: "164e63", body: "155e75", sub: "0e7490", highlight: "06b6d4",
    renderer: "css", animation: { type: "glassmorphism", speed: 0.5, intensity: 2 },
    text: { preferred: "dark", primary: "164e63", secondary: "155e75" }
  },
  startup: {
    name: "Startup Pink", emoji: "🚀",
    bg: "fdf2f8", accent: "ec4899", title: "831843", body: "be185d", sub: "f472b6", highlight: "db2777",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.8, intensity: 2 },
    text: { preferred: "dark", primary: "831843", secondary: "be185d" }
  },
  academic: {
    name: "Scholar Paper", emoji: "📜",
    bg: "f5f5f4", accent: "57534e", title: "1c1917", body: "44403c", sub: "78716c", highlight: "292524",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.1, intensity: 1 },
    text: { preferred: "dark", primary: "1c1917", secondary: "44403c" }
  },
  future: {
    name: "Abstract Glass", emoji: "💎",
    bg: "172554", accent: "6366f1", title: "ffffff", body: "bfdbfe", sub: "818cf8", highlight: "a5b4fc",
    renderer: "css", animation: { type: "glassmorphism", speed: 0.8, intensity: 2 },
    text: { preferred: "light", primary: "ffffff", secondary: "bfdbfe" }
  },
  bold: {
    name: "High Impact", emoji: "💥",
    bg: "000000", accent: "ef4444", title: "ffffff", body: "d1d5db", sub: "f87171", highlight: "fca5a5",
    renderer: "css", animation: { type: "gradient-flow", speed: 2.0, intensity: 3 },
    text: { preferred: "light", primary: "ffffff", secondary: "d1d5db" }
  },
  premium_dark: {
    name: "Luxury Obsidian", emoji: "🖤",
    bg: "0a0a0a", accent: "fbbf24", title: "ffffff", body: "d4d4d8", sub: "9ca3af", highlight: "fcd34d",
    renderer: "three", animation: { type: "particle-network", speed: 0.3, intensity: 1.5, particleCount: 60 },
    text: { preferred: "light", primary: "ffffff", secondary: "d4d4d8" }
  },
  neon_glow: {
    name: "Neon Nights", emoji: "🟣",
    bg: "0f0c29", accent: "00f2fe", title: "ffffff", body: "e0e7ff", sub: "a5b4fc", highlight: "4facfe",
    renderer: "css", animation: { type: "gradient-flow", speed: 1.5, intensity: 3 },
    text: { preferred: "light", primary: "ffffff", secondary: "e0e7ff" }
  },
  glassmorphism: {
    name: "Glassmorphism Blur", emoji: "🧊",
    bg: "cbd5e1", accent: "3b82f6", title: "1e293b", body: "334155", sub: "475569", highlight: "2563eb",
    renderer: "css", animation: { type: "glassmorphism", speed: 0.6, intensity: 3 },
    text: { preferred: "dark", primary: "1e293b", secondary: "334155" }
  },
  earthy: {
    name: "Earthy Neutrals", emoji: "🍂",
    bg: "fafaf9", accent: "a8a29e", title: "44403c", body: "57534e", sub: "78716c", highlight: "a8a29e",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.2, intensity: 1 },
    text: { preferred: "dark", primary: "44403c", secondary: "57534e" }
  },
  // ── New 15 ───────────────────────────────────────────────────────────────
  pure_white: {
    name: "Clean White", emoji: "🤍",
    bg: "ffffff", accent: "1a1a1a", title: "111111", body: "333333", sub: "888888", highlight: "000000",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.1, intensity: 1 },
    text: { preferred: "dark", primary: "111111", secondary: "333333" }
  },
  pure_black: {
    name: "Pure Black", emoji: "🖤",
    bg: "000000", accent: "eeeeee", title: "ffffff", body: "cccccc", sub: "888888", highlight: "ffffff",
    renderer: "three", animation: { type: "particle-network", speed: 0.2, intensity: 1, particleCount: 50 },
    text: { preferred: "light", primary: "ffffff", secondary: "cccccc" }
  },
  dark_mode: {
    name: "Dark Mode", emoji: "🌙",
    bg: "1a1a2e", accent: "e94560", title: "eaeaea", body: "a8a8b8", sub: "6c6c7a", highlight: "e94560",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.6, intensity: 2 },
    text: { preferred: "light", primary: "eaeaea", secondary: "a8a8b8" }
  },
  blue_corporate: {
    name: "Blue Corporate", emoji: "🏢",
    bg: "f0f4ff", accent: "1d4ed8", title: "1e3a5f", body: "374151", sub: "6b7280", highlight: "1d4ed8",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.3, intensity: 1 },
    text: { preferred: "dark", primary: "1e3a5f", secondary: "374151" }
  },
  green_fresh: {
    name: "Green Fresh", emoji: "🌱",
    bg: "f0fdf4", accent: "16a34a", title: "14532d", body: "374151", sub: "6b7280", highlight: "15803d",
    renderer: "css", animation: { type: "glassmorphism", speed: 0.4, intensity: 1 },
    text: { preferred: "dark", primary: "14532d", secondary: "374151" }
  },
  purple_dream: {
    name: "Purple Dream", emoji: "💜",
    bg: "1e1033", accent: "a855f7", title: "f3e8ff", body: "d8b4fe", sub: "9333ea", highlight: "c084fc",
    renderer: "three", animation: { type: "particle-network", speed: 0.8, intensity: 2, particleCount: 70 },
    text: { preferred: "light", primary: "f3e8ff", secondary: "d8b4fe" }
  },
  modern_gradient_theme: {
    name: "Modern Gradient", emoji: "🌊",
    bg: "0f0c29", accent: "fc00ff", title: "ffffff", body: "e0e0ff", sub: "cc00cc", highlight: "00dbde",
    renderer: "css", animation: { type: "gradient-flow", speed: 1.0, intensity: 2 },
    text: { preferred: "light", primary: "ffffff", secondary: "e0e0ff" }
  },
  minimal_clean: {
    name: "Minimal Clean", emoji: "✨",
    bg: "fafafa", accent: "374151", title: "111827", body: "4b5563", sub: "9ca3af", highlight: "1f2937",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.1, intensity: 1 },
    text: { preferred: "dark", primary: "111827", secondary: "4b5563" }
  },
  creative_burst: {
    name: "Creative Burst", emoji: "🎨",
    bg: "1a0a2e", accent: "ff6b6b", title: "ffffff", body: "ffd93d", sub: "ff9f43", highlight: "ff6b6b",
    renderer: "css", animation: { type: "gradient-flow", speed: 1.2, intensity: 2 },
    text: { preferred: "light", primary: "ffffff", secondary: "ffd93d" }
  },
  business_pro: {
    name: "Business Pro", emoji: "📊",
    bg: "1f2937", accent: "6366f1", title: "f9fafb", body: "d1d5db", sub: "6b7280", highlight: "818cf8",
    renderer: "three", animation: { type: "particle-network", speed: 0.5, intensity: 1, particleCount: 60 },
    text: { preferred: "light", primary: "f9fafb", secondary: "d1d5db" }
  },
  tech_dark: {
    name: "Tech Dark", emoji: "💻",
    bg: "0d1117", accent: "00ff41", title: "ffffff", body: "8b949e", sub: "3c4043", highlight: "00ff41",
    renderer: "css", animation: { type: "cyber-grid", speed: 1.5, intensity: 3 },
    text: { preferred: "light", primary: "ffffff", secondary: "8b949e" }
  },
  education_blue: {
    name: "Education Blue", emoji: "📚",
    bg: "eff6ff", accent: "2563eb", title: "1e3a5f", body: "374151", sub: "6b7280", highlight: "1d4ed8",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.3, intensity: 1 },
    text: { preferred: "dark", primary: "1e3a5f", secondary: "374151" }
  },
  startup_purple: {
    name: "Startup Purple", emoji: "🚀",
    bg: "13111c", accent: "8b5cf6", title: "ffffff", body: "c4b5fd", sub: "7c3aed", highlight: "a78bfa",
    renderer: "css", animation: { type: "glassmorphism", speed: 0.6, intensity: 2 },
    text: { preferred: "light", primary: "ffffff", secondary: "c4b5fd" }
  },
  medical_clean: {
    name: "Medical Clean", emoji: "⚕️",
    bg: "f8fafc", accent: "0891b2", title: "0c4a6e", body: "374151", sub: "64748b", highlight: "0e7490",
    renderer: "css", animation: { type: "floating-blobs", speed: 0.2, intensity: 1 },
    text: { preferred: "dark", primary: "0c4a6e", secondary: "374151" }
  },
  finance_gold: {
    name: "Finance Gold", emoji: "💰",
    bg: "0f0e0a", accent: "d4af37", title: "f5f0e0", body: "b8a06a", sub: "7a6a3a", highlight: "f0c040",
    renderer: "css", animation: { type: "gradient-flow", speed: 0.3, intensity: 2 },
    text: { preferred: "light", primary: "f5f0e0", secondary: "b8a06a" }
  },
};

// ─── Template Layout Hash ─────────────────────────────────────────────────────
function getLayoutForTemplate(key) {
  const layouts = ["sidebar", "headerFooter", "split", "modern", "minimal", "diagonal"];
  let hash = 0;
  const str = String(key);
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return layouts[Math.abs(hash) % layouts.length];
}


// ─── Font Styles ──────────────────────────────────────────────────────────────
export const FONT_STYLES = {
  modern:    { heading: "Calibri",          body: "Calibri" },
  classic:   { heading: "Times New Roman",  body: "Georgia" },
  tech:      { heading: "Courier New",      body: "Courier New" },
  elegant:   { heading: "Garamond",         body: "Garamond" },
  bold:      { heading: "Arial Black",      body: "Arial" },
  premium:   { heading: "Montserrat",       body: "Open Sans" },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Determines if a hex color is "dark" (so we can pick a contrasting text color).
 */
function isDark(hex) {
  const h = (hex || "000000").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // Perceived luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

/**
 * Converts a color string to a clean uppercase hex without '#'.
 * Falls back to `fallback` if the color is falsy.
 */
function col(colorString, fallback = "000000") {
  if (!colorString) return fallback.replace("#", "").toUpperCase();
  return colorString.replace("#", "").toUpperCase();
}

/**
 * Ensures a template always has all required fields with safe fallbacks.
 * This prevents any key being undefined, which would produce black (#000000) text.
 */
function resolveTemplate(tmpl) {
  const bg = tmpl.bg || "ffffff";
  const darkBg = isDark(bg);
  // For dark backgrounds, default text should be white; for light, dark.
  const safeText = darkBg ? "ffffff" : "1a1a1a";
  const safeSub  = darkBg ? "cccccc" : "555555";
  return {
    bg,
    accent:    tmpl.accent    || (darkBg ? "6366f1" : "3b82f6"),
    title:     tmpl.title     || safeText,
    body:      tmpl.body      || safeText,
    sub:       tmpl.sub       || safeSub,
    highlight: tmpl.highlight || tmpl.title || safeText,
  };
}

export function validateSlides(slides) {
  const warnings = [];
  slides.forEach((slide, idx) => {
    if (!slide.title) warnings.push(`Slide ${idx + 1} is missing a title.`);
    if (slide.title && slide.title.length > 90) warnings.push(`Slide ${idx + 1} title is very long.`);
    if (slide.bullets && slide.bullets.length > 8) warnings.push(`Slide ${idx + 1} has too many bullets (${slide.bullets.length}).`);
    if (slide.type === "stats" && (!slide.stats || slide.stats.length === 0)) warnings.push(`Slide ${idx + 1} (Stats) is missing data.`);
    if (slide.type === "timeline" && (!slide.timelineItems || slide.timelineItems.length === 0)) warnings.push(`Slide ${idx + 1} (Timeline) is missing events.`);
    if (slide.image && !slide.image.startsWith("http")) warnings.push(`Slide ${idx + 1} image URL is invalid.`);
  });
  return warnings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export async function generatePptx(slides, templateKey = "corporate", fontStyleKey = "modern") {
  const rawTmpl = typeof templateKey === "object"
    ? templateKey
    : (TEMPLATES[templateKey] || TEMPLATES.corporate);
  // Always resolve to guarantee no undefined color values
  const tmpl  = resolveTemplate(rawTmpl);
  const fonts = FONT_STYLES[fontStyleKey] || FONT_STYLES.modern;

  const prs = new pptxgen();
  prs.layout  = "LAYOUT_WIDE"; // 13.33" × 7.5"
  prs.author  = "AI Presentation Studio";
  prs.company = "VisionText AI";
  prs.subject = slides[0]?.title || "Presentation";
  prs.title   = slides[0]?.title || "Presentation";

  // Generate Master Slide dynamically
  const layoutStyle = getLayoutForTemplate(typeof templateKey === "string" ? templateKey : "default");
  const masterObjects = [];
  
  if (layoutStyle === "sidebar") {
    masterObjects.push({ rect: { x: 0, y: 0, w: 0.5, h: "100%", fill: { color: col(tmpl.accent) } } });
    masterObjects.push({ rect: { x: 0.6, y: 0, w: 0.05, h: "100%", fill: { color: col(tmpl.accent) }, transparency: 50 } });
  } else if (layoutStyle === "headerFooter") {
    masterObjects.push({ rect: { x: 0, y: 0, w: "100%", h: 0.3, fill: { color: col(tmpl.accent) } } });
    masterObjects.push({ rect: { x: 0, y: 7.2, w: "100%", h: 0.3, fill: { color: col(tmpl.accent) } } });
  } else if (layoutStyle === "split") {
    masterObjects.push({ rect: { x: 0, y: 0, w: "100%", h: "40%", fill: { color: col(tmpl.accent) }, transparency: 90 } });
    masterObjects.push({ rect: { x: 0, y: "40%", w: "100%", h: 0.1, fill: { color: col(tmpl.accent) } } });
  } else if (layoutStyle === "modern") {
    masterObjects.push({ ellipse: { x: -1, y: -2, w: 4, h: 4, fill: { color: col(tmpl.accent) }, transparency: 85 } });
    masterObjects.push({ ellipse: { x: 11, y: 5.5, w: 5, h: 5, fill: { color: col(tmpl.accent) }, transparency: 85 } });
  } else if (layoutStyle === "diagonal") {
    masterObjects.push({ polygon: { x: 10, y: 0, w: 3.33, h: 3, points: [{x:0,y:0}, {x:1,y:0}, {x:1,y:1}], fill: { color: col(tmpl.accent) }, transparency: 70 } });
    masterObjects.push({ polygon: { x: 0, y: 4.5, w: 3, h: 3, points: [{x:0,y:1}, {x:0,y:0}, {x:1,y:1}], fill: { color: col(tmpl.accent) }, transparency: 70 } });
  } else {
    // minimal
    masterObjects.push({ rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: col(tmpl.accent) } } });
  }

  prs.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: col(tmpl.bg) },
    objects: masterObjects,
    slideNumber: { x: 12.8, y: 7.1, w: 0.5, h: 0.3, fontSize: 10, color: col(tmpl.sub), align: "right" }
  });

  const transitions = ["fade", "zoom", "push", "pull", "cover", "uncover", "wipe"];
  const animations = ["fade", "zoom", "fly", "spin"];

  slides.forEach((slide, idx) => {
    const sl = prs.addSlide({ masterName: "MASTER_SLIDE" });
    const slideNum = idx + 1;

    // Apply Transition
    const transType = transitions[idx % transitions.length];
    sl.transition = { type: transType, speed: "med" };

    // Background override per slide if provided, otherwise uses Master
    if (slide.bgColor) {
      sl.background = { color: col(slide.bgColor) };
    }

    // Get absolute elements (compile them if the user didn't edit this slide)
    const elements = slide.elements && slide.elements.length > 0 
        ? slide.elements 
        : compileSlideToElements(slide, tmpl);

    // Determine a safe fallback text color based on the slide background
    const slideBg = slides[idx]?.bgColor || tmpl.bg;
    const safeFallbackText = isDark(slideBg) ? "FFFFFF" : "1A1A1A";

    elements.forEach(el => {
      // Convert percentages (0-100) to inches (13.33 x 7.5)
      const x = (el.x / 100) * 13.33;
      const y = (el.y / 100) * 7.5;
      const w = (el.w / 100) * 13.33;
      const h = (el.h / 100) * 7.5;
      // Use the safe fallback so text is never invisible against the slide background
      const color = el.type === "text"
        ? col(el.color, safeFallbackText)
        : col(el.color, tmpl.accent);
      const opacity = el.opacity !== undefined ? (1 - el.opacity) * 100 : 0; // pptxgenjs uses transparency 0-100%

      const animType = animations[(idx + elements.indexOf(el)) % animations.length];
      const animateOpt = { type: animType, duration: 1.2, delay: elements.indexOf(el) * 0.1 };

      if (el.type === "shape") {
        sl.addShape(el.shape === "circle" ? prs.ShapeType.ellipse : prs.ShapeType.rect, {
          x, y, w, h,
          fill: { color, transparency: opacity },
          line: { width: 0 },
          animate: animateOpt
        });
      } else if (el.type === "image") {
        sl.addImage({
          path: el.src,
          x, y, w, h,
          sizing: { type: "crop" }, // Simulates objectFit: "cover"
          animate: animateOpt
        });
      } else {
        // Text
        sl.addText(el.text, {
          x, y, w, h,
          fontSize: el.fontSize * 0.75, // Scale down slightly to match HTML rendering sizes
          color,
          bold: !!el.bold,
          italic: !!el.italic,
          fontFace: el.bold ? fonts.heading : fonts.body,
          align: el.align || "left",
          valign: "top",
          transparency: opacity,
          margin: 4, // Give a tiny margin so it doesn't touch the edge of the invisible bounding box
          animate: animateOpt
        });
      }
    });

    if (slide.speaker_notes || slide.speakerNotes) {
      sl.addNotes(slide.speaker_notes || slide.speakerNotes);
    }
  });

  return await prs.write("blob");
}
