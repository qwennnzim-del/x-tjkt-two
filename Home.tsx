
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
  Play,
  ArrowDownRight
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
      title: "Jago Kabel",
      desc: "Tukang Crimping Handal",
      icon: <Network size={20} />,
    },
    {
      title: "Ngoding Dikit",
      desc: "Bikin Web & Aplikasi",
      icon: <Code size={20} />,
    },
    {
      title: "Anti Hack",
      desc: "Cyber Security Tipis-tipis",
      icon: <ShieldCheck size={20} />,
    }
  ];

  const firstName = user.name.split(' ')[0];

  return (
    <section className="min-h-screen bg-clean relative overflow-hidden flex flex-col">
      {/* Abstract Background Shapes (More Organic) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-[80px] animate-float opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-emerald-50/40 to-teal-100/40 rounded-full blur-[100px] animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-grow flex flex-col justify-center relative pt-28 pb-12 px-6 z-10">
        
        {/* RUNNING TEXT BACKGROUND (Editorial Vibe) */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full opacity-[0.03] pointer-events-none select-none overflow-hidden whitespace-nowrap">
           <div className="animate-marquee inline-block">
              <span className="text-[12rem] font-black font-artist uppercase mr-20">Anak TKJ Nih Boss</span>
              <span className="text-[12rem] font-black font-artist uppercase mr-20">Senggol Dong</span>
              <span className="text-[12rem] font-black font-artist uppercase mr-20">X TJKT TWO</span>
           </div>
           <div className="animate-marquee inline-block absolute top-0 left-full">
              <span className="text-[12rem] font-black font-artist uppercase mr-20">Anak TKJ Nih Boss</span>
              <span className="text-[12rem] font-black font-artist uppercase mr-20">Senggol Dong</span>
              <span className="text-[12rem] font-black font-artist uppercase mr-20">X TJKT TWO</span>
           </div>
        </div>

        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8 mb-12">
            
            {/* User Greeting Badge */}
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <button 
                onClick={() => onExplore('profile')}
                className="group flex items-center gap-4 pl-2 pr-6 py-2 bg-white/60 border border-white/60 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt="Me" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Welcome Bestie,</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{firstName}</span>
                    {user.isAdmin && <CheckCircle2 size={12} className="text-blue-500" />}
                  </div>
                </div>
              </button>
            </div>

            {/* Hezell Watermark */}
            <div className="hidden md:block text-right animate-in fade-in slide-in-from-right duration-700 delay-100">
               <p className="font-handwriting text-2xl text-slate-400">Since 2026</p>
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Hezell Creative</p>
            </div>
          </div>

          {/* Main Typography */}
          <div className="relative mb-16">
            <h1 className="font-artist text-[5rem] sm:text-[7rem] md:text-[9rem] leading-[0.85] font-black text-slate-900 tracking-tighter mix-blend-darken animate-in fade-in slide-in-from-bottom duration-1000">
              <span className="block">DIGITAL</span>
              <span className="block italic font-light text-slate-400 pl-4 sm:pl-12">BASECAMP</span>
              <span className="block text-right pr-4 sm:pr-0 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">ANAK TJKT 2</span>
            </h1>
            
            <div className="absolute top-0 right-0 md:top-1/2 md:-right-8 w-24 h-24 md:w-32 md:h-32 bg-slate-900 rounded-full flex items-center justify-center text-white animate-spin-slow hidden sm:flex">
               <div className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  Calon<br/>Sukses<br/>2026
               </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 items-end">
             <div className="md:col-span-1 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed mb-6 text-justify">
                   Ini markas digital anak <span className="text-slate-900 font-bold">X TJKT TWO</span>. 
                   Tempat kita ngoding, ngeluh tugas, curhat colongan, dan seru-seruan bareng satu kelas. No Drama, Just Vibes.
                </p>
                <div className="flex items-center gap-4">
                   <button onClick={() => onExplore('about')} className="h-12 px-8 bg-slate-900 text-white rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl group">
                      Cek Vibes Kita <ArrowDownRight size={16} className="group-hover:-rotate-45 transition-transform duration-300" />
                   </button>
                </div>
             </div>

             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                {skills.map((skill, idx) => (
                   <div key={idx} className="p-6 border border-slate-200 rounded-3xl hover:bg-white hover:border-white hover:shadow-xl transition-all duration-500 group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                         {skill.icon}
                      </div>
                      <h4 className="font-artist text-lg font-bold text-slate-900 mb-1">{skill.title}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500">{skill.desc}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
