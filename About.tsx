
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Loader2, Eye, Sparkles, Image as ImageIcon, Youtube, Play, Plus, Link as LinkIcon, X, Video, ImagePlus, Type } from 'lucide-react';
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
  url: string; // Base64 Image atau Embed URL
  thumbnail?: string; // Base64 Thumbnail khusus Video
  title?: string; // Judul Video
  createdAt: any;
}

const About: React.FC<AboutProps> = ({ isAdmin }) => {
  const [moments, setMoments] = useState<MomentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // State untuk Form Video Baru
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  // State untuk Video Player Aktif (Click-to-Play)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null); // Untuk Upload Foto Biasa
  const thumbnailInputRef = useRef<HTMLInputElement>(null); // Untuk Upload Thumbnail Video

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

  // --- HANDLERS ---

  // 1. Upload Foto Biasa (Galeri Foto)
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // 2. Handle Thumbnail Selection untuk Video
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Ukuran thumbnail maksimal 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Helper: Convert Link ke Embed URL
  const getEmbedUrl = (inputUrl: string) => {
    // YouTube
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const ytMatch = inputUrl.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      // Tambahkan autoplay=1 agar jalan saat thumbnail diklik
      return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&controls=1&modestbranding=1&rel=0`;
    }

    // Vimeo
    const vimeoRegExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
    const vimeoMatch = inputUrl.match(vimeoRegExp);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Dailymotion
    if (inputUrl.includes('dailymotion.com') || inputUrl.includes('dai.ly')) {
       // Simplifikasi deteksi ID Dailymotion
       let id = '';
       if(inputUrl.includes('/video/')) id = inputUrl.split('/video/')[1].split('?')[0].split('_')[0];
       else if(inputUrl.includes('dai.ly/')) id = inputUrl.split('dai.ly/')[1];
       
       if(id) return `https://www.dailymotion.com/embed/video/${id}?autoplay=1`;
    }

    return null;
  };

  // 4. Submit Video Baru
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !videoUrlInput || !videoTitle || !videoThumbnail) {
      alert("Mohon lengkapi Judul, Link, dan Thumbnail video.");
      return;
    }

    const embedUrl = getEmbedUrl(videoUrlInput);
    if (!embedUrl) {
      alert("Link video tidak valid atau tidak didukung.");
      return;
    }

    setIsUploading(true);
    try {
      await addDoc(collection(db, "moments"), {
        type: 'video',
        url: embedUrl,
        title: videoTitle,
        thumbnail: videoThumbnail,
        createdAt: serverTimestamp()
      });
      
      // Reset Form
      setVideoUrlInput('');
      setVideoTitle('');
      setVideoThumbnail(null);
      setShowVideoInput(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan video.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMoment = async (id: string) => {
    if (!isAdmin || !window.confirm("Hapus konten ini?")) return;
    await deleteDoc(doc(db, "moments", id));
  };

  // Helper untuk menampilkan video di card (jika data lama tidak punya thumbnail)
  const getVideoSrc = (url: string, isPlaying: boolean) => {
    if (!url.startsWith('http')) {
      // Legacy YouTube ID support
      return `https://www.youtube.com/embed/${url}?autoplay=${isPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0`;
    }
    // New format (Full Embed URL)
    // Pastikan autoplay parameter sesuai state
    if (isPlaying) return url; // URL sudah mengandung autoplay=1 dari getEmbedUrl
    return url.replace('autoplay=1', 'autoplay=0');
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
              CINEMA <br/>
              <span className="text-slate-200">X TJKT TWO</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Streaming Kenangan Kita</p>
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

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          )}
        </header>

        {/* Input Form Video */}
        {showVideoInput && isAdmin && (
          <div className="mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
            <div className="glass p-6 rounded-[2rem] shadow-xl border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-blue-400 to-purple-400"></div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">Upload Video Baru</h3>
               
               <form onSubmit={handleVideoSubmit} className="space-y-4">
                  
                  {/* 1. Input Judul */}
                  <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-xl"><Type size={16} /></div>
                    <input 
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Judul Video (Contoh: Vlog Study Tour)"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* 2. Input Link */}
                  <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-xl"><LinkIcon size={16} /></div>
                    <input 
                      type="text"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="Link YouTube / Vimeo / Dailymotion"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* 3. Input Thumbnail */}
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors text-[10px] font-black uppercase tracking-widest border border-slate-200 border-dashed"
                    >
                      <ImagePlus size={16} /> {videoThumbnail ? 'Ganti Thumbnail' : 'Upload Thumbnail'}
                    </button>
                    <input type="file" ref={thumbnailInputRef} className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
                    
                    {videoThumbnail && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={videoThumbnail} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setShowVideoInput(false)}
                        className="flex-1 py-3 text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-black uppercase tracking-widest"
                      >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        disabled={isUploading}
                        className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        {isUploading ? 'Menyimpan...' : 'Tayangkan Video'}
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Grid Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pb-20">
          {moments.length > 0 ? (
            moments.map((moment, i) => (
              <div 
                key={moment.id} 
                className="group break-inside-avoid animate-in fade-in slide-in-from-bottom duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`relative w-full rounded-[2rem] overflow-hidden bg-slate-100 shadow-lg border-[4px] border-white transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl ${moment.type === 'video' ? 'aspect-video' : 'aspect-[4/5]'}`}>
                  
                  {moment.type === 'video' ? (
                    // --- TAMPILAN VIDEO STREAM STYLE ---
                    <div className="w-full h-full relative bg-black group/video">
                      {/* Logic: Jika video ini sedang diputar (diklik), tampilkan iframe. Jika tidak, tampilkan Thumbnail */}
                      {playingVideoId === moment.id ? (
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={getVideoSrc(moment.url, true)} 
                          title={moment.title || "Video player"} 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      ) : (
                        // Thumbnail View (Click to Play)
                        <div 
                          onClick={() => setPlayingVideoId(moment.id)}
                          className="w-full h-full cursor-pointer relative"
                        >
                          {/* Custom Thumbnail or Fallback */}
                          {moment.thumbnail ? (
                             <img src={moment.thumbnail} alt={moment.title} className="w-full h-full object-cover opacity-90 transition-opacity group-hover/video:opacity-75" />
                          ) : (
                             <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <Video size={32} className="text-white/20" />
                             </div>
                          )}

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 shadow-xl group-hover/video:scale-110 transition-transform duration-300">
                                <Play size={24} className="text-white fill-white ml-1" />
                             </div>
                          </div>

                          {/* Title Overlay at Bottom */}
                          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                             <h4 className="text-white font-artist text-lg font-bold truncate tracking-wide">{moment.title || "Untitled Video"}</h4>
                             <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Klik untuk memutar</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Delete Button (Admin Only) */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/video:opacity-100 transition-opacity">
                           <button 
                            onClick={(e) => { e.stopPropagation(); removeMoment(moment.id); }} 
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Hapus Video"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // --- TAMPILAN FOTO (Tetap sama) ---
                    <>
                      <img 
                        src={moment.url} 
                        alt="Memory" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <p className="font-handwriting text-2xl text-white mb-1">Our Vibes ✨</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">X TJKT TWO</span>
                          {isAdmin && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeMoment(moment.id); }} 
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                </div>
                {/* Title Outside for Video (Optional design choice, but kept inside for stream look above) */}
              </div>
            ))
          ) : (
            <div className="col-span-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-200">
              <Eye size={48} className="text-slate-200 mb-6" />
              <h3 className="font-artist text-2xl text-slate-400 font-bold uppercase tracking-tight">Belum ada tayangan</h3>
              <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-bold">Video & Foto akan muncul di sini</p>
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
