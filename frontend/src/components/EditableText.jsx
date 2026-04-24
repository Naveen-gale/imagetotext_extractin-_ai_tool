import { useState, useRef, useEffect, useCallback } from "react";
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
  children,
}) {
  const [isFocused, setIsFocused]     = useState(false);
  const [isHovered, setIsHovered]     = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const contentRef  = useRef(null);
  const hideTimer   = useRef(null);   // debounce for hiding toolbar
  const dragControls = useDragControls();

  const displaySize = fontSize || baseSize || 30;

  // ── 1. Set DOM value once on mount ──────────────────────────────────────────
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerText = value || "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Sync only when AI/external update changes value (not while typing) ───
  useEffect(() => {
    if (contentRef.current && !isFocused) {
      if (contentRef.current.innerText !== (value || "")) {
        contentRef.current.innerText = value || "";
      }
    }
  }, [value, isFocused]);

  // ── Hover handlers with debounce so toolbar never flashes away ───────────────
  const handleMouseEnter = useCallback(() => {
    clearTimeout(hideTimer.current);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Give the user 300ms to move the mouse onto the toolbar before hiding it
    hideTimer.current = setTimeout(() => setIsHovered(false), 300);
  }, []);

  // ── Blur handler ─────────────────────────────────────────────────────────────
  const handleBlur = () => {
    setIsFocused(false);
    if (contentRef.current) {
      onChange(contentRef.current.innerText);
    }
  };

  // ── AI actions ───────────────────────────────────────────────────────────────
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

  // Show toolbar when hovered (even after focus so users can use AI on focused text)
  const showToolbar = isHovered || isFocused;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={dragControls}
      className={`relative w-full ${isFocused ? "z-50" : ""}`}
      // ⬇ ENTIRE wrapper: both text + toolbar share ONE hover zone
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── AI Toolbar ──────────────────────────────────────────────────────── */}
      {showToolbar && (
        <div
          className="absolute -top-10 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl flex items-center p-1 gap-1 z-[60] select-none"
          // Prevent mouseLeave from the wrapper triggering while inside toolbar
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          // Prevent clicks on toolbar from blurring the editable below
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Size controls */}
          {onSizeChange && (
            <>
              <button
                className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors"
                onClick={() => onSizeChange(displaySize + 4)}
                title="Increase font size"
              >
                A+
              </button>
              <button
                className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors"
                onClick={() => onSizeChange(Math.max(8, displaySize - 4))}
                title="Decrease font size"
              >
                A-
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1 flex-shrink-0" />
            </>
          )}

          {/* AI buttons */}
          {loadingAction ? (
            <span className="px-2 py-1 text-indigo-400 font-bold text-xs flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              AI working…
            </span>
          ) : (
            <>
              <button
                className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold rounded text-xs transition-colors flex items-center gap-1 whitespace-nowrap"
                onClick={() => handleAIAction("spelling")}
                title="Fix spelling & grammar"
              >
                ✏️ Fix
              </button>
              <button
                className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold rounded text-xs transition-colors flex items-center gap-1 whitespace-nowrap"
                onClick={() => handleAIAction("autocomplete")}
                title="Autocomplete sentence"
              >
                ✨ Finish
              </button>
              <button
                className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold rounded text-xs transition-colors flex items-center gap-1 whitespace-nowrap"
                onClick={() => handleAIAction("improve")}
                title="Improve tone & style"
              >
                🚀 Tone
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Drag handle (only when hovered, not focused) ─────────────────── */}
      {isHovered && !isFocused && (
        <div
          className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-slate-500 opacity-60 hover:opacity-100 z-50 transition-opacity select-none"
          onPointerDown={(e) => dragControls.start(e)}
          title="Drag to reposition"
        >
          ⋮⋮
        </div>
      )}

      {/* ── Editable content ─────────────────────────────────────────────── */}
      <Component
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`${className} transition-colors duration-150 cursor-text outline-none rounded-md px-2 ${
          isFocused
            ? "bg-slate-800/50 border border-dashed border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
            : isHovered
            ? "border border-dashed border-slate-600/70"
            : "border border-dashed border-transparent"
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onInput={() => {
          if (contentRef.current) onChange(contentRef.current.innerText);
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...style,
          fontSize: `${displaySize}px`,
          minWidth: "10px",
          minHeight: "1em",
          display: isBullet ? "list-item" : "block",
          wordBreak: "break-word",
        }}
        spellCheck="false"
        data-placeholder={placeholder}
      />

      {/* Slot for any children rendered inside the wrapper (e.g. add/remove buttons) */}
      {children}
    </motion.div>
  );
}
