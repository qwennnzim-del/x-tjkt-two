
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, ShieldCheck, Loader2, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag states for Desktop
  const [isDown, setIsDown] = useState(false);
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
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Precision index detection
      const itemWidth = scrollRef.current.querySelector('.snap-item')?.clientWidth || clientWidth;
      const index = Math.round(scrollLeft / (itemWidth + 24)); // 24 is gap-6
      if (index !== activeIndex && index >= 0) {
        setActiveIndex(index);
      }
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollSnapType = 'none'; // Disable snap while dragging
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseLeave = () => {
    if (!isDown) return;
    setIsDown(false);
    resetSnap();
  };

  const handleMouseUp = () => {
    setIsDown(false);
    resetSnap();
  };

  const resetSnap = () => {
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x proximity';
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Drag speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.querySelector('.snap-item')?.clientWidth || 300;
      const move = direction === 'next' ? (itemWidth + 24) : -(itemWidth + 24);
      scrollRef.current.scrollBy({ left: move, behavior: 'smooth' });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const file = files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64String = reader.result as string;
          await addDoc(collection(db, "moments"), {
            url: base64String,
            createdAt: serverTimestamp()
          });
          setIsUploading(false);
        };
      } catch (error) {
        console.error(error);
        setIsUploading(false);
      }
    }
  };

  const removeMoment = async (id: string) => {
    if (!isAdmin || !window.confirm("Hapus foto ini?")) return;
    await deleteDoc(doc(db, "moments", id));
  };

  return (
    <section className="py-24 pt-32 sm:py-32 bg-clean min-h-screen relative overflow-hidden select-none">
      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <span className="font-handwriting text-3xl text-slate-400 block">Vibes Gallery</span>
            <h2 className="font-artist text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">X TJKT TWO</h2>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <span>{isUploading ? 'Sending...' : 'Post Moment'}</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </header>

        <div className="relative">
          {/* Navigation Buttons (Desktop Only) */}
          <div className="hidden lg:flex absolute -top-16 right-0 gap-3">
            <button onClick={() => navigate('prev')} className="p-3 glass rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => navigate('next')} className="p-3 glass rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Main Scroll Container */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-6 overflow-x-auto no-scrollbar snap-x snap-proximity pb-12 pt-4 px-0 cursor-grab active:cursor-grabbing`}
            style={{ 
              touchAction: 'pan-y', 
              WebkitOverflowScrolling: 'touch' 
            }}
          >
            {moments.length > 0 ? (
              moments.map((moment, i) => (
                <div 
                  key={moment.id} 
                  className="snap-item snap-center shrink-0 w-[80vw] sm:w-[450px] aspect-[3/4] sm:aspect-[4/5] relative first:ml-0"
                >
                  <div className={`w-full h-full rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-[6px] sm:border-[10px] border-white transition-all duration-700 bg-slate-50 relative ${activeIndex === i ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
                    <img 
                      src={moment.url} 
                      alt="Moment" 
                      className="w-full h-full object-cover select-none pointer-events-none"
                      draggable="false"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {isAdmin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMoment(moment.id); }} 
                        className="absolute bottom-6 right-6 p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-20"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    <div className="absolute bottom-8 left-8">
                       <p className="font-handwriting text-3xl text-white drop-shadow-md">Sweet Memory ✨</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-100 mx-4">
                <Eye size={48} className="text-slate-200 mb-4" />
                <h3 className="font-artist text-xl text-slate-400 font-bold uppercase">No Moments Uploaded</h3>
              </div>
            )}
          </div>

          {/* Counter & Dots */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex justify-center gap-2">
              {moments.slice(0, 10).map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-10 bg-slate-900' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>
            
            <div className="glass px-6 py-3 rounded-full flex items-center gap-3 animate-bounce">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Geser atau Tarik Foto</span>
              <ChevronRight size={14} className="text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
