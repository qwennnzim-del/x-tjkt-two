
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Loader2, Eye, Sparkles, Image as ImageIcon, Youtube, Play, Plus, Link as LinkIcon, X, Video } from 'lucide-react';
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
  type: 'image' | 'video';
  url: string; // Bisa berupa Base64 Image, YouTube ID (Legacy), atau Full Embed URL
  caption?: string;
  createdAt: any;
}

const About: React.FC<AboutProps> = ({ isAdmin }) => {
  const [moments, setMoments] = useState<MomentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle Image Upload (Base64)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const file = files[0];
        if (file.size > 1024 * 1024) {
          alert("Ukuran foto terlalu besar! Harap kompres di bawah 1MB.");
          setIsUploading(false);
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64String = reader.result as string;
          await addDoc(collection(db, "moments"), {
            type: 'image',
            url: base64String,
            createdAt: serverTimestamp()
          });
          setIsUploading(false);
        };
      } catch (error) {
        console.error(error);
        setIsUploading(false);
        alert("Gagal upload foto.");
      }
    }
  };

  // Helper Cerdas: Deteksi Platform & Ambil Embed URL
  const getEmbedUrl = (inputUrl: string) => {
    // 1. YouTube (Short & Long Links)
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const ytMatch = inputUrl.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}?controls=1&modestbranding=1&rel=0`;
    }

    // 2. Vimeo
    const vimeoRegExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
    const vimeoMatch = inputUrl.match(vimeoRegExp);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // 3. Dailymotion
    if (inputUrl.includes('dailymotion.com/video/')) {
       // Format: dailymotion.com/video/x7tgad0
       const id = inputUrl.split('/video/')[1].split('?')[0].split('_')[0];
       return `https://www.dailymotion.com/embed/video/${id}`;
    }
    if (inputUrl.includes('dai.ly/')) {
        const id = inputUrl.split('dai.ly/')[1];
        return `https://www.dailymotion.com/embed/video/${id}`;
    }

    // 4. Bilibili (Global)
    if (inputUrl.includes('bilibili.tv')) {
        // Butuh logika ekstra, tapi biasanya iframe src beda. 
        // Kita return null dulu untuk menjaga kualitas player standar.
    }

    return null;
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !videoUrlInput) return;

    const embedUrl = getEmbedUrl(videoUrlInput);
    
    if (!embedUrl) {
      alert("Link tidak dikenali! Gunakan link dari YouTube, Vimeo, atau Dailymotion.");
      return;
    }

    setIsUploading(true);
    try {
      await addDoc(collection(db, "moments"), {
        type: 'video',
        url: embedUrl, // Simpan Full URL Embed
        createdAt: serverTimestamp()
      });
      setVideoUrlInput('');
      setShowVideoInput(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan video.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMoment = async (id: string) => {
    if (!isAdmin || !window.confirm("Hapus kenangan ini?")) return;
    await deleteDoc(doc(db, "moments", id));
  };

  // Helper untuk menampilkan video (Support Legacy YouTube ID)
  const getVideoSrc = (url: string) => {
    // Jika URL dimulai dengan http, berarti format baru (Embed URL)
    if (url.startsWith('http')) {
      return url;
    }
    // Jika tidak (format lama), asumsikan itu ID YouTube
    return `https://www.youtube.com/embed/${url}?controls=1&modestbranding=1&rel=0`;
  };

  return (
    <section className="py-24 pt-32 bg-clean min-h-screen relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <ImageIcon size={20} />
              </div>
              <span className="font-handwriting text-3xl text-slate-400">Vibes Gallery</span>
            </div>
            <h2 className="font-artist text-5xl sm:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              DOKUMENTASI <br/>
              <span className="text-slate-200">X TJKT TWO</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Video & Foto Kenangan Kita</p>
          </div>
          
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Button Upload Foto */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 text-[10px] font-black uppercase tracking-widest overflow-hidden"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <span>Add Photo</span>
              </button>
              
              {/* Button Add Video */}
              <button 
                onClick={() => setShowVideoInput(!showVideoInput)}
                disabled={isUploading}
                className="group relative flex items-center justify-center gap-3 px-6 py-4 glass text-slate-900 border-slate-300 rounded-2xl hover:bg-white transition-all shadow-lg disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
              >
                <Video size={16} className="text-red-500" />
                <span>Add Video</span>
              </button>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          )}
        </header>

        {/* Input Form Video */}
        {showVideoInput && isAdmin && (
          <div className="mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
            <div className="glass p-6 rounded-[2rem] shadow-xl border-red-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-blue-400 to-purple-400"></div>
               <div className="flex items-center gap-2 mb-4 text-slate-400">
                  <span className="text-[9px] font-bold uppercase tracking-widest">Supports:</span>
                  <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[9px] font-bold">YouTube</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">Vimeo</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Dailymotion</span>
               </div>
               <form onSubmit={handleVideoSubmit} className="flex gap-2">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                    <LinkIcon size={20} />
                  </div>
                  <input 
                      type="text" 
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="Paste Link Video di sini..."
                      className="flex-grow bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-bold text-sm"
                      autoFocus
                  />
                  <button 
                      type="button" 
                      onClick={() => setShowVideoInput(false)}
                      className="p-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={20} />
                  </button>
                  <button 
                      type="submit"
                      disabled={!videoUrlInput.trim() || isUploading}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors shadow-lg"
                  >
                      Simpan
                  </button>
               </form>
            </div>
          </div>
        )}

        {/* Grid Gallery - Vertical Scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pb-20">
          {moments.length > 0 ? (
            moments.map((moment, i) => (
              <div 
                key={moment.id} 
                className="group break-inside-avoid animate-in fade-in slide-in-from-bottom duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`relative w-full rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-xl border-[8px] border-white transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-3xl ${moment.type === 'video' ? 'aspect-video' : 'aspect-[4/5]'}`}>
                  
                  {moment.type === 'video' ? (
                    // TAMPILAN VIDEO PLAYER (Support Multi-Platform)
                    <div className="w-full h-full relative group/video bg-black">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={getVideoSrc(moment.url)} 
                        title="Video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="rounded-[2rem]"
                      ></iframe>
                      
                      {/* Delete Button for Video (Admin Only) */}
                      {isAdmin && (
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/video:opacity-100 transition-opacity">
                           <button 
                            onClick={(e) => { e.preventDefault(); removeMoment(moment.id); }} 
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Hapus Video"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // TAMPILAN FOTO
                    <>
                      <img 
                        src={moment.url} 
                        alt="Memory" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Glass Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                        <p className="font-handwriting text-3xl text-white mb-2">Our Vibes ✨</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">X TJKT TWO</span>
                          {isAdmin && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeMoment(moment.id); }} 
                              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              title="Hapus Foto"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-200">
              <Eye size={48} className="text-slate-200 mb-6" />
              <h3 className="font-artist text-2xl text-slate-400 font-bold uppercase tracking-tight">Belum ada dokumentasi</h3>
              <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-bold">Kenangan kita akan muncul di sini</p>
            </div>
          )}
        </div>

        {/* Bottom Decorative Footer */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 glass px-8 py-4 rounded-full">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Humble — Solid — Family</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
