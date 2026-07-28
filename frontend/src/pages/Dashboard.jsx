import { Link } from "react-router-dom";
import { FileText, Presentation, FileImage, Sparkles, ArrowUpRight, ScanText, Layers, Wand2, Download } from "lucide-react";

// ─── Feature row data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    num: "01",
    to: "/extract",
    label: "Text Extraction",
    title: "Smart\nExtraction",
    description:
      "Drop in any PDF, DOCX, PPT, or scanned image. VisionText's AI reads, cleans and formats every word — instantly ready to copy, translate, or summarize.",
    color: "indigo",
    accent: "#6366f1",
    accentLight: "rgba(99,102,241,0.12)",
    accentBorder: "rgba(99,102,241,0.25)",
    tags: ["PDF", "DOCX", "PPT", "PNG / JPG", "Auto-format"],
    icon: <ScanText strokeWidth={1.5} />,
    highlights: [
      { icon: <FileImage className="w-4 h-4" />, text: "Images + Documents" },
      { icon: <Wand2 className="w-4 h-4" />, text: "AI-powered cleanup" },
      { icon: <Download className="w-4 h-4" />, text: "Export instantly" },
    ],
  },
  {
    num: "02",
    to: "/aippt",
    label: "AI Presentation",
    title: "PPT\nStudio",
    description:
      "Type a topic or drag in an inspiration image. The AI generates a complete, beautifully themed presentation — slides, layout, and content in seconds.",
    color: "purple",
    accent: "#a855f7",
    accentLight: "rgba(168,85,247,0.12)",
    accentBorder: "rgba(168,85,247,0.25)",
    tags: ["Auto Slides", "31+ Themes", "ML Theme AI", "Export .pptx"],
    icon: <Presentation strokeWidth={1.5} />,
    highlights: [
      { icon: <Layers className="w-4 h-4" />, text: "Up to 20 slides" },
      { icon: <Sparkles className="w-4 h-4" />, text: "AI Theme Prediction" },
      { icon: <Download className="w-4 h-4" />, text: "Download .pptx" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-14 text-slate-100 w-full">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold tracking-widest uppercase text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          VisionText AI Platform
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black tracking-tight leading-[1.1] mb-5 text-white">
          What will you{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            create
          </span>{" "}
          today?
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Two powerful AI tools. Pick your mission.
        </p>
      </div>

      {/* ── Feature Rows ───────────────────────────────────── */}
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.num}
            to={f.to}
            id={`dashboard-feature-${f.num}`}
            className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border transition-all duration-300"
            style={{
              background: "rgba(15,23,42,0.9)",
              borderColor: "rgba(51,65,85,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = f.accentBorder;
              e.currentTarget.style.boxShadow = `0 0 40px ${f.accentLight}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Left accent bar */}
            <div
              className="hidden sm:block w-1 flex-shrink-0 transition-all duration-300"
              style={{ background: f.accentBorder }}
            />
            <div
              className="sm:hidden h-1 w-full flex-shrink-0"
              style={{ background: f.accent, opacity: 0.5 }}
            />

            {/* ── Left panel: number + icon ─────────────────── */}
            <div
              className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 px-6 py-5 sm:py-8 sm:w-36 flex-shrink-0 border-b sm:border-b-0 sm:border-r"
              style={{ borderColor: "rgba(51,65,85,0.4)" }}
            >
              {/* Big number */}
              <span
                className="text-5xl sm:text-6xl font-black leading-none select-none transition-all duration-300 group-hover:opacity-100"
                style={{ color: f.accent, opacity: 0.18 }}
              >
                {f.num}
              </span>
              {/* Icon circle */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: f.accentLight,
                  border: `1px solid ${f.accentBorder}`,
                  color: f.accent,
                }}
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7">{f.icon}</span>
              </div>
            </div>

            {/* ── Middle panel: main content ────────────────── */}
            <div className="flex-1 px-6 py-6 sm:py-8 flex flex-col justify-between gap-5">
              {/* Top row */}
              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.18em] mb-2 block"
                  style={{ color: f.accent }}
                >
                  {f.label}
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-black leading-tight text-white mb-3"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {f.title}
                </h2>
                <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-lg">
                  {f.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold"
                    style={{
                      background: f.accentLight,
                      color: f.accent,
                      border: `1px solid ${f.accentBorder}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right panel: highlights + CTA ────────────── */}
            <div
              className="flex sm:flex-col justify-between items-end sm:items-start gap-4 px-6 py-6 sm:py-8 sm:w-52 flex-shrink-0 border-t sm:border-t-0 sm:border-l"
              style={{ borderColor: "rgba(51,65,85,0.4)" }}
            >
              {/* Highlight bullets */}
              <ul className="hidden sm:flex flex-col gap-3 flex-1">
                {f.highlights.map((h) => (
                  <li
                    key={h.text}
                    className="flex items-center gap-2.5 text-[13px] text-slate-400"
                    style={{ color: "rgba(148,163,184,0.9)" }}
                  >
                    <span style={{ color: f.accent }}>{h.icon}</span>
                    {h.text}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group-hover:gap-3 ml-auto sm:ml-0 mt-auto flex-shrink-0"
                style={{
                  background: f.accentLight,
                  border: `1.5px solid ${f.accentBorder}`,
                  color: f.accent,
                }}
              >
                Open
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Footer note ────────────────────────────────────── */}
      <p className="mt-10 text-xs text-slate-600 tracking-wide">
        All processing is AI-powered · Files are never stored permanently
      </p>
    </div>
  );
}