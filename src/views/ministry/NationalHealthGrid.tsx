import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Shield, Building2, Users, Activity, 
  AlertCircle, ArrowUpRight, Zap, Filter, 
  MapPin, Database, Layers, Search, Download, Share2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell 
} from 'recharts';

import { useNavigate } from 'react-router-dom';
import { GraphIntelligenceLayer } from '../../components/ministry/GraphIntelligenceLayer';

const data = [
  { name: 'Karkh', value: 400, load: 85, active: 1240 },
  { name: 'Rusafa', value: 300, load: 72, active: 980 },
  { name: 'Basrah', value: 200, load: 94, active: 2100 },
  { name: 'Erbil', value: 278, load: 65, active: 1450 },
  { name: 'Najaf', value: 189, load: 88, active: 890 },
  { name: 'Nineveh', value: 239, load: 79, active: 1670 },
];

const hospitalData: Record<string, any[]> = {
  'Karkh': [
    { name: 'Al-Kindy General', cases: 142, load: 92, trend: '+5%' },
    { name: 'Yarmouk Specialized', cases: 88, load: 78, trend: '-2%' },
    { name: 'Ibn Sina Center', cases: 45, load: 40, trend: 'stable' },
  ],
  'Rusafa': [
    { name: 'Sheikh Zayed Hospital', cases: 110, load: 82, trend: '+12%' },
    { name: 'Ibn Al-Quff', cases: 67, load: 60, trend: 'stable' },
  ],
  'Basrah': [
    { name: 'Al-Sadr Teaching', cases: 210, load: 98, trend: '+18%' },
    { name: 'Basrah Childrens', cases: 54, load: 45, trend: '-4%' },
  ],
  // Default for others
};

export function NationalHealthGrid() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const displayedHospitals = activeRegion ? (hospitalData[activeRegion] || [
    { name: `${activeRegion} General Hub`, cases: Math.floor(Math.random() * 100), load: 75, trend: 'stable' },
    { name: `${activeRegion} Regional Center`, cases: Math.floor(Math.random() * 80), load: 60, trend: '+2%' },
  ]) : [];

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100 selection:bg-indigo-500/30">
      {/* Header Panel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="space-y-2">
           <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/40 relative group cursor-pointer" onClick={() => navigate('/ministry/dashboard')}>
                 <Globe size={32} />
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
              <div>
                 <h1 className="text-3xl font-black tracking-tight uppercase">{t.nationalHealthGrid}</h1>
                 <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.3em]">{t.ministryOversight} • GULA OS V4</p>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
             <button 
               onClick={() => navigate('/ministry/epidemiology')}
               className="px-6 py-3 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
             >
               <AlertCircle size={14} /> {t.epiIntelligence}
             </button>
             <button 
               onClick={() => navigate('/ministry/audit')}
               className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-[1.02] transition-all flex items-center gap-2"
             >
               <Shield size={14} /> {t.compliance}
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* National Command Center Main Board */}
        <div className="xl:col-span-2 space-y-8">
           <div className="p-10 bg-slate-900 border border-white/10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/5 opacity-50" />
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Globe size={240} className="text-white animate-spin-slow" />
              </div>
              
              <div className="relative z-10">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live National Surveillance Active</span>
                       </div>
                       <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">National <span className="text-indigo-400">Command</span> Center</h2>
                       <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-1 italic">Strategic Health Intelligence Unit • GULA OS Phase IV</p>
                    </div>
                    <div className="flex gap-3">
                       <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-105 transition-all">
                          National Map Mode
                       </button>
                       <button className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60">
                          Neural Heatmaps
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: 'Epidemic Threat', val: 'MINIMAL', color: 'text-emerald-400', load: 12 },
                      { label: 'Lab Hub Efficiency', val: '98.4%', color: 'text-indigo-400', load: 98 },
                      { label: 'Medicine Buffer', val: 'STABLE', color: 'text-emerald-400', load: 85 },
                      { label: 'System Uptime', val: '99.99%', color: 'text-indigo-400', load: 99 },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-all group/stat">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">{stat.label}</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter mb-4", stat.color)}>{stat.val}</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.load}%` }}
                            className={cn("h-full", stat.color.replace('text-', 'bg-'))}
                           />
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {data.map((region) => (
                       <motion.div
                         key={region.name}
                         whileHover={{ scale: 1.02 }}
                         className={cn(
                           "p-8 rounded-[2.5rem] border transition-all cursor-pointer group/node relative overflow-hidden",
                           activeRegion === region.name 
                            ? "bg-indigo-600/20 border-indigo-500 shadow-2xl shadow-indigo-950/50" 
                            : region.load > 85 
                            ? "bg-rose-500/10 border-rose-500/30" 
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                         )}
                         onClick={() => setActiveRegion(region.name === activeRegion ? null : region.name)}
                       >
                          {region.load > 85 && (
                            <div className="absolute top-0 right-0 p-4">
                               <AlertCircle size={16} className="text-rose-500 animate-pulse" />
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-8">
                             <div className={cn(
                               "w-12 h-12 rounded-2xl transition-all flex items-center justify-center border",
                               activeRegion === region.name ? "bg-indigo-600 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-slate-400"
                             )}>
                                <MapPin size={24} />
                             </div>
                             <div className="text-right">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.2em]",
                                  region.load > 85 ? "text-rose-400" : "text-emerald-400"
                                )}>
                                   {region.load > 85 ? 'OVERLOAD' : 'NOMINAL'}
                                </span>
                                <p className="text-2xl font-black text-white italic tracking-tighter">{region.load}%</p>
                             </div>
                          </div>
                          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{region.name}</h3>
                          <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest italic">
                             <span>{region.active} OPS</span>
                             <span>{region.value} MS</span>
                          </div>

                          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${region.load}%` }}
                               className={cn(
                                 "h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]",
                                 region.load > 85 ? "bg-rose-500" : "bg-indigo-500"
                               )} 
                             />
                          </div>
                       </motion.div>
                    ))}
                 </div>

                 <AnimatePresence>
                   {activeRegion && (
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className="mt-12 p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] relative overflow-hidden"
                     >
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                 <Building2 size={20} />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black uppercase tracking-widest">{activeRegion} Granular Overview</h4>
                                 <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest italic">Hospital-Specific Health Intelligence</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => setActiveRegion(null)}
                             className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                           >
                              Collapse Details
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {displayedHospitals.map((h, i) => (
                             <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                   <h5 className="text-xs font-black text-white">{h.name}</h5>
                                   <span className={cn(
                                     "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                                     h.load > 90 ? "bg-rose-500 text-white" : "bg-emerald-500/20 text-emerald-400"
                                   )}>{h.load}% CAP</span>
                                </div>
                                <div className="mt-auto">
                                  <div className="flex items-baseline justify-between">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">Active Cases: <span className="text-white">{h.cases}</span></p>
                                     <span className={cn(
                                       "text-[8px] font-black",
                                       h.trend.includes('+') ? "text-rose-400" : h.trend === 'stable' ? "text-slate-500" : "text-emerald-400"
                                     )}>{h.trend}</span>
                                  </div>
                                  <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                                     <div className={cn("h-full", h.load > 90 ? "bg-rose-500" : "bg-indigo-500")} style={{ width: `${h.load}%` }} />
                                  </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>

           <GraphIntelligenceLayer />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem]">
                 <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6">{t.latency} (ms)</h3>
                 <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#6366f1" fill="rgba(99,102,241,0.1)" strokeWidth={3} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="p-8 bg-slate-900 rounded-[3rem] border border-white/5">
                 <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6">{t.distribution}</h3>
                 <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data}>
                          <Bar dataKey="active">
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.load > 85 ? '#f43f5e' : '#6366f1'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Alerts / Intelligence */}
        <div className="space-y-8">
           <div className="p-8 bg-indigo-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-white/20 rounded-xl">
                       <Zap size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cluster Alert</span>
                 </div>
                 <h3 className="text-2xl font-black mb-4 leading-tight">Critical Resource Depletion: Zone C</h3>
                 <p className="text-sm text-indigo-100 font-medium mb-8 leading-relaxed opacity-80">
                   Supply chain heuristics predict reagent exhaustion in the Basrah cluster within 36 hours. Auto-routing active.
                 </p>
                 <div className="pt-4">
                    <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                        Override Logistics
                    </button>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">{t.nodeStatus}</h3>
              {[
                { id: '1', title: 'Nineveh Hub Offline for Neural Update', time: '2m ago', type: 'info' },
                { id: '2', title: 'Unauthorized API Access Detected', time: '12m ago', type: 'alert' },
                { id: '3', title: 'New Lab Cluster Integrated: Erbil East', time: '1h ago', type: 'success' },
                { id: '4', title: 'Data Sovereignty Audit Complete', time: '3h ago', type: 'info' },
              ].map(item => (
                <div key={item.id} className="flex gap-4 group cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-all">
                   <div className={cn(
                     "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border",
                     item.type === 'alert' ? "bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:scale-110" : "bg-white/5 border-white/10 text-slate-400"
                   )}>
                      <Activity size={18} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-white uppercase tracking-tight truncate leading-tight mb-1">{item.title}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-[8px] font-bold text-slate-500 tracking-wider font-mono">{item.time}</span>
                         <div className="w-1 h-1 rounded-full bg-slate-700" />
                         <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Protocol V4</span>
                      </div>
                   </div>
                </div>
              ))}
              <button className="w-full py-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all mt-4">
                 Full System Audit
              </button>
           </div>

           <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-[3rem] text-center">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                 <Shield size={32} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">{t.trustScore}</h3>
              <p className="text-3xl font-black text-emerald-400 mb-2">99.8%</p>
              <div className="flex items-center justify-center gap-1">
                 <ArrowUpRight size={14} className="text-emerald-400" />
                 <span className="text-[8px] font-black uppercase text-emerald-400/60">+0.2% vs Last Quarter</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
