import { useState, useRef, useEffect } from "react";
import { improveTextApi } from "../utils/api";

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
    <div
      className={`editable-text-container ${isFocused ? "focused" : ""} ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative", width: "100%" }}
    >
      {(showToolbar || (isHovered && !isFocused)) && (
        <div className="editable-toolbar" onMouseDown={(e) => e.preventDefault()}>
          <button className="tb-btn" onClick={() => onSizeChange((displaySize) + 5)} title="Increase Size">A+</button>
          <button className="tb-btn" onClick={() => onSizeChange(Math.max(10, (displaySize) - 5))} title="Decrease Size">A-</button>
          <div className="tb-divider" />
          {loadingAction ? (
            <span className="tb-loading">⏳ AI...</span>
          ) : (
            <>
              <button className="tb-btn ai-btn" onClick={() => handleAIAction("spelling")} title="Fix Spelling">✏️ Fix</button>
              <button className="tb-btn ai-btn" onClick={() => handleAIAction("autocomplete")} title="Autocomplete">✨ Finish</button>
              <button className="tb-btn ai-btn" onClick={() => handleAIAction("improve")} title="Improve">🚀 Tone</button>
            </>
          )}
        </div>
      )}

      <Component
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`editable-content ${className}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...style,
          fontSize: `${displaySize}px`,
          outline: "none",
          minWidth: "10px",
          minHeight: "1em",
          display: isBullet ? "list-item" : "block",
          border: isFocused ? "1px dashed rgba(168,85,247,0.5)" : "1px dashed transparent",
          background: isFocused ? "rgba(255,255,255,0.05)" : "transparent",
          padding: isFocused ? "2px 8px" : "2px 8px",
          borderRadius: "4px",
          transition: "var(--transition)",
          cursor: "text"
        }}
        data-placeholder={placeholder}
      >
        {value}
      </Component>
    </div>
  );
}
