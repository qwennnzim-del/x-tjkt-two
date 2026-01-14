
import React, { useState, useMemo } from 'react';
import { Users, ChevronDown, ChevronUp, Star, ShieldCheck, Code, Layout, Palette, Award, Heart, Sparkles, X, Loader2 } from 'lucide-react';

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

  const rawMembers: Member[] = [
    { name: "IBU RESITA", role: "Wali Kelas", priority: 0 },
    { name: "IRFAN FERMADI", role: "Ketua Murid", priority: 1 },
    { name: "GALUH RAY PUTRA", role: "Wakil Murid", priority: 2 },
    { name: "MELVINA YEIZA ALWI", role: "Sekretaris", priority: 3 },
    { name: "Muhani Khalifia Khadijah", role: "Sekretaris", priority: 3 },
    { name: "SALMA YUNIAR", role: "Bendahara", priority: 4 },
    { name: "SITI SARIFAH ANJANI", role: "Bendahara", priority: 4 },
    { name: "M FARIZ ALFAUZI", role: "DEVELOPMENT", priority: 5 },
    { name: "MUHAMMAD ZYLDAN MUZHAFFAR SUPRIYANA", role: "DEVELOPMENT", priority: 5 },
    { name: "Muhamad Razib", role: "DEVELOPMENT", priority: 5 },
    { name: "EVANDER YUSUF FARIZKY", role: "OSIS", priority: 5 },
    { name: "DIMAS ALVINO", role: "OSIS", priority: 5 },
    { name: "ALHAM HAIKAL", role: "Member", priority: 6 },
    { name: "ANNAS NASRI MAULUDIN", role: "Member", priority: 6 },
    { name: "AUREL AGRI NOVIANTI", role: "Member", priority: 6 },
    { name: "AYATULL HUSNA", role: "Member", priority: 6 },
    { name: "AZMI ABDUL MAULANA", role: "Member", priority: 6 },
    { name: "Bibit Adi Syaputra", role: "Member", priority: 6 },
    { name: "CAKRA BUANA", role: "Member", priority: 6 },
    { name: "DERI PADLLI", role: "Member", priority: 6 },
    { name: "GALUH RAGA PANUNTUN", role: "Member", priority: 6 },
    { name: "HASBI NURSYAH PUTRA", role: "Member", priority: 6 },
    { name: "INTAN DARMAWAN", role: "Member", priority: 6 },
    { name: "M RABLI AZWAR", role: "Member", priority: 6 },
    { name: "M. PADIL NURJAMAN", role: "Member", priority: 6 },
    { name: "Megha Indah Ramdani", role: "Member", priority: 6 },
    { name: "MOH BILAL NURULFATA", role: "Member", priority: 6 },
    { name: "MUHAMMAD FIRMAN SUPIANI", role: "Member", priority: 6 },
    { name: "MUHAMMAD MAULANA", role: "Member", priority: 6 },
    { name: "MUHAMMAD WIJAYA ZAINUR RAHMAN", role: "Member", priority: 6 },
    { name: "Muhamad Zaky Pairus", role: "Member", priority: 6 },
    { name: "MUHAMMAD RASYA RADITYA SWARNA", role: "Member", priority: 6 },
    { name: "MUHAMMAD REIHAN ALPIANSYAH", role: "Member", priority: 6 },
    { name: "MUHAMMAD RIZKI PRATAMA", role: "Member", priority: 6 },
    { name: "NURSHIFA AMALIA", role: "Member", priority: 6 },
    { name: "PAHRI GILANG PRATAMA", role: "Member", priority: 6 },
    { name: "RAYHAN AMBIYA", role: "Member", priority: 6 },
    { name: "REZA JUNIARDI", role: "Member", priority: 6 },
    { name: "RINDU RIAYU", role: "Member", priority: 6 },
    { name: "RISTA AMELIA", role: "Member", priority: 6 },
    { name: "RIZKIA FEBRIANTI", role: "Member", priority: 6 },
    { name: "SALMA ZULFA NASYITHA", role: "Member", priority: 6 },
    { name: "SHIRA PUTRYASNI WULANDARI", role: "Member", priority: 6 },
    { name: "WOLID HERDIANSYAH", role: "Member", priority: 6 },
    { name: "ZULPA APRILIANI", role: "Member", priority: 6 },
    { name: "RAYA", role: "Member", priority: 6 },
  ];

  const sortedMembers = useMemo(() => {
    return [...rawMembers].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const INITIAL_LIMIT = 12;
  const displayedMembers = showAll ? sortedMembers : sortedMembers.slice(0, INITIAL_LIMIT);

  const getRoleIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('wali')) return <Star size={12} className="text-amber-500" />;
    if (r.includes('ketua') || r.includes('wakil')) return <ShieldCheck size={12} className="text-blue-500" />;
    if (r.includes('osis')) return <Award size={12} className="text-indigo-500" />;
    if (r.includes('development')) return <Code size={12} className="text-emerald-500" />;
    return null;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getGradient = (priority: number) => {
    switch(priority) {
      case 0: return "from-amber-100 to-orange-100 text-amber-700";
      case 1: 
      case 2: return "from-blue-100 to-indigo-100 text-blue-700";
      case 3:
      case 4: return "from-purple-100 to-pink-100 text-purple-700";
      case 5: return "from-emerald-100 to-teal-100 text-emerald-700";
      default: return "from-slate-100 to-slate-200 text-slate-500";
    }
  };

  // --- CHEMISTRY LOGIC ---
  const calculateChemistry = (member: Member) => {
    if (!currentUser) return;
    
    // Jangan izinkan cek diri sendiri
    if (member.name.toLowerCase() === currentUser.toLowerCase()) {
        alert("Cek diri sendiri? Narsis banget lu! 😂");
        return;
    }

    setIsCalculating(true);
    setChemistryResult(null);

    // Algoritma Hash Sederhana agar hasil KONSISTEN (tidak random setiap klik)
    const combinedNames = [currentUser.toLowerCase(), member.name.toLowerCase()].sort().join('');
    let hash = 0;
    for (let i = 0; i < combinedNames.length; i++) {
        hash = combinedNames.charCodeAt(i) + ((hash << 5) - hash);
    }
    const percentage = Math.abs(hash % 101); // 0 - 100

    setTimeout(() => {
        setChemistryResult(percentage);
        setIsCalculating(false);
    }, 2000);
  };

  const getChemistryStatus = (score: number) => {
      if (score >= 90) return "JODOH DUNIA AKHIRAT 😍";
      if (score >= 70) return "Bestie Sejati ✨";
      if (score >= 50) return "Teman Tapi Mesra? 🤔";
      if (score >= 30) return "Cuma Teman Tugas 📚";
      return "Jangan Berharap Deh 💀";
  };

  return (
    <section className="py-24 pt-32 bg-clean min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/20 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6">
        <div id="members-title" className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="font-handwriting text-2xl sm:text-3xl text-slate-400 block mb-3">Wajah-Wajah X TJKT TWO</span>
            <h2 className="font-artist text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              The <span className="text-slate-200">Squad</span>
            </h2>
            <div className="w-20 h-1.5 bg-slate-900 mt-6 rounded-full"></div>
          </div>
          
          <div className="glass px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-right duration-1000 self-start sm:self-auto">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 mb-0.5 leading-none">Total Squad</p>
              <p className="text-2xl font-artist font-black text-slate-900 tracking-tight leading-none">{rawMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="relative pb-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 relative">
            {displayedMembers.map((member, i) => (
              <div 
                key={i} 
                className="group animate-in fade-in zoom-in duration-500 cursor-pointer"
                style={{ animationDelay: `${(i % 12) * 40}ms` }}
                onClick={() => {
                    setSelectedMember(member);
                    setChemistryResult(null);
                }}
              >
                <div className={`glass rounded-[2rem] p-5 sm:p-6 h-full flex flex-col transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl group-hover:bg-white border-white/40 ${member.priority === 0 ? 'ring-2 ring-amber-200 bg-amber-50/40' : ''}`}>
                  <div className={`aspect-square rounded-3xl bg-gradient-to-br ${getGradient(member.priority)} flex items-center justify-center text-2xl sm:text-3xl font-artist font-black mb-5 shadow-inner transition-transform duration-700 group-hover:scale-95 relative overflow-hidden`}>
                     {/* Hover Effect Hint */}
                     <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white px-2 py-1 rounded-full text-slate-900">Tap Me</span>
                     </div>
                    {getInitials(member.name)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-1.5 mb-1.5 min-h-[14px]">
                      {getRoleIcon(member.role)}
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${member.priority < 6 ? 'text-slate-900' : 'text-slate-400'}`}>
                        {member.role}
                      </span>
                    </div>
                    <h3 className="font-artist text-sm sm:text-base leading-tight font-black text-slate-900 transition-colors uppercase break-words tracking-tight group-hover:text-blue-600">
                      {member.name.toLowerCase()}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAll && rawMembers.length > INITIAL_LIMIT && (
            <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-clean via-clean/90 to-transparent flex items-end justify-center pb-4 pointer-events-none">
              <button 
                onClick={() => setShowAll(true)}
                className="pointer-events-auto group flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl"
              >
                Reveal Full Squad
                <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}

          {showAll && (
            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => {
                  setShowAll(false);
                  document.getElementById('members-title')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex items-center gap-4 px-10 py-5 glass text-slate-900 rounded-full hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-xl font-black uppercase tracking-[0.3em] text-[10px]"
              >
                Close List <ChevronUp size={18} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHEMISTRY MODAL */}
      {selectedMember && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                  >
                      <X size={20} />
                  </button>

                  <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl font-artist font-black mb-6 shadow-xl transform rotate-3">
                          {getInitials(selectedMember.name)}
                      </div>
                      <h3 className="font-artist text-2xl font-black text-slate-900 uppercase leading-none mb-1">{selectedMember.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">{selectedMember.role}</p>

                      {!chemistryResult && !isCalculating ? (
                          <div className="space-y-4">
                              <p className="text-sm text-slate-500 font-medium">Penasaran seberapa cocok kamu sama dia?</p>
                              <button 
                                onClick={() => calculateChemistry(selectedMember)}
                                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-pink-200"
                              >
                                  <Heart size={16} className="fill-white animate-pulse" />
                                  Cek Chemistry
                              </button>
                          </div>
                      ) : isCalculating ? (
                          <div className="py-8 flex flex-col items-center gap-4">
                              <Loader2 size={32} className="text-pink-500 animate-spin" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 animate-pulse">Menghitung detak jantung...</p>
                          </div>
                      ) : (
                          <div className="animate-in zoom-in duration-500">
                              <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                      <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                      <path className="text-pink-500" strokeDasharray={`${chemistryResult}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                  </svg>
                                  <div className="text-center">
                                      <span className="text-3xl font-black font-artist text-slate-900 block">{chemistryResult}%</span>
                                  </div>
                              </div>
                              <h4 className="font-artist text-xl font-bold text-pink-600 mb-2">{getChemistryStatus(chemistryResult || 0)}</h4>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hasil prediksi Hzell AI</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </section>
  );
};

export default Members;
