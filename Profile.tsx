
import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Save, Edit2, CheckCircle2, Sparkles, MessageSquare, Loader2 } from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Memberikan delay sedikit untuk kesan sinkronisasi
    setTimeout(() => {
      const updatedUser = {
        ...user,
        name,
        bio,
        photo
      };
      
      onUpdate(updatedUser);
      setIsSaving(false);
      alert("Profil berhasil diperbarui secara lokal! ✨");
    }, 800);
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
                {isSaving ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
