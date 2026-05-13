import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Activity, Cpu, Monitor, AlertTriangle, 
  CheckCircle2, Clock, MapPin, Search, Bot,
  RefreshCw, Layers, ShieldCheck, Database, BarChart3,
  ChevronRight, ArrowRight, Gauge, FlaskConical
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabAnalyzer, AutomatedJob } from '../../types/lab';
import { LabAutomationService } from '../../services/lab/LabAutomationService';
import { cn } from '../../lib/utils';

export function AutomatedOrchestrator() {
  const { t } = useLanguage();
  const [analyzers, setAnalyzers] = useState<LabAnalyzer[]>([]);
  const [jobs, setJobs] = useState<AutomatedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalyzer, setSelectedAnalyzer] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling simulation
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const [analyzerList, jobList] = await Promise.all([
      LabAutomationService.getAnalyzers(),
      LabAutomationService.getActiveJobs()
    ]);
    setAnalyzers(analyzerList);
    setJobs(jobList);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'busy': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'idle': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'maintenance': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 'error': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="p-8 space-y-10 pb-32">
      {/* Dynamic Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <Bot size={320} className="text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-rose-500/10" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Orchestration Engine V4.2 Online
                </span>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] italic">GULA AI • Neural Lab Balancer</p>
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Automated <span className="text-indigo-400">Specimen</span> <br />
              Routing & <span className="text-rose-400">Analysis</span>
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Throughput</p>
              <div className="flex items-end gap-2">
                 <p className="text-3xl font-black italic">14.2k</p>
                 <span className="text-[10px] text-emerald-400 font-bold mb-1">TESTS/HR</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Efficiency</p>
              <div className="flex items-end gap-2">
                 <p className="text-3xl font-black italic">98.4%</p>
                 <span className="text-[10px] text-indigo-400 font-bold mb-1">OPT</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm hidden md:block">
              <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Active Jobs</p>
              <div className="flex items-end gap-2">
                 <p className="text-3xl font-black italic">{jobs.length}</p>
                 <span className="text-[10px] text-rose-400 font-bold mb-1">PROC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Analyzers Grid */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex justify-between items-center px-2">
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Machine <span className="text-slate-400">Clusters</span></h2>
             <button onClick={loadData} className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
               <RefreshCw size={20} />
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {analyzers.map(analyzer => (
               <motion.div 
                 key={analyzer.id}
                 whileHover={{ y: -4 }}
                 className={cn(
                   "p-8 bg-white border border-slate-100 rounded-[2.5rem] transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-slate-200/50",
                   selectedAnalyzer === analyzer.id ? "ring-2 ring-indigo-500 border-transparent shadow-xl" : ""
                 )}
                 onClick={() => setSelectedAnalyzer(analyzer.id === selectedAnalyzer ? null : analyzer.id)}
               >
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                       <Cpu size={32} />
                    </div>
                    <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", getStatusColor(analyzer.status))}>
                       {analyzer.status}
                    </div>
                 </div>

                 <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{analyzer.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{analyzer.model} • S/N {analyzer.serialNumber}</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Operational Load</span>
                          <span className={cn(analyzer.currentLoad > 80 ? "text-rose-500" : "text-emerald-500")}>{analyzer.currentLoad}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${analyzer.currentLoad}%` }}
                            className={cn("h-full", analyzer.currentLoad > 80 ? "bg-rose-500" : "bg-emerald-500")}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Queue</p>
                          <p className="text-lg font-black text-slate-900 italic">{analyzer.activeJobs.length} Samples</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Reliability</p>
                          <p className="text-lg font-black text-indigo-600 italic">99.9%</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 flex items-center gap-2 overflow-hidden">
                    {analyzer.supportedTests.map(test => (
                      <span key={test} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase whitespace-nowrap">
                        {test}
                      </span>
                    ))}
                 </div>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Real-time Job Queue */}
        <div className="space-y-8">
           <div className="flex justify-between items-center px-2">
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Intelligent <span className="text-slate-400">Queue</span></h2>
             <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Live</span>
           </div>

           <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-4 flex flex-col gap-4">
             <AnimatePresence mode="popLayout">
               {jobs.map((job, index) => (
                 <motion.div 
                   key={job.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: index * 0.1 }}
                   className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                 >
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/10",
                           job.priority === 'stat' ? "bg-rose-500" : "bg-indigo-600"
                         )}>
                           <FlaskConical size={20} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.sampleId}</p>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Analysis</h4>
                         </div>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        job.priority === 'stat' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {job.priority}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                         <div className="flex items-center gap-2">
                            <Monitor size={12} className="text-slate-400" />
                            <span>{job.analyzerId}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Clock size={12} className="text-slate-400" />
                            <span>ETA {new Date(job.estimatedCompletion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </div>

                      <div className="relative pt-4 overflow-hidden rounded-full">
                         <div className="h-1 w-full bg-slate-50">
                            <motion.div 
                               initial={{ x: "-100%" }}
                               animate={{ x: "0%" }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="h-full w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"
                            />
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">{job.status}...</span>
                         </div>
                         <button className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center gap-1 group">
                           Intervene <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                         </button>
                      </div>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>

             {jobs.length === 0 && (
               <div className="py-20 text-center">
                 <Bot size={48} className="mx-auto text-slate-200 mb-4" />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active autonomous jobs</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
