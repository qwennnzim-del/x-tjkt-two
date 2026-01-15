
import React, { useState, useMemo } from 'react';
import { Users, ChevronDown, ChevronUp, Star, ShieldCheck, Code, Award, Heart, X, Loader2, Zap } from 'lucide-react';

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

  const calculateChemistry = (member: Member) => {
    if (!currentUser) return;
    if (member.name.toLowerCase() === currentUser.toLowerCase()) {
        alert("Cek diri sendiri? Narsis banget lu! 😂");
        return;
    }
    setIsCalculating(true);
    setChemistryResult(null);
    setTimeout(() => {
        let percentage = 0;
        const upperMember = member.name.toUpperCase();
        const upperUser = currentUser.toUpperCase();
        if (upperMember.includes("RESITA")) {
            percentage = 100; 
        } else if (
            upperUser.includes("FARIZ") || 
            upperMember.includes("FARIZ") ||
            upperUser.includes("MELVINA") ||
            upperMember.includes("MELVINA")
        ) {
            percentage = Math.floor(Math.random() * 11) + 90;
        } else {
            percentage = Math.floor(Math.random() * 90);
        }
        setChemistryResult(percentage);
        setIsCalculating(false);
    }, 2000);
  };

  const getChemistryStatus = (score: number, memberName: string) => {
      if (memberName.toUpperCase().includes("RESITA")) return "Restu Ibu Guru 😇";
      if (score >= 90) return "Soulmate Sejati! 💖";
      if (score >= 75) return "Bestie Goals 🔥";
      if (score >= 60) return "Teman Asik ✨";
      if (score >= 40) return "Butuh Ngopi Bareng ☕";
      return "Mungkin Beda Frekuensi 📡";
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <header className="text-center mb-16 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <Users size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Class Directory</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            TJKT <span className="text-slate-200">SQUAD</span>
          </h2>
          <p className="font-handwriting text-2xl text-slate-400 mt-4">Keluarga Besar X TJKT TWO</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedMembers.map((member, idx) => {
            const gradient = getGradient(member.priority);
            return (
              <div 
                key={idx}
                onClick={() => {
                  setSelectedMember(member);
                  calculateChemistry(member);
                }}
                className={`group relative p-6 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-gradient-to-br ${gradient} border border-white/60 shadow-sm hover:shadow-xl`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-xl font-black shadow-inner border border-white">
                    {getInitials(member.name)}
                  </div>
                  {getRoleIcon(member.role) && (
                     <div className="p-2 bg-white rounded-full shadow-sm">
                        {getRoleIcon(member.role)}
                     </div>
                  )}
                </div>

                <div>
                   <h4 className="font-artist text-lg font-black text-slate-900 leading-none mb-2 line-clamp-2 min-h-[2.5rem] uppercase tracking-tight">{member.name}</h4>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{member.role}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cek Chemistry</span>
                    <Heart size={14} className="text-pink-400" />
                </div>
              </div>
            );
          })}
        </div>

        {!showAll && (
          <div className="mt-16 text-center">
            <button 
              onClick={() => setShowAll(true)}
              className="px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 mx-auto group"
            >
              Lihat Semua Member <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
        
        {showAll && (
           <div className="mt-16 text-center">
            <button 
              onClick={() => setShowAll(false)}
              className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all shadow-lg flex items-center gap-3 mx-auto group"
            >
              Sembunyikan <ChevronUp size={16} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Chemistry Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="text-center">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 border-4 border-white shadow-lg">
                      {getInitials(selectedMember.name)}
                   </div>
                   <h3 className="font-artist text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{selectedMember.name}</h3>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">{selectedMember.role}</p>
                   
                   <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Compatibility Check</p>
                      
                      {isCalculating ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                           <Loader2 size={24} className="animate-spin text-slate-300" />
                           <span className="text-xs font-bold text-slate-400 animate-pulse">Calculating...</span>
                        </div>
                      ) : chemistryResult !== null ? (
                        <div className="animate-in zoom-in duration-500">
                           <div className="text-5xl font-artist font-black text-slate-900 mb-2">{chemistryResult}%</div>
                           <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-1000" style={{ width: `${chemistryResult}%` }}></div>
                           </div>
                           <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{getChemistryStatus(chemistryResult, selectedMember.name)}</p>
                        </div>
                      ) : null}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Members;
