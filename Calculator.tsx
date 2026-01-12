
import React, { useState } from 'react';
import { Network, Calculator, RefreshCw, Copy, CheckCircle2, Server, Globe, Shield, Wifi } from 'lucide-react';

const Calculator = () => {
  const [ip, setIp] = useState('');
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const calculateSubnet = () => {
    setError('');
    const ipParts = ip.split('.').map(Number);
    
    // Validasi IP Sederhana
    if (ipParts.length !== 4 || ipParts.some(part => isNaN(part) || part < 0 || part > 255)) {
      setError('Format IP Address salah! Contoh: 192.168.1.1');
      setResult(null);
      return;
    }

    if (cidr < 0 || cidr > 32) {
      setError('CIDR harus antara 0 - 32');
      return;
    }

    // Kalkulasi Subnet Mask
    const mask = ~(~0 << (32 - cidr));
    const maskParts = [
      (mask >>> 24) & 0xff,
      (mask >>> 16) & 0xff,
      (mask >>> 8) & 0xff,
      mask & 0xff
    ];

    // Kalkulasi Network Address
    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const netNum = ipNum & mask;
    const netParts = [
      (netNum >>> 24) & 0xff,
      (netNum >>> 16) & 0xff,
      (netNum >>> 8) & 0xff,
      netNum & 0xff
    ];

    // Kalkulasi Broadcast Address
    const broadcastNum = netNum | (~mask);
    const broadcastParts = [
      (broadcastNum >>> 24) & 0xff,
      (broadcastNum >>> 16) & 0xff,
      (broadcastNum >>> 8) & 0xff,
      broadcastNum & 0xff
    ];

    // Kalkulasi Range Host
    const firstHostNum = netNum + 1;
    const lastHostNum = broadcastNum - 1;
    
    const firstHost = [
      (firstHostNum >>> 24) & 0xff,
      (firstHostNum >>> 16) & 0xff,
      (firstHostNum >>> 8) & 0xff,
      firstHostNum & 0xff
    ];

    const lastHost = [
      (lastHostNum >>> 24) & 0xff,
      (lastHostNum >>> 16) & 0xff,
      (lastHostNum >>> 8) & 0xff,
      lastHostNum & 0xff
    ];

    const totalHosts = Math.pow(2, 32 - cidr) - 2;

    setResult({
      ip: ip,
      cidr: cidr,
      subnetMask: maskParts.join('.'),
      networkId: netParts.join('.'),
      broadcast: broadcastParts.join('.'),
      range: `${firstHost.join('.')} - ${lastHost.join('.')}`,
      hosts: totalHosts > 0 ? totalHosts : 0,
      classType: getIpClass(ipParts[0])
    });
  };

  const getIpClass = (firstOctet: number) => {
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
    return 'E (Experimental)';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Disalin: " + text);
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-clean relative overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-16 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 glass px-6 py-2 rounded-full mb-6">
            <Network size={16} className="text-cyan-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">TJKT Toolkit</span>
          </div>
          <h2 className="font-artist text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            SUBNET <span className="text-slate-200">CALC</span>
          </h2>
          <p className="font-handwriting text-2xl text-slate-400 mt-4">Alat wajib teknisi jaringan profesional.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* INPUT CARD */}
          <div className="glass rounded-[2.5rem] p-8 border-white/60 shadow-xl h-fit animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Input Data</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">IP Address</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="e.g. 192.168.10.1"
                    className="w-full pl-12 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono text-slate-800 placeholder:font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Prefix (CIDR) /{cidr}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="32" 
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                  <span>/1</span>
                  <span>/8</span>
                  <span>/16</span>
                  <span>/24</span>
                  <span>/32</span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Shield size={14} /> {error}
                </div>
              )}

              <button 
                onClick={calculateSubnet}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Hitung Subnet
              </button>
            </div>
          </div>

          {/* RESULT CARD */}
          <div className="glass rounded-[2.5rem] p-8 border-white/60 shadow-xl bg-gradient-to-br from-white/40 to-cyan-50/40 relative overflow-hidden animate-in fade-in slide-in-from-right duration-700">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 min-h-[300px]">
                <Server size={64} className="mb-4 text-slate-300" />
                <p className="font-artist text-xl text-slate-400">Menunggu Input...</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Masukkan IP untuk melihat magic-nya</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-200">
                        <Wifi size={20} />
                     </div>
                     <h3 className="font-bold text-xl text-slate-900">Result</h3>
                  </div>
                  <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-cyan-600">
                    Class {result.classType}
                  </span>
                </div>

                <div className="grid gap-3">
                   <ResultItem label="Network ID" value={result.networkId} onCopy={() => handleCopy(result.networkId)} />
                   <ResultItem label="Subnet Mask" value={result.subnetMask} onCopy={() => handleCopy(result.subnetMask)} />
                   <ResultItem label="Broadcast" value={result.broadcast} onCopy={() => handleCopy(result.broadcast)} />
                   <ResultItem label="Host Range" value={result.range} />
                   <ResultItem label="Total Usable Hosts" value={result.hosts.toLocaleString()} highlight />
                </div>
              </div>
            )}
            
            {/* Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-100 rounded-full blur-[80px] opacity-50 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ResultItem = ({ label, value, onCopy, highlight = false }: { label: string, value: string | number, onCopy?: () => void, highlight?: boolean }) => (
  <div className={`p-4 rounded-2xl flex items-center justify-between group ${highlight ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/60 border border-slate-100 hover:bg-white transition-colors'}`}>
    <div>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
      <p className={`font-mono text-sm md:text-base font-bold ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
    </div>
    {onCopy && (
      <button 
        onClick={onCopy} 
        className={`p-2 rounded-full transition-colors ${highlight ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-400'}`}
      >
        <Copy size={14} />
      </button>
    )}
  </div>
);

export default Calculator;
