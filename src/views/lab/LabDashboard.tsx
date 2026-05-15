import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Activity as ActivityIcon, AlertCircle, 
  Clock, CheckCircle2, TrendingUp,
  BarChart3, Microscope, Beaker, Search, Bell, Plus,
  Cpu, Zap, Radio, Boxes, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { TaskQueue } from '../../components/TaskQueue';
import { PredictiveAnalytics } from '../../components/PredictiveAnalytics';
import { WorkflowEngine } from '../../services/WorkflowEngine';
import { Task } from '../../types/domain';
import { auth } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabDeviceMonitor } from '../../components/LabDeviceMonitor';
import { OperationalIntelligence } from '../../components/lab/OperationalIntelligence';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "bg-indigo-600", bg }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.01 }}
    className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
  >
    <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-20 group-hover:opacity-100 transition-opacity", color)} />
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className={cn("p-4 rounded-2xl bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-all duration-500", color)}>
        <Icon size={24} className={cn("group-hover:scale-110 transition-transform", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
           <TrendingUp size={14} />
           {trend}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{title}</h3>
      <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6 font-headline">{value}</div>
      <div className="space-y-3">
         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>Utilization</span>
            <span>70%</span>
         </div>
         <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '70%' }}
               transition={{ duration: 1.5, ease: "circOut" }}
               className={cn("h-full rounded-full opacity-100 shadow-[0_0_15px_rgba(79,70,229,0.3)]", color)}
            />
         </div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60">{subtext}</p>
      </div>
    </div>
  </motion.div>
);

import { NeuralConnectivityHub } from '../../components/NeuralConnectivityHub';
import { Scan, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

export function LabDashboard() {
  const { t } = useLanguage();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [newSampleId, setNewSampleId] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSampleId) return;
    
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsRegistering(false);
      setNewSampleId('');
      toast.success('Node Registered', {
        description: `Sample ${newSampleId} successfully synchronized with the Bio-Grid.`
      });
    }, 1200);
  };
  const [activeFilter, setActiveFilter] = React.useState<'active' | 'completed'>('active');

  React.useEffect(() => {
    const unsubscribe = WorkflowEngine.subscribeToEntityTasks('LAB-882', (newTasks) => {
      setTasks(newTasks);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const handleAssign = async (taskId: string) => {
    const user = auth.currentUser;
    if (user) {
      await WorkflowEngine.updateTaskStatus(taskId, 'in_progress', user.uid);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    await WorkflowEngine.updateTaskStatus(taskId, status);
  };

  const handleBulkAction = async (action: 'assign' | 'complete' | 'hold' | 'process', taskIds: string[]) => {
    const user = auth.currentUser;
    let updates: Partial<Task> = {};

    switch (action) {
      case 'assign': 
        updates = { assignedTo: user?.uid, status: 'assigned' };
        break;
      case 'complete':
        updates = { status: 'completed' };
        break;
      case 'hold':
        updates = { status: 'on_hold' };
        break;
      case 'process':
        updates = { status: 'in_progress' };
        break;
    }

    await WorkflowEngine.bulkUpdateTasks(taskIds, updates);
  };

  const metrics = [
    { title: t.samplesInQueue, value: tasks.filter(t => t.status !== 'completed').length, icon: FlaskConical, color: 'bg-indigo-600', trend: "-12%" },
    { title: t.avgTat, value: '2.4h', icon: Clock, color: 'bg-amber-600', trend: "Optimal" },
    { title: t.validatedToday, value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'bg-emerald-600', trend: "+4%" },
    { title: t.qcAnomalies, value: '0', icon: AlertCircle, color: 'bg-rose-500' },
  ];

  const displayedTasks = tasks.filter(t => 
    activeFilter === 'active' ? t.status !== 'completed' : t.status === 'completed'
  );

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-600/5 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <FlaskConical size={20} className="text-white" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase font-headline">{t.labManagement}</h1>
          </div>
          <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Robotic Subsystems Online</span>
             </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next automated batch in 14m</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              readOnly
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              placeholder={t.globalSearch + " (Ctrl+K)"} 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm cursor-pointer"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 lg:p-20 rounded-[4rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group border border-white/10">
         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-emerald-500/10 animate-gradient-xy opacity-50" />
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 blur-[150px] -mr-96 -mt-96 transition-transform duration-1000 group-hover:scale-110 pointer-events-none" />
         
         <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-16">
            <div className="flex-1 space-y-10">
               <div className="flex flex-wrap items-center gap-6">
                  <div className="px-6 py-2 bg-white/10 backdrop-blur-xl rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border border-white/20">System-Wide Supply Strategy</div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                     <Zap size={14} className="fill-emerald-400" />
                     <span className="text-[11px] font-black uppercase tracking-widest italic">AI Optimized Mode</span>
                  </div>
               </div>
               
               <h2 className="text-5xl lg:text-7xl font-black tracking-tight uppercase leading-[0.85] font-headline">
                  Inter-Cluster <br /><span className="text-indigo-400 text-glow-indigo italic">Resource</span> Logistics
               </h2>
               
               <p className="text-lg lg:text-xl text-indigo-100/70 font-medium leading-relaxed max-w-2xl">
                 Unified view of reagents, consumables, and strategic reserves across the National Grid. Predictive re-routing active for <span className="text-white underline decoration-indigo-500 underline-offset-8">Basrah & Nineveh</span> nodes.
               </p>
               
               <div className="flex flex-wrap gap-4 pt-6">
                  <button className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 hover:scale-[1.03] hover:shadow-white/20 active:scale-95 transition-all">
                     View Supply Map
                  </button>
                  <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-xl transition-all">
                     Emergency Request
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-80">
               {[
                 { label: 'Global Reagents', val: '92%', status: 'Stable', color: 'emerald' },
                 { label: 'Consumables', val: 'Low', status: 'Alert', color: 'rose' },
                 { label: 'Reserve Energy', val: '100%', status: 'Nominal', color: 'indigo' },
                 { label: 'Asset Reliability', val: '99.2%', status: 'High', color: 'blue' }
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">{item.label}</span>
                    <p className="text-3xl font-black mb-3 font-headline">{item.val}</p>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      item.color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" :
                      item.color === 'rose' ? "bg-rose-500/20 text-rose-400" :
                      "bg-indigo-500/20 text-indigo-400"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", `bg-${item.color}-400`)} />
                      {item.status}
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 flex flex-wrap items-center gap-4 mt-20 pt-10 border-t border-white/5">
            <button 
              onClick={() => setIsRegistering(true)}
              className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
            >
               <Plus size={20} className="group-hover:rotate-90 transition-transform" />
               Register Node
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all">
               Bio-Grid Report
            </button>
         </div>
      </div>

      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsRegistering(false)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100"
            >
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none scale-150">
                  <Scan size={240} />
               </div>

               <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                        <Zap size={28} className="animate-pulse" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Node Registration</h3>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Bio-Grid Synchronization Protocol</p>
                     </div>
                  </div>
                  <button onClick={() => setIsRegistering(false)} className="p-4 text-slate-300 hover:text-rose-500 transition-colors">
                     <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleRegister} className="p-10 space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Neural Sample Identifier</label>
                     <div className="relative group">
                        <Scan className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
                        <input 
                           autoFocus
                           type="text"
                           value={newSampleId}
                           onChange={(e) => setNewSampleId(e.target.value.toUpperCase())}
                           placeholder="SMP-XXXX-XXXX"
                           className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[2rem] py-8 pl-20 pr-8 text-2xl font-black tracking-tighter text-slate-900 outline-none transition-all placeholder:text-slate-200"
                        />
                     </div>
                  </div>

                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-center gap-4">
                     <ShieldCheck size={32} className="text-indigo-600 shrink-0" />
                     <div>
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1">Encrypted Payload</p>
                        <p className="text-xs font-medium text-indigo-900/60 leading-tight">Registration will broadcast a validation request to all Karkh-Regional bio-nodes.</p>
                     </div>
                  </div>

                  <button 
                    disabled={!newSampleId || isSyncing}
                    className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 group relative overflow-hidden"
                  >
                     {isSyncing ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                        <>
                           Initialize Sync <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </>
                     )}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        <motion.div 
           whileHover={{ scale: 1.02 }}
           onClick={() => window.location.href = '/lab/orchestrator'}
           className="p-10 bg-indigo-600 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-200 cursor-pointer relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={140} />
           </div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                 <Cpu size={24} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Autonomous <br />Orchestrator</h2>
              <p className="text-xs text-white/60 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                 Launch Intelligent Machine Cluster <ArrowRight size={14} />
              </p>
           </div>
        </motion.div>

        <motion.div 
           whileHover={{ scale: 1.02 }}
           onClick={() => window.location.href = '/lab/tests'}
           className="p-10 bg-white border border-slate-100 rounded-[3.5rem] text-slate-900 shadow-sm cursor-pointer relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all"
        >
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
              <ClipboardList size={140} />
           </div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                 <FlaskConical size={24} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Test <br />Protocol Catalog</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                 Configure Clinical Methodologies <ArrowRight size={14} />
              </p>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, i) => (
          <StatCard key={i} {...m} />
        ))}
      </div>

      <PredictiveAnalytics />

      <NeuralConnectivityHub />

      <LabDeviceMonitor />

      <OperationalIntelligence />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
           <div className="flex gap-2">
              <button 
                onClick={() => setActiveFilter('active')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeFilter === 'active' ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100"
                )}
              >
                Active Execution
              </button>
              <button 
                onClick={() => setActiveFilter('completed')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeFilter === 'completed' ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100"
                )}
              >
                Historical Archive
              </button>
           </div>
           
           <TaskQueue 
             tasks={displayedTasks} 
             onAssign={handleAssign}
             onUpdateStatus={handleUpdateStatus}
             onBulkAction={handleBulkAction}
           />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[80px] -mr-16 -mt-16" />
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tight">{t.chemicalReagents}</h3>
                  <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[9px] font-black uppercase animate-pulse">Low Stock</div>
               </div>

               <div className="space-y-6">
                  {[
                    { label: 'Analyzer Fluid Delta', val: 'Low', progress: 15, color: 'bg-red-400' },
                    { label: 'Immunoassay Packs', val: 'Opt', progress: 85, color: 'bg-green-400' },
                    { label: 'Biopsy Cassettes', val: 'Med', progress: 45, color: 'bg-amber-400' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                          <span>{item.label}</span>
                          <span>{item.val}</span>
                       </div>
                       <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className={cn("h-full", item.color)}
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5">
                 {t.orderSupplies} <Plus size={14} />
               </button>
             </div>
           </div>

           <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Cpu size={18} />
                 </div>
                 <h3 className="text-sm font-black uppercase tracking-tight">Automation Twin</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { name: 'Centrifuge 01', status: 'Spinning', rpm: '4.5k', color: 'emerald' },
                   { name: 'Incubator Alpha', status: 'Stable', temp: '37.1°C', color: 'indigo' },
                   { name: 'Robotic Arm 04', status: 'Waiting', load: '0%', color: 'amber' },
                   { name: 'Analyzer Gamma', status: 'Active', load: '88%', color: 'rose' },
                 ].map((mod, i) => (
                   <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mod.name}</span>
                         <div className={`w-1.5 h-1.5 rounded-full bg-${mod.color}-500 animate-pulse`} />
                      </div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-sm font-black text-slate-900">{mod.rpm || mod.temp || mod.load}</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase">{mod.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
        </div>
      </div>
    </div>
  );
}
