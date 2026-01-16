
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, User, Cpu, Paperclip, Image as ImageIcon, Zap, Maximize2, FileCode, Search, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string; 
  isStreaming?: boolean; 
}

// LOGO DEEPZENT
const AI_LOGO_URL = "https://img.icons8.com/?size=100&id=UVAma2zdWPaJ&format=png&color=000000";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk Attachment Gambar
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  // Auto focus input saat dibuka
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // Limit 3MB
         alert("Ukuran file maksimal 3MB ya!");
         return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result as string);
        setFileMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const currentImage = selectedFile;
    const currentMime = fileMimeType;
    const currentText = input.trim();

    // 1. Tambahkan pesan user ke UI Local
    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      text: currentText,
      image: currentImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    clearFile(); // Reset file input UI segera
    setIsLoading(true);

    // 2. Siapkan Placeholder Pesan AI (Kosong Awalnya)
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsgPlaceholder: Message = {
      id: aiMsgId,
      role: 'ai',
      text: '', // Kosong dulu, nanti diisi stream
      isStreaming: true
    };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    try {
      // 3. Siapkan History
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      // 4. Panggil API (Fetch dengan Stream Reader)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentText || (currentImage ? "Analisis gambar ini" : ""),
          history: history,
          image: currentImage,
          mimeType: currentMime
        })
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      // 5. Baca Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          accumulatedText += chunkValue;

          // Update pesan AI di state secara real-time
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMsgId 
                ? { ...msg, text: accumulatedText } 
                : msg
            )
          );
        }
      }

      // Selesai streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
        )
      );

    } catch (error) {
      console.error("Chat Error:", error);
      // Update pesan AI jadi error jika gagal
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: "**Error:** Maaf, koneksi ke DeepZent terputus atau terjadi kesalahan server.", isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[9980] p-3 md:p-4 bg-slate-900 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border-2 border-white/20 ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'}`}
      >
        <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
             <img src={AI_LOGO_URL} alt="DeepZent" className="w-6 h-6 object-contain" />
           </div>
           <span className="hidden md:block text-xs font-black uppercase tracking-widest">DeepZent AI</span>
        </div>
      </button>

      {/* FULL SCREEN OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* HEADER */}
          <div className="flex-none bg-slate-900/50 border-b border-white/10 p-4 md:px-8 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-white/20">
                 <img src={AI_LOGO_URL} alt="Logo" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h3 className="font-artist text-2xl font-black text-white leading-none tracking-tight">DeepZent</h3>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mt-1">BY HEZELL</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* CHAT AREA */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
          >
            {/* EMPTY STATE / WELCOME SCREEN */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                 <div className="w-28 h-28 mb-6 relative group">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative w-full h-full bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-slate-900/5">
                        <img src={AI_LOGO_URL} alt="DeepZent" className="w-16 h-16 object-contain" />
                    </div>
                 </div>
                 <h2 className="font-artist text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-200 via-white to-cyan-200 mb-2">
                    DeepZent
                 </h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6">By Hezell</p>
                 
                 <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed mb-8">
                    Brain powered by <strong>Gemini 2.5 Flash</strong>. Siap bantu tugas, analisis kode, atau sekadar teman ngobrol anak TJKT 2.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                    <div className="glass bg-white/5 border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors text-left group cursor-default">
                       <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                          <ImagePlus size={20} />
                       </div>
                       <h4 className="text-white font-bold mb-1">Visual Analysis</h4>
                       <p className="text-xs text-slate-400">Kirim foto error atau topologi, DeepZent akan memindainya.</p>
                    </div>
                    <div className="glass bg-white/5 border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors text-left group cursor-default">
                       <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                          <FileCode size={20} />
                       </div>
                       <h4 className="text-white font-bold mb-1">Code & Tech</h4>
                       <p className="text-xs text-slate-400">Jago config Mikrotik, Cisco, hingga ngoding web.</p>
                    </div>
                    <div className="glass bg-white/5 border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors text-left group cursor-default">
                       <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                          <Search size={20} />
                       </div>
                       <h4 className="text-white font-bold mb-1">Class Info</h4>
                       <p className="text-xs text-slate-400">Tanya jadwal piket atau struktur kelas X TJKT 2.</p>
                    </div>
                 </div>
              </div>
            )}

            {/* MESSAGE BUBBLES */}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.role === 'ai' && (
                  <div className="w-10 h-10 rounded-xl bg-white border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-lg overflow-hidden">
                    <img src={AI_LOGO_URL} className="w-7 h-7 object-contain" alt="AI" />
                  </div>
                )}
                
                <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                   {/* Menampilkan Gambar yang diupload User */}
                   {msg.image && (
                     <div className={`rounded-2xl overflow-hidden border-2 ${msg.role === 'user' ? 'border-slate-700 ml-auto' : 'border-slate-700'} w-48 shadow-lg`}>
                        <img src={msg.image} alt="Uploaded" className="w-full h-auto object-cover" />
                     </div>
                   )}

                   {/* Bubble Teks */}
                   {(msg.text || msg.role === 'ai') && (
                      <div 
                        className={`p-5 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-md ${
                          msg.role === 'user' 
                            ? 'bg-slate-100 text-slate-900 rounded-tr-none' 
                            : 'bg-white/5 text-slate-100 rounded-tl-none border border-white/10 backdrop-blur-sm'
                        }`}
                      >
                        {msg.role === 'ai' ? (
                          <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/10 prose-a:text-emerald-400">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                              {msg.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse align-middle"></span>
                              )}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                   )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1 border-2 border-slate-300">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            
            {/* LOADING INDICATOR KHUSUS SAAT MENUNGGU STREAM PERTAMA KALI */}
            {isLoading && messages[messages.length - 1]?.text === '' && (
              <div className="flex gap-4 justify-start animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white border border-white/10 flex items-center justify-center shrink-0">
                  <img src={AI_LOGO_URL} className="w-6 h-6 object-contain" />
                </div>
                <div className="bg-white/5 p-4 rounded-[2rem] rounded-tl-none flex items-center gap-3 text-sm font-bold text-slate-400 border border-white/10">
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                     DeepZent is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="flex-none p-4 md:p-6 bg-slate-900/80 border-t border-white/10 backdrop-blur-xl">
             <div className="max-w-4xl mx-auto">
                
                {/* File Preview Chip */}
                {selectedFile && (
                  <div className="mb-3 inline-flex items-center gap-3 bg-slate-800 pl-2 pr-4 py-2 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2 fade-in">
                     <div className="w-10 h-10 rounded-xl overflow-hidden bg-black">
                        <img src={selectedFile} className="w-full h-full object-cover" alt="Preview" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Image Attached</span>
                        <span className="text-xs text-white truncate max-w-[100px]">Ready to send</span>
                     </div>
                     <button onClick={clearFile} className="ml-2 p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 size={14} />
                     </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="relative flex items-end gap-3">
                  {/* File Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:bg-white/10 hover:text-white transition-colors shrink-0 group"
                    title="Upload Gambar"
                  >
                     <Paperclip size={20} className="group-hover:rotate-45 transition-transform" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />

                  {/* Text Input */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Tanya DeepZent tentang apapun..."
                    className="w-full pl-5 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-base text-white placeholder:text-slate-500 shadow-inner resize-none min-h-[56px] max-h-[120px]"
                    rows={1}
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className="absolute right-2 bottom-2 p-3 bg-gradient-to-br from-emerald-500 to-cyan-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:grayscale transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Send size={18} className={isLoading ? "opacity-0" : "opacity-100"} />
                  </button>
                </form>
                
                <div className="text-center mt-3">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      DeepZent may produce inaccurate info. Verify important data.
                   </p>
                </div>
             </div>
          </div>
          
        </div>
      )}
    </>
  );
};

// Helper Icon Component
const ImagePlus = ({ size, className }: { size?: number, className?: string }) => (
    <ImageIcon size={size} className={className} />
);

export default ChatAssistant;
