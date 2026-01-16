
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Maximize2, Zap, Circle, Triangle, Square } from 'lucide-react';

interface Slide {
  title: string;
  content: string[];
  imagePrompt?: string;
}

interface PresentationData {
  theme: string;
  slides: Slide[];
}

interface PresentationPreviewProps {
  data: PresentationData;
  onClose: () => void;
}

const PresentationPreview: React.FC<PresentationPreviewProps> = ({ data, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < data.slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  // --- THEME STYLES ---
  const getThemeClass = () => {
    switch (data.theme) {
      case 'cyber':
        return "bg-slate-900 text-cyan-400 font-mono";
      case 'retro':
        return "bg-[#f5e6d3] text-[#4a4a4a] font-serif border-4 border-black";
      case 'minimal':
        return "bg-white text-slate-900 font-sans";
      default:
        return "bg-slate-900 text-white";
    }
  };

  const slide = data.slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
      <div className={`w-full max-w-5xl aspect-video relative shadow-2xl overflow-hidden flex flex-col ${getThemeClass()} rounded-xl`}>
        
        {/* HEADER CONTROLS */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
           <button onClick={onClose} className="p-2 bg-black/20 hover:bg-red-500 hover:text-white rounded-full transition-colors backdrop-blur-md">
             <X size={20} />
           </button>
        </div>

        {/* SLIDE CONTENT */}
        <div className="flex-grow flex flex-col justify-center px-16 py-12 relative z-10">
           {/* DECORATION BASED ON THEME */}
           {data.theme === 'cyber' && (
              <>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                 <div className="absolute bottom-10 right-10 opacity-20"><Zap size={100} /></div>
                 <div className="absolute top-10 left-10 opacity-20 font-mono text-[10px]">SYS.ROOT.DEEPZENT</div>
              </>
           )}
           {data.theme === 'retro' && (
              <>
                 <div className="absolute top-4 left-4 w-4 h-4 bg-orange-500 rounded-full border border-black"></div>
                 <div className="absolute top-4 left-10 w-4 h-4 bg-yellow-500 rounded-full border border-black"></div>
                 <div className="absolute bottom-0 left-0 w-full h-4 bg-black"></div>
              </>
           )}

           <div className="mb-2 text-sm opacity-60 uppercase tracking-widest font-bold">Slide {currentSlide + 1} / {data.slides.length}</div>
           
           <h1 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
             {slide.title}
           </h1>

           <ul className="space-y-4 text-xl md:text-2xl leading-relaxed max-w-3xl">
              {slide.content.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                   <span className="mt-1.5 opacity-50">
                     {data.theme === 'cyber' ? '>' : data.theme === 'retro' ? '★' : '•'}
                   </span>
                   <span>{point}</span>
                </li>
              ))}
           </ul>
        </div>

        {/* NAVIGATION */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-center z-20">
           <button 
             onClick={prevSlide} 
             disabled={currentSlide === 0}
             className="p-3 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-0 transition-all backdrop-blur-md"
           >
             <ChevronLeft size={24} />
           </button>
           
           <div className="flex gap-2">
              {data.slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-current w-6' : 'bg-current opacity-30'}`} 
                />
              ))}
           </div>

           <button 
             onClick={nextSlide} 
             disabled={currentSlide === data.slides.length - 1}
             className="p-3 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-0 transition-all backdrop-blur-md"
           >
             <ChevronRight size={24} />
           </button>
        </div>

      </div>
    </div>
  );
};

export default PresentationPreview;
