
import React, { useState, useMemo } from 'react';
import { Trophy, MessageCircle, CheckCircle2, XCircle, BrainCircuit, Sparkles, PartyPopper, Lightbulb, MessageSquarePlus, Medal, Loader2, ArrowRight } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

const ALL_QUESTIONS: Question[] = [
  {
    question: "Apa singkatan TJKT yang benar menurut 'Ustadz' Lab Komputer?",
    options: ["Teknik Jaringan Komputer & Telekomunikasi", "Tiba-tiba Jajan Kantin Terus", "Teknisi Jujur Kurang Tidur", "Tukang Jaga Kabel Tetangga"],
    answer: 0
  },
  {
    question: "Apa yang dilakukan anak TJKT kalau WiFi sekolah tiba-tiba mati?",
    options: ["Lapor guru piket", "Ritual manggil admin Zent", "Panik nyari tethering HP teman", "Pasrah dan merenungi nasib"],
    answer: 2
  },
  {
    question: "Siapa Wali Kelas X TJKT TWO yang paling sabar menghadapi 'vibrasi' kita?",
    options: ["Ibu Resita", "Ibu Nuri", "Bpk Cecep", "Bpk Herher"],
    answer: 0
  },
  {
    question: "Apa bunyi khas kalau kabel LAN dicolok dengan benar (menurut teori)?",
    options: ["Syuuuuttt", "Blep", "Klik!", "Titititit"],
    answer: 2
  },
  {
    question: "Benda apa yang paling haram disentuh di Lab tanpa izin admin?",
    options: ["Mouse gaming", "Kabel Server utama", "Keyboard berdebu", "Botol minum teman"],
    answer: 1
  },
  {
    question: "Apa obat paling ampuh buat komputer yang lemot bin lola?",
    options: ["Dibanting dikit", "Ditiup lubang USB-nya", "Restart adalah kunci utama", "Diajak ngobrol pelan-pelan"],
    answer: 2
  },
  {
    question: "Slogan legendaris kelas X TJKT TWO adalah...",
    options: ["Stay Humble, Stay Solid", "Maju Terus Pantang Mundur", "Jaringan Oke, Dompet Kere", "Penting Yakin Saja"],
    answer: 0
  },
  {
    question: "Kalau ada teman yang nanya 'IP Address itu apa?', jawaban paling kocak adalah...",
    options: ["Alamat Internet", "Nama Band Korea terbaru", "Id-nya Player Mobile Legend", "Ilmu Pasti Address"],
    answer: 1
  },
  {
    question: "Siapa ketua murid yang paling 'berwibawa' di X TJKT TWO?",
    options: ["Irfan Fermadi", "Galuh Ray", "Dimas Alvino", "Fariz Alfauzi"],
    answer: 0
  },
  {
    question: "Warna kabel LAN yang ada di urutan pertama standar T568B adalah...",
    options: ["Putih Hijau", "Putih Orange", "Biru", "Cokelat"],
    answer: 1
  }
];

interface QuizProps {
  userName: string;
  onSeeLeaderboard: () => void;
}

const Quiz: React.FC<QuizProps> = ({ userName, onSeeLeaderboard }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const quizQuestions = useMemo(() => {
    return [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  }, []);

  const getRankData = (finalScore: number) => {
    if (finalScore === 10) return { title: "Dewa Admin Server", msg: "Gila! Kamu emang teknisi masa depan X TJKT TWO! 🔥" };
    if (finalScore >= 7) return { title: "Kabel LAN Premium", msg: "Mantap, kamu udah paham banget seluk beluk kelas kita! 😎" };
    if (finalScore >= 4) return { title: "User WiFi Gratisan", msg: "Lumayan lah, tapi belajarnya kurang kenceng nih! 😂" };
    return { title: "Kabel Kusut", msg: "Waduh, sepertinya kamu butuh instal ulang otak nih! 🤡" };
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
    try {
      const rankData = getRankData(finalScore);
      await addDoc(collection(db, "leaderboard"), {
        name: userName,
        score: finalScore * 10,
        rankTitle: rankData.title,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Gagal simpan skor:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const adminNumber = "6287729044780";
  const waMessage = encodeURIComponent(
    `Halo Admin X TJKT TWO! 👋\n\nSaya *${userName}*, ingin memberikan masukan untuk website kelas kita:\n\n` +
    `📌 *Kategori:* [Ide Fitur / Saran Desain / Laporan Bug]\n` +
    `📝 *Detail:* ...\n\n` +
    `Semoga bisa membantu pengembangan web kita jadi lebih keren! Terima kasih! 🚀✨`
  );
  const waUrl = `https://wa.me/${adminNumber}?text=${waMessage}`;

  if (showResult) {
    const rank = getRankData(score);
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-clean">
        <div className="w-full max-w-2xl glass rounded-[3.5rem] p-8 md:p-14 text-center shadow-3xl animate-in zoom-in duration-700 border-white/60">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
            <Trophy size={40} className="animate-bounce" />
          </div>
          
          <h2 className="font-artist text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">QUIZ SELESAI!</h2>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mb-10">Mission report for {userName}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[2.5rem]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Skor Kamu</p>
              <p className="text-4xl font-artist font-black text-slate-900">{score * 10}</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[2.5rem]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Gelar Kamu</p>
              <p className="text-lg font-artist font-black text-slate-900 leading-none">{rank.title}</p>
            </div>
          </div>

          <p className="font-handwriting text-3xl text-slate-500 mb-12">"{rank.msg}"</p>

          <div className="flex flex-col gap-4 mb-8">
            <button 
              onClick={onSeeLeaderboard}
              className="flex items-center justify-center gap-4 w-full py-5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl font-black uppercase tracking-[0.3em] text-[10px] group"
            >
              Cek Hall of Fame <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 text-left relative overflow-hidden group border border-slate-100">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
              <MessageSquarePlus size={80} className="text-slate-900" />
            </div>
            
            <div className="relative z-10">
              <h4 className="text-slate-900 font-artist text-xl font-bold mb-3 flex items-center gap-3">
                Punya Ide atau Lapor Bug? 💡
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-8 font-medium">
                Bantu kami mengembangkan web ini jadi lebih keren dengan saran atau laporan kamu!
              </p>
              
              <a 
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm group/btn"
              >
                <MessageCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                Kirim Pesan ke Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIdx];
  const progress = ((currentIdx + 1) / quizQuestions.length) * 100;

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-clean">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <BrainCircuit size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Question {currentIdx + 1} of {quizQuestions.length}
            </span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            FUN <span className="text-slate-200">QUIZ</span>
          </h2>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-10 overflow-hidden">
            <div 
              className="h-full bg-slate-900 transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </header>

        <div className="glass rounded-[3rem] p-8 md:p-12 shadow-2xl relative border-white/60">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb size={20} className="text-amber-400" />
              <span className="font-handwriting text-2xl text-slate-400">Tebak Gesss...</span>
            </div>
            <h3 className="font-artist text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, i) => {
              let btnClass = "glass border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
              let Icon = null;

              if (selectedAnswer === i) {
                if (isCorrect) {
                  btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200";
                  Icon = <CheckCircle2 size={18} />;
                } else {
                  btnClass = "bg-red-500 border-red-500 text-white shadow-red-200";
                  Icon = <XCircle size={18} />;
                }
              } else if (selectedAnswer !== null && i === currentQuestion.answer) {
                 btnClass = "bg-emerald-100 border-emerald-200 text-emerald-700";
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
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Humble — Solid — Family</span>
            <PartyPopper size={14} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Quiz;
