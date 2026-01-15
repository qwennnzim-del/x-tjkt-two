
import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { MessageSquare, PieChart, Volume2, User as UserIcon, ShieldAlert } from 'lucide-react';

const POP_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAsAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

interface Notification {
  id: string;
  name: string;
  type: 'wall' | 'poll' | 'reply' | 'admin';
  message: string;
  photo?: string;
  isAdmin?: boolean;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialMount = useRef(true);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(POP_SOUND);
    audioRef.current.volume = 0.5;
  }, []);

  const triggerNotification = (name: string, type: 'wall' | 'poll' | 'reply' | 'admin', message: string, photo?: string, isAdmin?: boolean) => {
    // Play Sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
    }

    // Add visual notification
    const newNote = {
      id: Date.now().toString(),
      name,
      type: isAdmin ? 'admin' : type,
      message,
      photo,
      isAdmin
    };

    setNotifications(prev => [...prev, newNote]);

    // Remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNote.id));
    }, 5000);
  };

  // LISTENER 1: Global Wall Posts (New Posts)
  useEffect(() => {
    const q = query(collection(db, "global_wall"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialMount.current) return;
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          triggerNotification(data.sender, 'wall', 'memposting pesan baru di Wall!', data.photo, data.isAdmin);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // LISTENER 2: Polling Votes
  useEffect(() => {
    const q = query(collection(db, "polls"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const data = change.doc.data();
          const votedBy = data.votedBy || [];
          if (votedBy.length > 0) {
            // Kita tidak menyimpan foto voter di array votedBy saat ini, jadi foto undefined
            const lastVoter = votedBy[votedBy.length - 1];
            triggerNotification(lastVoter, 'poll', 'baru saja memberikan suara!', undefined, false);
          }
        }
      });
    });
    return () => unsubscribe();
  }, []);

  // LISTENER 3: Login Activity (Terutama Admin)
  useEffect(() => {
     const q = query(collection(db, "user_logins"), orderBy("timestamp", "desc"), limit(1));
     const unsubscribe = onSnapshot(q, (snapshot) => {
       // Kita ingin tau jika ada yang login baru, termasuk saat initial mount mungkin oke untuk info "X is online"
       snapshot.docChanges().forEach((change) => {
          if(change.type === "added") {
             // Pastikan timestamp nya baru (selisih < 10 detik dari sekarang) agar tidak spam saat load page
             const data = change.doc.data();
             if (data.timestamp) {
               const loginTime = data.timestamp.seconds * 1000;
               const now = Date.now();
               if (now - loginTime < 10000) { // Hanya notif jika login < 10 detik lalu
                  const msg = data.isAdmin ? 'ADMIN TELAH MEMASUKI SISTEM' : 'telah online';
                  triggerNotification(data.name, data.isAdmin ? 'admin' : 'wall', msg, data.photo, data.isAdmin);
               }
             }
          }
       });
     });
     return () => unsubscribe();
  }, []);

  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id}
          className={`relative p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right fade-in duration-300 w-80 pointer-events-auto border-l-4 overflow-hidden ${
             note.isAdmin 
             ? 'bg-red-950/90 text-red-50 border-red-500 backdrop-blur-md' 
             : 'bg-slate-900/90 text-white border-white backdrop-blur-md'
          }`}
        >
          {/* Glowing Effect for Admin */}
          {note.isAdmin && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}

          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 overflow-hidden ${note.isAdmin ? 'border-red-400 bg-red-900' : 'border-slate-500 bg-slate-800'}`}>
             {note.photo ? (
               <img src={note.photo} alt="User" className="w-full h-full object-cover" />
             ) : (
                note.type === 'poll' ? <PieChart size={20} /> : note.isAdmin ? <ShieldAlert size={20} /> : <UserIcon size={20} />
             )}
          </div>
          <div className="relative z-10">
            <p className={`text-xs font-black uppercase tracking-widest leading-tight mb-0.5 ${note.isAdmin ? 'text-red-200' : 'text-white'}`}>
              {note.name}
            </p>
            <p className={`text-[10px] font-bold uppercase tracking-wide ${note.isAdmin ? 'text-red-300' : 'text-slate-400'}`}>
              {note.message}
            </p>
          </div>
          <Volume2 size={14} className="text-white/20 ml-auto animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
