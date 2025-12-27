
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import Members from './Members';
import Schedule from './Schedule';
import Footer from './Footer';
import Login from './Login';

interface UserData {
  name: string;
  classMajor: string;
  isAdmin: boolean;
}

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  // Simple "Router" logic
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onExplore={setCurrentPage} userName={user?.name || ''} isAdmin={user?.isAdmin || false} />;
      case 'about':
        return <About isAdmin={user?.isAdmin || false} />;
      case 'members':
        return <Members />;
      case 'schedule':
        return <Schedule />;
      default:
        return <Home onExplore={setCurrentPage} userName={user?.name || ''} isAdmin={user?.isAdmin || false} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-clean min-h-screen selection:bg-slate-900 selection:text-white">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} userName={user.name} isAdmin={user.isAdmin} />
      
      <main className="animate-in fade-in duration-1000">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
