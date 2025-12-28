
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Trophy, User as UserIcon, CheckCircle2, Bell, ShieldAlert, Clock } from 'lucide-react';
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
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logins, setLogins] = useState<LoginActivity[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogins = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoginActivity[];
      
      if (logins.length > 0 && newLogins.length > 0 && newLogins[0].id !== logins[0].id) {
        setHasNew(true);
      }
      setLogins(newLogins);
    });

    return () => unsubscribe();
  }, [user.isAdmin, logins.length]);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setHasNew(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-lg bg-white/70 border-white' : 'bg-white/10 border-transparent'}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="font-artist text-xl font-bold tracking-tighter text-slate-800">X TJKT TWO</span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1 rounded-full ${currentPage === link.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {link.name}
              </button>
            ))}
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3">
              {/* Notification Bell for Admin Only */}
              {user.isAdmin && (
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={toggleNotifications}
                    className={`p-2 rounded-full transition-all relative ${showNotifications ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900'}`}
                  >
                    <Bell size={18} className={hasNew ? 'animate-bounce' : ''} />
                    {hasNew && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-12 right-0 w-80 glass rounded-[2rem] shadow-3xl border-white/60 p-6 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={14} className="text-blue-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Login Feed</h4>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Admin Only</span>
                      </div>

                      <div className="space-y-4">
                        {logins.length > 0 ? (
                          logins.map((login) => (
                            <div key={login.id} className="flex gap-4 p-3 rounded-2xl hover:bg-white/40 transition-colors border border-transparent hover:border-slate-100">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${login.isAdmin ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}>
                                <UserIcon size={16} />
                              </div>
                              <div className="flex-grow">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1">
                                  {login.name} {login.isAdmin && <CheckCircle2 size={10} className="text-blue-500" />}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                  {login.classMajor}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-[8px] text-slate-300 font-black">
                                  <Clock size={8} /> 
                                  {login.timestamp ? new Date(login.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">No login activity yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => handleNavClick('profile')}
                className={`flex items-center gap-3 p-1 pr-4 rounded-full transition-all border ${currentPage === 'profile' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-white/50 shadow-sm">
                  {user.photo ? (
                    <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black leading-none uppercase tracking-tighter ${currentPage === 'profile' ? 'text-white' : 'text-slate-900'}`}>
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

      {isOpen && (
        <div className="absolute top-24 left-6 right-6 lg:hidden">
          <div className="glass rounded-3xl p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-lg font-medium py-2 text-left border-b border-white/20 last:border-0 ${currentPage === link.id ? 'text-slate-900 font-bold' : 'text-slate-600'}`}
              >
                {link.name}
              </button>
            ))}
            
            <button 
              onClick={() => handleNavClick('profile')}
              className={`flex items-center gap-4 py-4 text-slate-900 font-bold border-t border-white/20 mt-2`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                {user.photo ? <img src={user.photo} alt="P" className="w-full h-full object-cover" /> : <UserIcon size={20} className="m-auto mt-2" />}
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 uppercase text-xs tracking-tight">My Profile {user.isAdmin && <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" />}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Account Settings</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
