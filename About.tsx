
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, ShieldCheck, Loader2, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { db } from './firebase';
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface AboutProps {
  isAdmin: boolean;
}

interface MomentData {
  id: string;
  url: string;
  createdAt: any;
}

const About: React.FC<AboutProps> = ({ isAdmin }) => {
  const [moments, setMoments] = useState<MomentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "moments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MomentData[];
      setMoments(data);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const { scrollLeft, clientWidth } = container;
      // Calculate active index based on item center
      const itemWidth = clientWidth * 0.85; // matching our w-[85vw] or fixed width
      const index = Math.round(scrollLeft / itemWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  // Mouse Drag Logic
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    // Disable smooth scroll during drag for instant response
    scrollContainerRef.current.style.scrollBehavior = 'auto';
    scrollContainerRef.current.style.scrollSnapType = 'none';
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (!scrollContainerRef.current) return;
    // Re-enable snapping and smooth scroll
    scrollContainerRef.current.style.scrollBehavior = 'smooth';
    scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier for speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const file = files[0];
        if (file.size > 1048576) {
          alert("Foto terlalu besar (Max 1MB). Silakan kompres foto kamu dulu.");
          setIsUploading(false);
          return;
        }

        const base64String = await convertToBase64(file);
        await addDoc(collection(db, "moments"), {
          url: base64String,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Upload Error:", error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removeMoment = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Hapus momen ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "moments", id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <section className="py-20 pt-28 sm:py-32 bg-clean min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -right-20 w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] -left-20 w-[400px] h-[400px] bg-purple-50/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <span className="font-handwriting text-3xl text-slate-400 block animate-in fade-in slide-in-from-left duration-700">Captured Moments</span>
            <div className="flex items-center gap-4">
              <h2 className="font-artist text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vibes Kita</h2>
              {isAdmin && (
                <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 text-blue-600 border-blue-100 shadow-sm text-[10px] font-black uppercase tracking-[0.2em]">
                  <ShieldCheck size={14} /> Admin Mode
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {isAdmin && (
               <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50 text-[10px] font-black uppercase tracking-widest group"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} className="group-hover:scale-110 transition-transform" />}
                <span>{isUploading ? 'Uploading...' : 'Add New Photo'}</span>
              </button>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </header>

        {/* The Professional Interactive Canvas */}
        <div className="relative">
          {/* Floating Indicator */}
          <div className="absolute -top-10 right-0 z-30 flex items-center gap-3 glass px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl border-white">
            <Sparkles size={12} className="text-yellow-500 fill-yellow-500" />
            {moments.length > 0 ? `Moment ${activeIndex + 1} of ${moments.length}` : 'Gallery Empty'}
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseMove={onMouseMove}
            className={`flex gap-6 sm:gap-12 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-16 pt-4 -mx-6 px-[7.5vw] lg:mx-0 lg:px-[15%] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ 
              touchAction: 'pan-y',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {moments.length > 0 ? (
              moments.map((moment, i) => (
                <div 
                  key={moment.id} 
                  className="snap-center shrink-0 w-[85vw] sm:w-[500px] aspect-[3/4] sm:aspect-[4/5] relative"
                >
                  <div className={`w-full h-full rounded-[3rem] sm:rounded-[5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] sm:border-[12px] border-white transition-all duration-1000 bg-slate-100 relative ${activeIndex === i ? 'scale-100 rotate-0 z-20' : 'scale-90 opacity-40 rotate-1 grayscale-[30%]'}`}>
                    <img 
                      src={moment.url} 
                      alt="X TJKT 2 Moment" 
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable="false"
                    />
                    
                    {/* Artistic Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMoment(moment.id); }} 
                        className="absolute top-8 right-8 p-4 bg-red-500/90 text-white rounded-full shadow-2xl backdrop-blur-md hover:bg-red-600 transition-all transform hover:scale-110 active:scale-90 z-30"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    
                    {/* Aesthetic Label */}
                    <div className="absolute bottom-10 left-10 pointer-events-none">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1 block">X TJKT TWO 2024</span>
                       <p className="font-handwriting text-4xl sm:text-5xl text-white drop-shadow-2xl">Vibe Check ✨</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full min-h-[450px] glass rounded-[4rem] flex flex-col items-center justify-center text-center p-16 border-dashed border-4 border-slate-100/50">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl text-slate-200">
                  <Eye size={48} />
                </div>
                <h3 className="font-artist text-2xl text-slate-400 font-black uppercase tracking-tighter">No Memories Synchronized</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">The cloud is waiting for your upload</p>
              </div>
            )}
          </div>

          {/* Bottom Interaction Guide */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex justify-center gap-2.5">
              {moments.slice(0, 10).map((_, i) => (
                <button 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-700 ${activeIndex === i ? 'w-12 bg-slate-900 shadow-lg' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            
            <div className="inline-flex items-center gap-4 px-8 py-3 glass rounded-full opacity-60 hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Tarik atau Geser Foto</span>
               <div className="flex gap-1 animate-pulse">
                  <ChevronRight size={14} className="text-slate-400" />
                  <ChevronRight size={14} className="text-slate-300" />
                  <ChevronRight size={14} className="text-slate-200" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
