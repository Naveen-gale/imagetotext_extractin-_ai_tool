import { useState, useEffect } from "react";
import { getPptHistory, deletePptHistoryItem, clearAllPptHistory } from "../../utils/api";

export default function HistoryModal({ onClose, onLoadHistoryItem }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getPptHistory();
      setHistory(data || []);
    } catch (err) {
      setError("Failed to load history: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePptHistoryItem(id);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all history? This cannot be undone.")) return;
    try {
      await clearAllPptHistory();
      setHistory([]);
    } catch (err) {
      setError("Failed to clear history.");
    }
  };

  return (
    <div className="fpm-overlay" role="dialog" aria-modal="true" onClick={onClose} style={{ zIndex: 1000, background: 'rgba(0,0,0,0.8)' }}>
      <div className="fpm-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', background: '#1e1e2e', borderRadius: '16px', border: '1px solid #333' }}>
        
        <div className="fpm-header" style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '24px' }}>🕰️ Presentation History</h2>
          <div>
            {history.length > 0 && (
               <button onClick={handleClearAll} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginRight: '16px', fontWeight: 'bold' }}>
                 🗑️ Clear All
               </button>
            )}
            <button onClick={onClose} style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ color: 'white', textAlign: 'center' }}>Loading history...</div>}
          {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}
          
          {!loading && history.length === 0 && (
             <div style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>No history found. Generate some presentations!</div>
          )}

          <div style={{ display: 'grid', gap: '16px' }}>
            {history.map((item) => (
               <div key={item._id} style={{ background: '#2a2a3c', padding: '16px', borderRadius: '12px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ flex: 1, paddingRight: '20px' }}>
                   <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                     {item.prompt}
                   </h3>
                   <div style={{ color: '#aaa', fontSize: '14px', display: 'flex', gap: '16px' }}>
                     <span>📑 {item.slideCount} slides</span>
                     <span>🎨 {item.template}</span>
                     <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                   </div>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <button 
                     onClick={() => onLoadHistoryItem(item)}
                     style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                   >
                     📂 Open
                   </button>
                   <button 
                     onClick={() => handleDelete(item._id)}
                     style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                     title="Delete"
                   >
                     ✕
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
