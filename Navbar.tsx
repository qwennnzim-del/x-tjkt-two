
import React from 'react';
import { Menu, X, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userName?: string;
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, userName, isAdmin }) => {
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
        <div className={`glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-lg bg-white/60' : 'bg-white/10 border-transparent'}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="font-artist text-xl font-bold tracking-tighter text-slate-800">X TJKT TWO</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link.id)}
                className={`text-xs font-semibold uppercase tracking-widest transition-colors ${currentPage === link.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {link.name}
              </button>
            ))}
            
            {/* User Indicator */}
            <div className="relative group">
              <div className={`h-8 w-8 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-slate-900'} text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm transition-colors`} title={userName}>
                {getInitial(userName)}
              </div>
              {isAdmin && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full text-blue-600 shadow-sm border border-blue-50">
                  <ShieldCheck size={10} />
                </div>
              )}
            </div>
          </div>

          <button className="md:hidden p-1 text-slate-800 flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
            <div className={`h-6 w-6 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-slate-900'} text-white flex items-center justify-center text-[10px] font-bold`}>
              {getInitial(userName)}
            </div>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
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
            <div className="flex items-center gap-3 pt-4 border-t border-white/20">
              <div className={`h-10 w-10 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-slate-900'} text-white flex items-center justify-center font-bold relative`}>
                {getInitial(userName)}
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-blue-600 shadow-sm border border-blue-50">
                    <ShieldCheck size={12} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{userName || 'User'}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  {isAdmin ? 'Administrator Connected' : 'Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
