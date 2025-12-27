
import React from 'react';
import { Menu, X, User, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userName?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, userName, isAdmin, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const getInitial = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-lg bg-white/70 border-white' : 'bg-white/10 border-transparent'}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="font-artist text-xl font-bold tracking-tighter text-slate-800">X TJKT TWO</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentPage === link.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {link.name}
              </button>
            ))}
            
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-900 leading-none">{userName?.split(' ')[0]}</span>
                  {isAdmin && <span className="text-[8px] text-blue-600 font-bold uppercase tracking-tighter">Admin</span>}
               </div>
               <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
               >
                 <LogOut size={16} />
               </button>
            </div>
          </div>

          <button className="md:hidden p-1 text-slate-800" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-24 left-6 right-6 md:hidden">
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
              onClick={onLogout}
              className="flex items-center gap-3 pt-4 text-red-500 font-bold uppercase tracking-widest text-xs"
            >
              <LogOut size={16} /> Logout System
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
