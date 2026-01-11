
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Loader2, Eye, Sparkles, Youtube, Play, Link as LinkIcon, X, Video, ImagePlus, Type, Clapperboard, Film } from 'lucide-react';
import { db } from './firebase';
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  where 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface CinemaProps {
  isAdmin: boolean;
}

interface VideoData {
  id: string;
  type: 'video';
  url: string; // Embed URL
  thumbnail?: string; // Base64 Thumbnail
  title?: string;
  createdAt: any;
}

const Cinema: React.FC<CinemaProps> = ({ isAdmin }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // State Form Upload
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  // State Player
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Fetch Data (Hanya tipe 'video')
  useEffect(() => {
    // Note: Idealnya menggunakan where("type", "==", "video") di query, 
    // tapi untuk kompatibilitas data lama kita filter di client side atau gunakan where jika index sudah ada.
    // Kita gunakan filter client-side agar aman jika index belum dibuat.
    const q = query(collection(db, "moments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as VideoData))
        .filter(item => item.type === 'video'); // HANYA AMBIL VIDEO
      setVideos(data);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---

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

  const getEmbedUrl = (inputUrl: string) => {
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const ytMatch = inputUrl.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&controls=1&modestbranding=1&rel=0`;
    }
    const vimeoRegExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
    const vimeoMatch = inputUrl.match(vimeoRegExp);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    if (inputUrl.includes('dailymotion.com') || inputUrl.includes('dai.ly')) {
       let id = '';
       if(inputUrl.includes('/video/')) id = inputUrl.split('/video/')[1].split('?')[0].split('_')[0];
       else if(inputUrl.includes('dai.ly/')) id = inputUrl.split('dai.ly/')[1];
       if(id) return `https://www.dailymotion.com/embed/video/${id}?autoplay=1`;
    }
    return null;
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !videoUrlInput || !videoTitle || !videoThumbnail) {
      alert("Mohon lengkapi Judul, Link, dan Thumbnail video.");
      return;
    }

    const embedUrl = getEmbedUrl(videoUrlInput);
    if (!embedUrl) {
      alert("Link video tidak valid.");
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

  const removeVideo = async (id: string) => {
    if (!isAdmin || !window.confirm("Hapus video ini?")) return;
    await deleteDoc(doc(db, "moments", id));
  };

  const getVideoSrc = (url: string, isPlaying: boolean) => {
    if (!url.startsWith('http')) {
      return `https://www.youtube.com/embed/${url}?autoplay=${isPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0`;
    }
    if (isPlaying) return url;
    return url.replace('autoplay=1', 'autoplay=0');
  };

  return (
    <section className="py-24 pt-32 bg-clean min-h-screen relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-slate-900/5 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
                <Clapperboard size={20} />
              </div>
              <span className="font-handwriting text-3xl text-slate-400">Classroom Cinema</span>
            </div>
            <h2 className="font-artist text-5xl sm:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              BIOSKOP <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">TJKT TWO</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Streaming Film Horror, Komedi & Romantis</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowVideoInput(!showVideoInput)}
              disabled={isUploading}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
            >
              <Film size={16} />
              <span>Upload Video</span>
            </button>
          )}
        </header>

        {/* Input Form Video */}
        {showVideoInput && isAdmin && (
          <div className="mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
            <div className="glass p-6 rounded-[2rem] shadow-xl border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">Studio Upload</h3>
               
               <form onSubmit={handleVideoSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-xl"><Type size={16} /></div>
                    <input 
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Judul Film / Video"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

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

                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors text-[10px] font-black uppercase tracking-widest border border-slate-200 border-dashed"
                    >
                      <ImagePlus size={16} /> {videoThumbnail ? 'Ganti Cover' : 'Upload Cover'}
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
                        className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        {isUploading ? 'Uploading...' : 'Tayangkan'}
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pb-20">
          {videos.length > 0 ? (
            videos.map((video, i) => (
              <div 
                key={video.id} 
                className="group break-inside-avoid animate-in fade-in slide-in-from-bottom duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-lg border-[4px] border-white transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                  
                  {/* Logic Click-to-Play */}
                  {playingVideoId === video.id ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={getVideoSrc(video.url, true)} 
                      title={video.title || "Cinema Player"} 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div 
                      onClick={() => setPlayingVideoId(video.id)}
                      className="w-full h-full cursor-pointer relative group/cover"
                    >
                      {/* Thumbnail Image */}
                      {video.thumbnail ? (
                         <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover/cover:opacity-60 transition-opacity" />
                      ) : (
                         <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Video size={40} className="text-white/20" />
                         </div>
                      )}

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl group-hover/cover:scale-110 transition-transform duration-300">
                            <Play size={28} className="text-white fill-white ml-1" />
                         </div>
                      </div>

                      {/* Title Bar */}
                      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                         <h4 className="text-white font-artist text-xl font-bold truncate tracking-wide">{video.title || "Untitled Cinema"}</h4>
                         <p className="text-[9px] text-white/70 font-black uppercase tracking-widest mt-1">Tonton Sekarang</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Delete Button */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={(e) => { e.stopPropagation(); removeVideo(video.id); }} 
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Hapus Video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-200">
              <Eye size={48} className="text-slate-200 mb-6" />
              <h3 className="font-artist text-2xl text-slate-400 font-bold uppercase tracking-tight">Bioskop Tutup</h3>
              <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-bold">Belum ada film yang diputar hari ini</p>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 glass px-8 py-4 rounded-full">
            <Sparkles size={16} className="text-red-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Cinematography of TJKT TWO</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cinema;
