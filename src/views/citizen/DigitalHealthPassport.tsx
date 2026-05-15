import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Fingerprint, QrCode, Lock, 
  MapPin, Activity, History, ChevronRight,
  User, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function DigitalHealthPassport() {
  const [isFlipped, setIsFlipped] = useState(false);

  const biometricData = [
    { label: 'Neural Signature', status: 'Verified' },
    { label: 'Blockchain ID', status: 'GULA-882-B-9' },
    { label: 'Crypto Keys', status: 'Active (PQ)' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-12 space-y-12 bg-slate-950 min-h-screen text-slate-100">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">National Health Passport</h1>
            <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.3em]">Sovereign Digital Identity Layer • Secure-Core V2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* The Card Container */}
        <div 
          className="relative perspective-1000 w-full h-[450px] cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div 
            className="w-full h-full relative transition-all duration-700 preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
          >
            {/* Front of Card */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[3rem] p-10 shadow-2xl overflow-hidden border border-white/20">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <ShieldCheck size={280} className="text-white" />
              </div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-12">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center">
                         <Fingerprint className="text-white" size={24} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Republic of Iraq</span>
                         <span className="text-xs font-black text-white uppercase tracking-tighter">Ministry of Health</span>
                      </div>
                   </div>
                   <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/40">
                      Active Access
                   </div>
                </div>

                <div className="flex gap-8 mb-12">
                   <div className="w-32 h-32 rounded-3xl bg-white/10 border border-white/20 p-2 overflow-hidden shadow-2xl backdrop-blur-md">
                      <img 
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200" 
                        alt="Citizen"
                        className="w-full h-full object-cover rounded-2xl"
                        referrerPolicy="no-referrer"
                      />
                   </div>
                   <div className="flex flex-col justify-center">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">Ahmed K. Mansour</h2>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">NID: 19920405-99201-2</p>
                      <div className="flex items-center gap-3 mt-4">
                         <MapPin size={14} className="text-indigo-300" />
                         <span className="text-[10px] font-black text-white/80 uppercase">Baghdad Residential Node</span>
                      </div>
                   </div>
                </div>

                <div className="mt-auto flex justify-between items-end">
                   <div className="space-y-4">
                      {biometricData.map(d => (
                         <div key={d.label} className="flex items-center gap-3">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{d.label}: <span className="text-white">{d.status}</span></span>
                         </div>
                      ))}
                   </div>
                   <div className="p-4 bg-white rounded-2xl shadow-2xl">
                      <QrCode size={48} className="text-indigo-900" />
                   </div>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white/10 [transform:rotateY(180deg)]">
              <div className="h-full flex flex-col">
                 <div className="flex items-center gap-4 mb-8">
                    <Lock size={20} className="text-indigo-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest italic text-white">Encrypted Bio-Data Storage</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Recent Sovereignty Logs</span>
                       <div className="space-y-2">
                          {[
                            'Access granted to Baghdad Medical City',
                            'Neural signature re-verified via Quantum Hash',
                            'Consent token updated for Research Unit-8'
                          ].map((log, i) => (
                            <div key={i} className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                               <span className="text-[10px] font-bold text-white/60">{log}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Sovereign Wallet Balance</span>
                       <p className="text-2xl font-black text-white">450.00 <span className="text-xs text-indigo-400">IQD-HC</span></p>
                       <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Health Credits for 2024</p>
                    </div>
                 </div>

                 <div className="mt-auto flex justify-center">
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] animate-pulse">Scanning Bio-Signal...</div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Grid */}
        <div className="space-y-8">
           <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="flex items-start gap-6">
                 <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                    <History size={24} />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-lg font-black uppercase italic text-white mb-2 underline decoration-indigo-500/50 decoration-4">Sovereign Audit Trail</h3>
                    <p className="text-xs text-white/40 mb-6 leading-relaxed">
                       Your data is stored in a decentralized sovereign node. Every access request is logged on the National Blockchain and requires your explicit biometric consent.
                    </p>
                    <div className="space-y-3">
                       {[
                          { label: 'Last Verification', date: 'March 14, 2026', time: '14:20:05', status: 'BAGHDAD-CTR' },
                          { label: 'Consent Update', date: 'March 10, 2026', time: '09:12:44', status: 'MINISTRY-WEB' },
                       ].map((item, i) => (
                          <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group/audit">
                             <div>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-xs font-bold text-white">{item.date} <span className="text-white/30 font-mono italic">at {item.time}</span></p>
                             </div>
                             <div className="text-right">
                                <span className="text-[8px] font-black text-white/40 uppercase block mb-1">Authorized Node</span>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">{item.status}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-rose-600/10 border border-rose-500/20 rounded-3xl">
                 <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={18} className="text-rose-500" />
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em]">Revocation Layer</span>
                 </div>
                 <p className="text-[10px] text-white/60 mb-6 font-bold leading-relaxed uppercase">Instantly revoke all digital access to your records from all institutions.</p>
                 <button className="w-full py-2 bg-rose-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl shadow-rose-900/40 hover:scale-105 transition-transform">
                    Emergency Lockdown
                 </button>
              </div>
              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl">
                 <div className="flex items-center gap-3 mb-4">
                    <Info size={18} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Portable Access</span>
                 </div>
                 <p className="text-[10px] text-white/60 mb-6 font-bold leading-relaxed uppercase">Generate a single-use proxy token for offline verification via NFC.</p>
                 <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-105 transition-transform">
                    Generate Offline Token
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="p-10 bg-indigo-900 rounded-[3rem] relative overflow-hidden text-center group shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
         <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2 group-hover:scale-105 transition-transform">Secure the National Future</h3>
         <p className="text-xs text-indigo-200 uppercase tracking-widest font-black mb-8 opacity-60 italic">GULA OS Sovereign Health Identity • Protected by National Law</p>
         <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
               <span className="text-3xl font-black text-white">42M+</span>
               <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Verified Citiziens</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-center">
               <span className="text-3xl font-black text-white">100%</span>
               <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Encryption Integrity</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-center">
               <span className="text-3xl font-black text-white">0</span>
               <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Reported Leaks</span>
            </div>
         </div>
      </div>
    </div>
  );
}
