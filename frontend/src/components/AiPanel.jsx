import { useState } from "react";
import FormatModal from "./modals/FormatModal";
import { aiSummarize, aiTranslate, aiFixGrammar, aiExtractInfo } from "../utils/api";
import { buildCombinedText } from "../utils/download";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese",
  "Hindi", "Arabic", "Chinese (Simplified)", "Japanese", "Korean",
  "Russian", "Dutch", "Turkish", "Polish", "Swedish",
  "Bengali", "Urdu", "Vietnamese", "Thai", "Greek",
];

export default function AiPanel({ results, addToast }) {
  // Source: 0 = "all combined", positive index = specific page
  const [sourceIdx, setSourceIdx] = useState(0); // 0 = combined
  const [targetLang, setTargetLang] = useState("Spanish");
  const [aiResult, setAiResult] = useState(null);
  const [aiLabel, setAiLabel] = useState("");
  const [loading, setLoading] = useState(null);
  const [showDownload, setShowDownload] = useState(false);

  // Get the text to analyze
  const getText = () => {
    if (sourceIdx === 0) return buildCombinedText(results); // all pages combined
    return results[sourceIdx - 1]?.text || "";
  };

  const run = async (toolName, apiFn, extra) => {
    const text = getText();
    if (!text || text.includes("[NO TEXT FOUND]") && text.length < 40) {
      addToast("No usable text to analyze.", "error");
      return;
    }
    setLoading(toolName);
    setAiResult(null);
    setAiLabel(toolName);
    try {
      const result = await apiFn(text, extra);
      setAiResult(result);
      addToast(`${toolName} complete!`, "success");
    } catch (err) {
      addToast(`${toolName} failed: ${err.message}`, "error");
    } finally {
      setLoading(null);
    }
  };

  const tools = [
    {
      id: "summarize",
      icon: "✨",
      name: "Summarize",
      desc: "Get key points and summary",
      fn: () => run("Summarize", aiSummarize),
    },
    {
      id: "translate",
      icon: "🌍",
      name: "Translate",
      desc: `Translate to ${targetLang}`,
      fn: () => run("Translate", (text) => aiTranslate(text, targetLang)),
    },
    {
      id: "grammar",
      icon: "✏️",
      name: "Fix Grammar",
      desc: "Correct errors & improve clarity",
      fn: () => run("Fix Grammar", aiFixGrammar),
    },
    {
      id: "extract",
      icon: "🔍",
      name: "Extract Info",
      desc: "Names, dates, numbers, facts",
      fn: () => run("Extract Info", aiExtractInfo),
    },
  ];

  return (
    <div className="ai-panel fade-in">
      {/* Header */}
      <div className="ai-panel-header">
        <span className="ai-panel-icon">🤖</span>
        <div>
          <h3>AI Features devlaped by naveen</h3>
          <p>Run AI on individual pages or all pages combined</p>
        </div>
      </div>

      {/* Source selector */}
      <div className="ai-source-select-wrap">
        <label>Analyze:</label>
        <select
          value={sourceIdx}
          onChange={(e) => { setSourceIdx(+e.target.value); setAiResult(null); }}
        >
          <option value={0}>
            📑 All {results.length} pages combined
          </option>
          {results.map((r, i) => (
            <option key={i + 1} value={i + 1}>
              Page {i + 1}: {r.fileName}
            </option>
          ))}
        </select>
      </div>

      {/* Language selector */}
      <div className="translate-options">
        <label>🌐 Translate to:</label>
        <select
          className="lang-select"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Tool buttons */}
      <div className="ai-tools-grid">
        {tools.map((tool) => (
          <button
            key={tool.id}
            id={`ai-${tool.id}-btn`}
            className={`ai-tool-btn ${loading === tool.name ? "loading" : ""}`}
            disabled={loading !== null}
            onClick={tool.fn}
          >
            <span className="ai-tool-icon">
              {loading === tool.name ? "⏳" : tool.icon}
            </span>
            <span className="ai-tool-name">{tool.name}</span>
            <span className="ai-tool-desc">{tool.desc}</span>
          </button>
        ))}
      </div>

      {/* AI result display */}
      {aiResult && (
        <div className="ai-result-box fade-in">
          <div className="ai-result-label">
            <span>✨</span>
            <span>
              {aiLabel} —{" "}
              {sourceIdx === 0
                ? `All ${results.length} pages`
                : `Page ${sourceIdx}: ${results[sourceIdx - 1]?.fileName}`}
            </span>
            <div style={{ marginLeft: "auto" }}>
              <button
                className="action-pill action-pill-download"
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                onClick={() => setShowDownload(true)}
              >
                ⬇ Download Result
              </button>
            </div>
          </div>
          <div className="ai-result-content">{aiResult}</div>
        </div>
      )}

      {showDownload && aiResult && (
        <FormatModal
          text={aiResult}
          filename={`ai_${aiLabel.toLowerCase().replace(/\s/g, "_")}_result`}
          title={`${aiLabel} result`}
          onClose={() => setShowDownload(false)}
          addToast={addToast}
        />
      )}
    </div>
  );
}
