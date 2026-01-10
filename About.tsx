
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Loader2, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';
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

interface PhotoData {
  id: string;
  type: 'image';
  url: string; // Base64 Image
  createdAt: any;
}

const About: React.FC<AboutProps> = ({ isAdmin }) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "moments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Filter hanya tipe image
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(item => item.type === 'image') as PhotoData[];
      setPhotos(data);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, []);

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

  const removePhoto = async (id: string) => {
    if (!isAdmin || !window.confirm("Hapus foto kenangan ini?")) return;
    await deleteDoc(doc(db, "moments", id));
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
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Koleksi Foto Kenangan Kita</p>
          </div>
          
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 text-[10px] font-black uppercase tracking-widest overflow-hidden"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <span>Add Photo</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          )}
        </header>

        {/* Grid Gallery */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 pb-20">
          {photos.length > 0 ? (
            photos.map((photo, i) => (
              <div 
                key={photo.id} 
                className="group break-inside-avoid animate-in fade-in slide-in-from-bottom duration-700 relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-xl border-[8px] border-white transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-3xl">
                  <img 
                    src={photo.url} 
                    alt="Memory" 
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  
                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="font-handwriting text-3xl text-white mb-2">Our Vibes ✨</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">X TJKT TWO</span>
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }} 
                          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Hapus Foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-200">
              <Eye size={48} className="text-slate-200 mb-6" />
              <h3 className="font-artist text-2xl text-slate-400 font-bold uppercase tracking-tight">Album Kosong</h3>
              <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-bold">Belum ada foto yang diupload</p>
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
