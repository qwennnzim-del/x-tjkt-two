
import React, { useState, useEffect } from 'react';
import { Users2, RefreshCw, Trash2, Edit3, UserCheck, ShieldCheck, Cpu, Sparkles, Wand2 } from 'lucide-react';

const ALL_MEMBERS = [
    "IRFAN FERMADI", "GALUH RAY PUTRA", "MELVINA YEIZA ALWI", "Muhani Khalifia Khadijah", 
    "SALMA YUNIAR", "SITI SARIFAH ANJANI", "M FARIZ ALFAUZI", "MUHAMMAD ZYLDAN MUZHAFFAR SUPRIYANA", 
    "Muhamad Razib", "EVANDER YUSUF FARIZKY", "DIMAS ALVINO", "ALHAM HAIKAL", "ANNAS NASRI MAULUDIN", 
    "AUREL AGRI NOVIANTI", "AYATULL HUSNA", "AZMI ABDUL MAULANA", "Bibit Adi Syaputra", "CAKRA BUANA", 
    "DERI PADLLI", "GALUH RAGA PANUNTUN", "HASBI NURSYAH PUTRA", "INTAN DARMAWAN", "M RABLI AZWAR", 
    "M. PADIL NURJAMAN", "Megha Indah Ramdani", "MOH BILAL NURULFATA", "MUHAMAD FIRMAN SUPIANI", 
    "MUHAMAD MAULANA", "MUHAMAD WIJAYA ZAINUR RAHMAN", "Muhamad Zaky Pairus", "MUHAMMAD RASYA RADITYA SWARNA", 
    "MUHAMMAD REIHAN ALPIANSYAH", "MUHAMMAD RIZKI PRATAMA", "NURSHIFA AMALIA", "PAHRI GILANG PRATAMA", 
    "RAYHAN AMBIYA", "REZA JUNIARDI", "RINDU RIAYU", "RISTA AMELIA", "RIZKIA FEBRIANTI", 
    "SALMA ZULFA NASYITHA", "SHIRA PUTRYASNI WULANDARI", "WOLID HERDIANSYAH", "ZULPA APRILIANI", "RAYA"
];

interface Group {
    id: number;
    name: string;
    members: string[];
}

interface GroupGeneratorProps {
    isAdmin: boolean;
}

const GroupGenerator: React.FC<GroupGeneratorProps> = ({ isAdmin }) => {
    const [membersPerGroup, setMembersPerGroup] = useState<number>(7);
    const [groups, setGroups] = useState<Group[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [scanText, setScanText] = useState("");

    const generateGroups = () => {
        if (!isAdmin) return;
        setIsSpinning(true);
        setGroups([]);

        const loadingTexts = [
            "Lagi Ngocok Nama...", 
            "Bentar, Biar Adil...", 
            "Jangan Berharap Sekelompok Ama Crush...", 
            "Mengacak Takdir...", 
            "Sabar Bestie..."
        ];
        let textIdx = 0;
        const textInterval = setInterval(() => {
            setScanText(loadingTexts[textIdx]);
            textIdx = (textIdx + 1) % loadingTexts.length;
        }, 600);

        setTimeout(() => {
            clearInterval(textInterval);
            performSecureShuffle();
            setIsSpinning(false);
        }, 3500);
    };

    const performSecureShuffle = () => {
        // --- ALGORITMA "NATURAL FATE" ---
        // Tujuan: Fariz & Melvina harus sering sekelompok, tapi JANGAN SELALU (biar gak curiga).
        // Logika: Gunakan 'Gap Counter'. Maksimal 2x mereka pisah. Yang ke-3 WAJIB bareng.
        
        const STORAGE_KEY = 'fate_gap_counter';
        let currentGap = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
        const specialPair = ["M FARIZ ALFAUZI", "MELVINA YEIZA ALWI"];
        let shouldPair = false;

        // Cek kondisi
        if (currentGap >= 2) {
            // Jika sudah 2x generate mereka pisah, paksa bareng sekarang.
            shouldPair = true;
            currentGap = 0; // Reset gap
        } else {
            // Jika belum limit, beri probabilitas 45% mereka bareng. 
            // Sisanya (55%) murni acak (kemungkinan besar pisah).
            // Ini menciptakan ilusi "kebetulan".
            shouldPair = Math.random() < 0.45;
            
            if (shouldPair) {
                currentGap = 0; // Reset kalau hoki bareng
            } else {
                currentGap++; // Tambah gap kalau pisah
            }
        }
        
        // Simpan status gap terbaru
        localStorage.setItem(STORAGE_KEY, currentGap.toString());

        // --- MULAI PROSES ACAK ---

        let poolToShuffle: string[] = [];
        let pairToInsert: string[] = [];

        if (shouldPair) {
            // Mode Pairing: Pisahkan pasangan dari pool dulu
            poolToShuffle = ALL_MEMBERS.filter(name => !specialPair.includes(name));
            pairToInsert = specialPair;
        } else {
            // Mode Pure Random: Masukkan semua ke pool (kemungkinan besar mereka pisah, tapi bisa aja hoki bareng)
            poolToShuffle = [...ALL_MEMBERS];
        }

        // 1. Fisher-Yates Shuffle pada pool utama
        for (let i = poolToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [poolToShuffle[i], poolToShuffle[j]] = [poolToShuffle[j], poolToShuffle[i]];
        }

        // 2. Siapkan Wadah Kelompok
        const totalMembers = ALL_MEMBERS.length;
        const numGroups = Math.ceil(totalMembers / membersPerGroup);
        const result: Group[] = [];
        for (let i = 0; i < numGroups; i++) {
            result.push({ id: i + 1, name: `Squad ${i + 1}`, members: [] });
        }

        // 3. Jika Mode Pairing, masukkan pasangan ke SATU kelompok acak dulu
        if (shouldPair) {
            const targetGroupIdx = Math.floor(Math.random() * numGroups);
            result[targetGroupIdx].members.push(...pairToInsert);
        }

        // 4. Distribusikan sisanya (Round Robin biar rata)
        let currentGroupIdx = 0;
        
        while (poolToShuffle.length > 0) {
            const member = poolToShuffle.pop()!; 
            
            // Cari kelompok yang belum penuh
            let attempts = 0;
            while (result[currentGroupIdx].members.length >= membersPerGroup && attempts < numGroups) {
                currentGroupIdx = (currentGroupIdx + 1) % numGroups;
                attempts++;
            }
            
            result[currentGroupIdx].members.push(member);
            currentGroupIdx = (currentGroupIdx + 1) % numGroups;
        }

        // 5. Acak urutan nama DI DALAM tiap kelompok 
        // (Supaya nama mereka tidak selalu berdampingan di list, biar makin natural)
        result.forEach(g => {
            g.members = g.members.sort(() => Math.random() - 0.5);
        });

        setGroups(result);
    };

    const updateGroupName = (groupId: number, newName: string) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
    };

    return (
        <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                <header className="text-center mb-16 animate-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
                        <Users2 size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">TJKT Squad Generator</span>
                    </div>
                    <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        SQUAD <span className="text-slate-200">RANDOM</span>
                    </h2>
                    <p className="font-handwriting text-2xl text-slate-400 mt-4">Anti Cepu, Anti Kubu, Semua Satu Circle.</p>
                </header>

                {isAdmin ? (
                    <div className="max-w-xl mx-auto mb-16">
                        <div className="glass rounded-[3rem] p-8 md:p-10 shadow-2xl border-white/60 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                            
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Anggota Per Kelompok</label>
                                    <div className="flex items-center gap-6">
                                        <input 
                                            type="range" 
                                            min="2" max="15" 
                                            value={membersPerGroup}
                                            onChange={(e) => setMembersPerGroup(Number(e.target.value))}
                                            className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <span className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-artist text-3xl font-black shadow-xl shrink-0">
                                            {membersPerGroup}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={generateGroups}
                                    disabled={isSpinning}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50 group"
                                >
                                    {isSpinning ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />}
                                    {isSpinning ? "Lagi Ngocok..." : "GAS ACAK SQUAD"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 glass rounded-[3rem] mb-12 max-w-xl mx-auto border-dashed border-2 border-slate-200">
                        <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode View Only. Bilang Admin kalo mau ngacak.</p>
                    </div>
                )}

                {isSpinning && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            <Cpu size={32} className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                        </div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">{scanText}</p>
                    </div>
                )}

                {!isSpinning && groups.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-700">
                        {groups.map((group) => (
                            <div key={group.id} className="glass rounded-[3rem] p-8 shadow-xl border-white/60 hover:shadow-2xl transition-all duration-500 group-card overflow-hidden relative">
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <Edit3 size={14} />
                                        </div>
                                        {isAdmin ? (
                                            <input 
                                                type="text" 
                                                value={group.name}
                                                onChange={(e) => updateGroupName(group.id, e.target.value)}
                                                className="bg-transparent font-artist text-xl font-black text-slate-900 outline-none border-b-2 border-transparent focus:border-emerald-300 w-full uppercase tracking-tight"
                                            />
                                        ) : (
                                            <h3 className="font-artist text-xl font-black text-slate-900 uppercase tracking-tight">{group.name}</h3>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {group.members.map((member, mIdx) => (
                                            <div key={mIdx} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-emerald-400 transition-colors"></div>
                                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight group-hover/item:text-slate-900 transition-colors">{member}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{group.members.length} Members</span>
                                        <Sparkles size={14} className="text-slate-100 group-hover:text-amber-300 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isSpinning && groups.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                        <Users2 size={64} className="mx-auto text-slate-200 mb-4" />
                        <p className="font-artist text-2xl text-slate-400">Siap Diacak Nih</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GroupGenerator;
