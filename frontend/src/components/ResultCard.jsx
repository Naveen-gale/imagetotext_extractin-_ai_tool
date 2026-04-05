import { useState } from "react";
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
      <div className="result-card fade-in" style={{ animationDelay: `${index * 0.07}s` }}>
        {/* Page number badge */}
        <div className="result-page-badge">Page {index + 1}</div>

        {/* Header row */}
        <div className="result-card-header">
          <div className="result-card-title">
            <div className="file-icon">🖼️</div>
            <div>
              <div className="result-card-filename">{result.fileName}</div>
              <div className="result-card-meta">
                {result.wordCount
                  ? `${result.wordCount.toLocaleString()} words · ${result.charCount?.toLocaleString()} chars`
                  : ""}
                {result.success === false && (
                  <span style={{ color: "#fca5a5" }}> ⚠ Extraction error</span>
                )}
              </div>
            </div>
          </div>
          <div className="result-card-actions">
            <button
              className="action-pill action-pill-preview"
              onClick={() => setShowPreview(true)}
              id={`preview-btn-${index}`}
            >
              👁 Preview
            </button>
            <button className="action-pill action-pill-copy" onClick={handleCopy}>
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
            <button
              className="action-pill action-pill-download"
              onClick={() => setShowFormat(true)}
              id={`download-btn-${index}`}
            >
              ⬇ Download
            </button>
          </div>
        </div>

        {/* Body: image or doc + text */}
        <div className="result-body">
          <div className="result-image-pane">
            {result.imageUrl ? (
              <>
                <img src={result.imageUrl} alt={result.fileName} />
                <a
                  className="img-link"
                  href={result.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  🔗 View on ImageKit
                </a>
              </>
            ) : (
              <div className="img-placeholder" style={{ display: 'flex', flexDirection: 'column', color: '#9ca3af' }}>
                <span style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</span>
                <span>Document Format</span>
              </div>
            )}
          </div>

          <div className="result-text-pane">
            <div className="text-box-label">📄 Extracted Text</div>
            <div className="text-box">{text}</div>

            {/* Quick download */}
            <div className="download-row">
              <span className="download-row-label">⬇ This page:</span>
              <button className="dl-btn dl-btn-pdf" onClick={() => handleQuickDownload("pdf")}>
                📄 PDF
              </button>
              <button className="dl-btn dl-btn-docx" onClick={() => handleQuickDownload("docx")}>
                📝 DOCX
              </button>
              <button className="dl-btn dl-btn-txt" onClick={() => handleQuickDownload("txt")}>
                📃 TXT
              </button>
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
