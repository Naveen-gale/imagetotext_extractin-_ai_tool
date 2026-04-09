import { useState, useCallback } from "react";
import Hero from "../components/Hero";
import DropZone from "../components/DropZone";
import ResultCard from "../components/ResultCard";
import CombinedDownload from "../components/CombinedDownload";
import AiPanel from "../components/AiPanel";
import { extractTextFromImages, saveExtractHistory } from "../utils/api";
import ExtractHistoryModal from "../components/modals/ExtractHistoryModal";

export default function Home({ addToast }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFiles = useCallback(
    (newFiles) => {
      if (files.length + newFiles.length > 12) {
        addToast("Maximum 12 files allowed.", "error");
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [
        ...prev,
        ...newFiles.map((f) => ({
          url: URL.createObjectURL(f),
          name: f.name,
        })),
      ]);
      addToast(
        `${newFiles.length} file${newFiles.length > 1 ? "s" : ""} added`,
        "info"
      );
    },
    [files.length, addToast]
  );

  const removeFile = useCallback(
    (index) => {
      URL.revokeObjectURL(previews[index].url);
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [previews]
  );

  const clearAll = useCallback(() => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setPreviews([]);
    setResults([]);
  }, [previews]);

  // ── Process images ─────────────────────────────────────────────────────────
  const processImages = async () => {
    if (!files.length) {
      addToast("Please add at least one file.", "error");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const data = await extractTextFromImages(files);
      const okCount = (data.results || []).filter((r) => r.success).length;
      setResults(data.results || []);
      addToast(
        `✅ ${okCount}/${data.results.length} file${data.results.length > 1 ? "s" : ""} extracted successfully!`,
        "success"
      );
      
      const totalWordsCount = (data.results || []).reduce((s, r) => s + (r.wordCount || 0), 0);
      saveExtractHistory({
        results: data.results || [],
        totalWords: totalWordsCount
      }).catch(err => console.error("Extract history save failed:", err));
      
    } catch (err) {
      addToast(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const totalWords = results.reduce((s, r) => s + (r.wordCount || 0), 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '10px 20px', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
        <button onClick={() => setShowHistory(true)} style={{ marginLeft: 'auto', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🕰️ Extraction History
        </button>
      </div>
      <Hero />

      <DropZone
        previews={previews}
        onFiles={handleFiles}
        onRemove={removeFile}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />

      {/* Action buttons */}
      {files.length > 0 && (
        <div className="process-area">
          <div className="process-btn-row">
            <button
              className="process-btn"
              onClick={processImages}
              disabled={loading}
              id="extract-btn"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Extracting {files.length} file{files.length > 1 ? "s" : ""}…
                </>
              ) : (
                <>
                  🚀 Extract Text from {files.length} File{files.length > 1 ? "s" : ""}
                </>
              )}
            </button>
            <button
              className="clear-btn"
              onClick={clearAll}
              disabled={loading}
              id="clear-btn"
            >
              🗑 Clear All
            </button>
          </div>
          {loading && (
            <div className="progress-bar-wrap">
              <div className="progress-bar" />
            </div>
          )}
        </div>
      )}

      {/* Results section */}
      {results.length > 0 && (
        <section className="results-section">

          {/* Stats bar */}
          <div className="results-header">
            <h2>📋 Extracted Results</h2>
            <div className="results-stats">
              <span className="stat-badge">
                📄 {results.length} page{results.length > 1 ? "s" : ""}
              </span>
              {totalWords > 0 && (
                <span className="stat-badge">
                  📝 {totalWords.toLocaleString()} words total
                </span>
              )}
            </div>
          </div>

          {/* ★ COMBINED DOWNLOAD — shown when multiple files */}
          <CombinedDownload results={results} addToast={addToast} />

          {/* Individual page cards */}
          <div style={{ marginTop: results.length > 1 ? 24 : 0 }}>
            {results.length > 1 && (
              <div className="pages-label">
                <span>📄 Individual Pages</span>
              </div>
            )}
            {results.map((result, i) => (
              <ResultCard
                key={i}
                result={result}
                index={i}
                addToast={addToast}
              />
            ))}
          </div>

          {/* AI Features */}
          <AiPanel results={results} addToast={addToast} />
        </section>
      )}

      {/* Empty state */}
      {!loading && !results.length && !files.length && (
        <div className="empty-state">
          <div className="empty-state-icon">🔮</div>
          <p>Upload files above to start extracting text with VisionText AI</p>
        </div>
      )}

      {showHistory && (
        <ExtractHistoryModal 
           onClose={() => setShowHistory(false)}
           onLoadHistoryItem={(item) => {
             setResults(item.results);
             setFiles([]);
             setPreviews([]);
             setShowHistory(false);
           }}
        />
      )}
    </>
  );
}
