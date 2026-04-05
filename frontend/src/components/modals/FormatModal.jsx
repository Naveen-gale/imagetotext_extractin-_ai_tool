import { useState } from "react";
import { downloadTxt, downloadPdf, downloadDocx } from "../../utils/download";

export default function FormatModal({ text, filename, title, onClose, addToast }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const formats = [
    {
      id: "pdf",
      label: "PDF",
      desc: "Best for sharing & printing",
      icon: "📄",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.35)",
    },
    {
      id: "docx",
      label: "Word (.docx)",
      desc: "Editable in Microsoft Word",
      icon: "📝",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.35)",
    },
    {
      id: "txt",
      label: "Plain Text",
      desc: "Simple & lightweight",
      icon: "📃",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.35)",
    },
  ];

  const handleDownload = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      if (selected === "pdf") await downloadPdf(text, filename);
      else if (selected === "docx") await downloadDocx(text, filename);
      else downloadTxt(text, filename);
      addToast?.(`Downloaded as ${selected.toUpperCase()} ✓`, "success");
      onClose();
    } catch (err) {
      addToast?.(`Download failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box format-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: "1.6rem" }}>⬇️</span>
          <div>
            <h3>Choose Download Format</h3>
            {title && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                {title}
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="format-grid">
          {formats.map((f) => (
            <button
              key={f.id}
              className={`format-card ${selected === f.id ? "format-card-selected" : ""}`}
              style={{
                background: selected === f.id ? f.bg : "rgba(255,255,255,0.02)",
                borderColor: selected === f.id ? f.color : "rgba(255,255,255,0.08)",
              }}
              onClick={() => setSelected(f.id)}
            >
              <span className="format-icon">{f.icon}</span>
              <span
                className="format-label"
                style={{ color: selected === f.id ? f.color : "var(--text-primary)" }}
              >
                {f.label}
              </span>
              <span className="format-desc">{f.desc}</span>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-confirm-btn"
            disabled={!selected || loading}
            onClick={handleDownload}
          >
            {loading ? (
              <><span className="spinner-small" /> Downloading…</>
            ) : (
              <>⬇ Download {selected ? selected.toUpperCase() : ""}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
