import { useState } from "react";
import { Eye, Copy, Download, Link as LinkIcon, FileText, Check, AlertCircle } from "lucide-react";
import FormatModal from "./modals/FormatModal";
import PreviewModal from "./modals/PreviewModal";
import { downloadTxt, downloadPdf, downloadDocx } from "../utils/download";

export default function ResultCard({ result, index, addToast }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = result.text || result.error || "[NO TEXT FOUND]";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    addToast("Text copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickDownload = async (fmt) => {
    try {
      const name = `page_${index + 1}_${result.fileName}`;
      if (fmt === "pdf") await downloadPdf(text, name);
      else if (fmt === "docx") await downloadDocx(text, name);
      else downloadTxt(text, name);
      addToast(`Page ${index + 1} downloaded as ${fmt.toUpperCase()}`, "success");
    } catch (e) {
      addToast(`Download failed: ${e.message}`, "error");
    }
  };

  return (
    <>
      <div className="group bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:bg-slate-900 hover:border-slate-700/50 hover:shadow-2xl shadow-slate-900/50 relative">
        {/* Page Badge */}
        <div className="absolute top-0 left-10 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-b-xl z-20 shadow-lg">
          Page {index + 1}
        </div>

        {/* Header Section */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/10">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white truncate max-w-[200px] sm:max-w-[300px]" title={result.fileName}>
                {result.fileName}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {result.wordCount ? `${result.wordCount.toLocaleString()} words` : "Empty"}
                </span>
                {result.success === false && (
                  <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                    <AlertCircle className="w-3 h-3" /> Error
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-all border border-slate-700/50"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${copied ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setShowFormat(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all border border-indigo-500 shadow-xl shadow-indigo-500/20 active:translate-y-0.5"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div className="grid md:grid-cols-[280px_1fr] gap-0">
          {/* Visual Side */}
          <div className="p-8 bg-slate-950/30 border-r border-slate-800/50 flex flex-col items-center justify-start gap-6">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
              {result.imageUrl ? (
                <img src={result.imageUrl} alt={result.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 italic">
                  <FileText className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-40 text-center">No Preview Available</span>
                </div>
              )}
            </div>
            
            {result.imageUrl && (
              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <LinkIcon className="w-3 h-3" /> View Original
              </a>
            )}
          </div>

          {/* Text Side */}
          <div className="p-8 flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Extracted Text Content</span>
            </div>
            
            <div className="relative group/text rounded-2xl bg-slate-950/50 border border-slate-800 p-6 min-h-[200px] max-h-[300px] overflow-y-auto">
               <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                 {text}
               </pre>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mt-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 whitespace-nowrap">Quick Download:</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={() => handleQuickDownload("pdf")} className="flex-1 sm:flex-none px-4 py-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/80 hover:text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">PDF</button>
                <button onClick={() => handleQuickDownload("docx")} className="flex-1 sm:flex-none px-4 py-2 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500/80 hover:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">DOCX</button>
                <button onClick={() => handleQuickDownload("txt")} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500/80 hover:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">TXT</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          result={result}
          pageNum={index + 1}
          onClose={() => setShowPreview(false)}
          onDownload={() => { setShowPreview(false); setShowFormat(true); }}
        />
      )}

      {showFormat && (
        <FormatModal
          text={text}
          filename={`page_${index + 1}_${result.fileName}`}
          title={`Page ${index + 1} — ${result.fileName}`}
          onClose={() => setShowFormat(false)}
          addToast={addToast}
        />
      )}
    </>
  );
}
