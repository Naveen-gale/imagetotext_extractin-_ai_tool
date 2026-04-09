import { useState, useEffect } from "react";
import { History, Trash2, X, FolderOpen, AlertCircle } from "lucide-react";
import { getExtractHistory, deleteExtractHistoryItem, clearAllExtractHistory } from "../../utils/api";

export default function ExtractHistoryModal({ onClose, onLoadHistoryItem }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getExtractHistory();
      setHistory(data || []);
    } catch (err) {
      setError("Failed to load extract history: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExtractHistoryItem(id);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all extraction history? This cannot be undone.")) return;
    try {
      await clearAllExtractHistory();
      setHistory([]);
    } catch (err) {
      setError("Failed to clear extraction history.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500" 
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
               <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Extraction History</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                 Your past text extractions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
               <button 
                 onClick={handleClearAll} 
                 className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm transition-all border border-red-500/20"
               >
                 <Trash2 className="w-4 h-4" />
                 <span className="hidden sm:inline">Clear All</span>
               </button>
            )}
            <button 
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold" 
              onClick={onClose}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto w-full">
          {loading && (
             <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading history...</span>
             </div>
          )}
          {error && (
             <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <span className="text-red-500 font-bold">{error}</span>
             </div>
          )}
          
          {!loading && history.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-slate-800 rounded-3xl">
                <History className="w-12 h-12 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-400">No extraction history found</h3>
                <p className="text-slate-500">Extract some text from images to see them here.</p>
             </div>
          )}

          <div className="grid gap-4">
            {history.map((item) => (
               <div key={item._id} className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
                 <div className="flex-1 min-w-0 pr-4">
                   <h3 className="text-lg font-black text-white mb-2 truncate" title={item.results[0]?.fileName || "Extracted Content"}>
                     {(item.results[0]?.fileName || "Extracted Content").length > 50 ? (item.results[0]?.fileName || "Extracted Content").substring(0, 50) + "..." : (item.results[0]?.fileName || "Extracted Content")}
                   </h3>
                   <div className="flex flex-wrap items-center gap-3 mt-2">
                     <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-md">
                        📄 {item.results.length} files
                     </span>
                     <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-md border border-slate-700">
                        📝 {item.totalWords} words
                     </span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 sm:mt-0 ml-auto sm:ml-0">
                        📅 {new Date(item.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                   <button 
                     onClick={() => onLoadHistoryItem(item)}
                     className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all focus:ring-4 ring-indigo-500/20 active:scale-95"
                   >
                     <FolderOpen className="w-4 h-4" /> Open
                   </button>
                   <button 
                     onClick={() => handleDelete(item._id)}
                     className="flex items-center justify-center bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 border border-slate-700 hover:border-red-500/30 p-3 rounded-xl transition-all active:scale-95"
                     title="Delete"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
