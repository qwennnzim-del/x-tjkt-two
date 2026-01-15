
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

          // 1. Ambil 5 Login Terakhir
          const loginQ = query(collection(db, "user_logins"), orderBy("timestamp", "desc"), limit(8));
          const loginSnap = await getDocs(loginQ);
          loginSnap.forEach(doc => {
            const data = doc.data();
            // Filter berdasarkan waktu clear
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
            // Filter berdasarkan waktu clear
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

          // Gabungkan dan Sortir berdasarkan waktu terbaru
          logs.sort((a, b) => {
             const timeA = a.time?.seconds || 0;
             const timeB = b.time?.seconds || 0;
             return timeB - timeA;
          });

          setActivities(logs.slice(0, 10)); // Ambil 10 teratas gabungan
        } catch (error) {
          console.error("Error fetching notifs", error);
        } finally {
          setLoadingNotif(false);
        }
      };

      fetchActivities();
    }
  }, [showNotif, user.isAdmin]);

  // Handle Clear Log
  const handleClearLogs = () => {
      // Simpan waktu sekarang sebagai titik clear
      const now = Date.now();
      localStorage.setItem('tjkt_log_cleared_at', now.toString());
      setActivities([]); // Kosongkan state visual
  };

  // Handle klik di luar dropdown untuk menutup
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
        <div className="glass rounded-full px-2 py-2 flex items-center gap-2 pointer-events-auto shadow-xl shadow-slate-200/50 bg-white/70 border border-white/40 backdrop-blur-xl animate-in slide-in-from-top duration-700">
          
          {/* LOGO */}
          <div 
            onClick={() => handleNavClick('home')}
            className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black font-artist text-sm cursor-pointer hover:scale-105 transition-transform"
          >
            X
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center bg-slate-100/50 rounded-full px-1 py-1">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === link.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
              >
                {link.name}
              </button>
            ))}
            <button onClick={() => handleNavClick('cinema')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === 'cinema' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Nobar</button>
            <button onClick={() => handleNavClick('generator')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === 'generator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Gacha</button>
          </div>

          <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden lg:block"></div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2 pr-1">
            
            {/* NOTIFICATION BELL (ADMIN ONLY) */}
            {user.isAdmin && (
              <div className="relative" ref={notifRef}>
                <button 
                   onClick={() => setShowNotif(!showNotif)}
                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative group ${showNotif ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100/50 hover:bg-white text-slate-900'}`}
                   title="Admin Activity Log"
                >
                   <Bell size={18} />
                   {/* Hanya tampilkan dot merah jika ada aktivitas (logika sederhana) */}
                   <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                </button>

                {/* NOTIFICATION POPUP DROPDOWN */}
                {showNotif && (
                  <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <h4 className="font-artist text-lg font-bold text-slate-900">Log Aktivitas</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Realtime Monitor</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <button 
                            onClick={handleClearLogs}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Bersihkan Log"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="flex items-center gap-1 bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[9px] font-bold">LIVE</span>
                          </div>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                      {loadingNotif ? (
                        <div className="py-8 flex justify-center text-slate-400">
                          <Loader2 size={24} className="animate-spin" />
                        </div>
                      ) : activities.length > 0 ? (
                        activities.map((log) => (
                          <div key={log.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                            
                            {/* AVATAR + ONLINE INDICATOR */}
                            <div className="relative shrink-0">
                               <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                                  {log.photo ? (
                                    <img 
                                      src={log.photo} 
                                      alt="User" 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${log.user}`;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <UserIcon size={16} />
                                    </div>
                                  )}
                               </div>
                               {/* Green Dot for Online Status */}
                               {log.type === 'login' && (
                                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
                               )}
                            </div>

                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-slate-900 truncate pr-2">{log.user}</p>
                                <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">{formatTime(log.time)}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 {log.type === 'login' ? (
                                   <School size={10} className="text-slate-400" />
                                 ) : (
                                   <MessageSquare size={10} className="text-slate-400" />
                                 )}
                                 <p className="text-[10px] text-slate-500 truncate font-medium">
                                   {log.school || log.message}
                                 </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center">
                          <CheckCircle2 size={32} className="mx-auto text-slate-200 mb-2" />
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            Log Bersih
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 bg-slate-50/50 border-t border-slate-100 text-center">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Admin Eyes Only</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            <button 
              onClick={() => handleNavClick('profile')}
              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${currentPage === 'profile' ? 'border-slate-900 scale-105' : 'border-white hover:border-slate-200'}`}
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
              className="lg:hidden w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-xl animate-in fade-in duration-300 lg:hidden flex items-center justify-center">
           <div className="flex flex-col items-center gap-6 p-8">
              {navLinks.map((link) => (
                <button 
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-2xl font-artist font-black uppercase tracking-tight ${currentPage === link.id ? 'text-slate-900 scale-110' : 'text-slate-400'}`}
                >
                  {link.name}
                </button>
              ))}
              <div className="w-10 h-1 bg-slate-200 rounded-full my-4"></div>
              <button onClick={() => handleNavClick('cinema')} className="text-lg font-bold text-slate-500 uppercase tracking-widest">Nobar</button>
              <button onClick={() => handleNavClick('generator')} className="text-lg font-bold text-slate-500 uppercase tracking-widest">Gacha</button>
              <button onClick={handleLogout} className="mt-8 px-8 py-3 bg-red-50 text-red-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                 <LogOut size={14} /> Keluar
              </button>
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
