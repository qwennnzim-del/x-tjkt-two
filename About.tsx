
import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Camera, Trash2, ShieldCheck, Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
  const [scrollProgress, setScrollProgress] = useState(0);
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
      const container = scrollContainerRef.current;
      const progress = (container.scrollLeft / (container.scrollWidth - container.clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
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
        alert("Gagal upload. Periksa koneksi atau Firestore Rules kamu.");
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
        alert("Gagal menghapus.");
      }
    }
  };

  return (
    <section className="py-20 pt-28 sm:py-24 sm:pt-32 bg-white relative overflow-hidden min-h-screen">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-32 z-10">
            <span className="font-handwriting text-xl sm:text-2xl text-slate-400 block mb-2">Cloud Gallery</span>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-artist text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Vibes X TJKT 2</h2>
              {isAdmin && (
                <div className="glass px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1.5 text-blue-600 border-blue-100 shadow-sm">
                  <ShieldCheck size={12} className="sm:size-[14px]" />
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Admin</span>
                </div>
              )}
            </div>
            <div className="w-16 sm:w-20 h-1 bg-slate-900 mb-6 sm:mb-8"></div>
            
            <div className="space-y-4 sm:space-y-6 text-slate-600 leading-relaxed font-light text-base sm:text-lg">
              <p>
                Kumpulan momen seru yang gak akan terulang. Geser galeri untuk melihat semua foto kita!
              </p>
              
              {isAdmin && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 group text-sm sm:text-base"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} className="group-hover:rotate-12 transition-transform" />}
                    <span>{isUploading ? 'Menyimpan...' : 'Tambah Foto'}</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 sm:pt-6">
                <div className="flex items-center gap-4 p-4 glass rounded-2xl sm:rounded-[2rem] border-white/60">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[11px] sm:text-sm">Real-time DB</h4>
                    <p className="text-[8px] sm:text-[10px] opacity-70 uppercase tracking-widest font-bold">Cloud Synced</p>
                  </div>
                </div>
              </div>

              {/* Desktop Nav Controls */}
              <div className="hidden lg:flex items-center gap-4 pt-8">
                <button 
                  onClick={() => scroll('left')}
                  className="w-14 h-14 rounded-full glass flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-md group"
                >
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-14 h-14 rounded-full glass flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-md group"
                >
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-visible mt-4 lg:mt-0">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                {moments.length} Memories Shared
              </span>
            </div>
            
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex flex-nowrap gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-6 px-6 lg:mx-0 lg:px-0 cursor-grab active:cursor-grabbing"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {moments.length > 0 ? (
                moments.map((moment) => (
                  <div key={moment.id} className="relative w-[75vw] sm:w-[350px] lg:min-w-[380px] aspect-[4/5] snap-center group shrink-0">
                    <div className="w-full h-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl border-[4px] sm:border-[6px] border-white transition-all duration-700 group-hover:scale-[0.98] bg-slate-50 relative">
                      <img 
                        src={moment.url} 
                        alt="Gallery Moment" 
                        className="w-full h-full object-cover select-none"
                        draggable="false"
                        loading="lazy"
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 sm:p-10">
                        <div className="flex justify-between items-center">
                          <p className="font-handwriting text-2xl sm:text-3xl text-white">Capture ✨</p>
                          {isAdmin && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMoment(moment.id);
                              }} 
                              className="p-2 sm:p-3 bg-red-500/90 text-white rounded-full backdrop-blur-md shadow-xl hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} sm:size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full min-h-[300px] glass rounded-[2rem] flex flex-col items-center justify-center text-center p-8 grow border-dashed border-2 border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Eye size={32} />
                  </div>
                  <h3 className="font-artist text-lg text-slate-400 font-bold mb-1">Belum ada foto</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Waiting for admin...</p>
                </div>
              )}
            </div>
            
            {/* Scroll Progress Indicator */}
            {moments.length > 0 && (
              <div className="mt-2 px-1">
                <div className="w-full h-[2px] bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-300" 
                    style={{ width: `${Math.max(8, scrollProgress)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Swipe to Explore</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">X TJKT 2</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
