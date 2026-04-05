import { useRef, useCallback } from "react";

const VALID_TYPES = [
  "image/jpeg", "image/jpg", "image/png",
  "image/webp", "image/gif", "image/bmp",
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.ms-powerpoint", 
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "text/plain"
];

export default function DropZone({ previews, onFiles, onRemove, isDragging, setIsDragging }) {
  const inputRef = useRef(null);

  const processFiles = useCallback(
    (fileList) => {
      // Filter out files that don't match our valid types
      const arr = Array.from(fileList).filter((f) => VALID_TYPES.includes(f.type));
      if (arr.length) onFiles(arr);
    },
    [onFiles]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <section className="dropzone-area fade-in">
      {/* Drop area */}
      <div
        className={`dropzone ${isDragging ? "active" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        id="dropzone"
        aria-label="File upload area"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
          className="sr-only"
          id="file-input"
          onChange={(e) => processFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <span className="dropzone-icon">📁</span>
        <h3>{isDragging ? "Drop your files here!" : "Drag & drop documents here"}</h3>
        <p>Upload images, PDFs, Word, PPT & Text — combined dynamically</p>
        <button
          className="upload-btn"
          id="choose-images-btn"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          📁 Choose Files
        </button>
      </div>

      {/* Thumbnails row */}
      {previews.length > 0 && (
        <div className="preview-grid fade-in">
          {previews.map((preview, i) => {
            const isDoc = !preview.url.startsWith("blob:"); // very naive check, but fine since objectURLs are blob:. Actually doc thumbnails are generic icons. Let's use a dynamic display based on name.
            const ext = preview.name.split('.').pop().toLowerCase();
            const hideThumb = ['pdf','doc','docx','ppt','pptx','txt'].includes(ext);

            return (
              <div key={i} className="preview-card" title={preview.name}>
                <div className="preview-card-num">{i + 1}</div>
                {hideThumb ? (
                   <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#1f2937", borderRadius: 8 }}>
                     <span style={{ fontSize: "2rem" }}>📄</span>
                     <span style={{ fontSize: "0.65rem", marginTop: 4, color: "#9ca3af" }}>{ext.toUpperCase()}</span>
                   </div>
                ) : (
                  <img src={preview.url} alt={`preview-${i}`} />
                )}
                <button
                  className="preview-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                  id={`remove-btn-${i}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
