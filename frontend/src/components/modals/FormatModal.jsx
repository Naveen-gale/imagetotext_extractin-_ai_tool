import { useState } from "react";
import { Download, X, FileText, File, FileCode2 } from "lucide-react";
import { downloadTxt, downloadPdf, downloadDocx } from "../../utils/download";

export default function FormatModal({ text, filename, title, onClose, addToast }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const formats = [
    {
      id: "pdf",
      label: "PDF",
      desc: "Best for sharing & printing",
      icon: <FileText className="w-8 h-8" />,
      color: "text-red-400",
      bgSelected: "bg-red-500/10",
      borderSelected: "border-red-500",
      hover: "hover:border-red-500/50 hover:bg-red-500/5",
    },
    {
      id: "docx",
      label: "Word (.docx)",
      desc: "Editable in Microsoft Word",
      icon: <File className="w-8 h-8" />,
      color: "text-blue-400",
      bgSelected: "bg-blue-500/10",
      borderSelected: "border-blue-500",
      hover: "hover:border-blue-500/50 hover:bg-blue-500/5",
    },
    {
      id: "txt",
      label: "Plain Text",
      desc: "Simple & lightweight",
      icon: <FileCode2 className="w-8 h-8" />,
      color: "text-emerald-400",
      bgSelected: "bg-emerald-500/10",
      borderSelected: "border-emerald-500",
      hover: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
    },
  ];

  const handleDownload = async () => {
    if (!selected) return;
    
    // Prompt the user for a filename before entering the loading state
    const requestedName = window.prompt("Enter a filename for your download:", filename);
    // If user clicks Cancel, requestedName is null. So we abort.
    if (requestedName === null) return;
    const finalFilename = requestedName.trim() || filename;

    setLoading(true);
    try {
      if (selected === "pdf") await downloadPdf(text, finalFilename);
      else if (selected === "docx") await downloadDocx(text, finalFilename);
      else downloadTxt(text, finalFilename);
      addToast?.(`Downloaded as ${selected.toUpperCase()} ✓`, "success");
      onClose();
    } catch (err) {
      addToast?.(`Download failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
               <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Download Format</h3>
              {title && (
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {title}
                </p>
              )}
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all" 
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 grid sm:grid-cols-3 gap-6">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={`flex flex-col items-center text-center p-8 rounded-3xl border-2 transition-all ${selected === f.id ? `${f.bgSelected} ${f.borderSelected}` : `border-slate-800 bg-slate-950/50 ${f.hover}`}`}
            >
              <div className={`mb-4 ${selected === f.id ? f.color : 'text-slate-500'}`}>
                {f.icon}
              </div>
              <span className={`text-lg font-black mb-1 ${selected === f.id ? f.color : 'text-slate-300'}`}>
                {f.label}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {f.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3">
          <button 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 transition-all" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex items-center justify-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl border border-indigo-500 shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all"
            disabled={!selected || loading}
            onClick={handleDownload}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Downloading...</>
            ) : (
              <><Download className="w-5 h-5" /> Download {selected ? selected.toUpperCase() : ""}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
