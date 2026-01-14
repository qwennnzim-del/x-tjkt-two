
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings, Clock, AlertTriangle, Hammer, RefreshCw, Lock, Unlock, WifiOff, Crown, Sparkles, PieChart, StickyNote, Film, Bot, ArrowRight, X, Users2 } from 'lucide-react'; 
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
import Quiz from './Quiz'; 
import Leaderboard from './Leaderboard'; 
import GroupGenerator from './GroupGenerator';
import Cursor from './Cursor'; // IMPORT CURSOR
import { db } from './firebase';
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// --- FEATURE TOUR COMPONENT (ONBOARDING) ---
interface FeatureTourProps {
  onComplete: () => void;
}

const FeatureTour: React.FC<FeatureTourProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Hzell Virtual",
      desc: "Asisten AI pintar khusus kelas kita. Tanya tugas, jadwal, atau curhat soal jaringan? Dia siap bantu 24/7.",
      icon: <Bot size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-blue-500 to-purple-600"
    },
    {
      title: "The Wall",
      desc: "Tembok ekspresi bebas! Kirim pesan anonim, salam-salaman, atau sekadar berbagi meme lucu.",
      icon: <StickyNote size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-pink-500 to-rose-500"
    },
    {
      title: "Squad Generator",
      desc: "Fitur baru! Bagi kelompok tugas jadi lebih adil dan seru dengan sistem Spinner otomatis.",
      icon: <Users2 size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-emerald-500 to-teal-500"
    },
    {
      title: "Cinema TJKT",
      desc: "Bioskop mini kelas. Streaming koleksi film dokumentasi hingga film baper.",
      icon: <Film size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-red-500 to-orange-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
        <div className={`absolute top-0 left-0 w-full h-32 ${currentStep.color} transition-colors duration-500`}></div>
        <div className="relative z-10">
          <div className={`w-24 h-24 mx-auto -mt-2 mb-6 rounded-3xl ${currentStep.color} flex items-center justify-center shadow-lg transform rotate-3 transition-colors duration-500 border-4 border-white`}>
            {currentStep.icon}
          </div>
          <div className="text-center space-y-4 mb-8">
            <h2 className="font-artist text-3xl font-black text-slate-900 uppercase tracking-tight">{currentStep.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{currentStep.desc}</p>
          </div>
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`} />
            ))}
          </div>
          <button onClick={handleNext} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl group">
            {step === steps.length - 1 ? "Mulai Jelajahi" : "Lanjut"} 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface UserData {
  name: string;
  classMajor: string;
  isAdmin: boolean;
  bio?: string;
  photo?: string;
}

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('tjkt_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const tourSeen = localStorage.getItem('tjkt_tour_seen');
    if (!tourSeen && savedUser) {
      setShowTour(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    const heartbeat = async () => {
      try {
        const userId = user.name.toLowerCase().replace(/\s+/g, '_');
        const userRef = doc(db, "user_logins", userId);
        await updateDoc(userRef, { lastActive: serverTimestamp(), status: 'online' });
      } catch (e) { console.error("Heartbeat error", e); }
    };
    heartbeat();
    const interval = setInterval(heartbeat, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('tjkt_session', JSON.stringify(userData));
    const tourSeen = localStorage.getItem('tjkt_tour_seen');
    if (!tourSeen) setShowTour(true);
  };

  const handleUpdateProfile = (updatedData: UserData) => {
    setUser(updatedData);
    localStorage.setItem('tjkt_session', JSON.stringify(updatedData));
  };

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('tjkt_tour_seen', 'true');
  };

  const renderPage = () => {
    if (!user) return <Login onLogin={handleLogin} />;
    // Pass user data to Members for the Chemistry feature
    switch (currentPage) {
      case 'home': return <Home onExplore={setCurrentPage} user={user} />;
      case 'about': return <About isAdmin={user.isAdmin} />;
      case 'cinema': return <Cinema isAdmin={user.isAdmin} />;
      case 'members': return <Members currentUser={user.name} />; // PASS CURRENT USER NAME
      case 'schedule': return <Schedule />;
      case 'profile': return <Profile user={user} onUpdate={handleUpdateProfile} />;
      case 'wall': return <GlobalWall user={user} />;
      case 'voting': return <Polling user={user} />;
      case 'quiz': return <Quiz user={user} onSeeLeaderboard={() => setCurrentPage('leaderboard')} />;
      case 'leaderboard': return <Leaderboard />;
      case 'generator': return <GroupGenerator isAdmin={user.isAdmin} />;
      default: return <Home onExplore={setCurrentPage} user={user} />;
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-clean">
      <div className="animate-pulse font-artist text-2xl text-slate-400">Loading X TJKT TWO...</div>
    </div>
  );

  return (
    <div className="bg-clean min-h-screen selection:bg-slate-900 selection:text-white relative cursor-none lg:cursor-auto">
      {/* Tambahkan Custom Cursor */}
      <Cursor />
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[9999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998] bg-gradient-to-tr from-blue-50/10 via-transparent to-purple-50/10"></div>
      {showTour && <FeatureTour onComplete={completeTour} />}
      <NotificationSystem />
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
