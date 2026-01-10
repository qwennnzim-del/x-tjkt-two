
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings, Clock, AlertTriangle, Hammer, RefreshCw, Lock, Unlock, WifiOff } from 'lucide-react'; // Added icons
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Cinema from './Cinema'; 
import Members from './Members';
import Schedule from './Schedule';
import Profile from './Profile';
import Footer from './Footer';
import Login from './Login';
import GlobalWall from './GlobalWall';
import Polling from './Polling';
import NotificationSystem from './NotificationSystem';
import ChatAssistant from './ChatAssistant'; 

// --- MAINTENANCE COMPONENT ---
interface MaintenanceProps {
  onUnlock: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceProps> = ({ onUnlock }) => {
  const MAINTENANCE_KEY = 'tjkt_maintenance_target';
  const DURATION_HOURS = 5;

  const [timeLeft, setTimeLeft] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // State untuk efek Prank Error
  const [statusText, setStatusText] = useState("Installing New Features v2.0");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // 1. Tentukan Waktu Target saat komponen dimuat
    const now = new Date().getTime();
    let targetTime = localStorage.getItem(MAINTENANCE_KEY);

    if (!targetTime) {
      const newTarget = now + (DURATION_HOURS * 60 * 60 * 1000);
      localStorage.setItem(MAINTENANCE_KEY, newTarget.toString());
      targetTime = newTarget.toString();
    }

    // 2. Update hitungan mundur setiap detik
    const updateTimer = () => {
      const currentTime = new Date().getTime();
      const storedTarget = localStorage.getItem(MAINTENANCE_KEY);
      
      if (!storedTarget) return;

      const distance = parseInt(storedTarget) - currentTime;

      if (distance < 0) {
        // --- PRANK LOGIC: WAKTU HABIS ---
        setIsError(true);
        setStatusText("CONNECTION TIMEOUT. RETRYING...");

        // Tahan di 00:00:00 selama 3 detik (3000ms), lalu reset
        // Kita pakai logika sederhana: jika distance < -3000, berarti sudah lewat 3 detik
        if (distance < -3000) {
            // Reset ke 5 Jam lagi
            const newTarget = currentTime + (DURATION_HOURS * 60 * 60 * 1000);
            localStorage.setItem(MAINTENANCE_KEY, newTarget.toString());
            
            // Kembalikan status normal
            setIsError(false);
            setStatusText("Installing New Features v2.0");
            setTimeLeft(DURATION_HOURS * 60 * 60);
        } else {
            // Masih dalam fase "Error" 3 detik
            setTimeLeft(0);
        }
      } else {
        // Normal Countdown
        setTimeLeft(Math.floor(distance / 1000));
        setIsError(false);
        setStatusText("Installing New Features v2.0");
      }
      setIsReady(true);
    };

    updateTimer(); 
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (navigator.vibrate) navigator.vibrate(50);

    if (newCount >= 5) {
      setIsUnlocking(true);
      setTimeout(() => {
        onUnlock();
      }, 1000);
    }
  };

  const time = formatTime(timeLeft);

  if (!isReady) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900 flex items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse ${isError ? 'bg-red-600/30' : 'bg-blue-600/20'}`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse delay-700 ${isError ? 'bg-red-600/30' : 'bg-purple-600/20'}`}></div>

      <div className={`relative max-w-lg w-full glass bg-white/5 border-white/10 p-10 rounded-[3rem] text-center shadow-2xl backdrop-blur-xl transition-all duration-700 ${isUnlocking ? 'scale-110 opacity-0 blur-xl' : 'scale-100 opacity-100'} ${isError ? 'border-red-500/50 shadow-red-900/50' : ''}`}>
        
        <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-8 animate-bounce transition-colors duration-500 ${isError ? 'bg-red-500 shadow-red-500/40' : 'bg-gradient-to-tr from-amber-400 to-orange-500 shadow-orange-500/20'}`}>
          {isError ? (
            <WifiOff size={40} className="text-white animate-pulse" />
          ) : (
            <Settings size={40} className="text-white animate-spin-slow duration-[3000ms]" />
          )}
        </div>

        <h1 className="font-artist text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none">
          SYSTEM <br/>
          <span className={`text-transparent bg-clip-text transition-colors duration-500 ${isError ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}>
            {isError ? 'ERROR' : 'UPDATE'}
          </span>
        </h1>

        <div className="space-y-4 mb-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-500 ${isError ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
            {isError ? <AlertTriangle size={14} className="text-red-400" /> : <RefreshCw size={14} className="text-blue-400 animate-spin" />}
            <span className={`text-[10px] font-black uppercase tracking-widest ${isError ? 'text-red-300' : 'text-blue-200'}`}>
              {statusText}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
            {isError 
              ? "Koneksi ke server terputus. Sistem sedang mencoba menghubungkan ulang secara otomatis..." 
              : "Mohon bersabar, website sedang di-update ke versi terbaru dengan fitur yang lebih canggih. Kami sedang melakukan pemeliharaan server besar-besaran."
            }
          </p>
        </div>

        {/* TIMER SECTION */}
        <div className={`bg-black/20 rounded-3xl p-6 border mb-8 transition-colors duration-500 ${isError ? 'border-red-500/30' : 'border-white/5'}`}>
          <p 
            onClick={handleSecretClick}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 cursor-default select-none active:text-slate-300 transition-colors"
          >
            ESTIMASI WAKTU (JAM) {clickCount > 0 && clickCount < 5 && <span className="text-slate-800">.</span>}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-white font-mono">
            <div className="flex flex-col gap-1">
              <span className={`text-4xl md:text-5xl font-bold bg-white/5 p-3 rounded-xl min-w-[70px] border transition-colors duration-500 ${isError ? 'text-red-500 border-red-500/20' : 'border-white/10'}`}>{time.h}</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500">Jam</span>
            </div>
            <span className={`text-2xl font-bold ${isError ? 'text-red-500' : 'text-slate-600'}`}>:</span>
            <div className="flex flex-col gap-1">
              <span className={`text-4xl md:text-5xl font-bold bg-white/5 p-3 rounded-xl min-w-[70px] border transition-colors duration-500 ${isError ? 'text-red-500 border-red-500/20' : 'border-white/10'}`}>{time.m}</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500">Menit</span>
            </div>
            <span className={`text-2xl font-bold ${isError ? 'text-red-500' : 'text-slate-600'}`}>:</span>
            <div className="flex flex-col gap-1">
              <span className={`text-4xl md:text-5xl font-bold bg-white/5 p-3 rounded-xl min-w-[70px] border transition-colors duration-500 ${isError ? 'text-red-500 border-red-500/20' : 'border-white/10 text-red-400'}`}>{time.s}</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500">Detik</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Lock size={12} />
          <span className="text-[9px] uppercase tracking-widest font-bold">Access Restricted to Admin</span>
        </div>

      </div>
    </div>
  );
};


// --- MAIN APP ---

interface UserData {
  name: string;
  classMajor: string;
  isAdmin: boolean;
  bio?: string;
  photo?: string;
}

const App = () => {
  // STATE MAINTENANCE (Default: True)
  const [isMaintenance, setIsMaintenance] = useState(true);
  
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tjkt_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('tjkt_session', JSON.stringify(userData));
  };

  const handleUpdateProfile = (updatedData: UserData) => {
    setUser(updatedData);
    localStorage.setItem('tjkt_session', JSON.stringify(updatedData));
  };

  const renderPage = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (currentPage) {
      case 'home':
        return <Home onExplore={setCurrentPage} user={user} />;
      case 'about':
        return <About isAdmin={user.isAdmin} />;
      case 'cinema': 
        return <Cinema isAdmin={user.isAdmin} />;
      case 'members':
        return <Members />;
      case 'schedule':
        return <Schedule />;
      case 'profile':
        return <Profile user={user} onUpdate={handleUpdateProfile} />;
      case 'wall':
        return <GlobalWall user={user} />;
      case 'voting':
        return <Polling user={user} />;
      default:
        return <Home onExplore={setCurrentPage} user={user} />;
    }
  };

  // 1. Cek Loading Awal
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-clean">
      <div className="animate-pulse font-artist text-2xl text-slate-400">Loading X TJKT TWO...</div>
    </div>
  );

  // 2. Cek Maintenance Mode SEBELUM masuk ke App
  if (isMaintenance) {
    return <MaintenanceScreen onUnlock={() => setIsMaintenance(false)} />;
  }

  // 3. Render Aplikasi Normal jika sudah di-unlock
  return (
    <div className="bg-clean min-h-screen selection:bg-slate-900 selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[9999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998] bg-gradient-to-tr from-blue-50/10 via-transparent to-purple-50/10"></div>
      
      {/* GLOBAL NOTIFICATION SYSTEM */}
      <NotificationSystem />

      {/* AI CHAT ASSISTANT (Hanya muncul jika sudah login) */}
      {user && <ChatAssistant />}

      {user && (
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user}
        />
      )}
      
      <main className="animate-in fade-in duration-1000">
        {renderPage()}
      </main>

      {user && <Footer />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
