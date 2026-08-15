/**
 * Text Color utility
 * Respects ML predictions while falling back to contrast calculations
 * to ensure text is always readable over animated backgrounds.
 */

// Helper to calculate luminance
function getLuminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const h = (hex || "#000000").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}

// Calculate contrast ratio (1 to 21)
function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Determine if a background is dark
export function isDarkBackground(hex) {
  const rgb = hexToRgb(hex);
  // Using simple perceived brightness for speed
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) < 128;
}

/**
 * Returns a readable text color.
 * Priority: ML prediction (if readable) -> theme configuration -> contrast fallback
 */
export function getReadableTextColor({ predictedColor, backgroundColor, theme }) {
  // Safe defaults
  const bg = backgroundColor ? `#${backgroundColor.replace("#", "")}` : "#FFFFFF";
  const fallbackLight = "#FFFFFF";
  const fallbackDark = "#1A1A1A";

  const isBgDark = isDarkBackground(bg);
  const contrastFallback = isBgDark ? fallbackLight : fallbackDark;

  // 1. If we have an ML predicted color, try to use it
  if (predictedColor) {
    const predHex = `#${predictedColor.replace("#", "")}`;
    const contrast = getContrastRatio(predHex, bg);
    // WCAG AA requirement for large text is 3.0:1, normal text is 4.5:1
    // We'll use 3.5 as an acceptable threshold for titles
    if (contrast >= 3.5) {
      return predHex;
    }
  }

  // 2. If no prediction (or unreadable prediction), try the theme's preferred text
  if (theme && theme.text) {
    const themePreferred = theme.text.primary;
    if (themePreferred) {
      const preferredHex = `#${themePreferred.replace("#", "")}`;
      const contrast = getContrastRatio(preferredHex, bg);
      if (contrast >= 3.5) {
        return preferredHex;
      }
    }
  }

  // 3. Last resort: high contrast fallback
  return contrastFallback;
}
