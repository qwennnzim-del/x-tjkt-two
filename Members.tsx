
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
    if (r.includes('wali')) return <Star size={14} className="text-amber-500" />;
    if (r.includes('ketua') || r.includes('wakil')) return <ShieldCheck size={14} className="text-blue-500" />;
    if (r.includes('osis')) return <Award size={14} className="text-indigo-500" />;
    if (r.includes('development')) return <Code size={14} className="text-emerald-500" />;
    if (r.includes('struktur')) return <Layout size={14} className="text-purple-500" />;
    if (r.includes('desain')) return <Palette size={14} className="text-rose-500" />;
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
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/20 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/20 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-6">
        <div id="members-title" className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <span className="font-handwriting text-3xl text-slate-400 block mb-3">Wajah-Wajah X TJKT TWO</span>
            <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              The <span className="text-slate-200">Squad</span>
            </h2>
            <div className="w-24 h-1.5 bg-slate-900 mt-6 rounded-full"></div>
          </div>
          
          <div className="glass px-8 py-5 rounded-[2.5rem] flex items-center gap-5 shadow-sm border-white/50 animate-in fade-in slide-in-from-right duration-1000">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-1 leading-none">Total Squad</p>
              <p className="text-3xl font-artist font-black text-slate-900 tracking-tight leading-none">{rawMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="relative pb-20">
          {/* Members Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 relative transition-all duration-700">
            {displayedMembers.map((member, i) => (
              <div 
                key={i} 
                className={`group animate-in fade-in zoom-in duration-500`}
                style={{ animationDelay: `${(i % 12) * 40}ms` }}
              >
                <div className={`glass rounded-[2rem] p-6 h-full flex flex-col transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group-hover:bg-white border-white/40 ${member.priority === 0 ? 'ring-2 ring-amber-200 bg-amber-50/40 shadow-xl' : ''}`}>
                  <div className={`aspect-square rounded-[1.8rem] bg-gradient-to-br ${getGradient(member.priority)} flex items-center justify-center text-3xl font-artist font-black mb-6 shadow-inner transition-transform duration-700 group-hover:scale-90`}>
                    {getInitials(member.name)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2 flex-wrap min-h-[16px]">
                      {getRoleIcon(member.role)}
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${member.priority < 6 ? 'text-slate-900' : 'text-slate-400'}`}>
                        {member.role}
                      </span>
                    </div>
                    <h3 className="font-artist text-lg leading-tight font-black text-slate-900 group-hover:text-slate-600 transition-colors uppercase break-words tracking-tight">
                      {member.name.toLowerCase()}
                    </h3>
                  </div>
                  
                  {member.priority < 6 && (
                    <div className="mt-5 pt-4 border-t border-slate-100/50 flex justify-between items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Class Elite</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Optimized Gradient Overlay and See All Button */}
          {!showAll && rawMembers.length > INITIAL_LIMIT && (
            <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-clean via-clean/95 to-transparent flex items-end justify-center pb-4 pointer-events-none">
              <button 
                onClick={() => setShowAll(true)}
                className="pointer-events-auto group flex items-center gap-4 px-14 py-7 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-full hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.5)] hover:-translate-y-2 transition-all duration-500 font-black uppercase tracking-[0.4em] text-[11px] border border-white/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Reveal Full Squad</span>
                <ChevronDown size={22} className="relative z-10 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Collapse Button */}
          {showAll && (
            <div className="mt-20 flex justify-center">
              <button 
                onClick={() => {
                  setShowAll(false);
                  document.getElementById('members-title')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex items-center gap-4 px-12 py-6 glass text-slate-900 rounded-full hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-xl hover:-translate-y-1 font-black uppercase tracking-[0.3em] text-[11px] border border-slate-200"
              >
                Hide Extra Squad <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Members;
