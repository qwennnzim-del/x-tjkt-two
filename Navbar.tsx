
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User as UserIcon, CheckCircle2, Bell, ShieldAlert, Clock, MoreVertical, LogOut, Smartphone, Monitor } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
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
  isAdmin: boolean;
  deviceType?: string;
  deviceOS?: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [logins, setLogins] = useState<LoginActivity[]>([]);
  const [hasNew, setHasNew] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time Notification Listener for Admin
  useEffect(() => {
    if (!user.isAdmin) return;

    const q = query(
      collection(db, "user_logins"),
      orderBy("timestamp", "desc"),
      limit(10) // Meningkatkan limit agar history lebih terlihat
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogins = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoginActivity[];
      
      // Jika ada ID baru yang masuk dan daftar tidak kosong, tandai sebagai 'baru'
      if (logins.length > 0 && newLogins.length > 0 && newLogins[0].id !== logins[0].id) {
        setHasNew(true);
      }
      setLogins(newLogins);
    }, (err) => {
      console.error("Notification listener failed:", err);
    });

    return () => unsubscribe();
  }, [user.isAdmin, logins.length]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home Base', id: 'home' },
    { name: 'Vibes Kita', id: 'about' },
    { name: 'The Squad', id: 'members' },
    { name: 'Jadwal Tempur', id: 'schedule' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('tjkt_session');
    window.location.reload();
  };

  const formatDetailedTime = (timestamp: any) => {
    if (!timestamp) return 'Just Now';
    const date = new Date(timestamp.seconds * 1000);
    // Format: 14:30:05
    return date.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-xl bg-white/80 border-white' : 'bg-white/10 border-transparent'}`}>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs transition-transform group-hover:rotate-6">X</div>
            <span className="font-artist text-xl font-bold tracking-tighter text-slate-800">TJKT TWO</span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1 rounded-full ${currentPage === link.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {link.name}
              </button>
            ))}
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-2">
              {/* ADMIN FEATURES */}
              {user.isAdmin && (
                <div className="flex items-center gap-2 mr-2">
                  {/* REAL-TIME NOTIFICATION BELL */}
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => { setShowNotifications(!showNotifications); setHasNew(false); }}
                      className={`p-2.5 rounded-full transition-all relative group ${showNotifications ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/30'}`}
                    >
                      <Bell size={18} className={hasNew ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'} />
                      {hasNew && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                      )}
                    </button>

                    {/* NOTIFICATION DROPDOWN */}
                    {showNotifications && (
                      <div className="absolute top-14 right-0 w-96 glass rounded-[2.5rem] shadow-3xl border-white/60 p-6 animate-in slide-in-from-top-4 duration-500 overflow-hidden z-50">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                              <ShieldAlert size={14} />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Traffic Feed</h4>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Admin Eyes Only</span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                          {logins.length > 0 ? (
                            logins.map((login) => (
                              <div key={login.id} className="flex gap-4 p-3.5 rounded-3xl hover:bg-white transition-all border border-transparent hover:border-slate-50 group/item shadow-sm hover:shadow-md">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover/item:-rotate-3 ${login.isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                                  <UserIcon size={16} />
                                </div>
                                <div className="flex-grow">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                        {login.name.split(' ')[0]}
                                      </p>
                                      {login.isAdmin && <CheckCircle2 size={12} className="text-blue-500" />}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                      <Clock size={10} />
                                      {formatDetailedTime(login.timestamp)}
                                    </div>
                                  </div>
                                  
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                    {login.classMajor}
                                  </p>

                                  {/* DEVICE INFO SECTION */}
                                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-dashed border-slate-100">
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                      {login.deviceType?.includes('HP') ? <Smartphone size={10} /> : <Monitor size={10} />}
                                      <span>{login.deviceType || 'Unknown Device'}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                    <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                                      {login.deviceOS || 'Unknown OS'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 text-center">
                              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={20} className="text-slate-200" />
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Silence is golden. No activity.</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                          <button className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Monitoring System Active</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MORE OPTIONS (TITIK 3) */}
                  <div className="relative" ref={moreMenuRef}>
                    <button 
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className={`p-2.5 rounded-full transition-all ${showMoreMenu ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900'}`}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showMoreMenu && (
                      <div className="absolute top-14 right-0 w-48 glass rounded-[1.5rem] shadow-3xl border-white/60 p-2 animate-in fade-in zoom-in duration-300 z-50">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition-all group"
                        >
                          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROFILE BUTTON */}
              <button 
                onClick={() => handleNavClick('profile')}
                className={`flex items-center gap-3 p-1 pr-4 rounded-full transition-all border ${currentPage === 'profile' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-white/50 shadow-sm shrink-0">
                  {user.photo ? (
                    <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black leading-none uppercase tracking-tighter truncate max-w-[80px] ${currentPage === 'profile' ? 'text-white' : 'text-slate-900'}`}>
                    {user.name.split(' ')[0]}
                  </span>
                  {user.isAdmin && <CheckCircle2 size={12} className="text-blue-500 fill-blue-500/10" />}
                </div>
              </button>
            </div>
          </div>

          <button className="lg:hidden p-1 text-slate-800" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute top-24 left-6 right-6 lg:hidden z-40">
          <div className="glass rounded-[2.5rem] p-6 flex flex-col gap-4 shadow-3xl animate-in slide-in-from-top duration-500">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-sm font-black uppercase tracking-[0.2em] py-3 text-left border-b border-slate-50 last:border-0 ${currentPage === link.id ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {link.name}
              </button>
            ))}
            
            <button 
              onClick={() => handleNavClick('profile')}
              className={`flex items-center gap-4 py-4 mt-2 border-t border-slate-50`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                {user.photo ? <img src={user.photo} alt="P" className="w-full h-full object-cover" /> : <UserIcon size={20} className="m-auto mt-2" />}
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 uppercase text-xs font-black tracking-tighter text-slate-900">
                  Account Identity {user.isAdmin && <CheckCircle2 size={12} className="text-blue-500" />}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Manage Profile Settings</span>
              </div>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-2"
            >
              <LogOut size={16} /> Logout Securely
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
