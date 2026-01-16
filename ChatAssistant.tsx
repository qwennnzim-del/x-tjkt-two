
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, User, Cpu, Paperclip, Image as ImageIcon, Zap, Maximize2, FileCode, Search, Trash2, ImagePlus, MonitorPlay, Code2, Download, Check, ChevronDown, ChevronRight, LayoutTemplate, Palette, FileJson, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PresentationPreview from './PresentationPreview';
import JSZip from 'jszip';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string; 
  isStreaming?: boolean;
  // Custom Data untuk Fitur Khusus
  type?: 'text' | 'presentation_card' | 'code_card';
  presentationData?: any;
  codeData?: any;
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
  
  // --- STATES FITUR KHUSUS ---
  const [wizardMode, setWizardMode] = useState<'none' | 'slide' | 'code'>('none');
  const [slideStep, setSlideStep] = useState(1);
  const [slideConfig, setSlideConfig] = useState({ count: 5, style: 'cyber', topic: '' });
  const [processingStatus, setProcessingStatus] = useState(''); // Untuk status "Hacking...", "Coding..."
  const [showPresentationPreview, setShowPresentationPreview] = useState<any>(null); // Data slide untuk preview

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading, processingStatus]);

  // Download Code as ZIP
  const handleDownloadZip = async (codeData: any) => {
    const zip = new JSZip();
    codeData.files.forEach((file: any) => {
       zip.file(file.name, file.content);
    });
    
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DeepZent_Project.zip";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- HANDLER KIRIM PESAN UTAMA ---
  const handleSend = async (e?: React.FormEvent, overrideMsg?: string, specialMode?: 'presentation_generator' | 'code_generator') => {
    if (e) e.preventDefault();
    const textToSend = overrideMsg || input.trim();
    
    if ((!textToSend && !selectedFile) || isLoading) return;

    // Reset Wizard UI jika user mengirim pesan manual (cancel wizard)
    if (!overrideMsg) {
        setWizardMode('none');
        setSlideStep(1);
    }

    const currentImage = selectedFile;
    const currentMime = fileMimeType;

    // 1. Tambahkan pesan user ke UI
    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      image: currentImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    clearFile();
    setIsLoading(true);

    // 2. Siapkan Placeholder Pesan AI
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsgPlaceholder: Message = {
      id: aiMsgId,
      role: 'ai',
      text: '', 
      isStreaming: true,
      type: 'text' // Default
    };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    try {
      // SET STATUS KERJA (Visual Effect)
      if (specialMode === 'code_generator') {
         const statuses = ["Menganalisis Logic...", "Membuat Struktur HTML...", "Meracik CSS Tailwind...", "Menulis JavaScript...", "Finalizing Code..."];
         let i = 0;
         const interval = setInterval(() => {
            setProcessingStatus(statuses[i]);
            i = (i + 1) % statuses.length;
         }, 800);
         // Stop interval nanti di finally/success
      } else if (specialMode === 'presentation_generator') {
         setProcessingStatus("Merancang Slide Deck Estetik...");
      }

      // API CALL
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          image: currentImage,
          mimeType: currentMime,
          mode: specialMode, // 'presentation_generator' | 'code_generator' | undefined
          slideConfig: specialMode === 'presentation_generator' ? slideConfig : undefined
        })
      });

      // --- HANDLING RESPONSE ---
      
      // JIKA SPECIAL MODE (JSON RESPONSE)
      if (specialMode) {
          const data = await response.json();
          
          // Error handling jika response API kosong atau error
          if (!data || !data.text) {
             throw new Error("Respon AI kosong atau gagal.");
          }

          // Parsing JSON string dari Gemini
          let parsedData;
          try {
             // Bersihkan markdown block jika ada (```json ... ```)
             const rawText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
             parsedData = JSON.parse(rawText);
          } catch (err) {
             console.error("JSON Parse Error", err);
             // Fallback: Tampilkan pesan error user friendly
             setMessages(prev => prev.map(msg => 
               msg.id === aiMsgId ? { ...msg, text: "Maaf, terjadi kesalahan saat memproses data format (JSON Error). Coba request ulang ya!", isStreaming: false } : msg
             ));
             setProcessingStatus('');
             return;
          }

          setProcessingStatus(''); // Clear status

          if (parsedData.type === 'presentation_result') {
             setMessages(prev => prev.map(msg => 
               msg.id === aiMsgId ? { ...msg, text: "Slide Presentasi Siap!", isStreaming: false, type: 'presentation_card', presentationData: parsedData } : msg
             ));
          } else if (parsedData.type === 'code_result') {
             setMessages(prev => prev.map(msg => 
               msg.id === aiMsgId ? { ...msg, text: "Website Project Created!", isStreaming: false, type: 'code_card', codeData: parsedData } : msg
             ));
          }

      } else {
          // JIKA CHAT BIASA (STREAMING)
          if (!response.body) throw new Error('ReadableStream not supported.');
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
              setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg));
            }
          }
          setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg));
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: "Error: Gagal memproses permintaan (Server Error).", isStreaming: false } : msg));
    } finally {
      setIsLoading(false);
      setProcessingStatus('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 5MB Limit
      if (file.size > 5 * 1024 * 1024) { 
         alert("Ukuran file maksimal 5MB.");
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

  const handleSuggestionClick = (text: string) => {
     if (text === "Analisis gambar ini") {
        fileInputRef.current?.click();
        setInput("Bantu saya menganalisis gambar ini...");
     } else {
        setInput(text);
     }
  };

  // --- WIZARD HANDLERS ---
  const startSlideWizard = () => {
     setWizardMode('slide');
     setSlideStep(1);
     setSlideConfig({ count: 5, style: 'cyber', topic: '' });
  };

  const handleSlideCount = (count: number) => {
     setSlideConfig(prev => ({ ...prev, count }));
     setSlideStep(2);
  };

  const handleSlideStyle = (style: string) => {
     setSlideConfig(prev => ({ ...prev, style }));
     setSlideStep(3);
  };

  const submitSlideTopic = () => {
     if (!slideConfig.topic) return;
     setWizardMode('none'); // Close wizard UI
     // Kirim request khusus
     handleSend(undefined, slideConfig.topic, 'presentation_generator');
  };

  // --- COMPONENT: CODE CARD UI ---
  const CodeCard = ({ data }: { data: any }) => {
      const [expanded, setExpanded] = useState(true);
      
      return (
        <div className="w-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 shadow-2xl mt-2 font-mono text-sm">
           {/* Header Mac Style */}
           <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-slate-400 text-xs">DeepZent_Project</div>
              <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white"><ChevronDown size={14} className={`transition-transform ${!expanded ? '-rotate-90' : ''}`} /></button>
           </div>
           
           {expanded && (
             <div className="p-4">
               {/* File List */}
               <div className="space-y-2 mb-6">
                  {data.files.map((file: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300 hover:bg-[#3e3e3e] p-2 rounded cursor-default animate-in slide-in-from-left" style={{ animationDelay: `${idx * 100}ms` }}>
                       <FileCode size={16} className="text-blue-400" />
                       <span>{file.name}</span>
                       <Check size={14} className="text-emerald-500 ml-auto" />
                    </div>
                  ))}
               </div>

               {/* Preview First File Code Snippet (Optional) */}
               <div className="bg-[#121212] p-3 rounded-lg text-xs text-slate-500 mb-4 border border-slate-800">
                  <pre className="overflow-x-auto no-scrollbar">
                     <code>{data.files[0].content.substring(0, 100)}...</code>
                  </pre>
               </div>

               {/* Action Buttons */}
               <button 
                 onClick={() => handleDownloadZip(data)}
                 className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-bold uppercase tracking-widest text-[10px]"
               >
                 <Download size={16} /> Download Project (ZIP)
               </button>
             </div>
           )}
        </div>
      );
  };

  // --- COMPONENT: PRESENTATION CARD UI ---
  const PresentationCard = ({ data }: { data: any }) => {
     return (
        <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-2xl mt-2 relative overflow-hidden group border border-white/10">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white/10 rounded-lg"><LayoutTemplate size={20} /></div>
                 <div>
                    <h4 className="font-bold text-lg">Presentasi Siap!</h4>
                    <p className="text-xs text-indigo-200">{data.slides.length} Slide • Tema {data.theme}</p>
                 </div>
              </div>
              
              <button 
                 onClick={() => setShowPresentationPreview(data)}
                 className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
              >
                 <Play size={14} className="fill-indigo-900" /> Lihat Slide
              </button>
           </div>
        </div>
     );
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

      {/* FULL SCREEN OVERLAY MOBILE OPTIMIZED */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300 h-[100dvh]">
          
          {/* HEADER */}
          <div className="flex-none bg-slate-900/80 border-b border-white/10 p-3 md:p-4 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-white/20">
                 <img src={AI_LOGO_URL} alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <h3 className="font-artist text-xl md:text-2xl font-black text-white leading-none tracking-tight">DeepZent</h3>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mt-1">BY HEZELL</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* CHAT AREA */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            {/* WELCOME / EMPTY STATE */}
            {messages.length === 0 && wizardMode === 'none' && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                 <div className="w-20 h-20 mb-4 relative group">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative w-full h-full bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-slate-900/5">
                        <img src={AI_LOGO_URL} alt="DeepZent" className="w-12 h-12 object-contain" />
                    </div>
                 </div>
                 <h2 className="font-artist text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-200 via-white to-cyan-200 mb-6">
                    DeepZent
                 </h2>
                 
                 {/* GRID MENU UTAMA */}
                 <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    <button onClick={startSlideWizard} className="col-span-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-4 rounded-2xl hover:bg-indigo-500/30 transition-all group text-left">
                       <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform"><MonitorPlay size={20} /></div>
                       <h4 className="text-white font-bold text-sm">Buat Slide</h4>
                       <p className="text-[10px] text-indigo-200 mt-1">Presentasi Instan Gen Z</p>
                    </button>
                    
                    <button onClick={() => { setWizardMode('code'); }} className="col-span-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-4 rounded-2xl hover:bg-emerald-500/30 transition-all group text-left">
                       <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform"><Code2 size={20} /></div>
                       <h4 className="text-white font-bold text-sm">Bikin Web</h4>
                       <p className="text-[10px] text-emerald-200 mt-1">HTML, CSS, JS Ready</p>
                    </button>

                    <button onClick={() => handleSuggestionClick("Analisis gambar ini")} className="col-span-2 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg"><ImagePlus size={20} /></div>
                       <div className="text-left">
                          <h4 className="text-white font-bold text-sm">Analisis Gambar</h4>
                          <p className="text-[10px] text-slate-400">Upload soal atau error log.</p>
                       </div>
                    </button>
                 </div>
              </div>
            )}

            {/* WIZARD MODE: SLIDE */}
            {wizardMode === 'slide' && (
               <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto animate-in slide-in-from-bottom fade-in">
                  <div className="w-full glass bg-slate-900/50 border-slate-700 p-6 rounded-[2rem]">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold flex items-center gap-2"><LayoutTemplate size={18} /> Slide Wizard</h3>
                        <button onClick={() => setWizardMode('none')} className="text-slate-400 hover:text-white"><X size={18} /></button>
                     </div>

                     {/* STEP 1: JUMLAH SLIDE */}
                     {slideStep === 1 && (
                        <div className="space-y-6">
                           <p className="text-slate-300 text-sm text-center">Mau berapa slide, bestie?</p>
                           <div className="relative pt-6 pb-2">
                              <input 
                                type="range" min="1" max="10" step="1" 
                                value={slideConfig.count} 
                                onChange={(e) => setSlideConfig({...slideConfig, count: parseInt(e.target.value)})}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                              <div className="text-center mt-4 text-4xl font-black text-emerald-400">{slideConfig.count}</div>
                           </div>
                           <button onClick={() => setSlideStep(2)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors">Lanjut</button>
                        </div>
                     )}

                     {/* STEP 2: STYLE DESAIN */}
                     {slideStep === 2 && (
                        <div className="space-y-4">
                           <p className="text-slate-300 text-sm text-center">Pilih vibe desainnya:</p>
                           <div className="grid grid-cols-1 gap-3">
                              <button onClick={() => handleSlideStyle('cyber')} className="p-4 rounded-xl border border-cyan-500/50 bg-cyan-900/20 hover:bg-cyan-500/20 text-cyan-300 text-left transition-all">
                                 <div className="font-bold">👾 Cyber Y2K</div>
                                 <div className="text-[10px] opacity-70">Neon, Glitch, Hacker vibes.</div>
                              </button>
                              <button onClick={() => handleSlideStyle('minimal')} className="p-4 rounded-xl border border-slate-500/50 bg-slate-800/50 hover:bg-white/10 text-white text-left transition-all">
                                 <div className="font-bold">✨ Clean Minimalist</div>
                                 <div className="text-[10px] opacity-70">Simple, Rapi, Professional.</div>
                              </button>
                              <button onClick={() => handleSlideStyle('retro')} className="p-4 rounded-xl border border-orange-500/50 bg-orange-900/20 hover:bg-orange-500/20 text-orange-300 text-left transition-all">
                                 <div className="font-bold">📼 Retro 90s</div>
                                 <div className="text-[10px] opacity-70">Nostalgic, Paper texture.</div>
                              </button>
                           </div>
                        </div>
                     )}

                     {/* STEP 3: TOPIK */}
                     {slideStep === 3 && (
                        <div className="space-y-4">
                           <p className="text-slate-300 text-sm text-center">Topik presentasinya apa?</p>
                           <textarea 
                              value={slideConfig.topic}
                              onChange={(e) => setSlideConfig({...slideConfig, topic: e.target.value})}
                              placeholder="Contoh: Sejarah Perkembangan Jaringan 5G..."
                              className="w-full p-4 bg-slate-800 rounded-xl text-white text-sm outline-none border border-slate-700 focus:border-emerald-500 min-h-[100px]"
                           />
                           <button onClick={submitSlideTopic} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                              <Sparkles size={14} className="inline mr-2" /> Generate Magic
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* MESSAGE BUBBLES */}
            {messages.map((msg) => {
              if (msg.role === 'ai' && !msg.text) return null; // Hide empty streaming placeholders

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 mb-4`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-white border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-lg overflow-hidden">
                      <img src={AI_LOGO_URL} className="w-5 h-5 object-contain" alt="AI" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] md:max-w-[75%]`}>
                     {/* Image Attachment */}
                     {msg.image && (
                       <div className={`rounded-xl overflow-hidden border-2 mb-2 ${msg.role === 'user' ? 'border-slate-700 ml-auto' : 'border-slate-700'} w-40 shadow-lg`}>
                          <img src={msg.image} alt="Uploaded" className="w-full h-auto object-cover" />
                       </div>
                     )}

                     {/* Text Bubble */}
                     {msg.text && (
                        <div 
                          className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-md break-words ${
                            msg.role === 'user' 
                              ? 'bg-slate-100 text-slate-900 rounded-tr-none' 
                              : 'bg-white/5 text-slate-100 rounded-tl-none border border-white/10 backdrop-blur-sm'
                          }`}
                        >
                          {msg.role === 'ai' ? (
                            <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-xl">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                     )}

                     {/* RENDER SPECIAL CARDS */}
                     {msg.type === 'code_card' && msg.codeData && (
                        <CodeCard data={msg.codeData} />
                     )}

                     {msg.type === 'presentation_card' && msg.presentationData && (
                        <PresentationCard data={msg.presentationData} />
                     )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1 border-2 border-slate-300">
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* LOADING & PROCESSING INDICATOR */}
            {(isLoading || processingStatus) && (
              <div className="flex gap-3 justify-start animate-pulse mb-6">
                <div className="w-8 h-8 rounded-xl bg-white border border-white/10 flex items-center justify-center shrink-0">
                  <img src={AI_LOGO_URL} className="w-5 h-5 object-contain" />
                </div>
                <div className="bg-white/5 px-4 py-3 rounded-[1.5rem] rounded-tl-none flex items-center gap-2 text-xs font-bold text-slate-400 border border-white/10">
                  {processingStatus ? (
                     <>
                        <Cpu size={14} className="animate-spin text-emerald-400" />
                        <span className="text-emerald-400 font-mono">{processingStatus}</span>
                     </>
                  ) : (
                     <>
                        <Loader2 size={14} className="animate-spin text-cyan-400" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                           DeepZent is thinking...
                        </span>
                     </>
                  )}
                </div>
              </div>
            )}
            
            <div className="h-24"></div>
          </div>

          {/* INPUT AREA STICKY BOTTOM */}
          {/* Sembunyikan Input Area jika sedang Wizard Mode */}
          {wizardMode === 'none' && (
          <div className="flex-none p-3 md:p-5 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl absolute bottom-0 left-0 w-full z-20">
             <div className="max-w-4xl mx-auto">
                {selectedFile && (
                  <div className="mb-2 inline-flex items-center gap-2 bg-slate-800 pl-2 pr-3 py-1.5 rounded-xl border border-white/10">
                     <div className="w-8 h-8 rounded-lg overflow-hidden bg-black shrink-0">
                        <img src={selectedFile} className="w-full h-full object-cover" alt="Preview" />
                     </div>
                     <div className="flex flex-col min-w-0">
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Image Attached</span>
                        <button onClick={clearFile} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
                     </div>
                  </div>
                )}

                <form onSubmit={(e) => handleSend(e)} className="relative flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/5 text-slate-400 rounded-xl border border-white/10 hover:bg-white/10 transition-colors shrink-0"
                  >
                     <Paperclip size={18} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

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
                    placeholder="Ketik pesan..."
                    className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-base text-white placeholder:text-slate-500 resize-none min-h-[48px] max-h-[100px]"
                    rows={1}
                  />

                  <button
                    type="submit"
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className="absolute right-1.5 bottom-1.5 p-2.5 bg-emerald-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </form>
             </div>
          </div>
          )}

          {/* INPUT AREA KHUSUS WEB GENERATOR (Jika wizard mode 'code') */}
          {wizardMode === 'code' && (
             <div className="flex-none p-3 md:p-5 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl absolute bottom-0 left-0 w-full z-20">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Code2 size={12}/> Mode Web Developer</span>
                       <button onClick={() => setWizardMode('none')} className="text-slate-500 hover:text-white text-xs ml-auto">Batal</button>
                    </div>
                    <form onSubmit={(e) => { 
                         e.preventDefault(); 
                         if(input.trim()) {
                            setWizardMode('none'); 
                            handleSend(undefined, input, 'code_generator'); 
                         }
                    }} className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Mau bikin website apa? (Contoh: Landing page kopi estetik...)"
                            className="w-full p-4 bg-slate-800 border border-emerald-500/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[80px]"
                            autoFocus
                        />
                        <button type="submit" className="absolute bottom-3 right-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-600">
                           Generate Code
                        </button>
                    </form>
                </div>
             </div>
          )}
          
        </div>
      )}

      {/* RENDER PRESENTATION PREVIEW OVERLAY */}
      {showPresentationPreview && (
         <PresentationPreview data={showPresentationPreview} onClose={() => setShowPresentationPreview(null)} />
      )}
    </>
  );
};

export default ChatAssistant;
