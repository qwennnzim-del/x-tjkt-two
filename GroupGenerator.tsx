
import React, { useState, useEffect } from 'react';
import { Users2, RefreshCw, Trash2, Edit3, UserCheck, ShieldCheck, Cpu, Sparkles, Wand2, Dice5 } from 'lucide-react';

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
            "Lagi Cari Murid Random...", 
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
        // --- ALGORITMA "DESTINY PAIR" ---
        const specialPair = ["M FARIZ ALFAUZI", "MELVINA YEIZA ALWI"];
        
        // Probabilitas: 99% True, 1% False
        const isDestiny = Math.random() < 0.99;
        
        let poolToShuffle = [...ALL_MEMBERS];
        
        // Jika takdir berkehendak (99%), pisahkan pasangan ini dari pool utama dulu
        if (isDestiny) {
            poolToShuffle = poolToShuffle.filter(name => !specialPair.includes(name));
        }

        // 1. Fisher-Yates Shuffle pada pool utama
        for (let i = poolToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [poolToShuffle[i], poolToShuffle[j]] = [poolToShuffle[j], poolToShuffle[i]];
        }

        // 2. Hitung jumlah kelompok
        const totalMembers = ALL_MEMBERS.length;
        const numGroups = Math.ceil(totalMembers / membersPerGroup);
        const result: Group[] = [];
        
        for (let i = 0; i < numGroups; i++) {
            result.push({ id: i + 1, name: `Squad ${i + 1}`, members: [] });
        }

        // 3. Masukkan Special Pair ke SATU kelompok acak (Jika 99% hit)
        if (isDestiny) {
            const randomGroupIdx = Math.floor(Math.random() * numGroups);
            result[randomGroupIdx].members.push(...specialPair);
        }

        // 4. Distribusi sisa member (Round Robin)
        let currentGroupIdx = 0;
        
        while (poolToShuffle.length > 0) {
            const member = poolToShuffle.pop()!;
            
            // Masukkan member ke kelompok saat ini
            result[currentGroupIdx].members.push(member);
            
            // Pindah ke kelompok berikutnya
            currentGroupIdx = (currentGroupIdx + 1) % numGroups;
        }

        // 5. Acak ulang urutan nama DI DALAM setiap kelompok agar terlihat natural
        result.forEach(g => {
            g.members = g.members.sort(() => Math.random() - 0.5);
        });

        setGroups(result);
    };

    const updateGroupName = (groupId: number, newName: string) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
    };

    return (
        <section className="min-h-screen pt-32 pb-20 px-4 md:px-6 bg-clean relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -z-10 opacity-60"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-50 rounded-full blur-[80px] -z-10 opacity-60"></div>

            <div className="container mx-auto max-w-6xl">
                <header className="text-center mb-12 animate-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full mb-5">
                        <Dice5 size={14} className="text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Random Team Maker</span>
                    </div>
                    <h2 className="font-artist text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
                        SQUAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">RANDOM</span>
                    </h2>
                    <p className="font-handwriting text-2xl md:text-3xl text-slate-400">Anti Cepu, Anti Kubu, Semua Satu Circle.</p>
                </header>

                {/* ADMIN CONTROLS */}
                {isAdmin ? (
                    <div className="max-w-xl mx-auto mb-16 px-2">
                        <div className="glass rounded-[2.5rem] p-6 md:p-8 shadow-2xl border-white/60 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                            
                            <div className="flex flex-col gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anggota / Kelompok</label>
                                        <span className="text-3xl font-artist font-black text-slate-900">{membersPerGroup}</span>
                                    </div>
                                    <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <input 
                                            type="range" 
                                            min="2" max="15" 
                                            value={membersPerGroup}
                                            onChange={(e) => setMembersPerGroup(Number(e.target.value))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                                            style={{ width: `${((membersPerGroup - 2) / 13) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 text-center font-bold">Geser untuk atur jumlah</p>
                                </div>

                                <button 
                                    onClick={generateGroups}
                                    disabled={isSpinning}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-70 group active:scale-95"
                                >
                                    {isSpinning ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} className="group-hover:-rotate-12 transition-transform" />}
                                    {isSpinning ? "LAGI PROSES..." : "ACAK SEKARANG"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 glass rounded-[2.5rem] mb-12 max-w-lg mx-auto border-dashed border-2 border-slate-200">
                        <ShieldCheck size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode View Only. Bilang Admin kalo mau ngacak.</p>
                    </div>
                )}

                {/* LOADING STATE */}
                {isSpinning && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            <Cpu size={28} className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                        </div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse text-center px-4">{scanText}</p>
                    </div>
                )}

                {/* RESULTS GRID */}
                {!isSpinning && groups.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 animate-in slide-in-from-bottom duration-700">
                        {groups.map((group) => (
                            <div key={group.id} className="glass rounded-[2rem] p-6 shadow-lg border-white/60 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group-card">
                                {/* Decorative blob */}
                                <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
                                        <div className="flex-grow mr-2">
                                            {isAdmin ? (
                                                <div className="flex items-center gap-2">
                                                    <Edit3 size={12} className="text-slate-300 shrink-0" />
                                                    <input 
                                                        type="text" 
                                                        value={group.name}
                                                        onChange={(e) => updateGroupName(group.id, e.target.value)}
                                                        className="w-full bg-transparent font-artist text-xl font-black text-slate-900 outline-none border-b border-transparent focus:border-emerald-300 uppercase tracking-tight placeholder:text-slate-300"
                                                    />
                                                </div>
                                            ) : (
                                                <h3 className="font-artist text-xl font-black text-slate-900 uppercase tracking-tight">{group.name}</h3>
                                            )}
                                        </div>
                                        <div className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-lg shrink-0">
                                            {group.members.length} ORANG
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        {group.members.map((member, mIdx) => (
                                            <div key={mIdx} className="flex items-center gap-3 group/item">
                                                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400 group-hover/item:bg-emerald-500 group-hover/item:text-white group-hover/item:border-emerald-500 transition-colors">
                                                    {mIdx + 1}
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight truncate group-hover/item:text-slate-900 transition-colors w-full">
                                                    {member}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <Sparkles size={12} className="text-slate-200 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isSpinning && groups.length === 0 && (
                    <div className="text-center py-20 opacity-40">
                        <Users2 size={64} className="mx-auto text-slate-300 mb-6" />
                        <h3 className="font-artist text-2xl text-slate-400 uppercase tracking-tight">Siap Untuk Diacak?</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Tekan tombol di atas untuk memulai</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GroupGenerator;
