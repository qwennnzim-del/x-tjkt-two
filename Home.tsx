
import React from 'react';
import { 
  ChevronRight, 
  Code, 
  Network, 
  ShieldCheck, 
  Sparkles,
  ShieldAlert,
  User as UserIcon,
  CheckCircle2,
  Edit2,
  Film
} from 'lucide-react';

interface HomeProps {
  onExplore: (page: string) => void;
  user: {
    name: string;
    isAdmin: boolean;
    photo?: string;
  };
}

const Home: React.FC<HomeProps> = ({ onExplore, user }) => {
  const skills = [
    {
      title: "Web Development",
      desc: "Membangun antarmuka yang modern dan fungsional.",
      icon: <Code size={24} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Network Engineer",
      desc: "Ahli infrastruktur digital dan konektivitas.",
      icon: <Network size={24} />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Cyber Security",
      desc: "Menjaga keamanan data dari ancaman digital.",
      icon: <ShieldCheck size={24} />,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  const firstName = user.name.split(' ')[0];

  return (
    <section className="min-h-screen bg-clean relative overflow-hidden flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center relative pt-24 pb-12 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none opacity-40">
           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto text-center z-10">
          <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top duration-700">
            <button 
              onClick={() => onExplore('profile')}
              className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 mb-4 shadow-2xl hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white">
                {user.photo ? (
                  <img 
                    src={user.photo} 
                    alt="Me" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UserIcon size={32} />
                  </div>
                )}
              </div>
            </button>
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full">
              {user.isAdmin ? <ShieldAlert size={12} className="text-blue-600" /> : <Sparkles size={12} className="text-yellow-500" />}
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                Welcome back, {firstName}! {user.isAdmin && <CheckCircle2 size={12} className="text-blue-500" />}
              </span>
            </div>
          </div>

          <h1 className="font-artist text-6xl md:text-9xl font-bold text-slate-900 mb-4 tracking-tighter animate-in fade-in slide-in-from-bottom duration-1000 leading-[0.9]">
            X TJKT TWO
          </h1>
          <p className="max-w-xl mx-auto text-[10px] sm:text-sm text-slate-500 mb-4 leading-relaxed font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            Professional Network & <br className="sm:hidden"/> Telecom Engineering Squad
          </p>
          <p className="max-w-xl mx-auto text-[10px] sm:text-xs text-slate-400 mb-10 leading-relaxed font-black uppercase tracking-[0.6em] animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
             HEZELL
          </p>

          <div className="flex flex-wrap gap-3 justify-center animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <button onClick={() => onExplore('about')} className="px-10 py-5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3 group text-xs font-bold uppercase tracking-widest">
              Vibes Kita <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onExplore('cinema')} className="px-10 py-5 glass border-red-200 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Film size={14} /> Bioskop
            </button>
            <button onClick={() => onExplore('members')} className="px-10 py-5 glass border-slate-200 text-slate-900 rounded-full hover:bg-white transition-all text-xs font-bold uppercase tracking-widest">
              Squad List
            </button>
          </div>
        </div>
      </div>

      <div className="py-12 bg-white/50 backdrop-blur-sm relative z-10 border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-5 p-4 rounded-3xl glass border-transparent hover:border-white transition-all">
                <div className={`w-12 h-12 shrink-0 ${skill.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  {skill.icon}
                </div>
                <div>
                  <h4 className="font-artist text-lg font-bold text-slate-900 leading-none mb-1">{skill.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-tight">{skill.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
