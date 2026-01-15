
import React, { useState, useRef, useEffect } from 'react';
import { User, School, ArrowRight, CheckCircle2, ShieldCheck, Lock, Sparkles, X, Grid, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { db } from './firebase';
import { collection, serverTimestamp, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface LoginProps {
  onLogin: (userData: { name: string; classMajor: string; isAdmin: boolean; photo?: string }) => void;
}

// URL LOGO SEKOLAH (Mengarah ke folder khusus)
const schoolLogoUrl = "/logoSekolah/logo-sekolah.png"; 

// DAFTAR SEKOLAH CIANJUR
const CIANJUR_SCHOOLS = [
  "SMK Negeri 1 Cianjur",
  "SMK Negeri 2 Cilaku",
  "SMA Negeri 1 Cianjur",
  "SMA Negeri 2 Cianjur",
  "SMA Pasundan 1 Cianjur",
  "SMA Mardi Yuana Cianjur",
  "MAN 1 Cianjur",
  "SMK Pasundan 1 Cianjur",
  "SMK Ar-Rahmah Cianjur",
  "SMK Bunga Persada",
  "SMK Bela Nusantara",
  "SMA Negeri 1 Cilaku",
  "SMA Negeri 1 Karangtengah",
  "SMK NURUL ISLAM AFFANDIYAH",
  "Lainnya (Luar Cianjur)"
];

// KOLEKSI AVATAR "SKETCH AESTHETIC" (Notion Style)
const AVATARS = [
  // 1. FOTO CUSTOM USER (Prioritas Utama)
  "https://img.sanishtech.com/u/2a6115aa5eb5ea3595ac4bc0d4519179.jpg",
  "https://img.sanishtech.com/u/3d1f4fd033c3b0634c4ae44d41ff0639.jpg",
  "https://img.sanishtech.com/u/db15721ab0a8f37db6160f87eb3af40f.jpg",
  "https://img.sanishtech.com/u/5fc118cbd7ed0a5cb60e0ee59b25fff5.jpg",
  "https://img.sanishtech.com/u/83ae9abb5e8ec549b59c6c200ecb4667.jpg",
  "https://img.sanishtech.com/u/3c228ae1dc18de1e4d77b67552d6a825.jpg",

  // 2. Cowok Sketsa Cool
  "https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Zack&backgroundColor=e5e7eb",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=e5e7eb",
  "https://api.dicebear.com/9.x/notionists/svg?seed=George&backgroundColor=e5e7eb",
  
  // 3. Cewek Sketsa Cantik
  "https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=e5e7eb",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Molly&backgroundColor=e5e7eb",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Bella&backgroundColor=e5e7eb",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Lola&backgroundColor=e5e7eb",
  
  // 4. Style Spesial (Kacamata / Rambut Unik)
  "https://api.dicebear.com/9.x/notionists/svg?seed=Midnight&backgroundColor=e5e7eb",
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [classMajor, setClassMajor] = useState(''); // Menyimpan Nama Sekolah
  const [adminCode, setAdminCode] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const [slideComplete, setSlideComplete] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State untuk Custom Dropdown
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const SECRET_ADMIN_CODE = "TJKTAUTH0808";

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSchoolDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const triggerLogin = async () => {
    setIsProcessing(true);
    let isAdmin = false;

    if (showAdminField && adminCode.length > 0) {
      if (adminCode === SECRET_ADMIN_CODE) {
        isAdmin = true;
      }
    }
    
    const deviceInfo = getDeviceDetails();
    
    try {
      const userId = name.toLowerCase().replace(/\s+/g, '_');
      
      await setDoc(doc(db, "user_logins", userId), {
        name,
        classMajor, // Disimpan sebagai sekolah
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
        <div className="text-center mb-6 flex flex-col items-center">
          {/* SCHOOL LOGO */}
          <div className="w-16 h-16 mb-4 flex items-center justify-center opacity-90 drop-shadow-md">
             <img 
               src={schoolLogoUrl} 
               alt="School Logo" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 // Fallback jika gambar tidak ditemukan
                 e.currentTarget.style.display = 'none';
               }}
             />
          </div>
          
          <span className="font-handwriting text-3xl text-slate-400 block mb-1">Kenalan Dulu Dong</span>
          <h1 className="font-artist text-3xl font-bold text-slate-900 tracking-tight">X TJKT TWO</h1>
        </div>

        {/* PHOTO SELECTION CIRCLE */}
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300 flex items-center justify-center bg-white ${photo ? 'border-slate-900' : 'border-dashed border-slate-300 bg-slate-50'}`}>
              {photo ? (
                <img 
                  src={photo} 
                  alt="Selected Avatar" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${name || 'User'}`;
                  }}
                />
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
              placeholder="Nama Lengkap Lo" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* CUSTOM SCHOOL DROPDOWN */}
          <div className="relative group" ref={dropdownRef}>
            <div 
              onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
              className={`w-full pl-12 pr-10 py-4 bg-white/60 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${showSchoolDropdown ? 'border-slate-900 ring-2 ring-slate-900/10 bg-white' : 'border-slate-200/50 hover:bg-white'}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-900 transition-colors" size={20} />
                <span className={`font-medium truncate ${classMajor ? 'text-slate-900' : 'text-slate-400'}`}>
                  {classMajor || "Sekolah Mana Ni?"}
                </span>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showSchoolDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* THE CUSTOM POPUP / DROPDOWN MENU */}
            {showSchoolDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto no-scrollbar">
                <div className="p-2 space-y-1">
                  {CIANJUR_SCHOOLS.map((school, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setClassMajor(school);
                        setShowSchoolDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${
                        classMajor === school 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {school}
                      {classMajor === school && <Check size={16} className="text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            {showAdminField ? 'Gajadi Admin' : 'Login Admin'}
          </button>
        </div>

        {/* Custom Slider Confirmation */}
        <div className="mt-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            {!isFormValid ? 'Isi Nama Dulu Dong' : slideComplete ? (isProcessing ? 'Bentar Yaa...' : 'Gas Masuk!') : 'Geser Buat Masuk'}
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

      {/* AVATAR SELECTOR MODAL 3D */}
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
              <h3 className="font-artist text-3xl font-bold text-slate-900">Pilih Avatar</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Biar Makin Kece</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar p-2">
              {AVATARS.map((avatarUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPhoto(avatarUrl);
                    setShowAvatarModal(false);
                  }}
                  className={`relative group aspect-square rounded-full overflow-hidden border-2 transition-all duration-300 hover:scale-105 bg-white flex items-center justify-center ${photo === avatarUrl ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl' : 'border-slate-200 hover:border-slate-900'}`}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`Avatar ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${idx}`;
                    }}
                  />
                  
                  {photo === avatarUrl && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md z-20">
                      <CheckCircle2 size={12} />
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
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white">
             {photo ? <img src={photo} alt="Me" className="w-full h-full object-contain" /> : <User size={20} className="m-auto mt-2 text-slate-900" />}
          </div>
          <div>
            <p className="font-bold text-sm">
              {adminCode === SECRET_ADMIN_CODE ? 'Welcome, Mimin!' : `Halo, ${name.split(' ')[0]}!`}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Profile Ready. Gas!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
