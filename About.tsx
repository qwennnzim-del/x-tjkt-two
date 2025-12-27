
import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Heart, Camera, Plus, Trash2, Image as ImageIcon, ShieldCheck, Loader2 } from 'lucide-react';
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

const DEFAULT_MOMENTS = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80"
];

const About: React.FC<AboutProps> = ({ isAdmin }) => {
  const [moments, setMoments] = useState<MomentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fungsi ini akan terus "mendengarkan" database kamu secara real-time
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
          alert("Foto terlalu besar (Max 1MB). Silakan kompres atau cari foto lain.");
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
        alert("Gagal upload. Pastikan Firestore Rules sudah di-set ke 'true'.");
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
        alert("Gagal menghapus.");
      }
    }
  };

  return (
    <section className="py-24 pt-32 bg-white relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="sticky top-32">
            <span className="font-handwriting text-2xl text-slate-400 block mb-2">Cloud Gallery</span>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-artist text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Vibes X TJKT 2</h2>
              {isAdmin && (
                <div className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-blue-600 border-blue-100 shadow-sm animate-pulse">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
                </div>
              )}
            </div>
            <div className="w-20 h-1 bg-slate-900 mb-8"></div>
            
            <div className="space-y-6 text-slate-600 leading-relaxed font-light text-lg">
              <p>
                Semua kenangan di sini tersimpan aman di <strong className="text-slate-900">Firebase Cloud</strong>. Siapapun yang login bisa melihat update foto terbaru secara langsung.
              </p>
              
              {isAdmin && (
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 group"
                  >
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} className="group-hover:rotate-12 transition-transform" />}
                    <span>{isUploading ? 'Syncing...' : 'Upload Momen'}</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="flex items-center gap-4 p-5 glass rounded-[2rem] border-white/60">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Status</h4>
                    <p className="text-xs opacity-70">Connected to Cloud</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {moments.length} Moments Captured
              </span>
            </div>
            
            <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 -mx-4 px-4 lg:mx-0 lg:px-0">
              {moments.length > 0 ? (
                moments.map((moment) => (
                  <div key={moment.id} className="relative min-w-[300px] sm:min-w-[380px] aspect-[4/5] snap-center group">
                    <div className="w-full h-full rounded-[3.5rem] overflow-hidden shadow-2xl border-[6px] border-white transition-all duration-700 group-hover:scale-[0.98]">
                      <img src={moment.url} alt="Gallery" className="w-full h-full object-cover" />
                      
                      {isAdmin && (
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => removeMoment(moment.id)} className="p-4 bg-red-500 text-white rounded-full shadow-xl">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all">
                          <p className="font-handwriting text-3xl text-white drop-shadow-lg">Magic ✨</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full p-20 glass rounded-[3rem] text-center">
                  <p className="font-artist text-slate-300">Belum ada foto. Admin, ayo upload!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
