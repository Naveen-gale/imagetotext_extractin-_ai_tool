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
    sl.background = { color: tmpl.bg };

    // Branding - ONLY ON FIRST SLIDE
    if (slides.indexOf(slide) === 0) {
      sl.addText("VisionText AI", {
        x: 0.8, y: 7.0, w: 12, h: 0.4,
        fontSize: 12,
        color: tmpl.sub,
        fontFace: fonts.body,
        align: "right",
        italic: true,
      });
    }

    // Add Slide Image if present
    if (slide.image) {
      // Use a standard position for images across most slide types (Right side)
      sl.addImage({
        path: slide.image,
        x: 8.5, y: 1.5, w: 4.3, h: 4.8,
        rounding: true,
      });
    }

    switch (slide.type) {
      case "title":
        renderTitleSlide(sl, prs, slide, tmpl, fonts);
        break;
      case "two-column":
        renderTwoColumnSlide(sl, prs, slide, tmpl, fonts, !!slide.image);
        break;
      case "quote":
        renderQuoteSlide(sl, prs, slide, tmpl, fonts);
        break;
      case "timeline":
        renderTimelineSlide(sl, prs, slide, tmpl, fonts, !!slide.image);
        break;
      case "stats":
        renderStatsSlide(sl, prs, slide, tmpl, fonts, !!slide.image);
        break;
      default:
        renderContentSlide(sl, prs, slide, tmpl, fonts, !!slide.image);
    }
  }

  // Return as Blob for browser download / upload
  const blob = await prs.write({ outputType: "blob" });
  return new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
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
}

function renderContentSlide(sl, _prs, slide, tmpl, fonts, hasImage) {
  const contentWidth = hasImage ? 7.5 : 11.5;

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
        fontSize: hasImage ? 24 : 30,
        color: tmpl.body,
        fontFace: fonts.body,
        paraSpaceBefore: 12,
      },
    }));
    sl.addText(bulletText, {
      x: 0.7, y: 1.8, w: contentWidth, h: 5.2,
      fontFace: fonts.body,
      color: tmpl.body,
    });
  }

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}

function renderTwoColumnSlide(sl, _prs, slide, tmpl, fonts, hasImage) {
  const contentWidth = hasImage ? 7.5 : 12.3;
  const colW = contentWidth / 2 - 0.5;

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
    x: 0.5, y: 1.8, w: colW, h: 0.8,
    fontSize: 26,
    bold: true,
    color: tmpl.accent,
    fontFace: fonts.heading,
  });
  const leftBullets = (left.bullets || []).map((b) => ({
    text: b,
    options: { bullet: { type: "bullet" }, fontSize: 20, color: tmpl.body, fontFace: fonts.body, paraSpaceBefore: 10 },
  }));
  if (leftBullets.length) {
    sl.addText(leftBullets, { x: 0.5, y: 2.6, w: colW, h: 4.4 });
  }

  sl.addText(right.heading || "Right", {
    x: 0.5 + colW + 0.5, y: 1.8, w: colW, h: 0.8,
    fontSize: 26,
    bold: true,
    color: tmpl.accent,
    fontFace: fonts.heading,
  });
  const rightBullets = (right.bullets || []).map((b) => ({
    text: b,
    options: { bullet: { type: "bullet" }, fontSize: 20, color: tmpl.body, fontFace: fonts.body, paraSpaceBefore: 10 },
  }));
  if (rightBullets.length) {
    sl.addText(rightBullets, { x: 0.5 + colW + 0.5, y: 2.6, w: colW, h: 4.4 });
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

function renderTimelineSlide(sl, _prs, slide, tmpl, fonts, hasImage) {
  const contentWidth = hasImage ? 7.5 : 11.7;

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
    x: 0.8, y: lineY, w: contentWidth, h: 0,
    line: { color: tmpl.accent, width: 2 },
  });

  items.slice(0, 6).forEach((item, i) => {
    const totalItems = items.slice(0, 6).length;
    const count = Math.max(totalItems - 1, 1);
    const x = 0.8 + (i * contentWidth) / count;

    // Dot
    sl.addShape("ellipse", {
      x: x - 0.15, y: lineY - 0.15, w: 0.3, h: 0.3,
      fill: { color: tmpl.accent },
      line: { width: 0 },
    });

    // Year label
    sl.addText(item.year || "", {
      x: x - 0.8, y: lineY + 0.3, w: 1.6, h: 0.8,
      fontSize: 20,
      bold: true,
      color: tmpl.accent,
      fontFace: fonts.heading,
      align: "center",
    });

    // Event text — alternate above/below
    const yOff = i % 2 === 0 ? lineY - 1.8 : lineY + 1.2;
    sl.addText(item.event || "", {
      x: x - 1.0, y: yOff, w: 2.0, h: 1.6,
      fontSize: 16,
      color: tmpl.body,
      fontFace: fonts.body,
      align: "center",
      wrap: true,
    });
  });

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}

function renderStatsSlide(sl, _prs, slide, tmpl, fonts, hasImage) {
  sl.addText(slide.title || "Key Statistics", {
    x: 0.5, y: 0.5, w: 12, h: 1.2,
    fontSize: 60,
    bold: true,
    color: tmpl.highlight,
    fontFace: fonts.heading,
  });

  const contentWidth = hasImage ? 7.5 : 12.3;
  const stats = slide.stats || [];
  const perRow = hasImage ? 2 : Math.min(stats.length, 3);
  const colW = contentWidth / Math.max(perRow, 1);

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
      fontSize: 36,
      bold: true,
      color: tmpl.accent,
      fontFace: fonts.heading,
      align: "center",
    });
    sl.addText(stat.label || "", {
      x, y: y + 1.5, w: colW - 0.3, h: 0.8,
      fontSize: 18,
      color: tmpl.body,
      fontFace: fonts.body,
      align: "center",
    });
  });

  if (slide.speakerNotes) sl.addNotes(slide.speakerNotes);
}
