import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, MousePointer2, Keyboard, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export function BehavioralBiometrics() {
  const [confidence, setConfidence] = useState(98.4);
  const [metrics, setMetrics] = useState({
    mouseCadence: 'Nominal',
    typingRhythm: 'Verified',
    interactionPattern: 'Standard'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence(prev => Math.max(95, Math.min(99.9, prev + (Math.random() * 0.2 - 0.1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-[2rem] p-6 text-white border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] -mr-8 -mt-8" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
               <Fingerprint size={18} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Behavioral Identity</h3>
         </div>
         <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
            Active Passive Auth
         </div>
      </div>

      <div className="space-y-6 relative z-10">
         <div className="flex items-end justify-between">
            <div className="space-y-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</span>
               <p className="text-3xl font-black text-white italic tracking-tighter">{confidence.toFixed(1)}%</p>
            </div>
            <div className="flex flex-col items-end gap-1">
               <ShieldCheck size={20} className="text-emerald-400" />
               <span className="text-[8px] font-black text-emerald-400 uppercase">Hardware Bound</span>
            </div>
         </div>

         <div className="grid grid-cols-3 gap-3">
            {[
               { label: 'Mouse', icon: MousePointer2, status: metrics.mouseCadence },
               { label: 'Typing', icon: Keyboard, status: metrics.typingRhythm },
               { label: 'Flow', icon: Activity, status: metrics.interactionPattern }
            ].map((m, i) => (
               <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-2 group-hover:bg-white/10 transition-colors">
                  <m.icon size={14} className="text-slate-500" />
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                  <span className="text-[8px] font-bold text-emerald-400">{m.status}</span>
               </div>
            ))}
         </div>

         <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Identity Drift Analysis</span>
               <span className="text-[8px] font-black text-emerald-500 uppercase">Within Deviation</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: ['70%', '75%', '72%'] }}
                 transition={{ repeat: Infinity, duration: 3 }}
                 className="h-full bg-indigo-500"
               />
            </div>
         </div>
      </div>
    </div>
  );
}
