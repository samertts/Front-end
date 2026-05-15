import React from 'react';
import { motion } from 'motion/react';
import { Settings, CheckCircle, Zap, Shield, Database, LayoutGrid, RotateCw, Activity, Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export function LabDeviceMonitor() {
  const { t } = useLanguage();

  const devices = [
    { id: 'NODE-01', model: 'Spectro-X4', status: 'Optimal', calibration: '99.9%', drift: '0.001%' },
    { id: 'NODE-02', model: 'Hematology Gen-6', status: 'Auto-Calibrating', calibration: '92.4%', drift: '0.012%' },
    { id: 'NODE-03', model: 'Molecular Array', status: 'Optimal', calibration: '100%', drift: '0.000%' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[4rem] p-10 lg:p-14 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] text-slate-900 dark:text-white pointer-events-none scale-150 rotate-12">
         <LayoutGrid size={400} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-16">
           <div className="space-y-1">
              <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white font-headline leading-none">{t.selfCalibrating}</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Autonomous Device Integrity Grid</p>
           </div>
           <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-transparent">
              <RotateCw size={18} className="group-hover:rotate-180 transition-transform duration-700" /> 
              Global Re-Sync
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {devices.map((device, i) => (
             <motion.div 
               key={device.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-8 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group/card cursor-pointer"
             >
                <div className="flex justify-between items-start">
                   <div className="p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm text-indigo-600 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-500">
                      <Cpu size={32} className="group-hover/card:rotate-12 transition-transform" />
                   </div>
                   <div className={cn(
                     "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                     device.status === 'Optimal' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                   )}>
                      {device.status}
                   </div>
                </div>

                <div className="space-y-2">
                   <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-headline">{device.model}</h4>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{device.id}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span>Calibration</span>
                         <span className="text-slate-900 dark:text-white">{device.calibration}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: device.calibration }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                         />
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Temporal Drift</span>
                      <span className="text-amber-600">-{device.drift}</span>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="mt-16 p-10 lg:p-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3.5rem] text-white flex flex-col xl:flex-row items-center justify-between gap-12 relative overflow-hidden group/audit border border-white/5 shadow-2xl shadow-indigo-900/40">
           <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/audit:opacity-100 transition-opacity" />
           <div className="relative z-10 flex flex-col sm:flex-row items-center gap-10 text-center sm:text-left">
              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-[1.8rem] border border-white/10 shadow-2xl">
                 <Shield size={42} className="text-indigo-400" />
              </div>
              <div>
                 <h4 className="text-2xl font-black uppercase tracking-tight italic">{t.immutableAudit} Trail Active</h4>
                 <p className="text-sm text-indigo-100/50 font-medium max-w-md mt-2 leading-relaxed">
                   All device cycles are hashed and appended to the national relational sync grid for absolute clinical transparency.
                 </p>
              </div>
           </div>
           <div className="relative z-10 flex items-center gap-10">
              <div className="text-center sm:text-right">
                 <p className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Consistency Score</p>
                 <p className="text-5xl font-black font-headline tracking-tighter">99.999%</p>
              </div>
              <div className="w-24 h-24 bg-white/5 rounded-[1.8rem] flex items-center justify-center border border-white/10 shadow-inner group-hover/audit:scale-110 transition-transform">
                 <Activity size={48} className="text-emerald-500 animate-pulse" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
