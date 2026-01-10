
import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Users, 
  PieChart,
  Zap
} from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  deleteDoc, 
  doc, 
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface PollingProps {
  user: {
    name: string;
    isAdmin: boolean;
  };
}

interface Option {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: Option[];
  createdBy: string;
  createdAt: any;
  votedBy: string[];
}

const Polling: React.FC<PollingProps> = ({ user }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '']); 
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPolls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Poll[];
      setPolls(fetchedPolls);
    });
    return () => unsubscribe();
  }, []);

  const handleAddOption = () => {
    setNewOptions([...newOptions, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (newOptions.length > 2) {
      const updatedOptions = newOptions.filter((_, i) => i !== index);
      setNewOptions(updatedOptions);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) {
      alert("Pertanyaan dan opsi tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedOptions = newOptions.map((text, index) => ({
        id: index,
        text,
        votes: 0
      }));

      await addDoc(collection(db, "polls"), {
        question: newQuestion,
        options: formattedOptions,
        createdBy: user.name,
        createdAt: serverTimestamp(),
        votedBy: []
      });

      setNewQuestion('');
      setNewOptions(['', '']);
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (confirm("Hapus polling ini? Data suara akan hilang permanen.")) {
      await deleteDoc(doc(db, "polls", id));
    }
  };

  const handleVote = async (poll: Poll, optionId: number) => {
    // Logic: Jika User Biasa dan sudah vote, tolak.
    // Jika Admin, BOLEH vote berkali-kali (Unlimited Like System).
    if (!user.isAdmin && poll.votedBy.includes(user.name)) {
      alert("Kamu sudah memilih di polling ini!");
      return;
    }

    const updatedOptions = poll.options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    const pollRef = doc(db, "polls", poll.id);
    
    // Update data
    // Admin tetap ditambahkan ke votedBy agar tercatat 'bersuara', tapi tidak diblokir
    await updateDoc(pollRef, {
      options: updatedOptions,
      votedBy: arrayUnion(user.name) 
    });
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 md:px-6 bg-clean relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        
        <header className="text-center mb-12 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <PieChart size={16} className="text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Demokrasi Kelas</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            SUARA <span className="text-slate-200">KITA</span>
          </h2>
          <p className="font-handwriting text-2xl text-slate-400 mt-4">Keputusan bersama, untuk kebersamaan.</p>
        </header>

        {/* ADMIN ONLY: CREATE POLL BUTTON */}
        {user.isAdmin && (
          <div className="mb-12 flex justify-center">
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {isCreating ? <XCircle size={18} /> : <Plus size={18} />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isCreating ? 'Batalkan' : 'Buat Polling Baru'}</span>
            </button>
          </div>
        )}

        {/* ADMIN ONLY: CREATE POLL FORM */}
        {isCreating && user.isAdmin && (
          <div className="max-w-xl mx-auto mb-16 animate-in fade-in zoom-in duration-300">
            <form onSubmit={handleCreatePoll} className="glass rounded-[2.5rem] p-8 shadow-2xl border-white/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pertanyaan</label>
                  <input 
                    type="text" 
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Contoh: Desain baju kelas pilih yang mana?"
                    className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-800 placeholder:font-normal"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pilihan Jawaban</label>
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Opsi ${idx + 1}`}
                        className="flex-grow px-5 py-3 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 text-sm font-medium"
                      />
                      {newOptions.length > 2 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveOption(idx)}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={handleAddOption}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2 mt-2 px-2"
                  >
                    <Plus size={12} /> Tambah Opsi Lain
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 transition-all font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Terbitkan Polling
                </button>
              </div>
            </form>
          </div>
        )}

        {/* POLLS LIST */}
        <div className="grid gap-8">
          {polls.length > 0 ? (
            polls.map((poll) => {
              const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
              const hasVoted = poll.votedBy.includes(user.name);
              
              // Admin selalu melihat tampilan voting (agar bisa spam vote), User biasa melihat hasil jika sudah vote
              const showResultView = hasVoted && !user.isAdmin;

              return (
                <div key={poll.id} className="glass rounded-[3rem] p-8 md:p-10 shadow-xl border-white/60 relative group animate-in slide-in-from-bottom duration-500">
                  
                  {/* Header Poll */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${hasVoted ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {hasVoted ? 'Voted' : 'Active Poll'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Users size={12} /> {totalVotes} Suara
                        </span>
                        {user.isAdmin && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Zap size={10} className="fill-emerald-600" /> Admin Mode: Unlimited Vote
                          </span>
                        )}
                      </div>
                      <h3 className="font-artist text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                        {poll.question}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                        Dibuat oleh {poll.createdBy}
                      </p>
                    </div>

                    {user.isAdmin && (
                      <button 
                        onClick={() => handleDeletePoll(poll.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        title="Hapus Polling"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Options Area */}
                  <div className="space-y-4">
                    {poll.options.map((option) => {
                      const percentage = calculatePercentage(option.votes, totalVotes);
                      
                      return (
                        <div key={option.id} className="relative">
                          {showResultView ? (
                            // RESULT VIEW (User Biasa Sudah Vote)
                            <div className="relative h-14 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                              <div 
                                className="absolute top-0 left-0 h-full bg-slate-900/5 transition-all duration-1000 ease-out flex items-center"
                                style={{ width: `${percentage}%` }}
                              >
                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-slate-900/20"></div>
                              </div>
                              
                              <div className="absolute inset-0 flex items-center justify-between px-6">
                                <span className="font-bold text-slate-700 text-sm md:text-base z-10">{option.text}</span>
                                <div className="flex items-center gap-2 z-10">
                                  <span className="font-artist text-xl font-black text-slate-900">{percentage}%</span>
                                  <span className="text-[10px] text-slate-400 font-bold">({option.votes})</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // VOTING VIEW (Admin / Belum Vote)
                            <button
                              onClick={() => handleVote(poll, option.id)}
                              className={`w-full text-left px-6 py-4 rounded-2xl border transition-all duration-200 shadow-sm group/btn relative overflow-hidden ${user.isAdmin ? 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-400 hover:shadow-md' : 'bg-white border-slate-200 hover:border-slate-900 hover:bg-slate-50'}`}
                            >
                              {/* Background Bar for Admin Visual Feedback */}
                              {user.isAdmin && (
                                <div 
                                  className="absolute top-0 left-0 h-full bg-emerald-500/5 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              )}

                              <div className="relative z-10 flex justify-between items-center">
                                <span className="font-bold text-slate-700 group-hover/btn:text-slate-900 transition-colors">{option.text}</span>
                                <div className="flex items-center gap-3">
                                  {/* Admin melihat jumlah vote saat ini di tombol */}
                                  {user.isAdmin && (
                                    <span className="text-[10px] font-black text-slate-400 bg-white/50 px-2 rounded-full">{option.votes} Suara</span>
                                  )}
                                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover/btn:border-slate-900 flex items-center justify-center">
                                    <div className={`w-2.5 h-2.5 rounded-full bg-slate-900 transition-opacity ${user.isAdmin ? 'opacity-100 scale-75' : 'opacity-0 group-hover/btn:opacity-100'}`}></div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {hasVoted && !user.isAdmin && (
                    <div className="mt-6 text-center animate-in fade-in zoom-in duration-500">
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <CheckCircle2 size={12} /> Terima kasih atas suaramu!
                      </span>
                    </div>
                  )}
                  
                  {user.isAdmin && (
                    <div className="mt-6 text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Admin Mode Active — Tekan opsi untuk menambah suara</p>
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="text-center py-20 opacity-50">
              <BarChart2 size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-artist text-xl text-slate-400">Belum ada polling aktif</p>
              {user.isAdmin ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Klik tombol di atas untuk membuat polling baru</p>
              ) : (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Tunggu admin membuat topik baru ya</p>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Polling;
