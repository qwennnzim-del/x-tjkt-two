
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, ShieldCheck, Loader2, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
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
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / (clientWidth * 0.85)); // 0.85 is the item width factor
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.clientWidth * 0.85;
      container.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
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
    if (window.confirm("Hapus momen ini?")) {
      try {
        await deleteDoc(doc(db, "moments", id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <section className="py-20 pt-28 sm:py-32 bg-clean min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -right-10 w-64 h-64 bg-blue-50/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-10 w-64 h-64 bg-slate-50/50 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-handwriting text-2xl text-slate-400 block mb-2">Vibes Kita</span>
            <div className="flex items-center gap-3">
              <h2 className="font-artist text-4xl sm:text-6xl font-bold text-slate-900 tracking-tighter uppercase leading-none">The Moments</h2>
              {isAdmin && (
                <div className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-blue-600 border-blue-100 shadow-sm text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={12} /> Admin
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {isAdmin && (
               <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <span>{isUploading ? 'Sending...' : 'Post'}</span>
              </button>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        {/* Professional Scroll Area */}
        <div className="relative group">
          {/* Moment Counter Indicator */}
          <div className="absolute top-4 right-4 z-30 glass px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 shadow-sm flex items-center gap-2">
            <Sparkles size={10} className="text-blue-500" />
            {moments.length > 0 ? `${activeIndex + 1} / ${moments.length}` : '0 / 0'}
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth"
            style={{ touchAction: 'pan-y' }}
          >
            {moments.length > 0 ? (
              moments.map((moment, i) => (
                <div 
                  key={moment.id} 
                  className="snap-center shrink-0 w-[85vw] sm:w-[450px] aspect-[4/5] relative transition-transform duration-500"
                >
                  <div className={`w-full h-full rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-[4px] sm:border-[8px] border-white transition-all duration-700 bg-slate-50 relative ${activeIndex === i ? 'scale-100 opacity-100' : 'scale-90 opacity-40 grayscale-[50%]'}`}>
                    <img 
                      src={moment.url} 
                      alt="Moment" 
                      className="w-full h-full object-cover select-none pointer-events-none"
                      loading="lazy"
                    />
                    
                    {/* Shadow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMoment(moment.id); }} 
                        className="absolute bottom-6 right-6 p-3 bg-red-500 text-white rounded-full shadow-2xl hover:bg-red-600 transition-all transform hover:scale-110 active:scale-95"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    
                    <div className="absolute bottom-8 left-8">
                       <p className="font-handwriting text-3xl text-white drop-shadow-md">X TJKT 2 ✨</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-100 mx-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Eye size={32} />
                </div>
                <h3 className="font-artist text-xl text-slate-400 font-bold mb-1 uppercase tracking-tighter">No Memories Yet</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Waiting for admin to share</p>
              </div>
            )}
          </div>

          {/* Bottom Dots Indicator */}
          <div className="flex justify-center gap-2 mt-2">
            {moments.slice(0, 10).map((_, i) => (
              <button 
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`}
              />
            ))}
            {moments.length > 10 && <span className="text-[10px] text-slate-400 font-bold">...</span>}
          </div>
        </div>

        {/* Mobile Instruction */}
        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-3 px-6 py-3 glass rounded-full animate-bounce">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Geser untuk jelajah</span>
              <ChevronRight size={14} className="text-slate-300" />
           </div>
        </div>
      </div>
    </section>
  );
};

export default About;
