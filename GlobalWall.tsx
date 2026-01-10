
import React, { useState, useEffect } from 'react';
import { Send, Trash2, Heart, Sparkles, MessageSquare, StickyNote, PenTool, CheckCircle2 } from 'lucide-react';
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
  increment
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface GlobalWallProps {
  user: {
    name: string;
    isAdmin: boolean;
  };
}

interface Note {
  id: string;
  text: string;
  sender: string;
  isAdmin?: boolean; // Menambahkan field optional untuk status admin
  color: string;
  likes: number;
  createdAt: any;
  mood: string;
}

const GlobalWall: React.FC<GlobalWallProps> = ({ user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-yellow-100');
  const [selectedMood, setSelectedMood] = useState('😎');
  const [isSending, setIsSending] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const colors = [
    { class: 'bg-yellow-100', hex: '#fef9c3' },
    { class: 'bg-blue-100', hex: '#dbeafe' },
    { class: 'bg-pink-100', hex: '#fce7f3' },
    { class: 'bg-green-100', hex: '#dcfce7' },
    { class: 'bg-purple-100', hex: '#f3e8ff' },
    { class: 'bg-orange-100', hex: '#ffedd5' },
  ];

  const moods = ['😎', '😂', '😭', '😡', '❤️', '🤔', '👻', '🔥'];

  useEffect(() => {
    const q = query(collection(db, "global_wall"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(fetchedNotes);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      // Jika mode anonim aktif, jangan kirim status isAdmin agar identitas tetap terjaga
      const adminStatus = isAnonymous ? false : user.isAdmin;

      await addDoc(collection(db, "global_wall"), {
        text: newMessage,
        sender: isAnonymous ? "Secret Admirer" : user.name.split(' ')[0],
        isAdmin: adminStatus, 
        color: selectedColor,
        mood: selectedMood,
        likes: 0,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
      setIsSending(false);
    } catch (error) {
      console.error("Error posting note:", error);
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus pesan ini dari tembok?")) {
      await deleteDoc(doc(db, "global_wall", id));
    }
  };

  const handleLike = async (id: string) => {
    const noteRef = doc(db, "global_wall", id);
    await updateDoc(noteRef, {
      likes: increment(1)
    });
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 md:px-6 bg-clean relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <header className="text-center mb-12 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <StickyNote size={16} className="text-pink-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">The Wall of Thoughts</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            SUARA <span className="text-slate-200">KITA</span>
          </h2>
          <p className="font-handwriting text-2xl text-slate-400 mt-4">Tempelkan apa saja yang ada di pikiranmu.</p>
        </header>

        {/* Input Area */}
        <div className="max-w-2xl mx-auto mb-16 relative group z-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <form onSubmit={handlePost} className="glass rounded-[2rem] p-6 shadow-2xl relative bg-white/40 backdrop-blur-xl border-white/60">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <PenTool className="absolute left-4 top-4 text-slate-300" size={18} />
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis sesuatu yang asik, lucu, atau inspiratif..."
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-slate-900/10 font-handwriting text-2xl text-slate-700 placeholder:text-slate-300 min-h-[100px] resize-none"
                  maxLength={150}
                />
                <span className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-300">{newMessage.length}/150</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-[200px] md:max-w-none">
                  {colors.map((c) => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setSelectedColor(c.class)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${c.class} ${selectedColor === c.class ? 'border-slate-900 scale-125' : 'border-transparent hover:scale-110'}`}
                    />
                  ))}
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  {moods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`text-lg hover:scale-125 transition-transform ${selectedMood === m ? 'scale-125 drop-shadow-md' : 'opacity-60'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-full border transition-all ${isAnonymous ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    {isAnonymous ? 'Mode: Rahasia 🕵️' : 'Mode: Publik 📢'}
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-submit"
                  >
                    {isSending ? <Sparkles className="animate-spin" size={20} /> : <Send size={20} className="-ml-0.5 mt-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Masonry Grid Layout using CSS Columns */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 pb-20 px-2">
          {notes.map((note, i) => (
            <div 
              key={note.id} 
              className={`break-inside-avoid relative group animate-in zoom-in duration-500`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`${note.color} p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-black/5 relative overflow-hidden`}>
                {/* Pin Effect */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black/10 shadow-inner"></div>

                <div className="flex justify-between items-start mb-3 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl filter drop-shadow-sm">{note.mood}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">
                        {note.sender}
                      </span>
                      {/* Lencana Admin */}
                      {note.isAdmin && (
                        <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" />
                      )}
                    </div>
                  </div>
                  {user.isAdmin && (
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <p className="font-handwriting text-2xl text-slate-800 leading-snug mb-6 break-words">
                  "{note.text}"
                </p>

                <div className="flex items-center justify-between border-t border-black/5 pt-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {note.createdAt?.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : 'Just now'}
                  </span>
                  <button 
                    onClick={() => handleLike(note.id)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-pink-500 transition-colors group/like"
                  >
                    <span className="text-[10px] font-black">{note.likes}</span>
                    <Heart size={14} className={`${note.likes > 0 ? 'fill-pink-500 text-pink-500' : ''} group-hover/like:scale-110 transition-transform`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {notes.length === 0 && (
           <div className="text-center py-20 opacity-50">
             <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="font-artist text-xl text-slate-400">Tembok masih bersih...</p>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Jadilah yang pertama menulis!</p>
           </div>
        )}
      </div>
    </section>
  );
};

export default GlobalWall;
