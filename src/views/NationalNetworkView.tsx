import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Settings, 
  Activity, 
  Smartphone, 
  Server, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Workflow, 
  Share2, 
  RefreshCw,
  Building2,
  Hospital,
  Microscope,
  Database,
  ArrowUpRight,
  Wifi
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface InstitutionNode {
  id: string;
  name: string;
  type: 'hospital' | 'lab' | 'center';
  status: 'active' | 'syncing' | 'idle';
  load: number;
  location: string;
  connections: string[];
}

const INSTITUTIONS: InstitutionNode[] = [
  { id: ' Baghdad-MC', name: 'Baghdad Medical City', type: 'hospital', status: 'active', load: 84, location: 'Central District', connections: ['9c-lab', 'basra-gen'] },
  { id: '9c-lab', name: '9C Central Lab', type: 'lab', status: 'active', load: 45, location: 'North Corridor', connections: ['Baghdad-MC', 'mosul-hosp'] },
  { id: 'basra-gen', name: 'Basrah General Hospital', type: 'hospital', status: 'syncing', load: 72, location: 'Southern Hub', connections: ['Baghdad-MC'] },
  { id: 'mosul-hosp', name: 'Mosul Teaching Hospital', type: 'hospital', status: 'active', load: 58, location: 'Northern Hub', connections: ['9c-lab'] },
  { id: 'erbil-sc', name: 'Erbil Surgical Center', type: 'center', status: 'idle', load: 31, location: 'Kurdistan Node', connections: ['mosul-hosp'] },
];

export default function NationalNetworkView() {
  const { language, t } = useLanguage();
  const [selectedNode, setSelectedNode] = useState<InstitutionNode | null>(INSTITUTIONS[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGlobalSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 lg:p-12 font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400"
            >
              <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-ping" />
              {t.nationalHealthGrid} • SECURE INTERCONNECT
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none text-glow-indigo">
              {t.networkHub}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleGlobalSync}
              className={cn(
                "px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 active:scale-95 group",
                isSyncing ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-white/5"
              )}
            >
              <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Global Re-Sync"}
            </button>
            <button className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
              Add Node
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Stats & Network Health */}
          <div className="lg:col-span-4 space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm group hover:shadow-xl transition-all">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                     <Share2 size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Nodes</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white font-headline">128</p>
               </div>
               <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm group hover:shadow-xl transition-all">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                     <Activity size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white font-headline">4ms</p>
               </div>
            </div>

            <div className="p-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3.5rem] text-white shadow-2xl border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                  <Globe size={180} />
               </div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
                        <Workflow size={24} className="text-indigo-400" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.3em] font-mono">System Integrity</span>
                  </div>
                  <h3 className="text-3xl font-black italic tracking-tighter leading-tight font-headline">
                    Unified Health <br /> <span className="text-indigo-400">Interoperability</span>
                  </h3>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>Sync Progress</span>
                        <span>{isSyncing ? "84%" : "100%"}</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: isSyncing ? "84%" : "100%" }}
                          className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">{t.activeClusters}</h4>
              <div className="space-y-3">
                {INSTITUTIONS.map(inst => (
                  <motion.button 
                    key={inst.id}
                    onClick={() => setSelectedNode(inst)}
                    whileHover={{ x: 5 }}
                    className={cn(
                      "w-full p-6 rounded-[2rem] border transition-all flex items-center justify-between group text-left",
                      selectedNode?.id === inst.id 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-500/20" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-indigo-900/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        selectedNode?.id === inst.id ? "bg-white/20" : "bg-slate-50 dark:bg-white/5"
                      )}>
                        {inst.type === 'hospital' ? <Hospital size={20} /> : inst.type === 'lab' ? <Microscope size={20} /> : <Building2 size={20} />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-black tracking-tight", selectedNode?.id === inst.id ? "text-white" : "text-slate-900 dark:text-white")}>{inst.name}</p>
                        <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60")}>{inst.location}</p>
                      </div>
                    </div>
                    {selectedNode?.id === inst.id && <ArrowUpRight size={18} />}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Selected node details & interactive visualization simulation */}
          <div className="lg:col-span-8 flex flex-col gap-8">
             <div className="flex-1 min-h-[600px] bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-white/5 p-8 lg:p-14 relative overflow-hidden flex flex-col shadow-sm">
                
                {/* Node Details Overlay */}
                <div className="relative z-20 flex justify-between items-start mb-auto">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse" />
                           {selectedNode?.status === 'active' ? t.nodeStatus_active : t.nodeStatus_syncing}
                         </div>
                         <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                           NODE ID: {selectedNode?.id}
                         </div>
                      </div>
                      <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none font-headline">
                         {selectedNode?.name}
                      </h2>
                      <div className="flex items-center gap-8 text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px]">
                         <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><Globe size={14} /> {selectedNode?.location}</span>
                         <span className="flex items-center gap-2"><Smartphone size={14} /> 2 Node Connections</span>
                      </div>
                   </div>

                   <button className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                      <Settings size={28} />
                   </button>
                </div>

                {/* Mock Interconnect Visualization */}
                <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center opacity-40 pointer-events-none">
                   <div className="relative w-full h-full">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="absolute inset-0 border-[1px] border-indigo-500/20 rounded-full m-12"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                        className="absolute inset-0 border-[1px] border-emerald-500/20 rounded-full m-32"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl animate-pulse" />
                      </div>
                   </div>
                </div>

                <div className="relative z-20 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-white dark:border-white/5 group hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Traffic Load</p>
                      <div className="flex items-end gap-3 mb-4">
                         <span className="text-5xl font-black text-slate-900 dark:text-white leading-none font-headline">{selectedNode?.load}%</span>
                         <Zap size={24} className="text-amber-500 mb-1" />
                      </div>
                      <div className="flex gap-1 h-8 items-end">
                         {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((h, i) => (
                           <motion.div 
                             key={i}
                             initial={{ height: 0 }}
                             animate={{ height: `${h * 100}%` }}
                             className="flex-1 bg-indigo-600/20 rounded-t-lg group-hover:bg-indigo-600 transition-colors"
                           />
                         ))}
                      </div>
                   </div>

                   <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-white dark:border-white/5 group hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.institutionSync}</p>
                      <div className="flex items-center gap-6 mb-6">
                         <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Database size={28} />
                         </div>
                         <div>
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">Active Relay</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TLS 1.3 Encryption</p>
                         </div>
                      </div>
                      <button className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl group-hover:scale-105 active:scale-95 transition-all">
                         Fetch Audit Log
                      </button>
                   </div>

                   <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-white dark:border-white/5 group hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.dataCorridor}</p>
                      <div className="space-y-5">
                         {selectedNode?.connections.map(id => (
                           <div key={id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                 <span className="text-[11px] font-black tracking-tight">{id}</span>
                              </div>
                              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">4ms TAT</span>
                           </div>
                         ))}
                         <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-center">
                            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mx-auto">
                               Manage Protocols <ArrowUpRight size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-10 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Wifi size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Uptime: 99.9%</span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">HL7-FHIR Compliant</span>
                      </div>
                   </div>
                   <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">GULA Interoperability v1.0</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
