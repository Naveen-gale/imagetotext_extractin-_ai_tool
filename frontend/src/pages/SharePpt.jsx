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
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><h2>Loading presentation...</h2></div>;
  }

  if (error || !data) {
    return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <h2>{error}</h2>
      <Link to="/" style={{ marginTop: '20px', color: '#3b82f6' }}>Return home</Link>
    </div>;
  }

  const tmpl = TEMPLATES[data.template] || TEMPLATES.corporate;
  const slide = data.slides[currentIndex];

  const renderSlideContent = () => {
    switch (slide.type) {
      case "title":
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 xs:p-12 w-full">
              <h1 className="font-black mb-6 w-full" style={{ color: `#${tmpl.title}`, fontSize: '60px', lineHeight: 1.2, fontFamily: "'Space Grotesk', sans-serif" }}>{slide.title}</h1>
              {slide.subtitle && <p className="font-bold opacity-80 w-full" style={{ color: `#${tmpl.sub}`, fontSize: '30px' }}>{slide.subtitle}</p>}
            </div>
        );
      case "quote":
        return (
            <div className="flex flex-col justify-center h-full p-12 xs:p-20 relative w-full">
              <div className="text-[120px] font-serif leading-none absolute top-12 left-12 opacity-20" style={{ color: `#${tmpl.accent}` }}>"</div>
              <h2 className="font-bold italic relative z-10 w-full" style={{ color: `#${tmpl.title}`, fontSize: '40px', lineHeight: 1.4 }}>{slide.quote || slide.title}</h2>
              {slide.author && <p className="mt-8 text-right relative z-10 font-black uppercase tracking-[0.2em]" style={{ color: `#${tmpl.sub}`, fontSize: '24px' }}>— {slide.author}</p>}
            </div>
        );
      case "stats":
        return (
            <div className="flex flex-col h-full p-8 xs:p-12 w-full">
              <h2 className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, fontSize: '48px', borderColor: `#${tmpl.accent}33` }}>{slide.title}</h2>
              <div className="grid grid-cols-2 gap-6 flex-grow content-start">
                {(slide.stats || []).map((s, i) => (
                  <div key={i} className="flex flex-col p-6 rounded-2xl border-2 bg-white/5" style={{ borderColor: `#${tmpl.accent}66` }}>
                     <div className="font-black w-full" style={{ color: `#${tmpl.accent}`, fontSize: '64px', lineHeight: 1 }}>{s.value}</div>
                     <div className="font-bold opacity-80 uppercase tracking-widest w-full mt-2" style={{ color: `#${tmpl.body}`, fontSize: '20px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
        );
      case "two-column":
        return (
            <div className="flex flex-col h-full p-8 xs:p-12 w-full">
              <h2 className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, fontSize: '48px', borderColor: `#${tmpl.accent}33` }}>{slide.title}</h2>
              <div className="flex flex-1 gap-8">
                <div className="flex-1 flex flex-col gap-4">
                  <h3 className="font-black uppercase tracking-widest w-full mb-2" style={{ color: `#${tmpl.accent}`, fontSize: '24px' }}>{slide.leftColumn?.heading}</h3>
                  <ul className="flex flex-col gap-4">
                    {(slide.leftColumn?.bullets || []).map((b, i) => (
                      <li key={i} className="flex gap-4 font-medium leading-relaxed" style={{ color: `#${tmpl.body}`, fontSize: '24px' }}>
                        <span className="text-2xl font-black mt-[-4px]" style={{ color: `#${tmpl.accent}` }}>•</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-0.5 h-full opacity-30" style={{ background: `#${tmpl.accent}` }} />
                <div className="flex-1 flex flex-col gap-4">
                  <h3 className="font-black uppercase tracking-widest w-full mb-2" style={{ color: `#${tmpl.accent}`, fontSize: '24px' }}>{slide.rightColumn?.heading}</h3>
                  <ul className="flex flex-col gap-4">
                    {(slide.rightColumn?.bullets || []).map((b, i) => (
                      <li key={i} className="flex gap-4 font-medium leading-relaxed" style={{ color: `#${tmpl.body}`, fontSize: '24px' }}>
                        <span className="text-2xl font-black mt-[-4px]" style={{ color: `#${tmpl.accent}` }}>•</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
        );
      case "timeline":
        return (
            <div className="flex flex-col h-full p-8 xs:p-12 w-full">
              <h2 className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, fontSize: '48px', borderColor: `#${tmpl.accent}33` }}>{slide.title}</h2>
              <div className="flex flex-col gap-6 flex-grow justify-center relative pl-8">
                <div className="absolute left-10 top-4 bottom-4 w-1 hidden sm:block opacity-30" style={{ background: `#${tmpl.accent}` }} />
                {(slide.timelineItems || []).map((t, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10 w-full pr-8">
                    <div className="hidden sm:block w-5 h-5 rounded-full flex-shrink-0" style={{ background: `#${tmpl.accent}` }} />
                    <div className="font-black uppercase tracking-widest w-full sm:w-[120px] flex-shrink-0" style={{ color: `#${tmpl.accent}`, fontSize: '28px' }}>{t.year}</div>
                    <div className="font-medium w-full" style={{ color: `#${tmpl.body}`, fontSize: '24px' }}>{t.event}</div>
                  </div>
                ))}
              </div>
            </div>
        );
      default:
        return (
            <div className="flex flex-col h-full p-8 xs:p-12 w-full">
              <h2 className="font-black mb-8 border-b-2 pb-4 w-full" style={{ color: `#${tmpl.highlight}`, fontSize: '48px', borderColor: `#${tmpl.accent}33` }}>{slide.title}</h2>
              <div className="flex gap-8 flex-1 w-full">
                <ul className="flex-1 flex flex-col gap-4 justify-center m-0 p-0">
                  {(slide.bullets || []).map((b, i) => (
                    <li key={i} className="flex gap-4 font-medium leading-relaxed" style={{ color: `#${tmpl.body}`, fontSize: '28px' }}>
                      <span className="text-2xl font-black mt-[-4px]" style={{ color: `#${tmpl.accent}` }}>•</span> {b}
                    </li>
                  ))}
                </ul>
                {slide.image && (
                  <div className="w-[40%] flex items-center justify-center p-4 rounded-xl border-2 bg-white/5" style={{ borderColor: `#${tmpl.accent}33` }}>
                    <img src={slide.image} alt="Visual" className="max-w-full max-h-full object-contain rounded-lg shadow-xl" />
                  </div>
                )}
              </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
        <div className="p-4 sm:p-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
            <Link to="/" className="text-white decoration-none font-black text-xl flex items-center gap-2">
              <span className="text-2xl">⚡</span> VisionText AI
            </Link>
            <div className="flex gap-4">
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {downloading ? "Generating..." : "⬇️ Download PPTX"}
                </button>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-slate-950/50">
            <div ref={containerRef} className="w-full max-w-6xl aspect-[16/9] relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" style={{ background: `#${tmpl.bg}` }}>
                <div className="absolute top-0 left-0 right-0 h-2 z-10" style={{ background: `#${tmpl.accent}` }} />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 200 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -200 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex"
                        style={{ fontFamily: FONT_STYLES[data.fontStyle]?.body || 'sans-serif' }}
                    >
                        {renderSlideContent()}
                    </motion.div>
                </AnimatePresence>

                {currentIndex === 0 && <div className="absolute bottom-6 right-8 opacity-50 uppercase tracking-[0.2em] font-black text-sm" style={{ color: `#${tmpl.sub}` }}>VisionText AI</div>}
                <div className="absolute bottom-0 left-0 right-0 h-2 z-10" style={{ background: `#${tmpl.accent}` }} />
                <div className="absolute bottom-6 left-8 opacity-30 font-black text-lg" style={{ color: `#${tmpl.sub}` }}>#{currentIndex + 1}</div>
            </div>
        </div>

        <div className="p-4 sm:p-6 flex flex-wrap justify-center items-center gap-4 sm:gap-8 bg-slate-900 border-t border-slate-800">
            <button 
               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
               disabled={currentIndex === 0}
               className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
                ← Previous
            </button>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-[50vw]">
                {data.slides.map((_, i) => (
                    <button 
                       key={i} 
                       onClick={() => setCurrentIndex(i)}
                       className={`w-3 h-3 rounded-full transition-all focus:outline-none ${i === currentIndex ? "scale-150 ring-2 ring-offset-2 ring-offset-slate-900" : "hover:bg-slate-500"}`}
                       style={{ 
                         background: i === currentIndex ? `#${tmpl.accent}` : '#475569',
                         ['--tw-ring-color']: i === currentIndex ? `#${tmpl.accent}` : undefined
                       }}
                    />
                ))}
            </div>
            <button 
               onClick={() => setCurrentIndex(Math.min(data.slides.length - 1, currentIndex + 1))}
               disabled={currentIndex === data.slides.length - 1}
               className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
                Next →
            </button>
        </div>
    </div>
  );
}
