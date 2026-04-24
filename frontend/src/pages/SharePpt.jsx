import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPptHistoryById } from "../utils/api";
import { generatePptx, TEMPLATES, FONT_STYLES } from "../utils/pptGenerator";

export default function SharePpt() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPpt = async () => {
      try {
        const item = await getPptHistoryById(id);
        setData(item);
      } catch (err) {
        setError("Could not load presentation. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };
    fetchPpt();
  }, [id]);

  const handleDownload = async () => {
    if (!data) return;
    let defaultPrefix = (data.prompt || "Presentation").slice(0, 15).replace(/[^a-z0-9]/gi, "_");
    const requestedName = window.prompt("Enter a filename for your presentation:", defaultPrefix);
    if (requestedName === null) return;
    const finalName = requestedName.trim() || defaultPrefix;
    setDownloading(true);
    try {
      const blob = await generatePptx(data.slides, data.template, data.fontStyle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${finalName}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white", background: "#020617" }}>
        <h2>Loading presentation...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", background: "#020617" }}>
        <h2>{error}</h2>
        <Link to="/" style={{ marginTop: "20px", color: "#3b82f6" }}>Return home</Link>
      </div>
    );
  }

  const tmpl = TEMPLATES[data.template] || TEMPLATES.corporate;
  const slide = data.slides[currentIndex];

  /* ─── Slide renderer ──────────────────────────────────────────────────────── */
  const renderSlide = () => {
    const bg = `#${tmpl.bg}`;
    const accent = `#${tmpl.accent}`;
    const titleColor = `#${tmpl.title}`;
    const bodyColor = `#${tmpl.body}`;
    const highlightColor = `#${tmpl.highlight}`;
    const subColor = `#${tmpl.sub}`;

    // Shared title + divider block
    const SlideTitle = ({ text, style = {} }) => (
      <div style={{ flexShrink: 0 }}>
        <div style={{
          fontSize: "clamp(18px, 3.5vw, 30px)",
          fontWeight: 900,
          color: highlightColor,
          lineHeight: 1.2,
          marginBottom: "6px",
          wordBreak: "break-word",
          ...style,
        }}>
          {text}
        </div>
        <div style={{ height: "2px", background: accent, opacity: 0.5, borderRadius: "2px", marginBottom: "10px" }} />
      </div>
    );

    // Bullet list
    const BulletList = ({ bullets = [], fontSize = "clamp(11px, 1.6vw, 16px)", color = bodyColor }) => (
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
        {(bullets || []).slice(0, 6).map((b, i) => (
          <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ color: accent, fontWeight: 900, fontSize, flexShrink: 0, marginTop: "1px" }}>•</span>
            <span style={{ color, fontSize, lineHeight: 1.4, fontWeight: 500 }}>{b}</span>
          </li>
        ))}
      </ul>
    );

    // Top accent bar
    const AccentBar = () => (
      <>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: accent, zIndex: 10 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: accent, zIndex: 10 }} />
      </>
    );

    // Slide number
    const SlideNum = () => (
      <div style={{
        position: "absolute", bottom: "10px", right: "14px",
        fontSize: "10px", color: subColor, opacity: 0.5, fontWeight: 700,
        zIndex: 5,
      }}>
        {currentIndex + 1} / {data.slides.length}
      </div>
    );

    switch (slide.type) {

      /* ── TITLE ── */
      case "title":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden" }}>
            <AccentBar />
            {/* Decorative circle */}
            <div style={{
              position: "absolute", right: "-5%", top: "-10%",
              width: "45%", aspectRatio: "1", borderRadius: "50%",
              background: accent, opacity: 0.07,
            }} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              justifyContent: "center", padding: "6% 8%",
            }}>
              <div style={{
                fontSize: "clamp(22px, 5vw, 48px)",
                fontWeight: 900, color: titleColor,
                lineHeight: 1.15, marginBottom: "14px",
                wordBreak: "break-word",
              }}>
                {slide.title}
              </div>
              <div style={{ width: "15%", height: "3px", background: accent, borderRadius: "2px", marginBottom: "14px" }} />
              {slide.subtitle && (
                <div style={{ fontSize: "clamp(12px, 1.8vw, 20px)", color: subColor, fontWeight: 500 }}>
                  {slide.subtitle}
                </div>
              )}
            </div>
            <div style={{
              position: "absolute", bottom: "14px", right: "18px",
              fontSize: "9px", color: subColor, opacity: 0.4, fontWeight: 700,
            }}>
              VisionText AI
            </div>
          </div>
        );

      /* ── QUOTE ── */
      case "quote":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden" }}>
            <AccentBar />
            <div style={{
              position: "absolute", top: "5%", left: "3%",
              fontSize: "clamp(50px, 12vw, 100px)", color: accent, opacity: 0.15,
              fontFamily: "serif", lineHeight: 1,
            }}>"</div>
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "10% 8%", textAlign: "center", gap: "12px",
            }}>
              <div style={{
                fontSize: "clamp(13px, 2.2vw, 22px)",
                fontStyle: "italic", color: titleColor,
                lineHeight: 1.5, fontWeight: 600,
              }}>
                {slide.quote || slide.title}
              </div>
              {slide.author && (
                <div style={{ fontSize: "clamp(11px, 1.5vw, 16px)", color: subColor, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  — {slide.author}
                </div>
              )}
            </div>
            <SlideNum />
          </div>
        );

      /* ── STATS ── */
      case "stats": {
        const stats = (slide.stats || []).slice(0, 6);
        const perRow = stats.length <= 3 ? stats.length : 3;
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden", display: "flex", flexDirection: "column", padding: "4% 4% 8%", boxSizing: "border-box" }}>
            <AccentBar />
            <SlideTitle text={slide.title} />
            <div style={{
              flex: 1, display: "grid",
              gridTemplateColumns: `repeat(${perRow}, 1fr)`,
              gap: "8px", overflow: "hidden",
            }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "8px 6px", borderRadius: "10px",
                  border: `1px solid ${accent}44`,
                  background: `${accent}12`,
                  overflow: "hidden",
                }}>
                  <div style={{ fontSize: "clamp(18px, 3.5vw, 36px)", fontWeight: 900, color: accent, lineHeight: 1, textAlign: "center" }}>{s.value}</div>
                  <div style={{ fontSize: "clamp(9px, 1.2vw, 13px)", color: bodyColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px", textAlign: "center" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <SlideNum />
          </div>
        );
      }

      /* ── TWO-COLUMN ── */
      case "two-column": {
        const left = slide.leftColumn || {};
        const right = slide.rightColumn || {};
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden", display: "flex", flexDirection: "column", padding: "4% 4% 8%", boxSizing: "border-box" }}>
            <AccentBar />
            <SlideTitle text={slide.title} />
            <div style={{ flex: 1, display: "flex", gap: "3%", overflow: "hidden" }}>
              {/* Left */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
                <div style={{ fontSize: "clamp(11px, 1.4vw, 15px)", fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {left.heading || ""}
                </div>
                <div style={{ height: "1.5px", background: accent, opacity: 0.35 }} />
                <BulletList bullets={left.bullets} />
              </div>
              {/* Divider */}
              <div style={{ width: "1.5px", background: accent, opacity: 0.2, flexShrink: 0 }} />
              {/* Right */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
                <div style={{ fontSize: "clamp(11px, 1.4vw, 15px)", fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {right.heading || ""}
                </div>
                <div style={{ height: "1.5px", background: accent, opacity: 0.35 }} />
                <BulletList bullets={right.bullets} />
              </div>
            </div>
            <SlideNum />
          </div>
        );
      }

      /* ── TIMELINE ── */
      case "timeline": {
        const items = (slide.timelineItems || []).slice(0, 5);
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden", display: "flex", flexDirection: "column", padding: "4% 4% 8%", boxSizing: "border-box" }}>
            <AccentBar />
            <SlideTitle text={slide.title} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden", justifyContent: "space-around" }}>
              {items.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                  <div style={{
                    flexShrink: 0, width: "6px", height: "6px", borderRadius: "50%",
                    background: accent, boxShadow: `0 0 6px ${accent}`,
                  }} />
                  <div style={{ flexShrink: 0, minWidth: "48px", fontSize: "clamp(9px, 1.2vw, 13px)", fontWeight: 900, color: accent }}>
                    {t.year}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 1.4vw, 14px)", color: bodyColor, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.event}
                  </div>
                </div>
              ))}
            </div>
            <SlideNum />
          </div>
        );
      }

      /* ── IMAGE ── */
      case "image":
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden", display: "flex", flexDirection: "column", padding: "4% 4% 8%", boxSizing: "border-box" }}>
            <AccentBar />
            <SlideTitle text={slide.title} />
            {slide.image ? (
              <div style={{ flex: 1, overflow: "hidden", borderRadius: "10px", border: `1px solid ${accent}33` }}>
                <img src={slide.image} alt="Visual" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <BulletList bullets={slide.bullets} />
              </div>
            )}
            <SlideNum />
          </div>
        );

      /* ── DEFAULT / CONTENT ── */
      default: {
        const hasImage = !!(slide.image);
        return (
          <div style={{ position: "relative", width: "100%", height: "100%", background: bg, overflow: "hidden", display: "flex", flexDirection: "column", padding: "4% 4% 8%", boxSizing: "border-box" }}>
            <AccentBar />
            <SlideTitle text={slide.title} />
            <div style={{ flex: 1, display: "flex", gap: "3%", overflow: "hidden" }}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <BulletList bullets={slide.bullets} fontSize={hasImage ? "clamp(10px, 1.3vw, 14px)" : "clamp(12px, 1.6vw, 17px)"} />
              </div>
              {hasImage && (
                <div style={{ width: "42%", flexShrink: 0, borderRadius: "10px", overflow: "hidden", border: `1px solid ${accent}33` }}>
                  <img src={slide.image} alt="Visual" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
            <SlideNum />
          </div>
        );
      }
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <Link to="/" className="text-white no-underline font-black text-lg flex items-center gap-2">
          <span className="text-xl">⚡</span> VisionText AI
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {downloading ? "Generating…" : "⬇️ Download PPTX"}
        </button>
      </div>

      {/* Slide preview — fixed 16:9 */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-950/50">
        <div
          ref={containerRef}
          className="w-full max-w-5xl relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
          style={{ aspectRatio: "16 / 9" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 sm:p-5 flex flex-wrap justify-center items-center gap-4 sm:gap-6 bg-slate-900 border-t border-slate-800">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm"
        >
          ← Prev
        </button>

        {/* Dot navigation */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[50vw]">
          {data.slides.map((_, i) => {
            const tmplColor = `#${tmpl.accent}`;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                title={data.slides[i]?.title || `Slide ${i + 1}`}
                style={{
                  width: i === currentIndex ? "10px" : "7px",
                  height: i === currentIndex ? "10px" : "7px",
                  borderRadius: "50%",
                  background: i === currentIndex ? tmplColor : "#475569",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  outline: "none",
                }}
              />
            );
          })}
        </div>

        <button
          onClick={() => setCurrentIndex(Math.min(data.slides.length - 1, currentIndex + 1))}
          disabled={currentIndex === data.slides.length - 1}
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
