
import React, { useState, useMemo, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, Star, ShieldCheck, Code, Award, Heart, X, Loader2, Zap, Cpu, Terminal } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface Member {
  name: string;
  role: string;
  priority: number;
}

interface MembersProps {
  currentUser?: string;
}

const Members: React.FC<MembersProps> = ({ currentUser }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [chemistryResult, setChemistryResult] = useState<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Listen to Real-time Online Users
  useEffect(() => {
    const q = query(collection(db, "user_logins"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeNames = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.name) {
          activeNames.add(data.name.toLowerCase().trim());
        }
      });
      setOnlineUsers(activeNames);
    });
    return () => unsubscribe();
  }, []);

  const rawMembers: Member[] = [
    { name: "IBU RESITA", role: "Wali Kelas", priority: 0 },
    { name: "IRFAN FERMADI", role: "Ketua Murid", priority: 1 },
    { name: "GALUH RAY PUTRA", role: "Wakil Murid", priority: 2 },
    { name: "MELVINA YEIZA ALWI", role: "Sekretaris 1", priority: 3 },
    { name: "Muhani Khalifia Khadijah", role: "Sekretaris 2", priority: 3 },
    { name: "SALMA YUNIAR", role: "Bendahara 1", priority: 4 },
    { name: "SITI SARIFAH ANJANI", role: "Bendahara 2", priority: 4 },
    
    // --- SEO DEVELOPMENT TEAM ---
    { name: "M FARIZ ALFAUZI", role: "SEO DEVELOPMENT", priority: 2 },
    { name: "MUHAMMAD ZYLDAN MUZHAFFAR SUPRIYANA", role: "SEO DEVELOPMENT", priority: 2 },
    { name: "Muhamad Razib", role: "SEO DEVELOPMENT", priority: 2 },
    
    // --- MEMBERS ---
    { name: "EVANDER YUSUF FARIZKY", role: "Member", priority: 5 },
    { name: "DIMAS ALVINO", role: "Member", priority: 5 },
    { name: "ALHAM HAIKAL", role: "Member", priority: 5 },
    { name: "ANNAS NASRI MAULUDIN", role: "Member", priority: 5 },
    { name: "AUREL AGRI NOVIANTI", role: "Member", priority: 5 },
    { name: "AYATULL HUSNA", role: "Member", priority: 5 },
    { name: "AZMI ABDUL MAULANA", role: "Member", priority: 5 },
    { name: "Bibit Adi Syaputra", role: "Member", priority: 5 },
    { name: "CAKRA BUANA", role: "Member", priority: 5 },
    { name: "DERI PADLLI", role: "Member", priority: 5 },
    { name: "GALUH RAGA PANUNTUN", role: "Member", priority: 5 },
    { name: "HASBI NURSYAH PUTRA", role: "Member", priority: 5 },
    { name: "INTAN DARMAWAN", role: "Member", priority: 5 },
    { name: "M RABLI AZWAR", role: "Member", priority: 5 },
    { name: "M. PADIL NURJAMAN", role: "Member", priority: 5 },
    { name: "Megha Indah Ramdani", role: "Member", priority: 5 },
    { name: "MOH BILAL NURULFATA", role: "Member", priority: 5 },
    { name: "MUHAMAD FIRMAN SUPIANI", role: "Member", priority: 5 },
    { name: "MUHAMAD MAULANA", role: "Member", priority: 5 },
    { name: "MUHAMAD WIJAYA ZAINUR RAHMAN", role: "Member", priority: 5 },
    { name: "Muhamad Zaky Pairus", role: "Member", priority: 5 },
    { name: "MUHAMMAD RASYA RADITYA SWARNA", role: "Member", priority: 5 },
    { name: "MUHAMMAD REIHAN ALPIANSYAH", role: "Member", priority: 5 },
    { name: "MUHAMMAD RIZKI PRATAMA", role: "Member", priority: 5 },
    { name: "NURSHIFA AMALIA", role: "Member", priority: 5 },
    { name: "PAHRI GILANG PRATAMA", role: "Member", priority: 5 },
    { name: "RAYHAN AMBIYA", role: "Member", priority: 5 },
    { name: "REZA JUNIARDI", role: "Member", priority: 5 },
    { name: "RINDU RIAYU", role: "Member", priority: 5 },
    { name: "RISTA AMELIA", role: "Member", priority: 5 },
    { name: "RIZKIA FEBRIANTI", role: "Member", priority: 5 },
    { name: "SALMA ZULFA NASYITHA", role: "Member", priority: 5 },
    { name: "SHIRA PUTRYASNI WULANDARI", role: "Member", priority: 5 },
    { name: "WOLID HERDIANSYAH", role: "Member", priority: 5 },
    { name: "ZULPA APRILIANI", role: "Member", priority: 5 },
    { name: "RAYA", role: "Member", priority: 5 }
  ];

  const sortedMembers = useMemo(() => {
    return [...rawMembers].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const displayedMembers = showAll ? sortedMembers : sortedMembers.slice(0, 8);

  const calculateChemistry = () => {
    setIsCalculating(true);
    setChemistryResult(null);
    
    setTimeout(() => {
      let percentage;
      
      // --- LOGIKA RIGGED ---
      // Jika M FARIZ ALFAUZI, skor selalu tinggi (91 - 98)
      if (selectedMember?.name === "M FARIZ ALFAUZI") {
         percentage = Math.floor(Math.random() * (98 - 91 + 1)) + 91; 
      } else {
         // Untuk yang lain random normal (60 - 100)
         percentage = Math.floor(Math.random() * 41) + 60; 
      }
      
      setChemistryResult(percentage);
      setIsCalculating(false);
    }, 2000);
  };

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setChemistryResult(null);
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-16 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <Users size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student Directory</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            SQUAD <span className="text-slate-200">X TJKT 2</span>
          </h2>
          <p className="font-handwriting text-2xl text-slate-400 mt-4">Kompak, Solid, dan Berprestasi.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayedMembers.map((member, index) => {
             const isOnline = onlineUsers.has(member.name.toLowerCase());
             const isPriority = member.priority < 5;
             const isSeo = member.role === "SEO DEVELOPMENT";

             return (
              <div 
                key={index}
                onClick={() => handleMemberClick(member)}
                // STYLE KARTU DISAMAKAN (KEMBALI KE STYLE STANDARD PRIORITY/MEMBER)
                className={`group relative p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${
                   isPriority 
                    ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-xl' 
                    : 'bg-white/40 border-white/60 hover:bg-white hover:shadow-lg'
                }`}
              >
                {/* Online Indicator */}
                {isOnline && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-emerald-200 shadow-lg z-10"></div>
                )}

                <div className="relative z-10">
                  {/* ICON LOGIC: SEO TETAP BEDA (Pakai CPU) TAPI WARNA MENYESUAIKAN TEMA PUTIH */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    isSeo ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                    isPriority ? 'bg-slate-900 text-white shadow-lg' : 
                    'bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'
                  }`}>
                    {isSeo ? <Cpu size={20} className="animate-pulse" /> :
                     member.priority === 0 ? <Star size={20} className="fill-yellow-400 text-yellow-400" /> :
                     member.priority === 1 ? <ShieldCheck size={20} /> :
                     member.priority === 2 ? <ShieldCheck size={20} className="opacity-80" /> :
                     member.priority < 5 ? <Award size={20} /> :
                     <Users size={20} />
                    }
                  </div>
                  
                  <h4 className="font-artist text-lg font-bold leading-tight mb-1 truncate text-slate-900">
                    {member.name}
                  </h4>
                  
                  <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isSeo ? 'text-cyan-600' : 'text-slate-400'}`}>
                    {isSeo && <Terminal size={10} />}
                    {member.role}
                  </div>
                </div>

                {/* Hover Effect BG */}
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[2rem] bg-slate-900/5"></div>
              </div>
             );
          })}
        </div>

        {/* View All Button */}
        {!showAll && (
          <div className="flex justify-center mb-20">
            <button 
              onClick={() => setShowAll(true)}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm group"
            >
              Lihat Semua Anggota <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
        
        {showAll && (
           <div className="flex justify-center mb-20">
            <button 
              onClick={() => setShowAll(false)}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm group"
            >
              Tutup Daftar <ChevronUp size={14} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* MEMBER DETAIL MODAL & CHEMISTRY CALCULATOR */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-3xl relative overflow-hidden animate-in zoom-in-95 duration-300 bg-clean border-[6px] border-white">
              
              {/* TOMBOL CLOSE (FIXED: Added z-50 to ensure clickable) */}
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 p-2 rounded-full transition-colors bg-slate-100 hover:bg-red-500 hover:text-white z-50 cursor-pointer"
              >
                 <X size={20} />
              </button>

              <div className="text-center mb-8 relative z-10">
                <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 mb-6 ${
                    selectedMember.role === "SEO DEVELOPMENT" ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' : 'bg-slate-900 text-white'
                }`}>
                    {selectedMember.role === "SEO DEVELOPMENT" ? <Cpu size={40} className="animate-pulse" /> : 
                     selectedMember.priority === 0 ? <Star size={40} className="fill-yellow-400 text-yellow-400" /> : <Users size={40} />}
                </div>
                
                <h3 className="font-artist text-3xl font-black leading-tight mb-2 text-slate-900">
                    {selectedMember.name}
                </h3>
                
                <div className={`inline-block px-4 py-1.5 rounded-full ${
                    selectedMember.role === "SEO DEVELOPMENT" ? 'bg-cyan-50 border border-cyan-100' : 'bg-slate-100'
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                      selectedMember.role === "SEO DEVELOPMENT" ? 'text-cyan-600' : 'text-slate-500'
                  }`}>
                      {selectedMember.role}
                  </p>
                </div>
              </div>

              {/* Chemistry Feature */}
              {currentUser && (
                 <div className="rounded-[2.5rem] p-6 border text-center relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Heart size={64} className="text-pink-500 rotate-12" /></div>
                    
                    <h4 className="font-artist text-lg font-bold mb-1 relative z-10 text-slate-900">Chemistry Check</h4>
                    <p className="text-[10px] mb-6 relative z-10 text-slate-400">Seberapa cocok kamu dengan {selectedMember.name.split(' ')[0]}?</p>

                    {chemistryResult !== null ? (
                       <div className="animate-in zoom-in duration-500">
                          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">{chemistryResult}%</span>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                            {chemistryResult > 90 ? "SOULMATE DETECTED! ❤️" : chemistryResult > 75 ? "BESTIE MATERIAL! ✨" : "GOOD FRIENDS! 👍"}
                          </p>
                       </div>
                    ) : (
                       <button 
                         onClick={calculateChemistry}
                         disabled={isCalculating}
                         className="w-full py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 bg-white text-pink-500"
                       >
                          {isCalculating ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className="fill-pink-500" />}
                          {isCalculating ? "Calculating..." : "Cek Kecocokan"}
                       </button>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}
    </section>
  );
};

export default Members;
