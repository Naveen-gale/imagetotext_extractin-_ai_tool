import { useState } from "react";
import { Search, X, Copy, ExternalLink, Download } from "lucide-react";

export default function PreviewModal({ result, pageNum, onClose, onDownload }) {
  const [copied, setCopied] = useState(false);
  const text = result.text || result.error || "[NO TEXT FOUND]";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
               <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Text Preview — Page {pageNum}
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                {result.fileName}
                {result.wordCount ? ` · ${result.wordCount.toLocaleString()} words` : ""}
              </p>
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold" 
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side flex container */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-6 gap-6">
          
          {/* Image column */}
          {result.imageUrl && (
            <div className="w-full lg:w-1/3 flex flex-col gap-3 min-h-0">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 flex-shrink-0">
                Original Image
              </div>
              <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                <img 
                  src={result.imageUrl} 
                  alt={result.fileName} 
                  className="max-w-full max-h-full object-contain p-2"
                />
              </div>
              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                View full size on ImageKit
              </a>
            </div>
          )}

          {/* Text content column */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 flex-shrink-0">
              📄 Extracted Text
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl overflow-y-auto font-sans text-slate-300 leading-relaxed whitespace-pre-wrap select-text selection:bg-indigo-500/30 min-h-[300px]">
              {text}
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
          <button 
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all active:scale-95 text-sm" 
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl border transition-all active:scale-95 text-sm ${
              copied 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button 
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl border border-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm" 
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
            Download Page
          </button>
        </div>
      </div>
    </div>
  );
}
