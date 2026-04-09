import { useState, useCallback } from "react";
import { History as HistoryIcon, Rocket, Trash2, FileStack, Type, Search } from "lucide-react";
import Hero from "../components/Hero";
import DropZone from "../components/DropZone";
import ResultCard from "../components/ResultCard";
import CombinedDownload from "../components/CombinedDownload";
import AiPanel from "../components/AiPanel";
import { extractTextFromImages, saveExtractHistory } from "../utils/api";
import ExtractHistoryModal from "../components/modals/ExtractHistoryModal";

export default function Extract({ addToast }) {
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
        `✅ ${okCount}/${data.results.length} extracted successfully!`,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Controls */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowHistory(true)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-800 transition-all shadow-xl hover:text-white"
        >
          <HistoryIcon className="w-5 h-5 text-indigo-400" />
          History
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
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              className="group relative flex-grow sm:flex-grow-0 flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              onClick={processImages}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Extract Text ({files.length})
                </>
              )}
            </button>
            <button
              className="flex items-center justify-center gap-2 px-8 py-5 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold text-lg rounded-2xl border border-slate-800 hover:border-red-500/30 transition-all disabled:opacity-50"
              onClick={clearAll}
              disabled={loading}
            >
              <Trash2 className="w-6 h-6" />
              Clear
            </button>
          </div>
          
          {loading && (
            <div className="w-full max-w-xl h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-[gradient_2s_linear_infinite] w-full" />
            </div>
          )}
        </div>
      )}

      {/* Results section */}
      {results.length > 0 && (
        <section className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          {/* Stats bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem]">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <FileStack className="w-6 h-6" />
               </div>
               <h2 className="text-2xl font-black text-white">Extraction Results</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 font-bold text-sm">
              <span className="px-4 py-2 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
                {results.length} Page{results.length > 1 ? 's' : ''}
              </span>
              {totalWords > 0 && (
                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                  {totalWords.toLocaleString()} Words
                </span>
              )}
            </div>
          </div>

          <CombinedDownload results={results} addToast={addToast} />

          {/* Individual page cards */}
          <div className="space-y-6">
            {results.length > 1 && (
              <div className="flex items-center gap-3 px-2">
                <Type className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Individual Pages</span>
              </div>
            )}
            <div className="grid gap-6">
              {results.map((result, i) => (
                <ResultCard
                  key={i}
                  result={result}
                  index={i}
                  addToast={addToast}
                />
              ))}
            </div>
          </div>

          <AiPanel results={results} addToast={addToast} />
        </section>
      )}

      {/* Empty state */}
      {!loading && !results.length && !files.length && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 border-2 border-dashed border-slate-900 rounded-[3rem] animate-pulse">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-5xl">
            <Search className="w-12 h-12 text-slate-800" />
          </div>
          <p className="text-slate-600 font-bold text-lg">Upload files above to begin extraction</p>
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
    </div>
  );
}
