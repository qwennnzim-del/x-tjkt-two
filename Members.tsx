
import React, { useState, useMemo } from 'react';
import { Users, ChevronDown, ChevronUp, Star, ShieldCheck, Code, Layout, Palette, Award } from 'lucide-react';

interface Member {
  name: string;
  role: string;
  priority: number;
}

const Members = () => {
  const [showAll, setShowAll] = useState(false);

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
    { name: "MUHAMAD FIRMAN SUPIANI", role: "Member", priority: 6 },
    { name: "MUHAMAD MAULANA", role: "Member", priority: 6 },
    { name: "MUHAMAD WIJAYA ZAINUR RAHMAN", role: "Member", priority: 6 },
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
                className="group animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${(i % 12) * 40}ms` }}
              >
                <div className={`glass rounded-[2rem] p-5 sm:p-6 h-full flex flex-col transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl group-hover:bg-white border-white/40 ${member.priority === 0 ? 'ring-2 ring-amber-200 bg-amber-50/40' : ''}`}>
                  <div className={`aspect-square rounded-3xl bg-gradient-to-br ${getGradient(member.priority)} flex items-center justify-center text-2xl sm:text-3xl font-artist font-black mb-5 shadow-inner transition-transform duration-700 group-hover:scale-95`}>
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
    </section>
  );
};

export default Members;