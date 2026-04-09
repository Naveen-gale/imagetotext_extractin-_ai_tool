import { Zap, Image as ImageIcon, Globe, FileText, Files, Lock } from "lucide-react";

export default function Hero() {
  const pills = [
    { icon: <Zap className="w-3.5 h-3.5" />, text: "Groq Vision AI" },
    { icon: <ImageIcon className="w-3.5 h-3.5" />, text: "ImageKit Storage" },
    { icon: <Globe className="w-3.5 h-3.5" />, text: "20+ Languages" },
    { icon: <FileText className="w-3.5 h-3.5" />, text: "PDF · DOCX · TXT" },
    { icon: <Files className="w-3.5 h-3.5" />, text: "Combined Document" },
    { icon: <Lock className="w-3.5 h-3.5" />, text: "Secure Upload" },
  ];

  return (
    <section className="text-center py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white leading-tight">
        Extract Text <span className="text-indigo-400">Instantly</span>
        <br />
        with VisionText AI
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Upload handwritten notes, documents, or screenshots. VisionText converts your images into searchable, formatted text in seconds.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {pills.map((pill, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300">
            {pill.icon}
            {pill.text}
          </div>
        ))}
      </div>
    </section>
  );
}
