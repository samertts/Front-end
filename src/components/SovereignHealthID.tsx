import React from 'react';
import { Shield, Check, Globe, Landmark, Fingerprint } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function SovereignHealthID() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-900 group-hover:scale-110 transition-transform">
         <Shield size={160} />
      </div>
      
      <div className="p-8 border-b border-slate-50 bg-slate-50/50">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
               <Globe size={18} />
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">National Health ID Federated</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight mt-1">Cross-Province Sovereign Link Verified</p>
            </div>
         </div>
      </div>

      <div className="p-8 space-y-6">
         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">National UID</span>
               <span className="text-sm font-bold text-slate-900 font-mono tracking-tighter">IRQ-MED-99422-SX</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Trust Level</span>
               <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm uppercase italic">
                  <Fingerprint size={14} />
                  Absolute
               </div>
            </div>
         </div>

         <div className="space-y-3">
            {[
               { name: 'Ministry of Health', status: 'Linked', icon: Landmark },
               { name: 'National Biometric Registry', status: 'Verified', icon: Fingerprint },
               { name: 'Sovereign Encryption Node', status: 'Secured', icon: Shield }
            ].map((link, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all cursor-pointer group/item">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                        <link.icon size={16} />
                     </div>
                     <span className="text-xs font-bold text-slate-700">{link.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Check size={12} className="text-emerald-500" />
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{link.status}</span>
                  </div>
               </div>
            ))}
         </div>

         <motion.button 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
         >
            Rotate Sovereign Keys
         </motion.button>
      </div>
    </div>
  );
}
