
import React from 'react';
import { 
  ChevronRight, 
  Code, 
  Network, 
  Wrench, 
  ShieldCheck, 
  Settings2,
  Cpu,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface HomeProps {
  onExplore: (page: string) => void;
  userName: string;
  isAdmin: boolean;
}

const Home: React.FC<HomeProps> = ({ onExplore, userName, isAdmin }) => {
  const skills = [
    {
      title: "Web Development",
      desc: "Bikin landing page kece & aplikasi web yang fungsional.",
      icon: <Code size={28} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Network Engineer",
      desc: "Arsitek di balik layar yang bikin internet lancar jaya.",
      icon: <Network size={28} />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Technic IT",
      desc: "Solusi sat-set buat segala masalah hardware & software.",
      icon: <Wrench size={28} />,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Specialist Security",
      desc: "Penjaga pintu digital biar data aman dari tangan jahil.",
      icon: <ShieldCheck size={28} />,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Konfigurasi Jaringan",
      desc: "Setting router & switch biar koneksi makin gokil.",
      icon: <Settings2 size={28} />,
      color: "bg-rose-50 text-rose-600"
    },
    {
      title: "IoT Solutions",
      desc: "Eksperimen seru hubungin barang lewat internet.",
      icon: <Cpu size={28} />,
      color: "bg-slate-50 text-slate-800"
    }
  ];

  const firstName = userName.split(' ')[0];

  return (
    <section className="min-h-screen bg-clean relative overflow-hidden">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative pt-20">
        <div className="absolute top-40 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
        
        <div className="container mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-3 glass px-5 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-top duration-1000">
            {isAdmin ? <ShieldAlert size={14} className="text-blue-600" /> : <Sparkles size={14} className="text-yellow-500" />}
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
              {isAdmin ? `Administrator: ${firstName}` : `Halo, ${firstName}! Selamat datang kembali.`}
            </span>
          </div>

          <p className="font-handwriting text-3xl text-slate-500 mb-4 animate-in fade-in slide-in-from-bottom duration-700">Udah siap buat perjalanan seru?</p>
          <h1 className="font-artist text-6xl md:text-9xl font-bold text-slate-900 mb-6 tracking-tight animate-in fade-in slide-in-from-bottom duration-1000">
            X TJKT TWO
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed font-light uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            Teknik Jaringan Komputer & Telekomunikasi <br/> Angkatan Paling Gacor 2024/2025
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <button onClick={() => onExplore('about')} className="px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group">
              Intip Vibes Kita <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onExplore('members')} className="px-8 py-4 glass text-slate-900 rounded-full hover:bg-white/60 transition-all flex items-center justify-center gap-2">
              Kenalan Sama Squad
            </button>
          </div>
        </div>
      </div>

      {/* Expertise Section */}
      <div className="py-24 bg-white/50 backdrop-blur-sm relative z-10 border-t border-white/40">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <span className="font-handwriting text-2xl text-slate-400 block mb-2">Apa yang kita kuasai?</span>
            <h2 className="font-artist text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Our Core Expertise</h2>
            <div className="w-20 h-1 bg-slate-900 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="glass group p-8 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-white"
              >
                <div className={`w-16 h-16 ${skill.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  {skill.icon}
                </div>
                <h3 className="font-artist text-2xl font-bold text-slate-900 mb-3">{skill.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
