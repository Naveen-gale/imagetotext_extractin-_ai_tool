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
    setDownloading(true);
    try {
      const blob = await generatePptx(data.slides, data.template, data.fontStyle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const namePrefix = (data.prompt || "Presentation").slice(0, 15).replace(/[^a-z0-9]/gi, "_");
      a.download = `${namePrefix}.pptx`;
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
            <div className="fpm-title-slide">
              <h1 className="fpm-big-title" style={{ color: `#${tmpl.title}`, fontSize: '60px', margin: 0, fontWeight: 800 }}>{slide.title}</h1>
              {slide.subtitle && <p className="fpm-big-sub" style={{ color: `#${tmpl.sub}`, fontSize: '30px', margin: '20px 0 0 0' }}>{slide.subtitle}</p>}
            </div>
        );
      case "quote":
        return (
            <div className="fpm-quote-slide" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ color: `#${tmpl.accent}`, fontSize: '100px', lineHeight: 1 }}>"</div>
              <h2 style={{ color: `#${tmpl.title}`, fontSize: '40px', fontStyle: 'italic', margin: '20px 0' }}>{slide.quote || slide.title}</h2>
              {slide.author && <p style={{ color: `#${tmpl.sub}`, fontSize: '30px' }}>— {slide.author}</p>}
            </div>
        );
      case "stats":
        return (
            <div className="fpm-content">
              <h2 style={{ color: `#${tmpl.highlight}`, fontSize: '50px', marginBottom: '30px' }}>{slide.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {(slide.stats || []).map((s, i) => (
                  <div key={i} style={{ flex: 1, minWidth: '200px', border: `2px solid #${tmpl.accent}66`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                     <div style={{ color: `#${tmpl.accent}`, fontSize: '50px', fontWeight: 'bold' }}>{s.value}</div>
                     <div style={{ color: `#${tmpl.body}`, fontSize: '24px', marginTop: '10px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
        );
      case "two-column":
        return (
            <div className="fpm-content">
              <h2 style={{ color: `#${tmpl.highlight}`, fontSize: '50px', marginBottom: '30px' }}>{slide.title}</h2>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: `#${tmpl.accent}`, fontSize: '30px' }}>{slide.leftColumn?.heading}</h3>
                  <ul style={{ color: `#${tmpl.body}`, fontSize: '24px', paddingLeft: '20px' }}>
                    {(slide.leftColumn?.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
                <div style={{ width: '2px', background: `#${tmpl.accent}33` }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: `#${tmpl.accent}`, fontSize: '30px' }}>{slide.rightColumn?.heading}</h3>
                  <ul style={{ color: `#${tmpl.body}`, fontSize: '24px', paddingLeft: '20px' }}>
                    {(slide.rightColumn?.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              </div>
            </div>
        );
      case "timeline":
        return (
            <div className="fpm-content">
              <h2 style={{ color: `#${tmpl.highlight}`, fontSize: '50px', marginBottom: '30px' }}>{slide.title}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(slide.timelineItems || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: `#${tmpl.accent}` }} />
                    <div style={{ color: `#${tmpl.accent}`, fontSize: '24px', fontWeight: 'bold', width: '120px' }}>{t.year}</div>
                    <div style={{ color: `#${tmpl.body}`, fontSize: '20px', flex: 1 }}>{t.event}</div>
                  </div>
                ))}
              </div>
            </div>
        );
      default:
        return (
            <div className="fpm-content-wrap">
              <div className="fpm-content">
                <h2 style={{ color: `#${tmpl.highlight}`, fontSize: '50px', marginBottom: '30px' }}>{slide.title}</h2>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <ul style={{ margin: 0, paddingLeft: "10px", flex: 1, color: `#${tmpl.body}`, fontSize: '28px' }}>
                    {(slide.bullets || []).map((b, i) => (
                      <li key={i} style={{ marginBottom: '15px' }}>{b}</li>
                    ))}
                  </ul>
                  {slide.image && (
                    <div style={{ width: '40%', flexShrink: 0 }}>
                      <img src={slide.image} alt="Visual" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
        );
    }
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', borderBottom: '1px solid #334155' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>🏢 VisionText AI</Link>
            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
                >
                    {downloading ? "Generating..." : "⬇️ Download PPTX"}
                </button>
            </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'hidden' }}>
            <div ref={containerRef} style={{ width: '100%', maxWidth: '1200px', aspectRatio: '16/9', position: 'relative', background: `#${tmpl.bg}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: `#${tmpl.accent}`, zIndex: 10 }} />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 200 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -200 }}
                        transition={{ duration: 0.4 }}
                        style={{ position: 'absolute', inset: '8px 0 0 0', display: 'flex', padding: currentIndex === 0 ? '60px' : '40px', boxSizing: 'border-box', fontFamily: FONT_STYLES[data.fontStyle]?.body || 'sans-serif' }}
                    >
                        {renderSlideContent()}
                    </motion.div>
                </AnimatePresence>

                {currentIndex === 0 && <div style={{ position: 'absolute', bottom: '20px', right: '30px', color: `#${tmpl.sub}`, fontSize: '14px', fontStyle: 'italic' }}>VisionText AI</div>}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: `#${tmpl.accent}`, zIndex: 10 }} />
                <div style={{ position: 'absolute', bottom: '20px', left: '30px', color: `#${tmpl.sub}`, fontSize: '16px' }}>#{currentIndex + 1}</div>
            </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', background: '#1e293b' }}>
            <button 
               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
               disabled={currentIndex === 0}
               style={{ background: 'transparent', color: 'white', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1 }}
            >
                ← Previous
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
                {data.slides.map((_, i) => (
                    <button 
                       key={i} 
                       onClick={() => setCurrentIndex(i)}
                       style={{ width: '12px', height: '12px', borderRadius: '50%', background: i === currentIndex ? `#${tmpl.accent}` : '#475569', border: 'none', cursor: 'pointer', padding: 0 }}
                    />
                ))}
            </div>
            <button 
               onClick={() => setCurrentIndex(Math.min(data.slides.length - 1, currentIndex + 1))}
               disabled={currentIndex === data.slides.length - 1}
               style={{ background: 'transparent', color: 'white', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: currentIndex === data.slides.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === data.slides.length - 1 ? 0.5 : 1 }}
            >
                Next →
            </button>
        </div>
    </div>
  );
}
