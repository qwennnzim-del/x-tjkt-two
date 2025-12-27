
import React from 'react';

const Footer = () => (
  <footer className="py-20 bg-slate-900 text-white rounded-t-[4rem]">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-16 mb-20">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-artist text-5xl md:text-7xl font-bold mb-8">Stay humble, stay solid.</h2>
          <p className="text-slate-400 max-w-lg mb-12 font-light tracking-wide text-lg">
            Ada pertanyaan atau mau ngajak kolaborasi? Main aja ke Laboratorium Komputer atau hubungi kita di sosmed. Kita selalu terbuka buat teman-teman baru.
          </p>
          <div className="flex gap-6">
            <a 
              href="https://www.instagram.com/teknisinya.tjktdua?igsh=bDF5MWV5djkxejc=" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center hover:bg-white transition-all duration-500 overflow-hidden group"
              title="Instagram @teknisinya.tjktdua"
            >
              <img 
                src="https://img.icons8.com/?size=100&id=BrU2BBoRXiWq&format=png&color=000000" 
                alt="Instagram" 
                className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
              />
            </a>
            <a 
              href="https://whatsapp.com/channel/0029VbB2q6h8qIzobHipWV1d" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center hover:bg-white transition-all duration-500 overflow-hidden group"
              title="WhatsApp Channel X TJKT TWO"
            >
              <img 
                src="https://img.icons8.com/?size=100&id=A1JUR9NRH7sC&format=png&color=000000" 
                alt="WhatsApp" 
                className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
              />
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-bold text-slate-500">X TJKT TWO 2024</h4>
          <p className="font-handwriting text-3xl text-white/80">"Kita bukan teman, kita keluarga."</p>
        </div>
      </div>
      <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-artist text-xl tracking-tighter opacity-50">X TJKT TWO</span>
        <p className="text-slate-500 text-xs font-light tracking-widest uppercase">
          © {new Date().getFullYear()} — Zent Tech.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
