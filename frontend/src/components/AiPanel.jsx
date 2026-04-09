import { useState } from "react";
import { Sparkles, Globe, PenTool, Search, Bot, Download } from "lucide-react";
import FormatModal from "./modals/FormatModal";
import { aiSummarize, aiTranslate, aiFixGrammar, aiExtractInfo } from "../utils/api";
import { buildCombinedText } from "../utils/download";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese",
  "Hindi", "Arabic", "Chinese (Simplified)", "Japanese", "Korean",
  "Russian", "Dutch", "Turkish", "Polish", "Swedish",
  "Bengali", "Urdu", "Vietnamese", "Thai", "Greek",
];

export default function AiPanel({ results, addToast }) {
  // Source: 0 = "all combined", positive index = specific page
  const [sourceIdx, setSourceIdx] = useState(0); // 0 = combined
  const [targetLang, setTargetLang] = useState("Spanish");
  const [aiResult, setAiResult] = useState(null);
  const [aiLabel, setAiLabel] = useState("");
  const [loading, setLoading] = useState(null);
  const [showDownload, setShowDownload] = useState(false);

  // Get the text to analyze
  const getText = () => {
    if (sourceIdx === 0) return buildCombinedText(results); // all pages combined
    return results[sourceIdx - 1]?.text || "";
  };

  const run = async (toolName, apiFn, extra) => {
    const text = getText();
    if (!text || text.includes("[NO TEXT FOUND]") && text.length < 40) {
      addToast("No usable text to analyze.", "error");
      return;
    }
    setLoading(toolName);
    setAiResult(null);
    setAiLabel(toolName);
    try {
      const result = await apiFn(text, extra);
      setAiResult(result);
      addToast(`${toolName} complete!`, "success");
    } catch (err) {
      addToast(`${toolName} failed: ${err.message}`, "error");
    } finally {
      setLoading(null);
    }
  };

  const tools = [
    {
      id: "summarize",
      icon: <Sparkles className="w-6 h-6" />,
      name: "Summarize",
      desc: "Get key points and summary",
      fn: () => run("Summarize", aiSummarize),
    },
    {
      id: "translate",
      icon: <Globe className="w-6 h-6" />,
      name: "Translate",
      desc: `Translate to ${targetLang}`,
      fn: () => run("Translate", (text) => aiTranslate(text, targetLang)),
    },
    {
      id: "grammar",
      icon: <PenTool className="w-6 h-6" />,
      name: "Fix Grammar",
      desc: "Correct errors & improve clarity",
      fn: () => run("Fix Grammar", aiFixGrammar),
    },
    {
      id: "extract",
      icon: <Search className="w-6 h-6" />,
      name: "Extract Info",
      desc: "Names, dates, numbers, facts",
      fn: () => run("Extract Info", aiExtractInfo),
    },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">AI Tools</h3>
          <p className="text-sm font-bold text-slate-400">Run AI on individual pages or all pages combined</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Source selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Analyze Source</label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none appearance-none"
            value={sourceIdx}
            onChange={(e) => { setSourceIdx(+e.target.value); setAiResult(null); }}
          >
            <option value={0}>
              📑 All {results.length} pages combined
            </option>
            {results.map((r, i) => (
              <option key={i + 1} value={i + 1}>
                Page {i + 1}: {r.fileName}
              </option>
            ))}
          </select>
        </div>

        {/* Language selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Target Language (For Translation)</label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none appearance-none"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Tool buttons */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            id={`ai-${tool.id}-btn`}
            className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all overflow-hidden ${
              loading === tool.name 
                ? "border-indigo-500 bg-indigo-500/10" 
                : "border-slate-800 bg-slate-950 hover:border-indigo-500/50 hover:bg-slate-900"
            }`}
            disabled={loading !== null}
            onClick={tool.fn}
          >
            {loading === tool.name && (
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
            )}
            <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              loading === tool.name 
                 ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
                 : "bg-slate-800 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110"
            }`}>
              {loading === tool.name ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : tool.icon}
            </div>
            <span className="text-lg font-black text-white mb-1 relative z-10">{tool.name}</span>
            <span className="text-xs font-bold text-slate-500 line-clamp-2 relative z-10">{tool.desc}</span>
          </button>
        ))}
      </div>

      {/* AI result display */}
      {aiResult && (
        <div className="mt-8 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white">{aiLabel} Result</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {sourceIdx === 0
                    ? `Analyzed all ${results.length} pages`
                    : `Analyzed page ${sourceIdx}: ${results[sourceIdx - 1]?.fileName}`}
                </span>
              </div>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm w-full sm:w-auto justify-center"
              onClick={() => setShowDownload(true)}
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
          <div className="p-8 font-sans text-slate-300 leading-relaxed whitespace-pre-wrap select-text selection:bg-indigo-500/30">
             {aiResult}
          </div>
        </div>
      )}

      {showDownload && aiResult && (
        <FormatModal
          text={aiResult}
          filename={`ai_${aiLabel.toLowerCase().replace(/\s/g, "_")}_result`}
          title={`${aiLabel} result`}
          onClose={() => setShowDownload(false)}
          addToast={addToast}
        />
      )}
    </div>
  );
}
