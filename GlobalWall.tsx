
import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Heart, Sparkles, MessageSquare, StickyNote, PenTool, CheckCircle2, User as UserIcon, CornerDownRight, X, Image as ImageIcon, Loader2, Bot } from 'lucide-react';
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
  increment,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

interface GlobalWallProps {
  user: {
    name: string;
    isAdmin: boolean;
    photo?: string;
  };
}

interface Reply {
  id: string;
  text: string;
  sender: string;
  photo?: string | null;
  isAdmin: boolean;
  createdAt: string;
}

interface Note {
  id: string;
  text: string;
  sender: string;
  photo?: string;
  postImage?: string; // New field for posted image
  isAdmin?: boolean;
  color: string;
  likes: number;
  likedBy?: string[];
  createdAt: any;
  replies?: Reply[];
}

const GlobalWall: React.FC<GlobalWallProps> = ({ user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-gradient-to-br from-yellow-50 to-amber-100');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for Replies
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [customReplyName, setCustomReplyName] = useState(''); // State khusus Admin
  const [isReplying, setIsReplying] = useState(false);

  const gradients = [
    { name: 'Warm', class: 'bg-gradient-to-br from-orange-50 to-amber-100', hex: '#fff7ed' },
    { name: 'Cool', class: 'bg-gradient-to-br from-blue-50 to-indigo-100', hex: '#eff6ff' },
    { name: 'Sweet', class: 'bg-gradient-to-br from-pink-50 to-rose-100', hex: '#fff1f2' },
    { name: 'Fresh', class: 'bg-gradient-to-br from-emerald-50 to-teal-100', hex: '#ecfdf5' },
    { name: 'Royal', class: 'bg-gradient-to-br from-purple-50 to-violet-100', hex: '#f5f3ff' },
    { name: 'Clean', class: 'bg-gradient-to-br from-slate-50 to-gray-200', hex: '#f8fafc' },
  ];

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit 2MB for base64 performance
        alert("Ukuran foto terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow post if text exists OR image exists
    if (!newMessage.trim() && !selectedImage) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "global_wall"), {
        text: newMessage,
        sender: user.name.split(' ')[0], // Nama Depan
        photo: user.photo || null,
        postImage: selectedImage || null,
        isAdmin: user.isAdmin,
        color: selectedColor,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
        replies: []
      });
      setNewMessage('');
      setSelectedImage(null);
      setIsSending(false);
    } catch (error) {
      console.error("Error posting note:", error);
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus postingan ini?")) {
      await deleteDoc(doc(db, "global_wall", id));
    }
  };

  const handleLike = async (id: string, currentLikedBy: string[] = []) => {
    const noteRef = doc(db, "global_wall", id);

    if (user.isAdmin) {
      await updateDoc(noteRef, { likes: increment(1) });
      return;
    }

    if (currentLikedBy && currentLikedBy.includes(user.name)) return; 

    await updateDoc(noteRef, {
      likes: increment(1),
      likedBy: arrayUnion(user.name)
    });
  };

  const handleReplySubmit = async (noteId: string) => {
    if (!replyText.trim()) return;
    setIsReplying(true);

    // LOGIKA ADMIN CUSTOM NAME
    // Jika user admin DAN kolom custom name terisi, gunakan nama custom dan hilangkan status admin
    let senderName = user.name.split(' ')[0];
    let isAdminSender = user.isAdmin;
    let senderPhoto = user.photo || null;

    if (user.isAdmin && customReplyName.trim()) {
      senderName = customReplyName.trim();
      isAdminSender = false; // Agar terlihat seperti user biasa
      senderPhoto = null; // Gunakan avatar default agar tidak ketahuan foto admin
    }

    const newReply: Reply = {
      id: crypto.randomUUID(),
      text: replyText,
      sender: senderName,
      photo: senderPhoto,
      isAdmin: isAdminSender,
      createdAt: new Date().toISOString()
    };

    try {
      const noteRef = doc(db, "global_wall", noteId);
      await updateDoc(noteRef, {
        replies: arrayUnion(newReply)
      });
      setReplyText('');
      setCustomReplyName(''); // Reset nama custom
      setActiveReplyId(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 md:px-6 bg-clean relative overflow-hidden">
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <header className="text-center mb-12 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <StickyNote size={16} className="text-pink-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">The Wall of Thoughts</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            SUARA <span className="text-slate-200">KITA</span>
          </h2>
          <p className="font-handwriting text-2xl text-slate-400 mt-4">Terbuka, Santai, dan Penuh Warna.</p>
        </header>

        {/* Input Area */}
        <div className="max-w-2xl mx-auto mb-16 relative group z-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <form onSubmit={handlePost} className="glass rounded-[2rem] p-6 shadow-2xl relative bg-white/60 backdrop-blur-xl border-white/60">
            <div className="flex flex-col gap-4">
              
              {/* Image Preview Area */}
              {selectedImage && (
                <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 group/preview">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="relative">
                <PenTool className="absolute left-4 top-4 text-slate-300" size={18} />
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis sesuatu atau bagikan foto..."
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-slate-900/10 font-handwriting text-2xl text-slate-700 placeholder:text-slate-300 min-h-[100px] resize-none"
                  maxLength={500}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  {/* Color Picker */}
                  <div className="flex gap-2">
                    {gradients.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => setSelectedColor(g.class)}
                        className={`w-6 h-6 rounded-full shadow-sm transition-transform ${g.class} ${selectedColor === g.class ? 'ring-2 ring-slate-900 scale-125' : 'hover:scale-110 border border-black/5'}`}
                        title={g.name}
                      />
                    ))}
                  </div>

                  {/* Image Upload Button */}
                  <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
                    title="Upload Foto"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSending || (!newMessage.trim() && !selectedImage)}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-submit text-[10px] font-black uppercase tracking-widest"
                >
                  {isSending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  <span>Posting</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Masonry Grid Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20 px-2">
          {notes.map((note, i) => {
            const userHasLiked = note.likedBy?.includes(user.name);
            
            return (
            <div 
              key={note.id} 
              className={`break-inside-avoid relative group animate-in slide-in-from-bottom duration-700`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`${note.color} p-5 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 relative overflow-hidden flex flex-col`}>
                
                {/* Header: Photo & Name */}
                <div className="flex justify-between items-start mb-4 px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-white/50 shadow-sm shrink-0">
                      {note.photo ? (
                        <img src={note.photo} alt={note.sender} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <UserIcon size={14} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">
                          {note.sender}
                        </span>
                        {note.isAdmin && <CheckCircle2 size={12} className="text-blue-600 fill-blue-100" />}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none block mt-1">
                        {note.createdAt?.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  </div>

                  {user.isAdmin && (
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className="w-7 h-7 bg-white/50 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Post Image (If Exists) */}
                {note.postImage && (
                  <div className="mb-4 rounded-3xl overflow-hidden border border-white/40 shadow-sm">
                    <img 
                      src={note.postImage} 
                      alt="Post attachment" 
                      className="w-full h-auto object-cover max-h-[400px]"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content Text */}
                {note.text && (
                  <p className="font-handwriting text-2xl text-slate-800 leading-snug mb-5 break-words px-1">
                    "{note.text}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-auto">
                   <button 
                    onClick={() => {
                       setActiveReplyId(activeReplyId === note.id ? null : note.id);
                       setCustomReplyName(''); // Reset saat toggle
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-[10px] font-black uppercase tracking-widest ${activeReplyId === note.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-black/5'}`}
                  >
                    <MessageSquare size={12} />
                    {note.replies?.length || 0} Reply
                  </button>

                  <button 
                    onClick={() => handleLike(note.id, note.likedBy)}
                    disabled={!user.isAdmin && userHasLiked}
                    className={`flex items-center gap-1.5 px-2 transition-transform ${!user.isAdmin && userHasLiked ? 'opacity-80 cursor-default' : 'hover:scale-110 cursor-pointer'}`}
                  >
                    <span className={`text-[10px] font-black ${userHasLiked || (user.isAdmin && note.likes > 0) ? 'text-pink-600' : 'text-slate-500'}`}>{note.likes}</span>
                    <Heart 
                      size={16} 
                      className={`${userHasLiked || (user.isAdmin && note.likes > 0) ? 'fill-pink-500 text-pink-500' : 'text-slate-500'} transition-colors`} 
                    />
                  </button>
                </div>

                {/* Reply Section */}
                {(activeReplyId === note.id || (note.replies && note.replies.length > 0)) && (
                  <div className={`mt-4 pt-4 border-t border-black/5 ${activeReplyId !== note.id ? 'hidden' : 'block'}`}>
                    
                    {/* List Replies */}
                    {note.replies && note.replies.length > 0 && (
                      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto no-scrollbar pr-1">
                        {note.replies.map((reply, rIdx) => (
                          <div key={rIdx} className="flex gap-2.5 items-start bg-white/40 p-3 rounded-2xl">
                             <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-white shrink-0">
                                {reply.photo ? (
                                  <img src={reply.photo} alt={reply.sender} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300"><UserIcon size={12}/></div>
                                )}
                             </div>
                             <div className="flex-grow">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                   <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight">{reply.sender}</span>
                                   {reply.isAdmin && <CheckCircle2 size={10} className="text-blue-500" />}
                                </div>
                                <p className="text-xs text-slate-600 leading-tight">{reply.text}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {activeReplyId === note.id && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        
                        {/* ADMIN ONLY: Custom Name Input */}
                        {user.isAdmin && (
                          <div className="flex items-center gap-2 mb-2 bg-slate-900/5 p-2 rounded-xl">
                            <Bot size={14} className="text-slate-500 ml-1" />
                            <input 
                              type="text"
                              value={customReplyName}
                              onChange={(e) => setCustomReplyName(e.target.value)}
                              placeholder="Nama Samaran (Kosongkan = Admin Asli)"
                              className="w-full bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-900 placeholder:text-slate-400 outline-none"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <CornerDownRight size={16} className="text-slate-300 ml-1" />
                          <div className="flex-grow relative">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={user.isAdmin && customReplyName ? `Balas sebagai "${customReplyName}"...` : "Balas..."}
                              className="w-full pl-4 pr-10 py-2.5 bg-white/60 rounded-xl text-xs border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-900"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(note.id)}
                            />
                            <button 
                              onClick={() => handleReplySubmit(note.id)}
                              disabled={!replyText.trim() || isReplying}
                              className="absolute right-1 top-1 p-1.5 bg-slate-900 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                            >
                               {isReplying ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
            );
          })}
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
