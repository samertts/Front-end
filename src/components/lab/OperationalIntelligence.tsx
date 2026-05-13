import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Zap, AlertTriangle, TrendingUp, Cpu, Map, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function OperationalIntelligence() {
  const [bottlenecks, setBottlenecks] = useState([
    { id: 'bn-1', sector: 'Serology', risk: 'High', load: 94, reason: 'Analyzer X4 throughput saturation' },
    { id: 'bn-2', sector: 'Hematology', risk: 'Medium', load: 82, reason: 'Operator shift transition delay' }
  ]);

  // Simulate a heatmap of Baghdad laboratory nodes
  const nodes = [
    { name: 'Karkh Central', x: 20, y: 30, state: 'nominal', load: 45 },
    { name: 'Rusafa General', x: 65, y: 25, state: 'warning', load: 88 },
    { name: 'Medical City', x: 45, y: 55, state: 'nominal', load: 62 },
    { name: 'Sadr Node', x: 80, y: 70, state: 'alert', load: 96 },
    { name: 'Mansour Clinic', x: 15, y: 65, state: 'nominal', load: 30 }
  ];

  return (
    <div className="grid grid-cols-12 gap-8 mt-12">
      {/* Real-time Bottleneck Detection */}
      <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-amber-500 fill-amber-500" />
                <h3 className="text-xl font-black uppercase tracking-tight">Bottleneck Intelligence</h3>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">AI Driven Flow Analysis</p>
           </div>
           <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition-colors">
              <Info size={18} />
           </button>
        </div>

        <div className="space-y-4">
          {bottlenecks.map((bn) => (
            <motion.div 
              key={bn.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "p-6 rounded-[2rem] border flex items-center justify-between group transition-all",
                bn.risk === 'High' ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                  bn.risk === 'High' ? "bg-red-600 text-white shadow-red-200" : "bg-amber-500 text-white shadow-amber-200"
                )}>
                  <Activity size={24} className="animate-pulse" />
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{bn.sector}</h4>
                   <p className="text-[10px] text-slate-500 font-medium mt-0.5">{bn.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-2xl font-black tracking-tighter",
                  bn.risk === 'High' ? "text-red-600" : "text-amber-600"
                )}>{bn.load}%</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-50">Operational Pressure</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Resource Forecast</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nominal +14% Capacity</span>
           </div>
           <div className="flex gap-1 h-3">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-full",
                    i > 30 ? "bg-red-400" : i > 20 ? "bg-amber-400" : "bg-emerald-400"
                  )} 
                />
              ))}
           </div>
        </div>
      </div>

      {/* Operational Region Heatmaps */}
      <div className="col-span-12 lg:col-span-7 bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Map size={320} />
         </div>
         
         <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Bio-Grid Pulse Map</h3>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">National Operational Command Center</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Live Feed Active</span>
               </div>
            </div>
         </div>

         <div className="relative h-80 bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-sm">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* Data Nodes */}
            {nodes.map((node, i) => (
               <motion.div
                 key={node.name}
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 style={{ left: `${node.x}%`, top: `${node.y}%` }}
                 className="absolute group/node cursor-pointer"
               >
                  <div className={cn(
                    "w-4 h-4 rounded-full relative",
                    node.state === 'alert' ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" :
                    node.state === 'warning' ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]" :
                    "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                  )}>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-inherit" />
                  </div>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover/node:opacity-100 transition-all pointer-events-none translate-y-2 group-hover/node:translate-y-0 z-20">
                     <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 min-w-[160px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{node.name}</p>
                        <div className="flex items-center justify-between">
                           <span className="text-xl font-black text-slate-900">{node.load}%</span>
                           <span className={cn(
                             "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                             node.state === 'alert' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                           )}>{node.state}</span>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-3 gap-6 mt-10 relative z-10">
            {[
               { label: 'System Latency', val: '14ms', icon: Cpu },
               { label: 'Traffic Volume', val: '4.2 TB/d', icon: TrendingUp },
               { label: 'Cloud Compute', val: '88.2%', icon: Zap }
            ].map((stat, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="p-2 bg-white/10 rounded-xl text-white">
                     <stat.icon size={14} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{stat.label}</p>
                     <p className="text-xs font-black text-white">{stat.val}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
