
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, User, Cpu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: 'System Online. Halo! Saya Hzell Virtual 🤖. Asisten pribadi buatan Hezell untuk X TJKT TWO. Mau tanya soal struktur kelas atau teknis jaringan?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Siapkan history untuk dikirim ke API (ambil 10 pesan terakhir agar hemat token context)
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      // Panggil Serverless Function di Vercel
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: history
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Terjadi kesalahan pada server');
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.text || "Sistem mengalami gangguan. Coba lagi nanti."
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "Koneksi ke server Hzell terputus. Pastikan konfigurasi API sudah benar."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9990] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group ${
          isOpen ? 'bg-red-500 text-white rotate-90' : 'bg-slate-900 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} className="group-hover:animate-bounce" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] glass rounded-[2rem] shadow-3xl border-white/60 z-[9990] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-white/80 p-4 border-b border-white/40 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="font-artist text-lg font-black text-slate-900 leading-none">Hzell Virtual</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">AI by Hezell</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 bg-white/40"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot size={14} />
                  </div>
                )}
                
                <div 
                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 rounded-bl-none border border-white/50'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white/50 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Loader2 size={12} className="animate-spin" />
                  Hzell sedang memproses...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 border-t border-white/40">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya Hzell..."
                className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors shadow-md"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
          
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
