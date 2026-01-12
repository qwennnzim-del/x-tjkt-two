import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, BrainCircuit, Sparkles, PartyPopper, Lightbulb, ArrowRight, Lock, Cpu, Zap, Loader2 } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  limit,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// --- PERTANYAAN BARU (EDISI V2) ---
interface Question {
  question: string;
  options: string[];
  answer: number;
}

const ALL_QUESTIONS: Question[] = [
  {
    question: "Di dunia jaringan, perintah 'PING' itu sebenernya singkatan dari apa (plesetan anak TJKT)?",
    options: ["Packet Internet Groper", "Pastikan Internet Ngacir Gan", "Program Iseng Nyari Gratisan", "Pusing Ini Network Gagal"],
    answer: 0
  },
  {
    question: "Kalau komputer panas banget, komponen apa yang biasanya butuh 'Pasta' baru?",
    options: ["RAM", "Processor (CPU)", "Harddisk", "Monitor"],
    answer: 1
  },
  {
    question: "Urutan warna pertama pada kabel LAN tipe Straight (T568B) adalah...",
    options: ["Putih Hijau", "Putih Biru", "Putih Orange", "Putih Cokelat"],
    answer: 2
  },
  {
    question: "Port standar untuk layanan web (HTTP) adalah...",
    options: ["Port 80", "Port 443", "Port 21", "Port 8080"],
    answer: 0
  },
  {
    question: "Apa fungsi utama dari RAM di komputer/laptop kita?",
    options: ["Menyimpan foto mantan selamanya", "Penyimpanan data sementara saat dinyalakan", "Mendinginkan mesin", "Supaya bisa main game berat doang"],
    answer: 1
  },
  {
    question: "Singkatan dari WAN adalah...",
    options: ["Wireless Area Network", "Wide Area Network", "Wifi Asli Ngebuhul", "World Access Number"],
    answer: 1
  },
  {
    question: "Penyakit paling umum anak TJKT kalau lagi ngoding atau config router adalah...",
    options: ["Typo satu huruf, error semalaman", "Lupa makan", "Ketiduran di keyboard", "Mouse hilang"],
    answer: 0
  },
  {
    question: "Tombol shortcut legendaris buat 'Paste' adalah...",
    options: ["Ctrl + C", "Ctrl + V", "Ctrl + P", "Ctrl + Z"],
    answer: 1
  },
  {
    question: "Sistem operasi yang logonya Pinguin imut adalah...",
    options: ["Windows", "MacOS", "Linux", "Android"],
    answer: 2
  },
  {
    question: "Apa moto hidup yang cocok buat anak X TJKT TWO?",
    options: ["No WiFi, No Life", "Salah Kabel, Salah Masa Depan", "Stay Solid, Stay Connected", "Reboot is the Solution"],
    answer: 2
  }
];

interface QuizProps {
  user: {
    name: string;
    isAdmin: boolean;
    photo?: string;
  };
  onSeeLeaderboard: () => void;
}

const Quiz: React.FC<QuizProps> = ({ user, onSeeLeaderboard }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyParticipated, setAlreadyParticipated] = useState(false);
  const [pastScore, setPastScore] = useState<number | null>(null);

  // DATABASE BARU: leaderboard_v2
  const COLLECTION_NAME = "leaderboard_v2";
  const LOCAL_STORAGE_KEY = `quiz_v2_taken_${user.name}`;

  // Cek apakah user sudah pernah ikut quiz versi baru
  useEffect(() => {
    const checkUserParticipation = async () => {
      // 1. Cek LocalStorage dulu (Cepat)
      const localStatus = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localStatus) {
        setPastScore(parseInt(localStatus));
        setAlreadyParticipated(true);
        setCheckingStatus(false);
        return;
      }

      // 2. Cek Firestore V2
      try {
        const q = query(
          collection(db, COLLECTION_NAME), 
          where("name", "==", user.name),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setPastScore(data.score);
          setAlreadyParticipated(true);
          // Simpan ke local agar refresh selanjutnya lebih cepat
          localStorage.setItem(LOCAL_STORAGE_KEY, data.score.toString());
        }
      } catch (err) {
        console.error("Error checking quiz status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkUserParticipation();
  }, [user.name, LOCAL_STORAGE_KEY]);

  const quizQuestions = useMemo(() => {
    return [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  }, []);

  const getRankData = (finalScore: number) => {
    const s = finalScore / 10;
    if (finalScore === 100) return { title: "Grand Master TJKT", msg: "Sempurna! Kamu layak jadi admin server sekolah! 👑" };
    if (finalScore >= 80) return { title: "Sepuh Jaringan", msg: "Ilmu padi bosku, makin berisi makin merunduk! 🔥" };
    if (finalScore >= 60) return { title: "Teknisi Magang", msg: "Not bad, tapi jangan lupa cek kabel lagi ya! 🛠️" };
    if (finalScore >= 40) return { title: "User WiFi Kantin", msg: "Lumayan lah, yang penting connect! 😂" };
    return { title: "Kabel Putus", msg: "Waduh, butuh crimping ulang otak nih sepertinya! 🤡" };
  };

  const handleAnswer = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(optionIdx);
    const correct = optionIdx === quizQuestions[currentIdx].answer;
    setIsCorrect(correct);
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(async () => {
      if (currentIdx < quizQuestions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        saveToLeaderboard(newScore);
      }
    }, 1200);
  };

  const saveToLeaderboard = async (finalScore: number) => {
    setIsSaving(true);
    const actualScore = finalScore * 10;
    try {
      const rankData = getRankData(actualScore);
      await addDoc(collection(db, COLLECTION_NAME), {
        name: user.name,
        score: actualScore,
        rankTitle: rankData.title,
        isAdmin: user.isAdmin,
        photo: user.photo || null,
        createdAt: serverTimestamp()
      });
      // Tandai sudah mengerjakan di local
      localStorage.setItem(LOCAL_STORAGE_KEY, actualScore.toString());
    } catch (err) {
      console.error("Gagal simpan skor:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-clean">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-slate-200 animate-spin" />
          <p className="font-artist text-xl text-slate-400">Loading Quiz V2...</p>
        </div>
      </div>
    );
  }

  // Jika sudah pernah ikut
  if (alreadyParticipated && !showResult) {
    const rank = getRankData(pastScore || 0);
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-clean">
        <div className="w-full max-w-2xl glass rounded-[3.5rem] p-8 md:p-14 text-center shadow-3xl border-white/60 animate-in zoom-in duration-700">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Lock size={40} />
          </div>
          <h2 className="font-artist text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">QUIZ V2 SELESAI</h2>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mb-10">Kamu sudah mengambil kesempatan ini</p>
          
          <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 mb-10">
            <p className="text-sm font-handwriting text-slate-500 mb-4">Skor Tertinggimu</p>
            <div className="flex justify-center items-end gap-1 mb-4">
              <span className="text-6xl font-artist font-black text-slate-900">{pastScore}</span>
              <span className="text-xs font-black text-slate-400 mb-2">PTS</span>
            </div>
            <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              {rank.title}
            </div>
          </div>

          <button 
            onClick={onSeeLeaderboard}
            className="flex items-center justify-center gap-4 w-full py-5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl font-black uppercase tracking-[0.3em] text-[10px]"
          >
            Lihat Papan Skor Season 2 <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Tampilan Hasil
  if (showResult) {
    const rank = getRankData(score * 10);
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-clean">
        <div className="w-full max-w-2xl glass rounded-[3.5rem] p-8 md:p-14 text-center shadow-3xl animate-in zoom-in duration-700 border-white/60">
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-amber-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-6 border-4 border-white">
            <Trophy size={48} className="animate-bounce" />
          </div>
          
          <h2 className="font-artist text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">RESULT SEASON 2</h2>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mb-10">Report for Agent {user.name.split(' ')[0]}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/60 border border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Skor</p>
              <p className="text-4xl font-artist font-black text-slate-900">{score * 10}</p>
            </div>
            <div className="bg-white/60 border border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Peringkat</p>
              <p className="text-lg font-artist font-black text-slate-900 leading-none mt-1">{rank.title}</p>
            </div>
          </div>

          <p className="font-handwriting text-3xl text-slate-500 mb-12">"{rank.msg}"</p>

          <div className="flex flex-col gap-4 mb-8">
            <button 
              onClick={onSeeLeaderboard}
              className="flex items-center justify-center gap-4 w-full py-5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl font-black uppercase tracking-[0.3em] text-[10px] group"
            >
              Cek Leaderboard Baru <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Pertanyaan
  const currentQuestion = quizQuestions[currentIdx];
  const progress = ((currentIdx + 1) / quizQuestions.length) * 100;

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-clean">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <Zap size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Season 2 • Question {currentIdx + 1}/{quizQuestions.length}
            </span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            TJKT <span className="text-slate-200">BRAIN</span>
          </h2>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-10 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out relative" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="glass rounded-[3rem] p-8 md:p-12 shadow-2xl relative border-white/60">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Cpu size={24} className="text-slate-900" />
              <span className="font-handwriting text-2xl text-slate-400">Logic Check...</span>
            </div>
            <h3 className="font-artist text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, i) => {
              let btnClass = "glass border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01]";
              let Icon = null;

              if (selectedAnswer === i) {
                if (isCorrect) {
                  btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 scale-[1.02]";
                  Icon = <CheckCircle2 size={18} />;
                } else {
                  btnClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 scale-[1.02]";
                  Icon = <XCircle size={18} />;
                }
              } else if (selectedAnswer !== null && i === currentQuestion.answer) {
                 btnClass = "bg-emerald-100 border-emerald-200 text-emerald-700 opacity-80";
              }

              return (
                <button
                  key={i}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-8 py-5 rounded-2xl transition-all duration-300 flex items-center justify-between font-bold text-sm md:text-base border shadow-sm group ${btnClass}`}
                >
                  <span className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-colors ${selectedAnswer === i ? 'bg-white/20 border-white/40' : 'bg-slate-50 border-slate-100 group-hover:bg-white'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </span>
                  {Icon}
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 opacity-30">
            <Sparkles size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">X TJKT TWO — 2026</span>
            <PartyPopper size={14} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Quiz;