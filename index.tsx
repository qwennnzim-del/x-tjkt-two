
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Bot, StickyNote, Users2, Film, ArrowRight, Loader2, Hammer, AlertTriangle, Construction } from 'lucide-react';
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
import Calculator from './Calculator';
import Cursor from './Cursor';
import { db } from './firebase';
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// --- MAINTENANCE SCREEN COMPONENT ---
const MaintenanceScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-yellow-500 selection:text-black">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-600 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-slate-800 rounded-full blur-[150px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl animate-in zoom-in duration-500">
         <div className="w-24 h-24 mx-auto mb-8 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/10">
            <Construction size={48} className="text-yellow-500 animate-bounce" />
         </div>

         <h1 className="font-artist text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 leading-none">
           LAGI <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">DIUPLIK</span>
         </h1>
         
         <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl mb-8">
           <p className="font-handwriting text-3xl text-slate-300 mb-2">
             "Bentar ya, Mimin lagi nambahin 10 Avatar Baru!"
           </p>
           <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
             Estimated Time: Sampai Mimin Selesai Ngopi
           </p>
         </div>

         <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <Loader2 size={16} className="text-yellow-500 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">System Maintenance</span>
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">X TJKT TWO • 2026</p>
         </div>
      </div>
    </div>
  );
};

// --- FEATURE TOUR COMPONENT (ONBOARDING) ---
interface FeatureTourProps {
  onComplete: () => void;
}

const FeatureTour: React.FC<FeatureTourProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Hzell Virtual",
      desc: "Bestie AI yang siap bantu tugas lo 24/7. Mau curhat soal jaringan atau sekadar gabut? Gas chat aja!",
      icon: <Bot size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-blue-500 to-purple-600"
    },
    {
      title: "The Wall",
      desc: "Tembok Julid & Curhat. Spill teh hangat di sini, anonim dan aman. Bebas berekspresi asal sopan.",
      icon: <StickyNote size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-pink-500 to-rose-500"
    },
    {
      title: "Squad Generator",
      desc: "Anti Rungkad Club. Bagi kelompok tugas jadi lebih adil dan seru tanpa drama 'ih kok sama dia'.",
      icon: <Users2 size={48} className="text-white" />,
      color: "bg-gradient-to-tr from-emerald-500 to-teal-500"
    },
    {
      title: "Cinema TJKT",
      desc: "Nobar Santuy. Nonton film bareng atau dokumentasi aib kelas di sini. Siapin popcorn!",
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
            {step === steps.length - 1 ? "Gas Jelajahi" : "Lanjut"} 
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
  // --- STATUS MAINTENANCE (Ubah ke false jika sudah selesai upload) ---
  const [isMaintenance, setIsMaintenance] = useState(false); 

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
    if (!tourSeen) {
      setShowTour(true);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('tjkt_tour_seen', 'true');
  };

  const handleUpdateProfile = (updatedData: UserData) => {
    setUser(updatedData);
    localStorage.setItem('tjkt_session', JSON.stringify(updatedData));
  };

  // --- RENDER MAINTENANCE CHECK ---
  if (isMaintenance) {
    return <MaintenanceScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onExplore={setCurrentPage} user={user!} />;
      case 'about':
        return <About isAdmin={user!.isAdmin} />;
      case 'cinema':
        return <Cinema isAdmin={user!.isAdmin} />;
      case 'members':
        return <Members currentUser={user!.name} />;
      case 'schedule':
        return <Schedule />;
      case 'wall':
        return <GlobalWall user={user!} />;
      case 'voting':
        return <Polling user={user!} />;
      case 'profile':
        return <Profile user={user!} onUpdate={handleUpdateProfile} />;
      case 'quiz':
        return <Quiz user={user!} onSeeLeaderboard={() => setCurrentPage('leaderboard')} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'generator':
        return <GroupGenerator isAdmin={user!.isAdmin} />;
      case 'calculator':
        return <Calculator />;
      default:
        return <Home onExplore={setCurrentPage} user={user!} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clean">
        <Loader2 size={40} className="text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-clean text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <NotificationSystem />
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />
      <Cursor />
      
      {renderPage()}
      
      <Footer />
      <ChatAssistant />
      
      {showTour && <FeatureTour onComplete={handleTourComplete} />}
    </main>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
