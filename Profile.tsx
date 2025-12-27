
import React, { useState, useRef, useEffect } from 'react';
import { Camera, User as UserIcon, Save, Edit2, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, Zap, Trophy, Loader2 } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  addDoc, 
  doc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface ProfileProps {
  user: {
    name: string;
    classMajor: string;
    isAdmin: boolean;
    bio?: string;
    photo?: string;
  };
  onUpdate: (updatedData: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [photo, setPhoto] = useState(user.photo || '');
  const [customScore, setCustomScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingScore, setFetchingScore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simpan nama original untuk mencari dokumen di database sebelum diupdate
  const originalNameRef = useRef(user.name);

  // Fetch current score from leaderboard if admin
  useEffect(() => {
    if (user.isAdmin) {
      const getScore = async () => {
        setFetchingScore(true);
        try {
          // Selalu cari berdasarkan nama user yang sedang login saat ini
          const q = query(collection(db, "leaderboard"), where("name", "==", user.name));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            setCustomScore(data.score);
          }
        } catch (err) {
          console.error("Error fetching score:", err);
        } finally {
          setFetchingScore(false);
        }
      };
      getScore();
    }
  }, [user.isAdmin, user.name]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Nama tidak boleh kosong!");
    setIsSaving(true);
    
    try {
      // 1. Jika Admin, Update Leaderboard Score & Nama di Database Leaderboard
      if (user.isAdmin) {
        // Cari data leaderboard berdasarkan nama lama (original)
        const q = query(collection(db, "leaderboard"), where("name", "==", originalNameRef.current));
        const snap = await getDocs(q);
        
        const actualScore = Number(customScore);
        let rankTitle = "Dewa Admin Server";
        if (actualScore < 100) rankTitle = "Admin Junior";
        if (actualScore < 50) rankTitle = "Kabel Kusut (Admin)";

        if (!snap.empty) {
          // Update dokumen yang sudah ada
          const docRef = doc(db, "leaderboard", snap.docs[0].id);
          await updateDoc(docRef, {
            name: name, // Update ke nama baru jika user merubah namanya
            score: actualScore,
            rankTitle: rankTitle,
            photo: photo,
            isAdmin: true,
            updatedAt: serverTimestamp()
          });
        } else {
          // Buat baru jika belum ada
          await addDoc(collection(db, "leaderboard"), {
            name: name,
            score: actualScore,
            rankTitle: rankTitle,
            isAdmin: true,
            photo: photo,
            createdAt: serverTimestamp()
          });
        }
        
        // Bersihkan cache quiz lama jika nama berubah agar tidak bisa kerjakan quiz lagi
        if (originalNameRef.current !== name) {
          localStorage.removeItem(`quiz_taken_${originalNameRef.current}`);
        }
        // Set cache quiz baru
        localStorage.setItem(`quiz_taken_${name}`, actualScore.toString());
      }

      // 2. Update Session Lokal (App State & LocalStorage)
      const updatedUser = {
        ...user,
        name,
        bio,
        photo
      };
      
      onUpdate(updatedUser);
      originalNameRef.current = name; // Update ref ke nama baru setelah sukses

      alert("Profil & Skor God-Mode Berhasil Disinkronkan! ⚡");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Gagal sinkronisasi ke server. Cek koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden">
      <div className="container mx-auto max-w-2xl">
        <header className="text-center mb-12 animate-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <UserIcon size={16} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Management</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            YOUR <span className="text-slate-200">PROFILE</span>
          </h2>
          <div className="w-24 h-1.5 bg-slate-900 mx-auto mt-8 rounded-full"></div>
        </header>

        <div className="glass rounded-[3.5rem] p-8 md:p-14 shadow-3xl border-white/60 relative animate-in zoom-in duration-700">
          {/* Badge Status */}
          <div className="absolute top-8 right-8">
            {user.isAdmin ? (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-blue-600 shadow-sm animate-pulse">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Admin</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 text-amber-600">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Valued Student</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mb-12">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-slate-200 to-slate-400 shadow-2xl overflow-hidden mb-6">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <UserIcon size={64} />
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-6 right-2 p-3 bg-slate-900 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoChange} 
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Secret Admin Cheat Mode */}
            {user.isAdmin && (
              <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border-2 border-amber-200 border-dashed relative overflow-hidden group/admin">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/admin:opacity-20 transition-opacity">
                  <Zap size={60} className="text-amber-500" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-amber-400 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Zap size={16} className="fill-white" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Admin Cheat Mode (Score Override)</h4>
                </div>
                
                <div className="relative">
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={20} />
                  <input 
                    type="number" 
                    value={customScore}
                    onChange={(e) => setCustomScore(parseInt(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-5 bg-white/80 border border-amber-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-400/20 font-artist text-3xl font-black text-slate-900"
                    placeholder="Set Point Manual"
                  />
                  {fetchingScore && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 animate-spin" size={16} />}
                </div>
                <p className="mt-4 text-[9px] font-bold text-amber-500 uppercase tracking-widest">Skor ini akan tertanam permanen di database global.</p>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Display Name</label>
              <div className="relative group">
                <Edit2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-slate-900/10 font-artist text-2xl font-bold text-slate-900 tracking-tight"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Short Bio</label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-5 text-slate-300" size={16} />
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  className="w-full pl-12 pr-4 py-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-slate-900/10 font-handwriting text-2xl text-slate-500 min-h-[120px]"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all shadow-2xl font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} className="group-hover:rotate-12 transition-transform" />
                )}
                {isSaving ? 'Sychronizing...' : 'Save & Overwrite Score'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
