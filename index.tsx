
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Members from './Members';
import Schedule from './Schedule';
import Profile from './Profile';
import Footer from './Footer';
import Login from './Login';
import GlobalWall from './GlobalWall';

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
      case 'members':
        return <Members />;
      case 'schedule':
        return <Schedule />;
      case 'profile':
        return <Profile user={user} onUpdate={handleUpdateProfile} />;
      case 'wall':
        return <GlobalWall user={user} />;
      default:
        return <Home onExplore={setCurrentPage} user={user} />;
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-clean">
      <div className="animate-pulse font-artist text-2xl text-slate-400">Loading X TJKT TWO...</div>
    </div>
  );

  return (
    <div className="bg-clean min-h-screen selection:bg-slate-900 selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[9999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998] bg-gradient-to-tr from-blue-50/10 via-transparent to-purple-50/10"></div>
      
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
