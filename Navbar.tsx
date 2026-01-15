
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User as UserIcon, LogOut, Bell, ShieldAlert, MessageSquare, Loader2, Clock, School, Trash2, CheckCircle2 } from 'lucide-react';
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: {
    name: string;
    isAdmin: boolean;
    photo?: string;
  };
}

interface ActivityLog {
  id: string;
  type: 'login' | 'post';
  user: string;
  school?: string; // Menambahkan field Sekolah
  message: string;
  time: any; // Firestore timestamp
  photo?: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // State untuk Notifikasi Admin
  const [showNotif, setShowNotif] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // --- KONFIGURASI PATH LOGO (Mengarah ke folder public/logoSekolah) ---
  const schoolLogoUrl = "/logoSekolah/logo-sekolah.png"; 
  const majorLogoUrl = "/logoSekolah/logo-jurusan.png";

  // NAVIGATION ITEMS (Rebranded to Gen Z / Aesthetic Terms)
  const navLinks = [
    { name: 'Base', id: 'home' },       // Home -> Base (Basecamp)
    { name: 'Vibes', id: 'about' },     // About/Gallery -> Vibes
    { name: 'Circle', id: 'members' },  // Members -> Circle/Gang
    { name: 'Spill', id: 'wall' },      // Wall -> Spill (Spill Tea)
    { name: 'Plan', id: 'schedule' },   // Schedule -> Plan
    { name: 'Vote', id: 'voting' },     // Vote -> Vote
    { name: 'Play', id: 'quiz' },       // Quiz -> Play
    { name: 'Math', id: 'calculator' }, // Calculator -> Math
  ];

  // Fetch Data Notifikasi saat Lonceng diklik
  useEffect(() => {
    if (showNotif && user.isAdmin) {
      const fetchActivities = async () => {
        setLoadingNotif(true);
        try {
          // Cek timestamp terakhir dihapus dari LocalStorage
          const lastClearedTime = parseInt(localStorage.getItem('tjkt_log_cleared_at') || '0');

          const logs: ActivityLog[] = [];

          // 1. Ambil 8 Login Terakhir
          const loginQ = query(collection(db, "user_logins"), orderBy("timestamp", "desc"), limit(8));
          const loginSnap = await getDocs(loginQ);
          loginSnap.forEach(doc => {
            const data = doc.data();
            const docTime = data.timestamp?.seconds * 1000 || 0;
            
            if (docTime > lastClearedTime) {
                logs.push({
                  id: 'login_' + doc.id,
                  type: 'login',
                  user: data.name,
                  school: data.classMajor || 'Unknown School',
                  message: 'Sedang Online',
                  time: data.timestamp,
                  photo: data.photo
                });
            }
          });

          // 2. Ambil 5 Postingan Wall Terakhir
          const wallQ = query(collection(db, "global_wall"), orderBy("createdAt", "desc"), limit(5));
          const wallSnap = await getDocs(wallQ);
          wallSnap.forEach(doc => {
            const data = doc.data();
            const docTime = data.createdAt?.seconds * 1000 || 0;

            if (docTime > lastClearedTime) {
                logs.push({
                  id: 'post_' + doc.id,
                  type: 'post',
                  user: data.sender,
                  school: 'Member Kelas',
                  message: `Post: "${data.text?.substring(0, 15)}${data.text?.length > 15 ? '...' : ''}"`,
                  time: data.createdAt,
                  photo: data.photo
                });
            }
          });

          // Gabungkan dan Sortir
          logs.sort((a, b) => {
             const timeA = a.time?.seconds || 0;
             const timeB = b.time?.seconds || 0;
             return timeB - timeA;
          });

          setActivities(logs.slice(0, 10)); 
        } catch (error) {
          console.error("Error fetching notifs", error);
        } finally {
          setLoadingNotif(false);
        }
      };

      fetchActivities();
    }
  }, [showNotif, user.isAdmin]);

  const handleClearLogs = () => {
      const now = Date.now();
      localStorage.setItem('tjkt_log_cleared_at', now.toString());
      setActivities([]); 
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('tjkt_session');
    window.location.reload();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* FLOATING NAVBAR CONTAINER */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="glass rounded-full px-3 py-2 flex items-center gap-3 pointer-events-auto shadow-xl shadow-slate-200/50 bg-white/80 border border-white/50 backdrop-blur-xl animate-in slide-in-from-top duration-700 max-w-full">
          
          {/* --- KIRI: LOGO SEKOLAH & LOGO KELAS --- */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
             {/* LOGO SEKOLAH */}
             <div className="w-8 h-8 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                <img 
                  src={schoolLogoUrl} 
                  alt="School" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
             </div>
             
             {/* SEPARATOR KECIL */}
             <div className="w-[1px] h-4 bg-slate-300"></div>

             {/* LOGO KELAS (X) */}
             <div 
               className="w-9 h-9 shrink-0 bg-slate-900 rounded-full flex items-center justify-center text-white font-black font-artist text-xs hover:scale-110 active:scale-95 transition-transform duration-300 shadow-md"
             >
               X
             </div>
          </div>

          {/* --- TENGAH: MENU DESKTOP --- */}
          <div className="hidden lg:flex items-center bg-slate-100/50 rounded-full px-1 py-1">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === link.id ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'}`}
              >
                {link.name}
              </button>
            ))}
            <button onClick={() => handleNavClick('cinema')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === 'cinema' ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'}`}>Nobar</button>
            <button onClick={() => handleNavClick('generator')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === 'generator' ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'}`}>Gacha</button>
          </div>

          <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden lg:block"></div>

          {/* --- KANAN: CONTROLS & LOGO JURUSAN --- */}
          <div className="flex items-center gap-2 pr-1">
            
            {/* NOTIFICATION BELL */}
            {user.isAdmin && (
              <div className="relative" ref={notifRef}>
                <button 
                   onClick={() => setShowNotif(!showNotif)}
                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative group hover:scale-105 active:scale-95 ${showNotif ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100/50 hover:bg-white text-slate-900'}`}
                >
                   <Bell size={18} />
                   <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                </button>
                {/* NOTIFICATION DROPDOWN */}
                {showNotif && (
                  <div className="absolute top-full right-0 mt-4 w-[85vw] sm:w-96 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div><h4 className="font-artist text-lg font-bold text-slate-900">Log Aktivitas</h4><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Realtime Monitor</p></div>
                      <div className="flex items-center gap-2"><button onClick={handleClearLogs} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button><div className="flex items-center gap-1 bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-[9px] font-bold">LIVE</span></div></div>
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1">
                      {loadingNotif ? (<div className="py-8 flex justify-center text-slate-400"><Loader2 size={24} className="animate-spin" /></div>) : activities.length > 0 ? (activities.map((log) => (<div key={log.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"><div className="relative shrink-0"><div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">{log.photo ? (<img src={log.photo} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${log.user}`; }}/>) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><UserIcon size={16} /></div>)}</div></div><div className="flex-grow min-w-0"><div className="flex justify-between items-start"><p className="text-xs font-bold text-slate-900 truncate pr-2">{log.user}</p><span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">{formatTime(log.time)}</span></div><div className="flex items-center gap-1.5 mt-0.5">{log.type === 'login' ? <School size={10} className="text-slate-400" /> : <MessageSquare size={10} className="text-slate-400" />}<p className="text-[10px] text-slate-500 truncate font-medium">{log.school || log.message}</p></div></div></div>))) : (<div className="py-12 text-center"><CheckCircle2 size={32} className="mx-auto text-slate-200 mb-2" /><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Log Bersih</p></div>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            <button 
              onClick={() => handleNavClick('profile')}
              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 shrink-0 ${currentPage === 'profile' ? 'border-slate-900 shadow-md' : 'border-white hover:border-slate-200'}`}
            >
              {user.photo ? (
                <img src={user.photo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><UserIcon size={16} /></div>
              )}
            </button>

            {/* MOBILE MENU TOGGLE */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 transition-colors active:scale-90"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* SEPARATOR KANAN */}
            <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>

            {/* LOGO JURUSAN */}
            <div className="w-8 h-8 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                <img 
                  src={majorLogoUrl} 
                  alt="Major" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </div>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl animate-in fade-in duration-300 lg:hidden overflow-y-auto">
           <div className="min-h-screen flex flex-col items-center justify-start pt-32 pb-10 px-6">
              <div className="w-full max-w-sm flex flex-col gap-4">
                  {navLinks.map((link, idx) => (
                    <button 
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full py-4 rounded-3xl text-xl font-artist font-black uppercase tracking-tight transition-all duration-300 animate-in slide-in-from-bottom border-2 ${
                        currentPage === link.id 
                        ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-xl' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {link.name}
                    </button>
                  ))}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button onClick={() => handleNavClick('cinema')} className="py-4 bg-red-50 text-red-500 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all border border-red-100">Nobar</button>
                    <button onClick={() => handleNavClick('generator')} className="py-4 bg-emerald-50 text-emerald-500 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100">Gacha</button>
                  </div>
                  <button onClick={handleLogout} className="mt-8 px-8 py-4 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group">
                     <LogOut size={16} className="group-hover:-translate-x-1 transition-transform"/> Keluar Akun
                  </button>
              </div>
              <div className="mt-12 text-center opacity-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">X TJKT TWO Mobile</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
