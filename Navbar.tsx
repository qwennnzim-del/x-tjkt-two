
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User as UserIcon, CheckCircle2, Bell, ShieldAlert, Clock, MoreVertical, LogOut, Smartphone, Monitor, Trash2 } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  writeBatch,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: {
    name: string;
    isAdmin: boolean;
    photo?: string;
  };
}

interface LoginActivity {
  id: string;
  name: string;
  classMajor: string;
  timestamp: any;
  lastActive?: any; 
  isAdmin: boolean;
  deviceType?: string;
  deviceOS?: string;
  photo?: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [logins, setLogins] = useState<LoginActivity[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user.isAdmin) return;
    const q = query(collection(db, "user_logins"), orderBy("lastActive", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoginActivity[];
      if (logins.length > 0 && newLogins.length > 0 && newLogins[0].id !== logins[0].id) {
        setHasNew(true);
      }
      setLogins(newLogins);
    }, (err) => { console.error("Notification listener failed:", err); });
    return () => unsubscribe();
  }, [user.isAdmin, logins.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) { setShowNotifications(false); }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) { setShowMoreMenu(false); }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Vibes', id: 'about' },
    { name: 'Cinema', id: 'cinema' },
    { name: 'Squad', id: 'members' },
    { name: 'Generator', id: 'generator' }, 
    { name: 'Game', id: 'quiz' }, 
    { name: 'Wall', id: 'wall' },
    { name: 'Vote', id: 'voting' },
    { name: 'Jadwal', id: 'schedule' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    // Hapus sesi dari localStorage
    localStorage.removeItem('tjkt_session');
    // Reload halaman untuk kembali ke Login screen
    window.location.reload();
  };

  const checkIsOnline = (lastActive: any) => {
     if (!lastActive) return false;
     const now = Date.now();
     const diff = now - (lastActive.seconds * 1000);
     return diff < 2 * 60 * 1000; 
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-xl bg-white/80 border-white' : 'bg-white/10 border-transparent'}`}>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs transition-transform group-hover:rotate-6">X</div>
            <span className="font-artist text-xl font-bold tracking-tighter text-slate-800">TJKT TWO</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-full ${currentPage === link.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user.isAdmin && (
              <div className="flex items-center gap-2">
                <div className="relative" ref={notificationRef}>
                  <button onClick={() => { setShowNotifications(!showNotifications); setHasNew(false); }} className={`p-2.5 rounded-full transition-all relative group ${showNotifications ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}>
                    <Bell size={18} className={hasNew ? 'animate-bounce' : ''} />
                    {hasNew && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>}
                  </button>
                  {showNotifications && (
                    <div className="absolute top-14 right-[-60px] md:right-0 w-[85vw] md:w-96 glass rounded-[2.5rem] shadow-3xl border-white/60 p-6 animate-in slide-in-from-top-4 duration-500 overflow-hidden z-[60]">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">User Activity</h4></div>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                        {logins.map((login) => {
                          const isOnline = checkIsOnline(login.lastActive || login.timestamp);
                          return (
                            <div key={login.id} className="flex gap-4 p-3 rounded-2xl bg-white/40 border border-white/60">
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                                {login.photo ? <img src={login.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50"><UserIcon size={16}/></div>}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black uppercase text-slate-900">{login.name.split(' ')[0]}</p>
                                  <div className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</div>
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{login.classMajor}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* PROFILE BUTTON */}
            <button onClick={() => handleNavClick('profile')} className={`hidden lg:flex items-center gap-3 p-1 pr-4 rounded-full transition-all border ${currentPage === 'profile' ? 'bg-slate-900 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-white shrink-0">
                {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserIcon size={14} /></div>}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
            </button>

            {/* LOGOUT BUTTON DESKTOP */}
            <button 
              onClick={handleLogout}
              className="hidden lg:flex p-2.5 rounded-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
              title="Keluar Sesi"
            >
              <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* MOBILE MENU TOGGLE */}
            <button className="lg:hidden p-2 text-slate-800 bg-white border border-slate-100 rounded-full" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="absolute top-24 left-6 right-6 lg:hidden z-40">
          <div className="glass rounded-[2.5rem] p-6 flex flex-col gap-4 shadow-3xl animate-in slide-in-from-top duration-500">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => handleNavClick(link.id)} className={`text-sm font-black uppercase tracking-[0.2em] py-3 text-left border-b border-slate-50 last:border-0 ${currentPage === link.id ? 'text-slate-900' : 'text-slate-400'}`}>{link.name}</button>
            ))}
            
            <div className="h-px bg-slate-100 my-2"></div>
            
            <button onClick={() => handleNavClick('profile')} className="flex items-center gap-4 py-3 group">
               <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                  {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><UserIcon size={16}/></div>}
               </div>
               <div className="text-left">
                  <p className="text-xs font-black uppercase text-slate-900">{user.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Edit Profile</p>
               </div>
            </button>

            {/* LOGOUT BUTTON MOBILE */}
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all border border-red-100 mt-2"
            >
               <LogOut size={14} /> Keluar / Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
