
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, BookOpen, GraduationCap, Library, Shirt, Users, UserCheck, Briefcase, BookMarked, AlertCircle } from 'lucide-react';

const Schedule = () => {
  const [activeDay, setActiveDay] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const days = [
    { 
      day: "Senin", 
      uniform: "Baju Putih Abu (Atribut Lengkap)",
      productiveSubjects: [
        { name: "UPACARA BENDERA", time: "07.30 – 08.05", teacher: "Sekolah" },
        { name: "MATA PELAJARAN DPK", time: "08.05 – 09.50", teacher: "Ibu Resita Agustin" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATA PELAJARAN DPK", time: "10.10 – 11.55", teacher: "Ibu Resita Agustin" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "MATA PELAJARAN IPAS", time: "12.25 – 14.45", teacher: "Ibu Dina Ika Agustiani" }
      ],
      generalSubjects: [
        { name: "UPACARA BENDERA", time: "07.30 – 08.05", teacher: "Lapangan" },
        { name: "B. INGGRIS", time: "08.05 – 09.50", teacher: "Bpk Hamdan Mu'akhor" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "PPKN", time: "10.10 – 11.55", teacher: "Ibu Dina Muminah" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "B. INGGRIS", time: "12.25 – 14.45", teacher: "Bpk Hamdan Mu'akhor" }
      ],
      picket: ["Alham Haikal", "Aurel Agri", "Bibit Adi", "M Razib", "M Rizki", "Nurshifa Amalia", "Rayhan Ambiya", "Salma Yuniar", "Muhani Khalifia"],
      reminders: []
    },
    { 
      day: "Selasa", 
      uniform: "Baju Putih Abu (Atribut LENGKAP)",
      productiveSubjects: [
        { name: "MATA PELAJARAN B.SUNDA", time: "07.30 – 09.50", teacher: "Ibu Nuri Purnamasari" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATA PELAJARAN B.SUNDA", time: "10.10 – 10.45", teacher: "Ibu Nuri Purnamasari" },
        { name: "MATA PELAJARAN IPAS", time: "10.45 – 11.55", teacher: "Ibu Dina Ika Agustiani" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "MATA PELAJARAN IPAS", time: "12.25 – 13.35", teacher: "Ibu Dina Ika Agustin" },
        { name: "MATA PELAJARAN DPK (2)", time: "13.35 – 14.45", teacher: "Bpk Cecep Supriatna" }
      ],
      generalSubjects: [
        { name: "WALI KELAS (PERWALIAN)", time: "07.30 – 08.05", teacher: "Ibu Resita" },
        { name: "B. INGGRIS", time: "08.05 – 09.50", teacher: "Bpk Hamdan Mu'akhor" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "PENDIDIKAN AGAMA ISLAM", time: "10.10 – 11.55", teacher: "Bpk Aziz Alan Abdillah" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "B. INDONESIA", time: "12.25 – 14.45", teacher: "Ibu Irma Nur rohmah" }
      ],
      picket: ["Annas Nasri", "Azmi Abdul", "Cakra Buana", "Deri Pasti", "Hasbi Nursyahputra", "Megha Indah", "Ayatul Husna", "Raya Aprilia"],
      reminders: []
    },
    { 
      day: "Rabu", 
      uniform: "Baju Pramuka (+ Baju Olahraga)",
      productiveSubjects: [
        { name: "MATA PELAJARAN DPK", time: "07.30 – 09.50", teacher: "Bpk Ahmad Sirojudin" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATA PELAJARAN DPK", time: "10.10 – 11.55", teacher: "Bpk Ahmad Sirojudin" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "MATA PELAJARAN DPK", time: "12.25 – 13.00", teacher: "Bpk Ahmad Sirojudin" },
        { name: "MATA PELAJARAN DPK", time: "13.00 – 14.45", teacher: "Bpk Cecep Supriatna" }
      ],
      generalSubjects: [
        { name: "PJOK (TEORI)", time: "07.30 – 08.40", teacher: "Bpk Yodha Ruridiana" },
        { name: "PJOK (PRAKTEK)", time: "08.40 – 09.50", teacher: "Bpk Yodha Ruridiana" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATEMATIKA", time: "10.10 – 11.55", teacher: "Bpk Nu'man" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "SENI BUDAYA", time: "12.25 – 14.45", teacher: "Bpk Cikal Gilang" }
      ],
      picket: ["Galuh Ray", "Irfan Fermadi", "Dimas Alvino", "Fariz Alfauzi", "Rabli Azwar", "Melvina Yeiza", "Evander Yusup", "Salma Zulfa", "Shira Putryasni"],
      reminders: [
        "Tugas B.Indonesia: Cerita Rakyat (Pengertian & Contoh Cerita).",
        "Jangan lupa bawa baju olahraga!"
      ]
    },
    { 
      day: "Kamis", 
      uniform: "Baju Batik Smaknis",
      productiveSubjects: [
        { name: "MATA PELAJARAN IPAS", time: "07.30 – 09.50", teacher: "Ibu Dina Ika Agustiani" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATA PELAJARAN DPK", time: "10.10 – 11.55", teacher: "Bpk Cecep Supriatna" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "MATA PELAJARAN INF", time: "12.25 – 14.45", teacher: "Bpk Herher Abdul khohar" }
      ],
      generalSubjects: [
        { name: "B. INDONESIA", time: "07.30 – 09.50", teacher: "Ibu Irma Nur Rohman" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATEMATIKA", time: "10.10 – 11.55", teacher: "Bpk Nu'man" },
        { name: "ISTIRAHAT", time: "11.55 – 12.25", teacher: "-" },
        { name: "SEJARAH", time: "12.25 – 14.45", teacher: "Ibu Ati Rohayati" }
      ],
      picket: ["Raihan Alviansyah", "Wijaya Zainur", "Rasya Raditya", "Pahri Gilang", "Maulana", "Rindu Riayu", "Rista Amelia", "Siti Saripah", "Firman Supiani"],
      reminders: [
        "TUGAS SENI: Menuliskan aktor.",
        "TUGAS MATEMATIKA: Menghafalkan rumus trigonometris."
      ]
    },
    { 
      day: "Jumat", 
      uniform: "Baju Putih Hitam / Pramuka",
      productiveSubjects: [
        { name: "SHOLAT DHUHA", time: "07.30 – 08.05", teacher: "Bersama" },
        { name: "MATA PELAJARAN DPK 3", time: "08.05 – 08.40", teacher: "Ibu Resita Agustin" },
        { name: "MATA PELAJARAN INF", time: "08.40 – 09.50", teacher: "Bpk Herher Abdul Kohar" },
        { name: "ISTIRAHAT", time: "09.50 – 10.10", teacher: "-" },
        { name: "MATA PELAJARAN INF", time: "10.10 – 11.20", teacher: "Bpk Herher Abdul Khohar" }
      ],
      generalSubjects: [],
      picket: ["Padil Nurjaman", "Zaky Pairus", "Zyldan Muzhaffar", "Rizkia Febryanti", "Intan Darmawan", "Zulpa Apriliani", "Galuh Raga", "Wolid Herdiansyah", "M Firman Supiani"],
      reminders: []
    },
  ];

  useEffect(() => {
    const observerOptions = {
      root: scrollContainerRef.current,
      threshold: 0.6, 
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = dayRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) {
            setActiveDay(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    dayRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleTabClick = (index: number) => {
    setActiveDay(index);
    const targetElement = dayRefs.current[index];
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  };

  const renderSubjectList = (subjects: any[], title: string, icon: React.ReactNode, headerColor: string) => (
    <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom duration-700">
      <div className={`flex items-center gap-3 mb-6 p-3 rounded-xl border border-dashed ${headerColor}`}>
        {icon}
        <span className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</span>
      </div>
      
      <div className="space-y-4">
        {subjects.map((sub, j) => (
          <div 
            key={j} 
            className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] transition-all duration-500 hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 group/item ${
              sub.name.includes('ISTIRAHAT') || sub.name.includes('UPACARA') || sub.name.includes('SHOLAT') ? 'bg-slate-50/60' : 'bg-white/40'
            }`}
          >
            <div className="flex items-center gap-5 mb-4 md:mb-0">
              <div className={`p-2 rounded-xl transition-colors ${
                sub.name.includes('ISTIRAHAT') 
                ? 'bg-amber-100 text-amber-600' 
                : sub.name.includes('UPACARA') || sub.name.includes('SHOLAT') 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-slate-100 text-slate-900'
              }`}>
                <BookOpen size={18} />
              </div>
              <div>
                <h4 className="font-artist text-xl font-black text-slate-900 leading-none mb-2 uppercase tracking-tight group-hover/item:text-slate-600 transition-colors">{sub.name}</h4>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{sub.teacher}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
                <Clock size={13} className="text-slate-400" />
                <span className="text-[11px] font-black tracking-widest text-slate-600">{sub.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-24 pt-32 bg-clean min-h-screen relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-50/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <span className="font-handwriting text-3xl text-slate-400 block mb-3">Rencana Mingguan</span>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Jadwal <span className="text-slate-200">Tempur</span>
          </h2>
          <div className="w-24 h-1.5 bg-slate-900 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar gap-3 mb-12 pb-4 -mx-6 px-6 md:mx-0 sticky top-24 z-20">
          <div className="flex gap-3 glass p-2 rounded-full border-white/50">
            {days.map((item, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`whitespace-nowrap px-8 py-4 rounded-full transition-all duration-500 font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 ${
                  activeDay === index
                    ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl scale-105 z-10'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Calendar size={14} />
                {item.day}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-10 pb-10 -mx-6 px-6 md:mx-0 md:px-0"
        >
          {days.map((dayData, i) => (
            <div 
              key={i}
              ref={(el) => (dayRefs.current[i] = el)}
              className="min-w-full md:min-w-[100%] lg:min-w-[1024px] snap-center px-2"
            >
              <div className="max-w-5xl mx-auto">
                <div className="glass rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group border-white/60">
                  {/* Uniform Indicator */}
                  <div className="absolute top-8 right-8 hidden lg:flex items-center gap-3 glass px-6 py-3 rounded-2xl border-white shadow-sm">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                      <Shirt size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Dress Code</p>
                      <p className="text-[10px] font-bold text-slate-900 uppercase">{dayData.uniform}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 leading-none mb-1.5">Schedule View</p>
                      <h3 className="font-artist text-4xl font-black text-slate-900 uppercase tracking-tighter">{dayData.day}</h3>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-10">
                    {/* Subjects Column */}
                    <div className="lg:col-span-2">
                      
                      {dayData.productiveSubjects.length > 0 && 
                        renderSubjectList(
                          dayData.productiveSubjects, 
                          "Kelas Produktif (Semester Ganjil)", 
                          <Briefcase size={18} className="text-slate-900" />,
                          "bg-slate-100 border-slate-200"
                        )
                      }

                      {dayData.generalSubjects.length > 0 && 
                        renderSubjectList(
                          dayData.generalSubjects, 
                          "Kelas Umum (Mulai 12 Jan 2026)", 
                          <BookMarked size={18} className="text-blue-600" />,
                          "bg-blue-50 border-blue-200"
                        )
                      }
                      
                    </div>

                    {/* Picket Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="glass-dark bg-slate-900/5 rounded-[2.5rem] p-8 h-full border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                            <Users size={18} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900">Piket Squad</span>
                        </div>

                        <div className="space-y-3 mb-8">
                          {dayData.picket.map((person, k) => (
                            <div key={k} className="flex items-center gap-3 group/piket p-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/piket:bg-slate-900 transition-colors"></div>
                              <span className="text-xs font-bold text-slate-500 group-hover/piket:text-slate-900 transition-colors uppercase tracking-tight">{person}</span>
                            </div>
                          ))}
                        </div>

                        {/* Reminder Section */}
                        {dayData.reminders && dayData.reminders.length > 0 && (
                          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                               <AlertCircle size={14} className="text-amber-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Reminder</span>
                            </div>
                            <ul className="space-y-2 mb-4">
                              {dayData.reminders.map((rem, rIdx) => (
                                <li key={rIdx} className="text-[10px] font-medium text-slate-600 leading-relaxed pl-2 border-l-2 border-amber-200">
                                  {rem}
                                </li>
                              ))}
                            </ul>
                            <div className="pt-3 border-t border-amber-200/50">
                                <p className="text-[9px] text-amber-600/80 italic">
                                   💡 Bingung tugasnya? Coba tanya <span className="font-bold">Hzell Virtual</span>.
                                </p>
                             </div>
                          </div>
                        )}

                        <div className="p-5 bg-white/60 rounded-3xl border border-white">
                          <div className="flex items-center gap-2 mb-2 text-slate-900">
                            <UserCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tugas Utama</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-400 uppercase font-bold">Menjaga kebersihan, kerapihan, dan kenyamanan kelas X TJKT TWO.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="mt-12 pt-8 border-t border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">© 2026 Class Management — X TJKT TWO</p>
                    <div className="flex gap-2">
                      {days.map((_, dotIdx) => (
                        <div key={dotIdx} className={`w-1 h-1 rounded-full transition-all duration-300 ${activeDay === dotIdx ? 'bg-slate-900 w-4' : 'bg-slate-200'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center animate-bounce">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Geser untuk melihat hari selanjutnya</p>
        </div>

        <div className="mt-16 flex justify-center lg:hidden">
           <div className="glass px-6 py-4 rounded-2xl flex items-center gap-3 text-slate-500">
              <Shirt size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Seragam: {days[activeDay].uniform}</span>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
