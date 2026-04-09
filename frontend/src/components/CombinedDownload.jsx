import { useState } from "react";
import { Files, Download, Eye, X, BookOpen, Layers } from "lucide-react";
import FormatModal from "./modals/FormatModal";
import { buildCombinedText } from "../utils/download";

/**
 * Big "Download All in One" panel shown when multiple images are processed.
 * Combines all pages in order into a single document.
 */
export default function CombinedDownload({ results, addToast }) {
  const [showFormat, setShowFormat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const totalWords = results.reduce((s, r) => s + (r.wordCount || 0), 0);
  const combined = buildCombinedText(results);

  if (results.length <= 1) return null;

  return (
    <>
      <div className="relative group bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        {/* Animated background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-10">
          {/* Icon Box */}
          <div className="flex-shrink-0 w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Files className="w-10 h-10" />
          </div>

          <div className="flex-grow space-y-4">
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white">Full Document Export</h3>
              <p className="text-indigo-300/80 font-bold text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Combined {results.length} Pages · {totalWords.toLocaleString()} Words Total
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:border-indigo-500/20 transition-colors">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white">{i + 1}</span>
                  <span className="truncate max-w-[120px]">{r.fileName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700 transition-all shadow-xl active:scale-[0.98]"
            >
              <Eye className="w-5 h-5 text-indigo-400" />
              Preview All
            </button>
            <button
              onClick={() => setShowFormat(true)}
              className="flex items-center justify-center gap-2 px-10 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl border border-white transition-all shadow-2xl shadow-white/10 active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Download All
            </button>
          </div>
        </div>
      </div>

      {/* Combined Preview overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowPreview(false)}>
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Full Preview</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {results.length} Pages · Upload Order
                  </p>
                </div>
              </div>
              <button 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex-grow overflow-y-auto">
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl font-sans leading-relaxed text-slate-300 whitespace-pre-wrap select-text selection:bg-indigo-500 selection:text-white">
                {combined}
              </div>
            </div>

            <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3">
              <button 
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 transition-all"
                onClick={() => setShowPreview(false)}
              >
                Close
              </button>
              <button
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl border border-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                onClick={() => { setShowPreview(false); setShowFormat(true); }}
              >
                Download Combined
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormat && (
        <FormatModal
          text={combined}
          filename={`combined_${results.length}_pages`}
          title={`All ${results.length} pages grouped`}
          onClose={() => setShowFormat(false)}
          addToast={addToast}
        />
      )}
    </>
  );
}
