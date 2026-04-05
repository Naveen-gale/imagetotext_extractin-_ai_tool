import { useState } from "react";

export default function PreviewModal({ result, pageNum, onClose, onDownload }) {
  const [copied, setCopied] = useState(false);
  const text = result.text || result.error || "[NO TEXT FOUND]";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: "1.6rem" }}>🔍</span>
          <div>
            <h3>
              Text Preview — Page {pageNum}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
              {result.fileName}
              {result.wordCount ? ` · ${result.wordCount.toLocaleString()} words` : ""}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Side-by-side: image + text */}
        <div className="preview-modal-body">
          {result.imageUrl && (
            <div className="preview-modal-img">
              <div className="text-box-label">Original Image</div>
              <img src={result.imageUrl} alt={result.fileName} />
              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--accent-3)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 8,
                }}
              >
                🔗 View full size on ImageKit
              </a>
            </div>
          )}
          <div className="preview-modal-text">
            <div className="text-box-label">📄 Extracted Text</div>
            <div className="preview-text-content">{text}</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Close
          </button>
          <button
            className="dl-btn dl-btn-copy"
            style={{ padding: "10px 18px" }}
            onClick={handleCopy}
          >
            {copied ? "✓ Copied!" : "📋 Copy Text"}
          </button>
          <button className="modal-confirm-btn" onClick={onDownload}>
            ⬇ Download This Page
          </button>
        </div>
      </div>
    </div>
  );
}
