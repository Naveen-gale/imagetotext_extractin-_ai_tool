import { Link } from "react-router-dom";
import { FileText, Presentation, FileImage, Sparkles, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-slate-100 font-sans w-full">
      
      {/* --- Header Section --- */}
      <div className="text-center max-w-3xl mb-12 sm:mb-16 mt-8 sm:mt-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 rounded-full bg-slate-800/80 border border-slate-700 shadow-sm">
           <Sparkles className="w-4 h-4 text-cyan-400" />
           <span className="text-sm font-medium tracking-wide text-slate-200">Welcome to VisionText</span>
        </div>
        
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
          What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">create</span> today?
        </h1>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto px-2">
          Transform your workflow with advanced AI. Instantly extract intelligent insights from documents or generate stunning presentations.
        </p>
      </div>

      {/* --- Cards Container --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-5xl">
        
        {/* 1. Extraction Card */}
        <Link 
          to="/extract" 
          className="group flex flex-col p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
        >
          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          {/* Card Content */}
          <div className="flex-grow">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              Smart Extraction
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Upload PDFs, DOCX, PPTs, or exact images. VisionText will cleanly extract and format all text using AI.
            </p>
          </div>
            
          {/* Footer of Card */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800 group-hover:border-indigo-500/30 transition-colors">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-indigo-300 font-medium">
              <FileImage className="w-4 h-4" /> Images + Docs supported
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 2. AI PPT Card */}
        <Link 
          to="/aippt" 
          className="group flex flex-col p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-purple-500/10"
        >
          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
            <Presentation className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          {/* Card Content */}
          <div className="flex-grow">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              AI PPT Studio
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Type out a topic or drag an inspiration image. Our AI will automatically generate a perfectly styled PowerPoint.
            </p>
          </div>
            
          {/* Footer of Card */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800 group-hover:border-purple-500/30 transition-colors">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-purple-300 font-medium">
              <Sparkles className="w-4 h-4" /> Full Slides Generated
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>
    </div>
  )
}