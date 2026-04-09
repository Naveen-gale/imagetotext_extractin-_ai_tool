import { useRef, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";

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
    <section className="space-y-8 animate-in fade-in duration-500">
      <div
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 overflow-hidden ${
          isDragging 
            ? "border-indigo-500 bg-indigo-500/10" 
            : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/80"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className={`mx-auto w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110 bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'}`}>
          <Upload className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {isDragging ? "Drop your files here!" : "Drag & drop documents here"}
        </h3>
        <p className="text-slate-400 text-sm mb-8">
          Upload images, PDFs, Word, PPT & Text documents
        </p>
        
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all border border-indigo-500 shadow-lg shadow-indigo-500/20 active:translate-y-0.5"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Choose Files
        </button>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {previews.map((preview, i) => {
            const ext = preview.name.split('.').pop().toLowerCase();
            const hideThumb = ['pdf','doc','docx','ppt','pptx','txt'].includes(ext);

            return (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all">
                <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                  {i + 1}
                </div>
                
                {hideThumb ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50 text-slate-400">
                     <FileText className="w-8 h-8 mb-1" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{ext}</span>
                   </div>
                ) : (
                  <img src={preview.url} alt={`preview-${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                )}
                
                <button
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
                
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] text-white truncate font-medium">
                    {preview.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
