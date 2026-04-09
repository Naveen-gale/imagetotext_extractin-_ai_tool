import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Rocket, Sparkles, Presentation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePptData, uploadPptFile, savePptHistory } from "../utils/api";
import { generatePptx, TEMPLATES, FONT_STYLES } from "../utils/pptGenerator";
import EditableText from "../components/EditableText";
import HistoryModal from "../components/modals/HistoryModal";

// ─── Constants ───────────────────────────────────────────────────────────────
const SLIDE_COUNTS = [4, 6, 8, 10, 12, 15];

// ─── Slide Preview component ─────────────────────────────────────────────────
function SlidePreview({ slide, template, index, isActive, onClick }) {
  const tmpl = TEMPLATES[template] || TEMPLATES.corporate;

  const renderContent = () => {
    if (slide.type === "title") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-xl sm:text-2xl font-black mb-2" style={{ color: `#${tmpl.title}`, lineHeight: 1.2 }}>{slide.title}</div>
          {slide.subtitle && <div className="text-[10px] sm:text-xs font-bold opacity-80" style={{ color: `#${tmpl.sub}` }}>{slide.subtitle}</div>}
        </div>
      );
    }
    if (slide.type === "quote") {
      return (
        <div className="flex flex-col justify-center h-full p-6">
          <div className="text-4xl font-serif leading-none mb-2" style={{ color: `#${tmpl.accent}` }}>"</div>
          <div className="text-sm sm:text-base font-bold italic mb-4" style={{ color: `#${tmpl.title}` }}>{slide.quote || slide.title}</div>
          {slide.author && <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-right" style={{ color: `#${tmpl.sub}` }}>— {slide.author}</div>}
        </div>
      );
    }
    if (slide.type === "stats") {
      return (
        <div className="flex flex-col h-full p-4">
          <div className="text-sm sm:text-base font-black mb-4 border-b pb-2" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }}>{slide.title}</div>
          <div className="grid grid-cols-2 gap-2 flex-grow content-start">
            {(slide.stats || []).slice(0, 4).map((s, i) => (
              <div key={i} className="flex flex-col p-2 rounded-lg border bg-white/5" style={{ borderColor: `#${tmpl.accent}55` }}>
                <div className="text-lg sm:text-xl font-black" style={{ color: `#${tmpl.accent}` }}>{s.value}</div>
                <div className="text-[8px] sm:text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1" style={{ color: `#${tmpl.text}` }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (slide.type === "two-column") {
      return (
        <div className="flex flex-col h-full p-4">
          <div className="text-sm sm:text-base font-black mb-4 border-b pb-2" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }}>{slide.title}</div>
          <div className="flex flex-1 gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1" style={{ color: `#${tmpl.accent}` }}>{slide.leftColumn?.heading}</div>
              {(slide.leftColumn?.bullets || []).slice(0, 3).map((b, i) => (
                <div key={i} className="text-[8px] sm:text-[10px] font-medium leading-relaxed flex gap-2" style={{ color: `#${tmpl.text}` }}>
                  <span style={{ color: `#${tmpl.accent}` }}>•</span> <span>{b}</span>
                </div>
              ))}
            </div>
            <div className="w-px h-full" style={{ background: `#${tmpl.accent}44` }} />
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1" style={{ color: `#${tmpl.accent}` }}>{slide.rightColumn?.heading}</div>
              {(slide.rightColumn?.bullets || []).slice(0, 3).map((b, i) => (
                <div key={i} className="text-[8px] sm:text-[10px] font-medium leading-relaxed flex gap-2" style={{ color: `#${tmpl.text}` }}>
                  <span style={{ color: `#${tmpl.accent}` }}>•</span> <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (slide.type === "timeline") {
      return (
        <div className="flex flex-col h-full p-4">
          <div className="text-sm sm:text-base font-black mb-4 border-b pb-2" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }}>{slide.title}</div>
          <div className="flex flex-col gap-3 flex-grow justify-center relative pl-2">
            <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: `#${tmpl.accent}44` }} />
            {(slide.timelineItems || []).slice(0, 5).map((t, i) => (
              <div key={i} className="flex gap-4 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: `#${tmpl.accent}` }} />
                <div className="flex flex-col pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: `#${tmpl.accent}` }}>{t.year}</span>
                  <span className="text-[8px] sm:text-[10px] font-medium mt-0.5" style={{ color: `#${tmpl.text}` }}>{t.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Default: content with bullets
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-sm sm:text-base font-black mb-4 border-b pb-2" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }}>{slide.title}</div>
        <div className="flex gap-4 flex-1">
          <ul className="flex-1 flex flex-col gap-2">
            {(slide.bullets || []).slice(0, 5).map((b, i) => (
              <li key={i} className="text-[8px] sm:text-[10px] font-medium leading-relaxed flex gap-2" style={{ color: `#${tmpl.text}` }}>
                 <span style={{ color: `#${tmpl.accent}` }}>•</span> <span>{b}</span>
              </li>
            ))}
          </ul>
          {slide.image && (
            <div className="w-1/3 flex items-center justify-center">
              <img src={slide.image} alt="Slide topic" className="w-full h-auto object-cover rounded shadow-md border border-white/10 max-h-full" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const isFirstSlide = index === 0;

  return (
    <div
      className={`relative w-full aspect-[16/9] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isActive ? "ring-4 ring-offset-2 ring-offset-slate-900 shadow-2xl scale-[1.02]" : "ring-1 ring-white/10"
      }`}
      style={{
        background: `#${tmpl.bg}`,
        ['--tw-ring-color']: isActive ? `#${tmpl.accent}` : undefined
      }}
      onClick={onClick}
      role="button"
      aria-label={`Slide ${index + 1}: ${slide.title}`}
    >
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: `#${tmpl.accent}` }} />
      <div className="absolute inset-0 overflow-hidden">
        {renderContent()}
      </div>
      <div className="absolute bottom-2 right-3 text-[8px] font-black opacity-50" style={{ color: `#${tmpl.text}` }}>{index + 1}</div>
      {isFirstSlide && (
        <div className="absolute bottom-2 left-3 text-[8px] font-black uppercase tracking-widest opacity-80" style={{ color: `#${tmpl.accent}` }}>VisionText AI</div>
      )}
    </div>
  );
}

// ─── Full-screen preview modal ────────────────────────────────────────────────
function FullPreviewModal({ slides, currentIndex, onUpdateSlide, onClose, onPrev, onNext, template, fontStyle }) {
  const tmpl = TEMPLATES[template] || TEMPLATES.corporate;
  const slide = slides[currentIndex];
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`w-full max-w-7xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isFullscreen ? '!max-w-full !max-h-screen !rounded-none !border-0 fixed inset-0 z-[110]' : 'animate-in zoom-in-95'}`} ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest rounded-lg border border-slate-700">{currentIndex + 1} / {slides.length}</span>
            <span className="text-lg sm:text-xl font-black text-white truncate max-w-[200px] sm:max-w-md">{slide.title}</span>
          </div>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all font-bold" onClick={toggleFullscreen} title="Toggle Fullscreen">
               {isFullscreen ? "🗗" : "⛶"}
             </button>
             <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold" onClick={onClose} aria-label="Close preview">✕</button>
          </div>
        </div>

        <div
          className="flex-1 relative overflow-auto flex items-center justify-center bg-slate-950/80 p-4 sm:p-8"
          style={{ fontFamily: FONT_STYLES[fontStyle]?.body || "Calibri, sans-serif" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative w-full max-w-5xl aspect-[16/9] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10"
              style={{ background: `#${tmpl.bg}` }}
            >
              <div className="absolute top-0 left-0 w-full h-2 z-10" style={{ background: `#${tmpl.accent}` }} />

          {slide.type === "title" ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 xs:p-12">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={60} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                className="font-black mb-6 w-full text-center" style={{ color: `#${tmpl.title}`, lineHeight: 1.2, fontFamily: "'Space Grotesk', sans-serif" }} 
              />
              <EditableText 
                value={slide.subtitle || ""} onChange={(v) => updateField("subtitle", v)}
                baseSize={30} fontSize={slide.customStyles?.subtitle?.fontSize} onSizeChange={(s) => updateCustomSize("subtitle", s)}
                className="font-bold opacity-80 w-full text-center" style={{ color: `#${tmpl.sub}` }} 
              />
            </div>
          ) : slide.type === "quote" ? (
            <div className="flex flex-col justify-center h-full p-12 xs:p-20 relative">
              <div className="text-[120px] font-serif leading-none absolute top-12 left-12 opacity-20" style={{ color: `#${tmpl.accent}` }}>"</div>
              <EditableText 
                value={slide.quote || slide.title || ""} onChange={(v) => updateField("quote", v)}
                baseSize={40} fontSize={slide.customStyles?.quote?.fontSize} onSizeChange={(s) => updateCustomSize("quote", s)}
                className="font-bold italic relative z-10 w-full" style={{ color: `#${tmpl.title}`, lineHeight: 1.4 }} 
              />
              <div className="mt-8 text-right relative z-10">
                <EditableText 
                  value={slide.author || ""} onChange={(v) => updateField("author", v)}
                  baseSize={24} fontSize={slide.customStyles?.author?.fontSize} onSizeChange={(s) => updateCustomSize("author", s)}
                  className="font-black uppercase tracking-[0.2em] inline-block text-right" style={{ color: `#${tmpl.sub}` }} placeholder="Author name"
                />
              </div>
            </div>
          ) : slide.type === "stats" ? (
            <div className="flex flex-col h-full p-8 xs:p-12">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={48} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }} 
              />
              <div className="grid grid-cols-2 gap-6 flex-grow content-start">
                {(slide.stats || []).map((s, i) => (
                  <div key={i} className="flex flex-col p-6 rounded-2xl border-2 bg-white/5" style={{ borderColor: `#${tmpl.accent}66` }}>
                     <EditableText 
                        value={s.value} onChange={(v) => updateObjArrayField("stats", i, "value", v)}
                        baseSize={64} fontSize={slide.customStyles?.stats_val?.[i]?.fontSize} onSizeChange={(sz) => updateArraySize("stats_val", i, sz)}
                        className="font-black w-full" style={{ color: `#${tmpl.accent}`, lineHeight: 1 }} 
                     />
                     <div className="mt-2">
                       <EditableText 
                          value={s.label} onChange={(v) => updateObjArrayField("stats", i, "label", v)}
                          baseSize={20} fontSize={slide.customStyles?.stats_lbl?.[i]?.fontSize} onSizeChange={(sz) => updateArraySize("stats_lbl", i, sz)}
                          className="font-bold opacity-80 uppercase tracking-widest w-full" style={{ color: `#${tmpl.body}` }} 
                       />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ) : slide.type === "two-column" ? (
            <div className="flex flex-col h-full p-8 xs:p-12">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={48} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }} 
              />
              <div className="flex flex-1 gap-8">
                <div className="flex-1 flex flex-col gap-4">
                  <EditableText 
                    className="font-black uppercase tracking-widest w-full mb-2" style={{ color: `#${tmpl.accent}` }} 
                    value={slide.leftColumn?.heading} onChange={(v) => updateColField("leftColumn", "heading", v)}
                    baseSize={24} fontSize={slide.customStyles?.leftHead?.fontSize} onSizeChange={(s) => updateCustomSize("leftHead", s)}
                  />
                  {(slide.leftColumn?.bullets || []).map((b, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-2xl font-black mt-[-4px]" style={{ color: `#${tmpl.accent}` }}>•</span>
                      <EditableText 
                        className="font-medium leading-relaxed w-full" style={{ color: `#${tmpl.body}` }} 
                        value={b} onChange={(v) => updateColField("leftColumn", "bullets", v, i)}
                        baseSize={24} fontSize={slide.customStyles?.leftBullets?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("leftBullets", i, s)}
                      />
                    </div>
                  ))}
                </div>
                <div className="w-0.5 h-full opacity-30" style={{ background: `#${tmpl.accent}` }} />
                <div className="flex-1 flex flex-col gap-4">
                  <EditableText 
                    className="font-black uppercase tracking-widest w-full mb-2" style={{ color: `#${tmpl.accent}` }} 
                    value={slide.rightColumn?.heading} onChange={(v) => updateColField("rightColumn", "heading", v)}
                    baseSize={24} fontSize={slide.customStyles?.rightHead?.fontSize} onSizeChange={(s) => updateCustomSize("rightHead", s)}
                  />
                  {(slide.rightColumn?.bullets || []).map((b, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-2xl font-black mt-[-4px]" style={{ color: `#${tmpl.accent}` }}>•</span>
                      <EditableText 
                        className="font-medium leading-relaxed w-full" style={{ color: `#${tmpl.body}` }} 
                        value={b} onChange={(v) => updateColField("rightColumn", "bullets", v, i)}
                        baseSize={24} fontSize={slide.customStyles?.rightBullets?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("rightBullets", i, s)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : slide.type === "timeline" ? (
            <div className="flex flex-col h-full p-8 xs:p-12">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={48} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }} 
              />
              <div className="flex flex-col gap-6 flex-grow justify-center relative pl-8">
                <div className="absolute left-10 top-4 bottom-4 w-1 hidden sm:block opacity-30" style={{ background: `#${tmpl.accent}` }} />
                {(slide.timelineItems || []).map((t, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10 w-full pr-8">
                    <div className="hidden sm:block w-5 h-5 rounded-full flex-shrink-0" style={{ background: `#${tmpl.accent}` }} />
                    <EditableText 
                       className="font-black uppercase tracking-widest w-full sm:w-[120px] flex-shrink-0" style={{ color: `#${tmpl.accent}` }}
                       value={t.year} onChange={(v) => updateObjArrayField("timelineItems", i, "year", v)}
                       baseSize={28} fontSize={slide.customStyles?.tl_year?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("tl_year", i, s)}
                    />
                    <EditableText 
                       className="font-medium w-full" style={{ color: `#${tmpl.body}` }}
                       value={t.event} onChange={(v) => updateObjArrayField("timelineItems", i, "event", v)}
                       baseSize={24} fontSize={slide.customStyles?.tl_evt?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("tl_evt", i, s)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full p-8 xs:p-12">
              <EditableText 
                value={slide.title} onChange={(v) => updateField("title", v)}
                baseSize={48} fontSize={slide.customStyles?.title?.fontSize} onSizeChange={(s) => updateCustomSize("title", s)}
                component="h2" className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, borderColor: `#${tmpl.accent}33` }} 
              />
              <div className="flex gap-8 flex-1 w-full">
                <div className="flex-1 flex flex-col gap-4 justify-center">
                  {(slide.bullets || []).map((b, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-2xl font-black mt-[-4px]" style={{ color: `#${tmpl.accent}` }}>•</span>
                      <EditableText 
                        value={b} onChange={(v) => updateArrayField("bullets", i, v)}
                        baseSize={28} fontSize={slide.customStyles?.bullets?.[i]?.fontSize} onSizeChange={(s) => updateArraySize("bullets", i, s)}
                        className="font-medium leading-relaxed w-full" style={{ color: `#${tmpl.body}` }}
                      />
                    </div>
                  ))}
                </div>
                {slide.image && (
                  <div className="w-[40%] flex items-center justify-center p-4 rounded-xl border-2 bg-white/5" style={{ borderColor: `#${tmpl.accent}33` }}>
                    <img src={slide.image} alt="Visual" className="max-w-full max-h-full object-contain rounded-lg shadow-xl" />
                  </div>
                )}
              </div>
            </div>
          )}

            <div className="absolute bottom-6 right-8 text-sm font-black opacity-30" style={{ color: `#${tmpl.text}` }}>{currentIndex + 1}</div>
            {currentIndex === 0 && <div className="absolute bottom-6 left-8 text-sm font-black uppercase tracking-[0.2em] opacity-50" style={{ color: `#${tmpl.accent}` }}>VisionText AI</div>}
          </motion.div>
        </AnimatePresence>
      </div>

        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-800 bg-slate-900/50 flex-shrink-0 z-10">
          <button 
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onPrev} disabled={currentIndex === 0}
          >
            ← Prev
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-[50vw]">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none ${i === currentIndex ? "scale-150 ring-2 ring-offset-2 ring-offset-slate-900" : "bg-slate-700 hover:bg-slate-600"}`}
                style={{ 
                  background: i === currentIndex ? `#${tmpl.accent}` : undefined,
                  ['--tw-ring-color']: i === currentIndex ? `#${tmpl.accent}` : undefined
                }}
                onClick={() => onUpdateSlide(i, slides[i]) /* hack to jump, ignoring logic for now */}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button 
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl border border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onNext} disabled={currentIndex === slides.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Aippt() {
  // Step states: "input" → "generating" → "preview"
  const [step, setStep] = useState("input");
  const [showHistory, setShowHistory] = useState(false);

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
  const [lastSavedId, setLastSavedId] = useState(null);

  // Action states
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const pptBlobRef = useRef(null);

  // Persistence: Load
  useEffect(() => {
    const saved = localStorage.getItem("ai_ppt_state");
    if (saved) {
      try {
        const { prompt: p, slides: s, template: t, fontStyle: f, slideCount: sc } = JSON.parse(saved);
        if (p) setPrompt(p);
        if (s?.length) {
          setSlides(s);
          setStep("preview");
        }
        if (t) setTemplate(t);
        if (f) setFontStyle(f);
        if (sc) setSlideCount(sc);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Persistence: Save
  useEffect(() => {
    if (step === "generating") return; // Don't save while generating
    const state = { prompt, slides, template, fontStyle, slideCount };
    localStorage.setItem("ai_ppt_state", JSON.stringify(state));
  }, [prompt, slides, template, fontStyle, slideCount, step]);

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
      
      savePptHistory({
        prompt,
        slideCount,
        template,
        fontStyle,
        slides: slideData
      }).then(res => setLastSavedId(res._id)).catch(err => console.error("History save failed:", err));
      
    } catch (err) {
      setError(err.message);
      setStep("input");
    }
  };

  // ── Download PPT ────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    let defaultPrefix = (prompt || "Presentation").slice(0, 15).replace(/[^a-z0-9]/gi, "_");
    const requestedName = window.prompt("Enter a filename for your presentation:", defaultPrefix);
    if (requestedName === null) return;
    const finalName = requestedName.trim() || defaultPrefix;

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
      a.download = `${finalName}.pptx`;
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
      if (lastSavedId) {
        setShareUrl(`${window.location.origin}/share-ppt/${lastSavedId}`);
      } else {
        setError("History not saved yet, try regenerating or reloading.");
      }
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all font-bold text-sm">
            ← Back
          </Link>
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2">
            <span className="text-sm">📊</span> AI Presentation Studio
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(true)} 
          className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-800 transition-all shadow-xl"
        >
          <HistoryIcon className="w-4 h-4 text-purple-400" />
          History
        </button>
      </div>

      {/* ── STEP 1: Input Form ── */}
      {step === "input" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Stunning Presentations</span><br />with AI
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
              Describe your topic, upload a reference image, choose your style — let artificial intelligence do the heavy lifting.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 sm:p-10 space-y-10 shadow-2xl">
            {/* Prompt */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500" htmlFor="ppt-prompt">
                📝 Presentation Topic / Description
              </label>
              <textarea
                id="ppt-prompt"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-200 text-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none min-h-[160px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'The Future of Renewable Energy — solar, wind, and battery storage trends for 2025'"
                maxLength={6000}
              />
              <div className="flex justify-end uppercase font-black text-[10px] tracking-widest text-slate-600">
                {prompt.length} / 6000
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">🖼️ Reference Image (Optional)</label>
              {imagePreview ? (
                <div className="flex items-center gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <img src={imagePreview} alt="Reference" className="w-20 h-20 object-cover rounded-xl border border-slate-800" />
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-slate-400 truncate max-w-[200px]">{image?.name}</span>
                    <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors" onClick={removeImage}>✕ Remove</button>
                  </div>
                </div>
              ) : (
                <div
                  className="group cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/50 bg-slate-950/50 hover:bg-purple-500/5 rounded-2xl p-10 text-center transition-all"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-3xl mb-3 opacity-50 group-hover:scale-110 transition-transform group-hover:opacity-100">📤</div>
                  <div className="text-sm font-bold text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">Drag & drop image here or click to browse</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">JPG, PNG, WebP · Max 20MB</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageDrop}
              />
            </div>

            {/* Settings Row */}
            <div className="space-y-8 pt-4 border-t border-slate-800">
              {/* Template Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">🎨 Template Design</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                    <button
                      key={key}
                      className={`relative flex flex-col p-4 rounded-xl border-2 transition-all overflow-hidden ${template === key ? 'ring-4 ring-purple-500/20' : 'hover:scale-[1.02]'}`}
                      style={{
                        borderColor: template === key ? `#${tmpl.accent}` : `#1e293b`,
                        background: `#${tmpl.bg}`
                      }}
                      onClick={() => { setTemplate(key); pptBlobRef.current = null; }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{tmpl.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{tmpl.name}</span>
                      </div>
                      <div className="w-full h-1" style={{ background: `#${tmpl.accent}` }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style + Slide Count */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500" htmlFor="font-style">✍️ Typography Style</label>
                  <select
                    id="font-style"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-bold focus:ring-2 focus:ring-purple-500/50 transition-all outline-none appearance-none"
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

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500" htmlFor="slide-count">📑 Slide Count</label>
                  <input
                    id="slide-count"
                    type="number"
                    min="4"
                    max="20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-bold focus:ring-2 focus:ring-purple-500/50 transition-all outline-none"
                    value={slideCount}
                    onChange={(e) => {
                      let val = parseInt(e.target.value, 10);
                      if (isNaN(val)) val = 4;
                      setSlideCount(val);
                    }}
                  />
                </div>
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold rounded-xl flex items-center gap-2">⚠️ {error}</div>}

            <button
              className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              onClick={handleGenerate}
              disabled={!prompt.trim()}
            >
              ✨ Generate Presentation with AI
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Generating Loader ── */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
           <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-4 border-4 border-transparent border-b-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">✨</div>
           </div>
           
           <div className="space-y-4">
             <h2 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
               Crafting Your Masterpiece...
             </h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
               Generating {slideCount} Intelligent Slides
             </p>
           </div>

           <div className="w-full max-w-md space-y-3 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
              {[
                { label: "Analyzing requirements", done: true },
                { label: "Researching content", done: step === "generating" },
                { label: "Generating visual assets", done: false },
                { label: "Polishing design", done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${s.done ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`} />
                   <span className={`text-sm font-bold tracking-tight ${s.done ? 'text-emerald-400' : 'text-slate-600'}`}>
                     {s.label}
                   </span>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ── STEP 3: Preview & Export ── */}
      {/* ── STEP 3: Preview & Export ── */}
      {step === "preview" && slides.length > 0 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <span className="text-4xl">🎉</span> Your Presentation is Ready!
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
                {slides.length} slides generated · {TEMPLATES[template]?.name} theme · {fontStyle} font
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all text-sm active:scale-95" 
                onClick={handleReset} 
                id="reset-ppt-btn"
              >
                🔄 Start Over
              </button>
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl border border-indigo-500 shadow-lg shadow-indigo-500/20 transition-all text-sm active:scale-95" 
                onClick={() => setShowFullPreview(true)} 
                id="fullpreview-btn"
              >
                👁️ Full Preview
              </button>
            </div>
          </div>

          {/* Slide Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-x-auto">
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
          <div className="flex items-center gap-3 text-sm p-4 bg-slate-950 border border-slate-800 rounded-xl justify-center font-bold">
            <span className="text-slate-500 uppercase tracking-widest text-xs">Currently viewing:</span>
            <span className="text-white bg-slate-800 px-3 py-1 rounded-md">{slides[activeSlide]?.title}</span>
            <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-md text-xs uppercase tracking-widest border border-indigo-500/20">[{slides[activeSlide]?.type}]</span>
          </div>

          {/* Export Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="text-2xl font-black text-white mb-2">📥 Export Your Presentation</div>
            <div className="text-sm font-bold text-slate-500 mb-8">💡 Open the downloaded file in PowerPoint, Google Slides, or Keynote.</div>

            {error && <div className="mb-6 p-4 w-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold rounded-xl flex items-center justify-center gap-2">⚠️ {error}</div>}

            <div className="grid sm:grid-cols-2 gap-4 w-full">
              <button
                className="flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 border border-purple-500  transition-all active:scale-[0.98] relative overflow-hidden"
                onClick={handleDownload}
                disabled={downloading}
                id="download-ppt-btn"
              >
                {downloading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating file…</>
                ) : (
                  <>⬇️ Download .pptx</>
                )}
              </button>

              <button
                className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 font-black text-lg rounded-2xl border-2 border-indigo-500/30 hover:border-indigo-500/60 disabled:border-slate-800 transition-all active:scale-[0.98]"
                onClick={handleShare}
                disabled={sharing || !!shareUrl}
                id="share-ppt-btn"
              >
                {sharing ? (
                  <><div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> Uploading…</>
                ) : shareUrl ? (
                  <>✅ Link Ready!</>
                ) : (
                  <>🔗 Get Shareable Link</>
                )}
              </button>
            </div>

            {shareUrl && (
              <div className="mt-8 w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">🌐 Your presentation is live at:</div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-indigo-400 font-mono text-sm hover:text-indigo-300 hover:border-indigo-500/50 transition-colors w-full sm:w-auto truncate block overflow-hidden text-ellipsis whitespace-nowrap text-left">
                    {shareUrl}
                  </a>
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95"
                    onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}
            
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
      
      {showHistory && (
        <HistoryModal 
           onClose={() => setShowHistory(false)}
           onLoadHistoryItem={(item) => {
             setPrompt(item.prompt);
             setTemplate(item.template);
             setFontStyle(item.fontStyle);
             setSlideCount(item.slideCount);
             setSlides(item.slides);
             setActiveSlide(0);
             setStep("preview");
             setShowHistory(false);
           }}
        />
      )}
    </div>
  );
}
