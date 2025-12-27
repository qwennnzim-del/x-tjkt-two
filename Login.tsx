
import React, { useState, useRef } from 'react';
import { User, School, ArrowRight, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface LoginProps {
  onLogin: (userData: { name: string; classMajor: string; isAdmin: boolean }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [classMajor, setClassMajor] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const [slideComplete, setSlideComplete] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const SECRET_ADMIN_CODE = "TJKTAUTH0808";

  const handleSlide = (e: React.MouseEvent | React.TouchEvent) => {
    if (slideComplete || !name || !classMajor) return;
    
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
    const isAdmin = adminCode === SECRET_ADMIN_CODE;
    
    // Simpan Log Login ke Firestore untuk dipantau Admin
    try {
      await addDoc(collection(db, "user_logins"), {
        name,
        classMajor,
        timestamp: serverTimestamp(),
        isAdmin: isAdmin
      });
    } catch (err) {
      console.error("Failed to log login:", err);
    }

    setShowNotification(true);
    setTimeout(() => {
      onLogin({ name, classMajor, isAdmin });
    }, 2000);
  };

  const isFormValid = name.length > 0 && classMajor.length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-clean flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>

      {/* Login Card */}
      <div className="w-full max-w-md glass rounded-[3rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <span className="font-handwriting text-3xl text-slate-400 block mb-2">Welcome Home</span>
          <h1 className="font-artist text-4xl font-bold text-slate-900 tracking-tight">X TJKT TWO</h1>
          <div className="w-12 h-1 bg-slate-900 mx-auto mt-4"></div>
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
              placeholder="Kelas & Jurusan (e.g. X TJKT 2)" 
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
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            {!isFormValid ? 'Isi data dulu ya' : slideComplete ? (adminCode === SECRET_ADMIN_CODE ? 'Admin Access Granted!' : 'Akun Berhasil Dibuat!') : 'Slide ke kanan buat masuk'}
          </p>
          
          <div 
            ref={sliderRef}
            className={`h-16 w-full rounded-full p-1 relative transition-all duration-500 overflow-hidden ${!isFormValid ? 'bg-slate-100 opacity-50 cursor-not-allowed' : 'bg-slate-100 cursor-pointer shadow-inner'}`}
          >
            <div 
              ref={handleRef}
              onMouseDown={handleSlide}
              onTouchStart={handleSlide}
              className={`absolute top-1 bottom-1 left-1 aspect-square rounded-full flex items-center justify-center transition-colors shadow-lg z-10 ${slideComplete ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-50'}`}
            >
              {slideComplete ? <CheckCircle2 size={24} /> : <ArrowRight size={24} />}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase transition-opacity duration-300" style={{ opacity: slideComplete ? 0 : 1 }}>Slide to Connect</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          X TJKT TWO — Professional Portfolio System
        </p>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-8 py-4 rounded-full flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 border-emerald-100 z-[110]">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">
              {adminCode === SECRET_ADMIN_CODE ? 'Admin Login Sukses!' : 'Berhasil!'}
            </p>
            <p className="text-xs text-slate-500">
              {adminCode === SECRET_ADMIN_CODE ? 'Mode administrator aktif.' : `Akun kamu sudah aktif, ${name.split(' ')[0]}.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
