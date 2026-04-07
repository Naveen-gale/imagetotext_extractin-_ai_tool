import pptxgen from "pptxgenjs";

// ─── Template Definitions ────────────────────────────────────────────────────
export const TEMPLATES = {
  corporate: {
    name: "Corporate Blue",
    emoji: "🏢",
    bg: "1a2340",
    accent: "3b82f6",
    title: "FFFFFF",
    body: "cbd5e1",
    sub: "94a3b8",
    highlight: "60a5fa",
  },
  creative: {
    name: "Creative Purple",
    emoji: "🎨",
    bg: "1e1433",
    accent: "a855f7",
    title: "FFFFFF",
    body: "e2d9f3",
    sub: "c084fc",
    highlight: "c084fc",
  },
  minimal: {
    name: "Minimal Dark",
    emoji: "⬛",
    bg: "111827",
    accent: "10b981",
    title: "FFFFFF",
    body: "d1fae5",
    sub: "6ee7b7",
    highlight: "34d399",
  },
  warm: {
    name: "Warm Sunset",
    emoji: "🌅",
    bg: "1c0f0f",
    accent: "f97316",
    title: "FFFFFF",
    body: "fed7aa",
    sub: "fb923c",
    highlight: "f97316",
  },
  ocean: {
    name: "Ocean Breeze",
    emoji: "🌊",
    bg: "0c1a2e",
    accent: "06b6d4",
    title: "FFFFFF",
    body: "cffafe",
    sub: "67e8f9",
    highlight: "22d3ee",
  },
};

// ─── Font Styles ─────────────────────────────────────────────────────────────
export const FONT_STYLES = {
  modern: { heading: "Calibri", body: "Calibri" },
  classic: { heading: "Times New Roman", body: "Georgia" },
  tech: { heading: "Courier New", body: "Courier New" },
  elegant: { heading: "Garamond", body: "Garamond" },
  bold: { heading: "Arial Black", body: "Arial" },
};

// ─── Main generator ───────────────────────────────────────────────────────────
export async function generatePptx(slides, templateKey = "corporate", fontStyleKey = "modern") {
  const tmpl = TEMPLATES[templateKey] || TEMPLATES.corporate;
  const fonts = FONT_STYLES[fontStyleKey] || FONT_STYLES.modern;

  const prs = new pptxgen();
  prs.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
  prs.author = "VisionText AI";
  prs.subject = slides[0]?.title || "Presentation";
  prs.title = slides[0]?.title || "Presentation";

  for (const slide of slides) {
    const sl = prs.addSlide();

    // Background
    sl.background = { color: tmpl.bg };

    // Accent bar at top
    sl.addShape(prs.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.08,
      fill: { color: tmpl.accent },
      line: { width: 0 },
    });

    // Bottom accent line
    sl.addShape(prs.ShapeType.rect, {
      x: 0, y: 7.42, w: "100%", h: 0.08,
      fill: { color: tmpl.accent },
      line: { width: 0 },
    });

    switch (slide.type) {
      case "title":
        renderTitleSlide(sl, prs, slide, tmpl, fonts);
        break;
      case "two-column":
        renderTwoColumnSlide(sl, prs, slide, tmpl, fonts);
        break;
      case "quote":
        renderQuoteSlide(sl, prs, slide, tmpl, fonts);
        break;
      case "timeline":
        renderTimelineSlide(sl, prs, slide, tmpl, fonts);
        break;
      case "stats":
        renderStatsSlide(sl, prs, slide, tmpl, fonts);
        break;
      default:
        renderContentSlide(sl, prs, slide, tmpl, fonts);
    }
  }

  // Return as Blob for browser download / upload
  const blob = await prs.write({ outputType: "blob" });
  return blob;
}

// ─── Slide Renderers ──────────────────────────────────────────────────────────

function renderTitleSlide(sl, prs, slide, tmpl, fonts) {
  // Big decorative circle
  sl.addShape(prs.ShapeType.ellipse, {
    x: 9.5, y: -1, w: 5, h: 5,
    fill: { color: tmpl.accent, transparency: 85 },
    line: { width: 0 },
  });

  sl.addText(slide.title || "Presentation", {
    x: 0.8, y: 2.2, w: 11.5, h: 1.5,
    fontSize: 60,
    bold: true,
    color: tmpl.title,
    fontFace: fonts.heading,
    align: "left",
  });

  if (slide.subtitle) {
    sl.addText(slide.subtitle, {
      x: 0.8, y: 4.1, w: 9, h: 1.2,
      fontSize: 30,
      color: tmpl.sub,
      fontFace: fonts.body,
      align: "left",
    });
  }

  // Decorative accent stripe
  sl.addShape(prs.ShapeType.rect, {
    x: 0.8, y: 3.7, w: 1.5, h: 0.06,
    fill: { color: tmpl.accent },
    line: { width: 0 },
  });

  sl.addText("VisionText AI", {
    x: 0.8, y: 6.9, w: 12, h: 0.4,
    fontSize: 12,
    color: tmpl.sub,
    fontFace: fonts.body,
    align: "left",
    italic: true,
  });
}

function renderContentSlide(sl, _prs, slide, tmpl, fonts) {
  sl.addText(slide.title || "Slide", {
    x: 0.5, y: 0.5, w: 12, h: 1.2,
    fontSize: 60,
    bold: true,
    color: tmpl.highlight,
    fontFace: fonts.heading,
  });

  const bullets = slide.bullets?.length ? slide.bullets : [];
  if (bullets.length) {
    const bulletText = bullets.map((b) => ({
      text: b,
      options: {
        bullet: { type: "bullet" },
        fontSize: 30,
        color: tmpl.body,
        fontFace: fonts.body,
        paraSpaceBefore: 12,
      },
    }));
    sl.addText(bulletText, {
      x: 0.7, y: 1.8, w: 11.5, h: 5.2,
      fontFace: fonts.body,
      color: tmpl.body,
    });
  }

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}

function renderTwoColumnSlide(sl, _prs, slide, tmpl, fonts) {
  sl.addText(slide.title || "Comparison", {
    x: 0.5, y: 0.5, w: 12, h: 1.2,
    fontSize: 60,
    bold: true,
    color: tmpl.highlight,
    fontFace: fonts.heading,
  });

  const left = slide.leftColumn || {};
  const right = slide.rightColumn || {};

  sl.addText(left.heading || "Left", {
    x: 0.5, y: 1.8, w: 5.8, h: 0.8,
    fontSize: 30,
    bold: true,
    color: tmpl.accent,
    fontFace: fonts.heading,
  });
  const leftBullets = (left.bullets || []).map((b) => ({
    text: b,
    options: { bullet: { type: "bullet" }, fontSize: 24, color: tmpl.body, fontFace: fonts.body, paraSpaceBefore: 10 },
  }));
  if (leftBullets.length) {
    sl.addText(leftBullets, { x: 0.5, y: 2.6, w: 5.8, h: 4.4 });
  }

  // Divider line
  sl.addShape("line", {
    x: 6.6, y: 1.8, w: 0, h: 4.8,
    line: { color: tmpl.accent, width: 1, transparency: 50 },
  });

  sl.addText(right.heading || "Right", {
    x: 6.9, y: 1.8, w: 5.8, h: 0.8,
    fontSize: 30,
    bold: true,
    color: tmpl.accent,
    fontFace: fonts.heading,
  });
  const rightBullets = (right.bullets || []).map((b) => ({
    text: b,
    options: { bullet: { type: "bullet" }, fontSize: 24, color: tmpl.body, fontFace: fonts.body, paraSpaceBefore: 10 },
  }));
  if (rightBullets.length) {
    sl.addText(rightBullets, { x: 6.9, y: 2.6, w: 5.8, h: 4.4 });
  }

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}

function renderQuoteSlide(sl, prs, slide, tmpl, fonts) {
  sl.addShape(prs.ShapeType.ellipse, {
    x: 5.2, y: 1.5, w: 2.8, h: 2.8,
    fill: { color: tmpl.accent, transparency: 90 },
    line: { width: 0 },
  });

  sl.addText("\u201c", {
    x: 0.5, y: 1.5, w: 2, h: 2,
    fontSize: 160,
    bold: true,
    color: tmpl.accent,
    fontFace: fonts.heading,
    transparency: 40,
  });

  sl.addText(slide.quote || slide.title || "", {
    x: 1.5, y: 2.2, w: 10, h: 3,
    fontSize: 40,
    italic: true,
    color: tmpl.title,
    fontFace: fonts.body,
    align: "center",
  });

  if (slide.author) {
    sl.addText(`\u2014 ${slide.author}`, {
      x: 1.5, y: 5.8, w: 10, h: 1.0,
      fontSize: 30,
      color: tmpl.sub,
      fontFace: fonts.body,
      align: "center",
    });
  }

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}

function renderTimelineSlide(sl, _prs, slide, tmpl, fonts) {
  sl.addText(slide.title || "Timeline", {
    x: 0.5, y: 0.5, w: 12, h: 1.2,
    fontSize: 60,
    bold: true,
    color: tmpl.highlight,
    fontFace: fonts.heading,
  });

  const items = slide.timelineItems
    || (slide.bullets || []).map((b, i) => ({ year: `Step ${i + 1}`, event: b }));

  const lineY = 3.6;

  // Horizontal spine
  sl.addShape("line", {
    x: 0.8, y: lineY, w: 11.7, h: 0,
    line: { color: tmpl.accent, width: 2 },
  });

  items.slice(0, 6).forEach((item, i) => {
    const count = Math.max(items.slice(0, 6).length - 1, 1);
    const x = 0.8 + (i * 11.7) / count;

    // Dot
    sl.addShape("ellipse", {
      x: x - 0.15, y: lineY - 0.15, w: 0.3, h: 0.3,
      fill: { color: tmpl.accent },
      line: { width: 0 },
    });

    // Year label
    sl.addText(item.year || "", {
      x: x - 1.0, y: lineY + 0.3, w: 2.0, h: 0.8,
      fontSize: 24,
      bold: true,
      color: tmpl.accent,
      fontFace: fonts.heading,
      align: "center",
    });

    // Event text — alternate above/below
    const yOff = i % 2 === 0 ? lineY - 1.8 : lineY + 1.2;
    sl.addText(item.event || "", {
      x: x - 1.2, y: yOff, w: 2.4, h: 1.6,
      fontSize: 18,
      color: tmpl.body,
      fontFace: fonts.body,
      align: "center",
      wrap: true,
    });
  });

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}

function renderStatsSlide(sl, _prs, slide, tmpl, fonts) {
  sl.addText(slide.title || "Key Statistics", {
    x: 0.5, y: 0.5, w: 12, h: 1.2,
    fontSize: 60,
    bold: true,
    color: tmpl.highlight,
    fontFace: fonts.heading,
  });

  const stats = slide.stats || [];
  const perRow = Math.min(stats.length, 3);
  const colW = 12.3 / Math.max(perRow, 1);

  stats.slice(0, 6).forEach((stat, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    const x = 0.5 + col * colW;
    const y = 2.0 + row * 2.8;

    sl.addShape("rect", {
      x, y, w: colW - 0.3, h: 2.4,
      fill: { color: tmpl.accent, transparency: 88 },
      line: { color: tmpl.accent, width: 1, transparency: 40 },
    });

    sl.addText(stat.value || "\u2014", {
      x, y: y + 0.2, w: colW - 0.3, h: 1.2,
      fontSize: 50,
      bold: true,
      color: tmpl.accent,
      fontFace: fonts.heading,
      align: "center",
    });
    sl.addText(stat.label || "", {
      x, y: y + 1.5, w: colW - 0.3, h: 0.8,
      fontSize: 24,
      color: tmpl.body,
      fontFace: fonts.body,
      align: "center",
    });
  });

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}
