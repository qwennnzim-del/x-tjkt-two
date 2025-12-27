
import React, { useState, useRef } from 'react';
import { Cpu, Heart, Camera, Plus, Trash2, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface AboutProps {
  isAdmin: boolean;
}

const About: React.FC<AboutProps> = ({ isAdmin }) => {
  const [moments, setMoments] = useState<string[]>([
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80"
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (!isAdmin) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = event.target.files;
    if (files) {
      const newUrls = Array.from(files).map((file: File) => URL.createObjectURL(file));
      setMoments(prev => [...newUrls, ...prev]);
    }
  };

  const removeMoment = (index: number) => {
    if (!isAdmin) return;
    setMoments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="py-24 pt-32 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Teks Deskripsi */}
          <div>
            <span className="font-handwriting text-2xl text-slate-400 block mb-2">Kenalan Yuk!</span>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-artist text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Vibes Kelas Kita</h2>
              {isAdmin && (
                <div className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-blue-600 border-blue-100 mt-2">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Admin Mode</span>
                </div>
              )}
            </div>
            <div className="w-20 h-1 bg-slate-900 mb-8"></div>
            
            <div className="space-y-6 text-slate-600 leading-relaxed font-light text-lg">
              <p>
                Halo! Kita dari <strong className="text-slate-900">X TJKT TWO</strong>. Bukan cuma sekadar kumpulan anak yang kebetulan satu kelas, tapi kita ini sirkel besar yang isinya anak-anak gokil, kreatif, dan pastinya punya visi buat masa depan.
              </p>
              <p>
                {isAdmin 
                  ? "Sebagai administrator, kamu bisa mengelola galeri momen kelas. Klik tombol di bawah untuk menambah dokumentasi aktivitas terbaru."
                  : "Lihat setiap momen seru kita di sini. Dari pas pusing ngerjain tugas, sampe pas ketawa bareng di jam istirahat."}
              </p>
              
              {isAdmin && (
                <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-left duration-500">
                  <button 
                    onClick={handleUploadClick}
                    className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl"
                  >
                    <Camera size={20} />
                    <span>Upload Momen Seru</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="flex items-center gap-4 p-4 glass rounded-2xl">
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-800">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Future Ready</h4>
                    <p className="text-xs opacity-70">Tech Enthusiasts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 glass rounded-2xl">
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-800">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">High Solidarity</h4>
                    <p className="text-xs opacity-70">Stay Solid!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Galeri Geser (iPhone/Android Style) */}
          <div className="relative w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Moments • {moments.length} Photos</span>
              <div className="flex gap-2 text-slate-300">
                <ImageIcon size={16} />
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10 -mx-4 px-4 lg:mx-0 lg:px-0">
              {moments.map((src, index) => (
                <div 
                  key={index} 
                  className="relative min-w-[280px] sm:min-w-[350px] aspect-[4/5] snap-center group"
                >
                  <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white transition-all duration-700 group-hover:scale-[0.98]">
                    <img 
                      src={src} 
                      alt={`Moment ${index}`} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    />
                    
                    {/* Overlay Buttons - Only visible to admin */}
                    {isAdmin && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMoment(index);
                          }}
                          className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors shadow-lg"
                          title="Hapus Momen"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Floating Tag */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <p className="font-handwriting text-lg text-slate-800 whitespace-nowrap">Momen Terindah ✨</p>
                  </div>
                </div>
              ))}
              
              {/* Tambah Card (Hanya muncul untuk Admin) */}
              {isAdmin && (
                <div 
                  onClick={handleUploadClick}
                  className="min-w-[280px] sm:min-w-[350px] aspect-[4/5] snap-center flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all group"
                >
                  <div className="p-5 bg-slate-100 rounded-full text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">Tambah Momen Lagi</p>
                </div>
              )}
            </div>

            {/* Hint Geser */}
            <div className="flex justify-center mt-4">
              <div className="flex gap-1.5">
                {moments.slice(0, 5).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-slate-400' : 'bg-slate-200'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
