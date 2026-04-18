import { useState, useRef, useEffect } from "react";
import { improveTextApi } from "../utils/api";
import { motion, useDragControls } from "framer-motion";

export default function EditableText({
  value,
  onChange,
  onSizeChange,
  fontSize,
  baseSize,
  placeholder = "Enter text...",
  component = "div",
  className = "",
  style = {},
  isBullet = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  
  const contentRef = useRef(null);
  const dragControls = useDragControls();

  const displaySize = fontSize || baseSize || 30;

  // Sync value if external changes happen
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== value && !isFocused) {
      contentRef.current.innerText = value || "";
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    // Slight delay to allow toolbar clicks
    setTimeout(() => {
      setShowToolbar(false);
    }, 200);
    if (contentRef.current) {
      onChange(contentRef.current.innerText);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowToolbar(true);
  };

  const handleAIAction = async (action) => {
    if (!contentRef.current) return;
    const currentText = contentRef.current.innerText;
    if (!currentText.trim()) return;

    setLoadingAction(action);
    try {
      const improved = await improveTextApi(currentText, action);
      contentRef.current.innerText = improved;
      onChange(improved);
    } catch (e) {
      console.error(e);
      alert("AI Action Failed: " + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const Component = component;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={dragControls}
      className={`relative w-full group ${isFocused ? "z-50" : ""} ${isHovered ? "" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isHovered && !isFocused) && (
        <div 
          className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-slate-500 opacity-50 hover:opacity-100 z-50 transition-opacity"
          onPointerDown={(e) => dragControls.start(e)}
          title="Drag to move"
        >
          ⋮⋮
        </div>
      )}
      {(showToolbar || (isHovered && !isFocused)) && (
        <div 
          className="absolute -top-10 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl flex items-center p-1 gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200" 
          onMouseDown={(e) => e.preventDefault()}
        >
          <button className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors" onClick={() => onSizeChange((displaySize) + 5)} title="Increase Size">A+</button>
          <button className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors" onClick={() => onSizeChange(Math.max(10, (displaySize) - 5))} title="Decrease Size">A-</button>
          
          <div className="w-[1px] h-4 bg-slate-700 mx-1" />
          
          {loadingAction ? (
            <span className="px-2 py-1 text-indigo-400 font-bold text-xs flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              AI...
            </span>
          ) : (
            <>
              <button className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold rounded text-xs transition-colors flex items-center gap-1" onClick={() => handleAIAction("spelling")} title="Fix Spelling">✏️ Fix</button>
              <button className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold rounded text-xs transition-colors flex items-center gap-1" onClick={() => handleAIAction("autocomplete")} title="Autocomplete">✨ Finish</button>
              <button className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold rounded text-xs transition-colors flex items-center gap-1" onClick={() => handleAIAction("improve")} title="Improve Tone">🚀 Tone</button>
            </>
          )}
        </div>
      )}

      <Component
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`${className} transition-all duration-200 ease-in-out cursor-text outline-none rounded-md px-2 ${
          isFocused 
            ? "bg-slate-800/50 border border-dashed border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
            : "border border-dashed border-transparent hover:border-slate-800"
        }`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...style,
          fontSize: `${displaySize}px`,
          minWidth: "10px",
          minHeight: "1em",
          display: isBullet ? "list-item" : "block",
        }}
        data-placeholder={placeholder}
      >
        {value}
      </Component>
    </motion.div>
  );
}
