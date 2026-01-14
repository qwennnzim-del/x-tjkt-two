
import React, { useState, useRef } from 'react';
import { User, School, ArrowRight, CheckCircle2, ShieldCheck, Lock, Sparkles, X, Grid, Loader2 } from 'lucide-react';
import { db } from './firebase';
import { collection, serverTimestamp, setDoc, doc, runTransaction } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface LoginProps {
  onLogin: (userData: { name: string; classMajor: string; isAdmin: boolean; photo?: string }) => void;
}

const AVATARS = [
  "https://img.sanishtech.com/u/9ccea957849bb7793480e98a39f3c0c9.jpg",
  "https://img.sanishtech.com/u/a8715b0203becd730da838f2a29512e5.jpg",
  "https://img.sanishtech.com/u/1fc38868e47381608e77290305c4ea85.jpg",
  "https://img.sanishtech.com/u/b6bbe3fe81124325572b15cc11552700.jpg",
  "https://img.sanishtech.com/u/fcf2603aaff914b3c1edf19dfdd9c778.jpg",
  "https://img.sanishtech.com/u/9ad6340a9f401792f3d8bc85f5d788cd.jpg",
  "https://img.sanishtech.com/u/4775236e062447d43b5cb56361fc1159.jpg",
  "https://img.sanishtech.com/u/0f1a2324bf297cf99e45fd402df48465.jpg",
  "https://img.sanishtech.com/u/7376f9dec64c42a53e23cac6b8bcfa16.jpg"
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [classMajor, setClassMajor] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const [slideComplete, setSlideComplete] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const SECRET_ADMIN_CODE = "TJKTAUTH0808";

  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let deviceType = "PC / Laptop";
    let os = "Unknown OS";

    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/.test(ua)) {
      deviceType = "HP / Mobile";
    } else if (/iPad|Tablet/i.test(ua)) {
      deviceType = "Tablet";
    }

    if (ua.indexOf("Win") !== -1) os = "Windows";
    else if (ua.indexOf("Mac") !== -1) os = "MacOS";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";
    else if (ua.indexOf("like Mac") !== -1) os = "iOS";

    return { type: deviceType, os: os };
  };

  const handleSlide = (e: React.MouseEvent | React.TouchEvent) => {
    if (slideComplete || !name || !classMajor || isProcessing) return;
    
    const slider = sliderRef.current;
    const handle = handleRef.current;
    if (!slider || !handle) return;

    const startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const sliderRect = slider.getBoundingClientRect();
    const maxSlide = sliderRect.width - handle.offsetWidth - 8;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      let delta = currentX - startX;
      delta = Math.max(0, Math.min(delta, maxSlide));
      
      handle.style.transform = `translateX(${delta}px)`;
      
      if (delta >= maxSlide - 5) {
        setSlideComplete(true);
        cleanup();
        triggerLogin();
      }
    };

    const cleanup = () => {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('mouseup', cleanup);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('touchend', cleanup);
      if (!slideComplete) {
        handle.style.transition = 'transform 0.3s ease';
        handle.style.transform = 'translateX(0px)';
        setTimeout(() => { handle.style.transition = ''; }, 300);
      }
    };

    window.addEventListener('mousemove', onMove as any);
    window.addEventListener('mouseup', cleanup);
    window.addEventListener('touchmove', onMove as any, { passive: false });
    window.addEventListener('touchend', cleanup);
  };

  // --- HIGH SECURITY CHECK ---
  const checkAndConsumeAdminQuota = async (): Promise<boolean> => {
    const configRef = doc(db, "app_settings", "admin_quota");

    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(configRef);
        
        // Logika: 
        // Jika dokumen belum ada, kita asumsikan 1 pemakaian sudah terjadi (History User).
        // Jadi currentUsage default = 1.
        let currentUsage = 1;

        if (sfDoc.exists()) {
          const data = sfDoc.data();
          // Jika ada data, gunakan data tersebut. 
          currentUsage = data.usage !== undefined ? data.usage : 1;
        }

        // Batas Maksimal = 2
        if (currentUsage >= 2) {
          throw "LIMIT_REACHED";
        }

        // Increment Usage
        transaction.set(configRef, { usage: currentUsage + 1 }, { merge: true });
      });
      return true; // Sukses, kuota masih ada
    } catch (e) {
      if (e === "LIMIT_REACHED") return false; // Gagal, kuota habis
      console.error("Admin verification error:", e);
      return false; // Fail safe
    }
  };

  const triggerLogin = async () => {
    setIsProcessing(true);
    let isAdmin = false;

    // Jika user mencoba login sebagai admin
    if (showAdminField && adminCode.length > 0) {
      if (adminCode === SECRET_ADMIN_CODE) {
        // Cek Kuota di Database
        const accessGranted = await checkAndConsumeAdminQuota();
        
        if (!accessGranted) {
          alert("Kode telah dibatas oleh hezell");
          setSlideComplete(false);
          setIsProcessing(false);
          // Reset slider visuals
          if (handleRef.current) {
            handleRef.current.style.transform = 'translateX(0px)';
          }
          return; // Stop login process
        }
        
        isAdmin = true;
      }
    }
    
    const deviceInfo = getDeviceDetails();
    
    try {
      // 1. Simpan Data Login untuk History & Notifikasi
      const userId = name.toLowerCase().replace(/\s+/g, '_');
      
      await setDoc(doc(db, "user_logins", userId), {
        name,
        classMajor,
        timestamp: serverTimestamp(),
        lastActive: serverTimestamp(), 
        isAdmin: isAdmin,
        photo: photo || null,
        deviceType: deviceInfo.type,
        deviceOS: deviceInfo.os,
        fullUserAgent: navigator.userAgent,
        status: 'online'
      });

    } catch (err) {
      console.error("Failed to log login:", err);
    }

    setShowNotification(true);
    setTimeout(() => {
      onLogin({ name, classMajor, isAdmin, photo: photo || undefined });
    }, 2000);
  };

  const isFormValid = name.length > 0 && classMajor.length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-clean flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>

      {/* Login Card */}
      <div className="w-full max-w-md glass rounded-[3rem] p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in duration-700 max-h-[90vh] overflow-y-auto no-scrollbar z-10">
        <div className="text-center mb-6">
          <span className="font-handwriting text-3xl text-slate-400 block mb-1">Setup Your Profile</span>
          <h1 className="font-artist text-3xl font-bold text-slate-900 tracking-tight">X TJKT TWO</h1>
        </div>

        {/* PHOTO SELECTION CIRCLE */}
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300 ${photo ? 'border-slate-900' : 'border-dashed border-slate-300 bg-slate-50'}`}>
              {photo ? (
                <img src={photo} alt="Selected Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-slate-100 transition-colors">
                  <Sparkles size={32} className="text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">Pilih Avatar</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <Grid size={16} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Kelas (e.g. X TJKT 2)" 
              value={classMajor}
              onChange={(e) => setClassMajor(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {showAdminField && (
            <div className="relative group animate-in slide-in-from-top-2 duration-300">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Kode Rahasia Admin" 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowAdminField(!showAdminField)}
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${showAdminField ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={12} />
            {showAdminField ? 'Batal Admin' : 'Masuk Sebagai Admin'}
          </button>
        </div>

        {/* Custom Slider Confirmation */}
        <div className="mt-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            {!isFormValid ? 'Lengkapi Nama & Kelas' : slideComplete ? (isProcessing ? 'Verifying...' : 'Access Granted!') : 'Geser untuk Gabung'}
          </p>
          
          <div 
            ref={sliderRef}
            className={`h-16 w-full rounded-full p-1 relative transition-all duration-500 overflow-hidden ${!isFormValid ? 'bg-slate-100 opacity-50 cursor-not-allowed' : 'bg-slate-200 cursor-pointer shadow-inner'}`}
          >
            <div 
              ref={handleRef}
              onMouseDown={handleSlide}
              onTouchStart={handleSlide}
              className={`absolute top-1 bottom-1 left-1 aspect-square rounded-full flex items-center justify-center transition-colors shadow-lg z-10 ${slideComplete ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-50'}`}
            >
              {isProcessing ? <Loader2 size={24} className="animate-spin" /> : slideComplete ? <CheckCircle2 size={24} /> : <ArrowRight size={24} />}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase transition-opacity duration-300" style={{ opacity: slideComplete ? 0 : 1 }}>Slide to Join</span>
            </div>
          </div>
        </div>
      </div>

      {/* AVATAR SELECTOR MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-clean rounded-[3rem] p-8 shadow-3xl relative overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white">
            <button 
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-200 rounded-full hover:bg-red-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <h3 className="font-artist text-3xl font-bold text-slate-900">Pilih Karaktermu</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Tentukan vibe kamu hari ini!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar p-2">
              {AVATARS.map((avatarUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPhoto(avatarUrl);
                    setShowAvatarModal(false);
                  }}
                  className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${photo === avatarUrl ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-900'}`}
                >
                  <img src={avatarUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                  {photo === avatarUrl && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={24} className="text-emerald-500 drop-shadow-md bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-2xl z-[130]">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
             {photo ? <img src={photo} alt="Me" className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2" />}
          </div>
          <div>
            <p className="font-bold text-sm">
              {adminCode === SECRET_ADMIN_CODE ? 'Welcome, Admin!' : `Halo, ${name.split(' ')[0]}!`}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Profile Setup Complete
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
