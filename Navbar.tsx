
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User as UserIcon, LogOut, Bell, ShieldAlert, MessageSquare, Loader2, Clock } from 'lucide-react';
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

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Vibes', id: 'about' },
    { name: 'Squad', id: 'members' },
    { name: 'Wall', id: 'wall' },
    { name: 'Jadwal', id: 'schedule' },
    { name: 'Vote', id: 'voting' },
    { name: 'Game', id: 'quiz' },
    { name: 'Calc', id: 'calculator' },
  ];

  // Fetch Data Notifikasi saat Lonceng diklik
  useEffect(() => {
    if (showNotif && user.isAdmin) {
      const fetchActivities = async () => {
        setLoadingNotif(true);
        try {
          const logs: ActivityLog[] = [];

          // 1. Ambil 5 Login Terakhir
          const loginQ = query(collection(db, "user_logins"), orderBy("timestamp", "desc"), limit(5));
          const loginSnap = await getDocs(loginQ);
          loginSnap.forEach(doc => {
            const data = doc.data();
            logs.push({
              id: 'login_' + doc.id,
              type: 'login',
              user: data.name,
              message: 'Login ke sistem',
              time: data.timestamp,
              photo: data.photo
            });
          });

          // 2. Ambil 5 Postingan Wall Terakhir
          const wallQ = query(collection(db, "global_wall"), orderBy("createdAt", "desc"), limit(5));
          const wallSnap = await getDocs(wallQ);
          wallSnap.forEach(doc => {
            const data = doc.data();
            logs.push({
              id: 'post_' + doc.id,
              type: 'post',
              user: data.sender,
              message: `Posting: "${data.text?.substring(0, 20)}${data.text?.length > 20 ? '...' : ''}"`,
              time: data.createdAt,
              photo: data.photo
            });
          });

          // Gabungkan dan Sortir berdasarkan waktu terbaru
          logs.sort((a, b) => {
             const timeA = a.time?.seconds || 0;
             const timeB = b.time?.seconds || 0;
             return timeB - timeA;
          });

          setActivities(logs.slice(0, 8)); // Ambil 8 teratas gabungan
        } catch (error) {
          console.error("Error fetching notifs", error);
        } finally {
          setLoadingNotif(false);
        }
      };

      fetchActivities();
    }
  }, [showNotif, user.isAdmin]);

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
            <button onClick={() => handleNavClick('cinema')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === 'cinema' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Cinema</button>
            <button onClick={() => handleNavClick('generator')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentPage === 'generator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Gen</button>
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
                   <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                </button>

                {/* NOTIFICATION POPUP DROPDOWN */}
                {showNotif && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="font-artist text-lg font-bold text-slate-900">Activity Log</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terpantau 24/7 oleh Sistem</p>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                      {loadingNotif ? (
                        <div className="py-8 flex justify-center text-slate-400">
                          <Loader2 size={24} className="animate-spin" />
                        </div>
                      ) : activities.length > 0 ? (
                        activities.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.type === 'login' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                              {log.type === 'login' ? <UserIcon size={14} /> : <MessageSquare size={14} />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{log.user}</p>
                              <p className="text-[10px] text-slate-500 truncate">{log.message}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 whitespace-nowrap">
                              <Clock size={10} />
                              {formatTime(log.time)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs font-medium">
                          Tidak ada aktivitas baru
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
              <button onClick={() => handleNavClick('cinema')} className="text-lg font-bold text-slate-500 uppercase tracking-widest">Cinema</button>
              <button onClick={() => handleNavClick('generator')} className="text-lg font-bold text-slate-500 uppercase tracking-widest">Generator</button>
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
