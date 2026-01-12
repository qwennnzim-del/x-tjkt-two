
import React, { useState, useEffect } from 'react';
import { Medal, Crown, Sparkles, Loader2, Trophy, Users, ShieldCheck, CheckCircle2, User as UserIcon, Flame } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rankTitle: string;
  isAdmin?: boolean;
  photo?: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // GUNAKAN COLLECTION BARU V2
  const COLLECTION_NAME = "leaderboard_v2";

  useEffect(() => {
    // Ambil info user yang login dari localStorage
    const savedUser = localStorage.getItem('tjkt_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser).name);
    }

    // Gunakan query sederhana dengan satu orderBy untuk stabilitas tanpa index manual
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy("score", "desc"), 
      limit(20) // Limit ditingkatkan sedikit
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      
      // Filter duplikat jika ada (opsional, tapi bagus untuk data yang bersih)
      const uniqueEntries = Array.from(new Set(entries.map(a => a.name)))
        .map(name => entries.find(a => a.name === name)!)
        .sort((a, b) => b.score - a.score);

      setLeaderboard(uniqueEntries);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Leaderboard Error:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-50/20 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <Flame size={16} className="text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Season 2: Fresh Start</span>
          </div>
          <h2 className="font-artist text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            HALL OF <span className="text-slate-200">FAME</span>
          </h2>
          <p className="font-handwriting text-3xl text-slate-400 mt-4">Panggung para jawara baru</p>
          <div className="w-24 h-1.5 bg-slate-900 mx-auto mt-10 rounded-full"></div>
        </header>

        <div className="glass rounded-[3.5rem] p-6 md:p-12 shadow-3xl border-white/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-artist text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Top Players V2</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Reset & Updated</p>
              </div>
            </div>
            {loading && <Loader2 size={20} className="text-slate-400 animate-spin" />}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-24 text-center">
                <Loader2 size={40} className="mx-auto text-slate-200 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing New Database...</p>
              </div>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((entry, i) => {
                const isMe = entry.name === currentUser;
                return (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-5 md:p-6 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.01] border animate-in slide-in-from-bottom duration-500 ${
                      isMe ? 'ring-2 ring-blue-400 bg-blue-50/50 border-blue-200' :
                      i === 0 ? 'bg-amber-50/80 border-amber-200 shadow-amber-100 shadow-xl' : 
                      i === 1 ? 'bg-slate-50/80 border-slate-200' :
                      i === 2 ? 'bg-orange-50/80 border-orange-200' : 'bg-white/40 border-white/60 hover:bg-white'
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner transition-transform ${
                        i === 0 ? 'bg-amber-400 text-white' : 
                        i === 1 ? 'bg-slate-400 text-white' :
                        i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {i === 0 ? <Crown size={24} className="animate-pulse" /> : i + 1}
                      </div>

                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 shrink-0">
                        {entry.photo ? (
                          <img src={entry.photo} alt="U" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <UserIcon size={20} />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                            {entry.name}
                          </p>
                          {entry.isAdmin && (
                            <div className="relative group">
                              <CheckCircle2 size={16} className="text-blue-500 fill-blue-500/10" />
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                            </div>
                          )}
                          {isMe && <span className="text-[8px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest ml-1">You</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={10} className="text-slate-300" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {entry.rankTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-3xl md:text-4xl font-artist font-black text-slate-900 leading-none">{entry.score}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Points</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 text-center glass rounded-[2.5rem] border-dashed border-2 border-slate-200">
                <Sparkles size={40} className="mx-auto text-slate-200 mb-6" />
                <h3 className="font-artist text-2xl text-slate-400 font-bold uppercase tracking-tight">Belum ada skor V2</h3>
                <p className="text-slate-300 text-[10px] mt-2 uppercase tracking-[0.3em] font-black">Jadilah yang pertama mengisi papan skor baru!</p>
              </div>
            )}
          </div>

          <div className="mt-16 pt-10 border-t border-slate-100 text-center flex flex-col items-center gap-4">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Humble — Solid — Family</p>
            <p className="font-handwriting text-2xl text-slate-400">Siapa raja kuis selanjutnya? ✨</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
