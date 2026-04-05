import { useState } from "react";
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
      <div className="combined-download-box fade-in">
        {/* Icon + info */}
        <div className="combined-download-icon">📑</div>

        <div className="combined-download-info">
          <h3>📚 Download All {results.length} Pages as One Document</h3>
          <p>
            All extracted text combined in upload order &nbsp;·&nbsp;{" "}
            <strong>{totalWords.toLocaleString()} words</strong> total &nbsp;·&nbsp;{" "}
            {results.length} pages
          </p>
          <div className="combined-page-list">
            {results.map((r, i) => (
              <span key={i} className="combined-page-tag">
                <span className="combined-page-num">{i + 1}</span>
                {r.fileName}
              </span>
            ))}
          </div>
        </div>

        <div className="combined-download-actions">
          <button
            className="combined-preview-btn"
            onClick={() => setShowPreview(true)}
            id="combined-preview-btn"
          >
            👁 Preview Combined
          </button>
          <button
            className="combined-dl-btn"
            onClick={() => setShowFormat(true)}
            id="combined-download-btn"
          >
            ⬇ Download Combined Document
          </button>
        </div>
      </div>

      {/* Combined Preview overlay */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div
            className="modal-box preview-modal"
            style={{ maxWidth: 760 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span style={{ fontSize: "1.6rem" }}>📑</span>
              <div>
                <h3>Combined Document Preview</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  {results.length} pages · {totalWords.toLocaleString()} words total
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div style={{ padding: "0 24px 4px" }}>
              <div className="preview-text-content" style={{ maxHeight: 500 }}>
                {combined}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowPreview(false)}>
                Close
              </button>
              <button
                className="modal-confirm-btn"
                onClick={() => { setShowPreview(false); setShowFormat(true); }}
              >
                ⬇ Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Format selection */}
      {showFormat && (
        <FormatModal
          text={combined}
          filename={`combined_${results.length}_pages_document`}
          title={`All ${results.length} pages combined in order`}
          onClose={() => setShowFormat(false)}
          addToast={addToast}
        />
      )}
    </>
  );
}
