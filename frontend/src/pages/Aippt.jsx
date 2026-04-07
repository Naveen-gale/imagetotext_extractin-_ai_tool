import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { generatePptData, uploadPptFile } from "../utils/api";
import { generatePptx, TEMPLATES, FONT_STYLES } from "../utils/pptGenerator";
import EditableText from "../components/EditableText";

// ─── Constants ───────────────────────────────────────────────────────────────
const SLIDE_COUNTS = [4, 6, 8, 10, 12, 15];

// ─── Slide Preview component ─────────────────────────────────────────────────
function SlidePreview({ slide, template, index, isActive, onClick }) {
  const tmpl = TEMPLATES[template] || TEMPLATES.corporate;

  const renderContent = () => {
    if (slide.type === "title") {
      return (
        <div className="sp-title-layout">
          <div className="sp-title-text">{slide.title}</div>
          {slide.subtitle && <div className="sp-subtitle">{slide.subtitle}</div>}
        </div>
      );
    }
    if (slide.type === "quote") {
      return (
        <div className="sp-quote-layout">
          <div className="sp-quote-mark">"</div>
          <div className="sp-quote-body">{slide.quote || slide.title}</div>
          {slide.author && <div className="sp-quote-author">— {slide.author}</div>}
        </div>
      );
    }
    if (slide.type === "stats") {
      return (
        <div className="sp-content-layout">
          <div className="sp-slide-title">{slide.title}</div>
          <div className="sp-stats-grid">
            {(slide.stats || []).slice(0, 4).map((s, i) => (
              <div key={i} className="sp-stat-box" style={{ borderColor: `#${tmpl.accent}55` }}>
                <div className="sp-stat-value" style={{ color: `#${tmpl.accent}` }}>{s.value}</div>
                <div className="sp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (slide.type === "two-column") {
      return (
        <div className="sp-content-layout">
          <div className="sp-slide-title">{slide.title}</div>
          <div className="sp-two-col">
            <div className="sp-col">
              <div className="sp-col-heading" style={{ color: `#${tmpl.accent}` }}>{slide.leftColumn?.heading}</div>
              {(slide.leftColumn?.bullets || []).slice(0, 3).map((b, i) => (
                <div key={i} className="sp-bullet">• {b}</div>
              ))}
            </div>
            <div className="sp-col-divider" style={{ background: `#${tmpl.accent}44` }} />
            <div className="sp-col">
              <div className="sp-col-heading" style={{ color: `#${tmpl.accent}` }}>{slide.rightColumn?.heading}</div>
              {(slide.rightColumn?.bullets || []).slice(0, 3).map((b, i) => (
                <div key={i} className="sp-bullet">• {b}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (slide.type === "timeline") {
      return (
        <div className="sp-content-layout">
          <div className="sp-slide-title">{slide.title}</div>
          <div className="sp-timeline">
            {(slide.timelineItems || []).slice(0, 5).map((t, i) => (
              <div key={i} className="sp-timeline-item">
                <div className="sp-timeline-dot" style={{ background: `#${tmpl.accent}` }} />
                <div>
                  <span className="sp-timeline-year" style={{ color: `#${tmpl.accent}` }}>{t.year}</span>
                  <span className="sp-timeline-evt"> {t.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Default: content with bullets
    return (
      <div className="sp-content-layout">
        <div className="sp-slide-title" style={{ color: `#${tmpl.highlight}` }}>{slide.title}</div>
        <ul className="sp-bullets">
          {(slide.bullets || []).slice(0, 5).map((b, i) => (
            <li key={i} className="sp-bullet-item">{b}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      className={`sp-wrapper ${isActive ? "sp-active" : ""}`}
      style={{
        background: `#${tmpl.bg}`,
        borderColor: isActive ? `#${tmpl.accent}` : "transparent",
      }}
      onClick={onClick}
      role="button"
      aria-label={`Slide ${index + 1}: ${slide.title}`}
    >
      <div className="sp-top-bar" style={{ background: `#${tmpl.accent}` }} />
      {renderContent()}
      <div className="sp-index">#{index + 1}</div>
    </div>
  );
}

// ─── Full-screen preview modal ────────────────────────────────────────────────
function FullPreviewModal({ slides, currentIndex, onUpdateSlide, onClose, onPrev, onNext, template, fontStyle }) {
  const tmpl = TEMPLATES[template] || TEMPLATES.corporate;
  const slide = slides[currentIndex];
  if (!slide) return null;

  const updateField = (field, newText) => {
    onUpdateSlide(currentIndex, { ...slide, [field]: newText });
  };
  const updateCustomSize = (field, size) => {
    onUpdateSlide(currentIndex, { 
      ...slide, 
      customStyles: { ...slide.customStyles, [field]: { ...slide.customStyles?.[field], fontSize: size } }
    });
  };

  const updateArrayField = (field, arrIndex, newText) => {
    const arr = [...(slide[field] || [])];
    arr[arrIndex] = newText;
    onUpdateSlide(currentIndex, { ...slide, [field]: arr });
  };
  const updateArraySize = (field, arrIndex, size) => {
    const arrStyles = { ...(slide.customStyles?.[field] || {}) };
    arrStyles[arrIndex] = { fontSize: size };
    onUpdateSlide(currentIndex, {
      ...slide,
      customStyles: { ...slide.customStyles, [field]: arrStyles }
    });
  };

  // Helper object field updater (e.g. stats, timeline)
  const updateObjArrayField = (field, arrIndex, attr, newText) => {
    const arr = [...(slide[field] || [])];
    arr[arrIndex] = { ...arr[arrIndex], [attr]: newText };
    onUpdateSlide(currentIndex, { ...slide, [field]: arr });
  };
  // Helper for two-column
  const updateColField = (colName, attr, newText, arrIndex = null) => {
    const col = { ...slide[colName] };
    if (arrIndex !== null) {
      const arr = [...(col[attr] || [])];
      arr[arrIndex] = newText;
      col[attr] = arr;
    } else {
      col[attr] = newText;
    }
    onUpdateSlide(currentIndex, { ...slide, [colName]: col });
  };

  return (
    <div className="fpm-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="fpm-container" onClick={(e) => e.stopPropagation()}>
        <div className="fpm-header">
          <span className="fpm-counter">{currentIndex + 1} / {slides.length}</span>
          <span className="fpm-title">{slide.title}</span>
          <button className="fpm-close" onClick={onClose} aria-label="Close preview">✕</button>
        </div>

        <div
          className="fpm-slide"
          style={{ background: `#${tmpl.bg}`, fontFamily: FONT_STYLES[fontStyle]?.body || "Calibri, sans-serif" }}
        >
          <div className="fpm-accent-top" style={{ background: `#${tmpl.accent}` }} />

          {slide.type === "title" ? (
            <div className="fpm-title-slide">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={60} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                className="fpm-big-title" style={{ color: `#${tmpl.title}`, lineHeight: 1.2, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }} 
              />
              <EditableText 
                value={slide.subtitle || ""} onChange={(v) => updateField("subtitle", v)}
                baseSize={30} fontSize={slide.customStyles?.subtitle?.fontSize} onSizeChange={(s) => updateCustomSize("subtitle", s)}
                className="fpm-big-sub" style={{ color: `#${tmpl.sub}` }} 
              />
            </div>
          ) : slide.type === "quote" ? (
            <div className="fpm-quote-slide">
              <div className="fpm-quote-icon" style={{ color: `#${tmpl.accent}` }}>"</div>
              <EditableText 
                value={slide.quote || slide.title || ""} onChange={(v) => updateField("quote", v)}
                baseSize={40} fontSize={slide.customStyles?.quote?.fontSize} onSizeChange={(s) => updateCustomSize("quote", s)}
                className="fpm-quote-text" style={{ color: `#${tmpl.title}` }} 
              />
              <EditableText 
                value={slide.author || ""} onChange={(v) => updateField("author", v)}
                baseSize={30} fontSize={slide.customStyles?.author?.fontSize} onSizeChange={(s) => updateCustomSize("author", s)}
                className="fpm-quote-author" style={{ color: `#${tmpl.sub}` }} placeholder="Author name"
              />
            </div>
          ) : slide.type === "stats" ? (
            <div className="fpm-content">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={60} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" style={{ color: `#${tmpl.highlight}` }} 
              />
              <div className="fpm-stats-grid">
                {(slide.stats || []).map((s, i) => (
                  <div key={i} className="fpm-stat" style={{ borderColor: `#${tmpl.accent}66` }}>
                     <EditableText 
                        value={s.value} onChange={(v) => updateObjArrayField("stats", i, "value", v)}
                        baseSize={50} fontSize={slide.customStyles?.stats_val?.[i]?.fontSize} onSizeChange={(sz) => updateArraySize("stats_val", i, sz)}
                        className="fpm-stat-val" style={{ color: `#${tmpl.accent}` }} 
                     />
                     <EditableText 
                        value={s.label} onChange={(v) => updateObjArrayField("stats", i, "label", v)}
                        baseSize={24} fontSize={slide.customStyles?.stats_lbl?.[i]?.fontSize} onSizeChange={(sz) => updateArraySize("stats_lbl", i, sz)}
                        className="fpm-stat-lbl" style={{ color: `#${tmpl.body}` }} 
                     />
                  </div>
                ))}
              </div>
            </div>
          ) : slide.type === "two-column" ? (
            <div className="fpm-content">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={60} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" style={{ color: `#${tmpl.highlight}` }} 
              />
              <div className="fpm-two-col">
                <div className="fpm-col">
                  <EditableText 
                    className="fpm-col-h" style={{ color: `#${tmpl.accent}` }} 
                    value={slide.leftColumn?.heading} onChange={(v) => updateColField("leftColumn", "heading", v)}
                    baseSize={30} fontSize={slide.customStyles?.leftHead?.fontSize} onSizeChange={(s) => updateCustomSize("leftHead", s)}
                  />
                  {(slide.leftColumn?.bullets || []).map((b, i) => (
                     <EditableText 
                       key={i} className="fpm-bullet" style={{ color: `#${tmpl.body}` }} isBullet
                       value={b} onChange={(v) => updateColField("leftColumn", "bullets", v, i)}
                       baseSize={24} fontSize={slide.customStyles?.leftBullets?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("leftBullets", i, s)}
                     />
                  ))}
                </div>
                <div className="fpm-col-divider" style={{ background: `#${tmpl.accent}33` }} />
                <div className="fpm-col">
                  <EditableText 
                    className="fpm-col-h" style={{ color: `#${tmpl.accent}` }} 
                    value={slide.rightColumn?.heading} onChange={(v) => updateColField("rightColumn", "heading", v)}
                    baseSize={30} fontSize={slide.customStyles?.rightHead?.fontSize} onSizeChange={(s) => updateCustomSize("rightHead", s)}
                  />
                  {(slide.rightColumn?.bullets || []).map((b, i) => (
                    <EditableText 
                      key={i} className="fpm-bullet" style={{ color: `#${tmpl.body}` }} isBullet
                      value={b} onChange={(v) => updateColField("rightColumn", "bullets", v, i)}
                      baseSize={24} fontSize={slide.customStyles?.rightBullets?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("rightBullets", i, s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : slide.type === "timeline" ? (
            <div className="fpm-content">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={60} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" style={{ color: `#${tmpl.highlight}` }} 
              />
              <div className="fpm-timeline">
                {(slide.timelineItems || []).map((t, i) => (
                  <div key={i} className="fpm-tl-item" style={{display: 'flex', alignItems: 'center'}}>
                    <div className="fpm-tl-dot" style={{ background: `#${tmpl.accent}` }} />
                    <EditableText 
                       className="fpm-tl-yr" style={{ margin: 0, width: "100px", color: `#${tmpl.accent}` }}
                       value={t.year} onChange={(v) => updateObjArrayField("timelineItems", i, "year", v)}
                       baseSize={24} fontSize={slide.customStyles?.tl_year?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("tl_year", i, s)}
                    />
                    <EditableText 
                       className="fpm-tl-evt" style={{ margin: 0, flex: 1, color: `#${tmpl.body}` }}
                       value={t.event} onChange={(v) => updateObjArrayField("timelineItems", i, "event", v)}
                       baseSize={18} fontSize={slide.customStyles?.tl_evt?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("tl_evt", i, s)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="fpm-content">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={60} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" style={{ color: `#${tmpl.highlight}` }} 
              />
              <ul className="fpm-blist" style={{ margin: 0, paddingLeft: "10px" }}>
                {(slide.bullets || []).map((b, i) => (
                  <EditableText 
                     key={i} value={b} onChange={(v) => updateArrayField("bullets", i, v)}
                     baseSize={30} fontSize={slide.customStyles?.bullets?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("bullets", i, s)}
                     component="li" style={{ color: `#${tmpl.body}` }} isBullet
                  />
                ))}
              </ul>
            </div>
          )}

          <div className="fpm-accent-bottom" style={{ background: `#${tmpl.accent}` }} />
        </div>

        <div className="fpm-nav">
          <button className="fpm-nav-btn" onClick={onPrev} disabled={currentIndex === 0}>← Prev</button>
          <div className="fpm-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`fpm-dot ${i === currentIndex ? "fpm-dot-active" : ""}`}
                style={{ background: i === currentIndex ? `#${tmpl.accent}` : undefined }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button className="fpm-nav-btn" onClick={onNext} disabled={currentIndex === slides.length - 1}>Next →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Aippt() {
  // Step states: "input" → "generating" → "preview"
  const [step, setStep] = useState("input");

  // Form state
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [template, setTemplate] = useState("corporate");
  const [fontStyle, setFontStyle] = useState("modern");
  const [slideCount, setSlideCount] = useState(8);

  // Result state
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Action states
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const pptBlobRef = useRef(null);

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }, []);

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Generate PPT ────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) { setError("Please enter a topic or description."); return; }
    setError("");
    setStep("generating");
    pptBlobRef.current = null;
    setShareUrl(null);

    try {
      const slideData = await generatePptData({ prompt, image, slideCount });
      if (!slideData?.length) throw new Error("AI returned empty slides. Please try again.");
      setSlides(slideData);
      setActiveSlide(0);
      setStep("preview");
    } catch (err) {
      setError(err.message);
      setStep("input");
    }
  };

  // ── Download PPT ────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      let blob = pptBlobRef.current;
      if (!blob) {
        blob = await generatePptx(slides, template, fontStyle);
        pptBlobRef.current = blob;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.slice(0, 40).replace(/[^a-z0-9]/gi, "_")}_presentation.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // ── Share PPT online ────────────────────────────────────────────────────────
  const handleShare = async () => {
    setSharing(true);
    setError("");
    try {
      let blob = pptBlobRef.current;
      if (!blob) {
        blob = await generatePptx(slides, template, fontStyle);
        pptBlobRef.current = blob;
      }
      const url = await uploadPptFile(blob, `${prompt.slice(0, 30).replace(/\s+/g, "_")}.pptx`);
      setShareUrl(url);
    } catch (err) {
      setError("Share failed: " + err.message);
    } finally {
      setSharing(false);
    }
  };

  const handleReset = () => {
    removeImage();
    setPrompt("");
    setSlides([]);
    setActiveSlide(0);
    pptBlobRef.current = null;
    setShareUrl(null);
    setError("");
    setStep("input");
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="aippt-page">
      {/* Back navigation */}
      <div className="aippt-topbar">
        <Link to="/" className="aippt-back-btn">← Back to VisionText</Link>
        <div className="aippt-badge">📊 AI Presentation Studio</div>
      </div>

      {/* ── STEP 1: Input Form ── */}
      {step === "input" && (
        <div className="aippt-input-wrap">
          <div className="aippt-hero">
            <h1 className="aippt-hero-title">
              Create <span className="aippt-hero-accent">Stunning Presentations</span><br />with AI
            </h1>
            <p className="aippt-hero-sub">
              Describe your topic, upload a reference image, choose your style — and let AI do the rest.
            </p>
          </div>

          <div className="aippt-form-card">
            {/* Prompt */}
            <div className="aippt-field">
              <label className="aippt-label" htmlFor="ppt-prompt">
                📝 Presentation Topic / Description
              </label>
              <textarea
                id="ppt-prompt"
                className="aippt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'The Future of Renewable Energy — cover solar, wind, and battery storage trends for 2025'"
                rows={4}
                maxLength={1000}
              />
              <span className="aippt-char-count">{prompt.length}/1000</span>
            </div>

            {/* Image Upload */}
            <div className="aippt-field">
              <label className="aippt-label">🖼️ Reference Image (Optional)</label>
              {imagePreview ? (
                <div className="aippt-img-preview">
                  <img src={imagePreview} alt="Reference" className="aippt-img-thumb" />
                  <div className="aippt-img-info">
                    <span>{image?.name}</span>
                    <button className="aippt-img-remove" onClick={removeImage}>✕ Remove</button>
                  </div>
                </div>
              ) : (
                <div
                  className="aippt-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Click or drag to upload a reference image"
                >
                  <div className="aippt-drop-icon">📤</div>
                  <div className="aippt-drop-text">Drag & drop an image here, or click to browse</div>
                  <div className="aippt-drop-hint">JPG, PNG, WebP · Max 20MB</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleImageDrop}
              />
            </div>

            {/* Settings Row */}
            <div className="aippt-settings-row">
              {/* Template Selection */}
              <div className="aippt-field aippt-field-inline">
                <label className="aippt-label">🎨 Template</label>
                <div className="aippt-template-grid">
                  {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                    <button
                      key={key}
                      className={`aippt-tmpl-btn ${template === key ? "aippt-tmpl-active" : ""}`}
                      style={{
                        background: template === key ? `#${tmpl.accent}22` : undefined,
                        borderColor: template === key ? `#${tmpl.accent}` : undefined,
                        color: template === key ? `#${tmpl.accent}` : undefined,
                      }}
                      onClick={() => { setTemplate(key); pptBlobRef.current = null; }}
                      aria-pressed={template === key}
                    >
                      <span>{tmpl.emoji}</span>
                      <span>{tmpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style + Slide Count */}
              <div className="aippt-controls-row">
                <div className="aippt-field">
                  <label className="aippt-label" htmlFor="font-style">✍️ Text Style</label>
                  <select
                    id="font-style"
                    className="aippt-select"
                    value={fontStyle}
                    onChange={(e) => { setFontStyle(e.target.value); pptBlobRef.current = null; }}
                  >
                    {Object.entries(FONT_STYLES).map(([key]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aippt-field">
                  <label className="aippt-label" htmlFor="slide-count">📑 Number of Slides</label>
                  <select
                    id="slide-count"
                    className="aippt-select"
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                  >
                    {SLIDE_COUNTS.map((n) => (
                      <option key={n} value={n}>{n} slides</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && <div className="aippt-error">⚠️ {error}</div>}

            <button
              className="aippt-generate-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              id="generate-ppt-btn"
            >
              ✨ Generate Presentation with AI
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Generating Loader ── */}
      {step === "generating" && (
        <div className="aippt-loading-screen">
          <div className="aippt-loading-orb">
            <div className="aippt-orb-ring" />
            <div className="aippt-orb-ring aippt-orb-ring-2" />
            <div className="aippt-orb-core">✨</div>
          </div>
          <h2 className="aippt-loading-title">AI is crafting your presentation…</h2>
          <p className="aippt-loading-sub">Generating {slideCount} slides based on your prompt{image ? " and image" : ""}.</p>
          <div className="aippt-loading-steps">
            <div className="aippt-step aippt-step-done">✅ Analyzing prompt</div>
            {image && <div className="aippt-step aippt-step-done">✅ Processing image</div>}
            <div className="aippt-step aippt-step-active">⚡ Building slide structure…</div>
            <div className="aippt-step">⏳ Applying design</div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Preview & Export ── */}
      {step === "preview" && slides.length > 0 && (
        <div className="aippt-preview-page">
          {/* Header */}
          <div className="aippt-preview-header">
            <div>
              <h2 className="aippt-preview-title">🎉 Your Presentation is Ready!</h2>
              <p className="aippt-preview-sub">{slides.length} slides generated · {TEMPLATES[template]?.name} theme · {fontStyle} font</p>
            </div>
            <div className="aippt-preview-header-actions">
              <button className="aippt-action-btn aippt-btn-secondary" onClick={handleReset} id="reset-ppt-btn">
                🔄 Start Over
              </button>
              <button className="aippt-action-btn aippt-btn-preview" onClick={() => setShowFullPreview(true)} id="fullpreview-btn">
                👁️ Full Preview
              </button>
            </div>
          </div>

          {/* Slide Strip */}
          <div className="aippt-slide-strip">
            {slides.map((slide, i) => (
              <SlidePreview
                key={i}
                slide={slide}
                template={template}
                index={i}
                isActive={activeSlide === i}
                onClick={() => { setActiveSlide(i); setShowFullPreview(true); }}
              />
            ))}
          </div>

          {/* Selected slide detail */}
          <div className="aippt-selected-info">
            <span className="aippt-selected-label">Currently viewing:</span>
            <span className="aippt-selected-title">{slides[activeSlide]?.title}</span>
            <span className="aippt-selected-type">[{slides[activeSlide]?.type}]</span>
          </div>

          {/* Export Actions */}
          <div className="aippt-export-card">
            <div className="aippt-export-headline">📥 Export Your Presentation</div>

            {error && <div className="aippt-error">⚠️ {error}</div>}

            <div className="aippt-export-actions">
              <button
                className="aippt-action-btn aippt-btn-download"
                onClick={handleDownload}
                disabled={downloading}
                id="download-ppt-btn"
              >
                {downloading ? <><span className="aippt-spinner" /> Generating file…</> : "⬇️ Download .pptx"}
              </button>

              <button
                className="aippt-action-btn aippt-btn-share"
                onClick={handleShare}
                disabled={sharing || !!shareUrl}
                id="share-ppt-btn"
              >
                {sharing ? <><span className="aippt-spinner" /> Uploading…</> : shareUrl ? "✅ Link Ready!" : "🔗 Get Online Shareable Link"}
              </button>
            </div>

            {shareUrl && (
              <div className="aippt-share-box">
                <div className="aippt-share-label">🌐 Your presentation is live at:</div>
                <div className="aippt-share-url-row">
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="aippt-share-link">
                    {shareUrl}
                  </a>
                  <button
                    className="aippt-copy-btn"
                    onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}

            <div className="aippt-export-note">
              💡 Open the downloaded file in PowerPoint, Google Slides, or Keynote.
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showFullPreview && slides.length > 0 && (
        <FullPreviewModal
          slides={slides}
          currentIndex={activeSlide}
          template={template}
          fontStyle={fontStyle}
          onUpdateSlide={(idx, updatedSlide) => {
            const newArray = [...slides];
            newArray[idx] = updatedSlide;
            setSlides(newArray);
            pptBlobRef.current = null; // Re-generate PPT on next download
          }}
          onClose={() => setShowFullPreview(false)}
          onPrev={() => setActiveSlide((p) => Math.max(0, p - 1))}
          onNext={() => setActiveSlide((p) => Math.min(slides.length - 1, p + 1))}
        />
      )}
    </div>
  );
}
