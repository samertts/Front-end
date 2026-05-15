import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { TaskService } from '../../services/taskService';
import { OfflineSyncService, useOnlineStatus } from '../../lib/offlineSyncService';
import { db } from '../../lib/offlineDb';
import { 
  Microscope, PlayCircle, CheckCircle2, AlertCircle, 
  Clock, User, Shield, Zap, Filter, Search,
  ArrowRight, PauseCircle, Timer, MoreVertical,
  Activity as ActivityIcon, Users, Settings,
  Wifi, WifiOff, AlertTriangle, ClipboardList,
  Image as ImageIcon, Terminal, Keyboard, Scan,
  Dna, Cpu, Box, X, QrCode, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { ResultEntryUI } from '../../components/lab/ResultEntryUI';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { TelemetryService } from '../../services/telemetryService';
const ResultCertificate = React.lazy(() => import('../../components/lab/ResultCertificate').then(m => ({ default: m.ResultCertificate })));

// Skeleton Component
const TaskSkeleton = () => (
  <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
      <div className="md:col-span-4 flex items-center gap-6">
        <div className="w-20 h-20 bg-slate-100 rounded-[2rem]" />
        <div className="space-y-2">
          <div className="h-6 bg-slate-100 rounded-lg w-32" />
          <div className="h-3 bg-slate-100 rounded-lg w-20" />
        </div>
      </div>
      <div className="md:col-span-4 space-y-4 px-8 border-x border-slate-50">
        <div className="h-2 bg-slate-100 rounded-full w-full" />
        <div className="flex gap-4">
          <div className="h-3 bg-slate-100 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </div>
      <div className="md:col-span-4 flex justify-end">
        <div className="h-14 bg-slate-100 rounded-3xl w-full" />
      </div>
    </div>
  </div>
);

type TaskStatus = 'unassigned' | 'claimed' | 'in-progress' | 'review' | 'completed';
type TaskPriority = 'routine' | 'urgent'| 'stat';

interface LabTask {
  id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  testName: string;
  priority: TaskPriority;
  status: TaskStatus;
  slaMinutes: number;
  timeRemaining: number;
  owner?: string;
  section: string;
  dueAt: Date;
  notes?: string;
  attachments?: string[];
}

export function WorkQueue() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  
  const [viewMode, setViewMode] = useState<'technician' | 'pathologist' | 'manager'>('technician');
  const [filterSection, setFilterSection] = useState('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterSla, setFilterSla] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'due'>('priority');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isResultEntryOpen, setIsResultEntryOpen] = useState<any | null>(null);

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'danger' | 'primary' | 'warning';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  const triggerConfirm = (
    title: string, 
    description: string, 
    onConfirm: () => void, 
    variant: 'danger' | 'primary' | 'warning' = 'primary'
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant
    });
  };
  
  const isOnline = useOnlineStatus();
  const isOffline = !isOnline;
  const syncQueueCount = useLiveQuery(() => db.syncQueue.count()) || 0;
  
  // Transform offline tasks to lab tasks
  const labTasks: LabTask[] = (tasks || []).map(t => ({
    id: t.id,
    sampleId: t.metadata?.sampleId || 'N/A',
    patientId: t.metadata?.patientId || 'N/A',
    patientName: t.metadata?.patientName || 'N/A',
    testName: t.title,
    priority: t.priority as TaskPriority,
    status: t.status as TaskStatus,
    slaMinutes: t.metadata?.slaMinutes || 60,
    timeRemaining: t.metadata?.timeRemaining || 0,
    owner: t.metadata?.owner,
    section: t.metadata?.section || 'General',
    dueAt: new Date(t.updatedAt),
    notes: t.description,
    attachments: t.metadata?.attachments
  }));
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<{ message: string; severity: 'high' | 'critical' } | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<any | null>(null);

  // Keyboard Shortcuts (UX Requirement)
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isResultEntryOpen) return;
    
    // Alt + C: Claim first unassigned urgent task
    if (e.altKey && e.key === 'c') {
      const firstUnassigned = tasks.find(t => t.status === 'unassigned');
      if (firstUnassigned) handleClaim(firstUnassigned.id);
    }
    // Alt + S: Scan (Simulated)
    if (e.altKey && e.key === 's') {
      toast.info('Barcode Scanner Ready...', { icon: '🔍' });
    }
  }, [tasks, isResultEntryOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const handleOnline = () => {
      toast.success('System back online. Syncing changes...');
    };
    const handleOffline = () => {
      toast.error('Connection lost. Entering offline mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const savedWork = localStorage.getItem('active_lab_work');
    if (savedWork) {
      const { taskId } = JSON.parse(savedWork);
      setActiveWorkId(taskId);
      toast('Resuming interrupted work session', { icon: '🔄' });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClaim = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    TelemetryService.trackClick('claim_task_attempt', 'WorkQueue');

    triggerConfirm(
      'Claim Laboratory Task',
      `Assigning sample #${task.metadata?.sampleId || 'UNK'} (${task.title}) to your queue. Are you ready to begin processing?`,
      async () => {
        setIsProcessing(taskId);
        try {
          await TaskService.updateTaskStatus(taskId, 'claimed');
          toast.success('Task Claimed', {
            description: `Sample ${task.metadata?.sampleId || 'UNK'} assigned to your queue`
          });
        } catch (error) {
          console.error(error);
        } finally {
          setIsProcessing(null);
        }
      },
      'primary'
    );
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (newStatus === 'completed') {
      const isHighRisk = task.priority === 'stat' || task.priority === 'urgent';
      triggerConfirm(
        'Confirm Clinical Action',
        `You are about to mark sample #${task.metadata?.sampleId || 'UNK'} as ${newStatus.toUpperCase()}. This action is irreversible.`,
        () => TaskService.updateTaskStatus(taskId, 'completed'),
        isHighRisk ? 'danger' : 'primary'
      );
      return;
    }

    await TaskService.updateTaskStatus(taskId, newStatus as any);
  };

  const startWork = (task: any) => {
    setIsResultEntryOpen(task);
    setActiveWorkId(task.id);
    localStorage.setItem('active_lab_work', JSON.stringify({ taskId: task.id, startTime: Date.now() }));
    toast.info('Starting intensive sample evaluation...');
  };

  const handleResultsSave = (results: any) => {
    if (isResultEntryOpen) {
      updateTaskStatus(isResultEntryOpen.id, 'review');
      setIsResultEntryOpen(null);
    }
  };

  const toggleSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) newSelected.delete(taskId);
    else newSelected.add(taskId);
    setSelectedTasks(newSelected);
  };

  const handleBulkClaim = async () => {
    const unassignedTasksInSelection = tasks.filter(t => 
      selectedTasks.has(t.id) && t.status === 'unassigned'
    );

    if (unassignedTasksInSelection.length === 0) {
      toast.error('No unassigned tasks selected');
      return;
    }

    triggerConfirm(
      'Bulk Claim Tasks',
      `Assigning ${unassignedTasksInSelection.length} samples to your queue. Are you ready to begin processing this batch?`,
      async () => {
        setIsProcessing('bulk');
        try {
          for (const task of unassignedTasksInSelection) {
            await TaskService.updateTaskStatus(task.id, 'claimed');
          }
          setSelectedTasks(new Set());
          toast.success(`Successfully claimed ${unassignedTasksInSelection.length} tasks`, {
            description: 'The tasks have been added to your personal work queue.'
          });
        } catch (error) {
          console.error(error);
          toast.error('Partial failure during bulk claim');
        } finally {
          setIsProcessing(null);
        }
      },
      'primary'
    );
  };

  const selectAllUnassigned = () => {
    // We only want to select unassigned tasks that are currently visible (filtered)
    const visibleUnassignedIds = labTasks
      .filter(t => filterSection === 'All' || t.section === filterSection)
      .filter(t => filterPriority === 'All' || t.priority === filterPriority.toLowerCase())
      .filter(t => {
          if (filterSla === 'All') return true;
          if (filterSla === 'Critical') return t.timeRemaining < 15;
          if (filterSla === 'Warning') return t.timeRemaining < 30 && t.timeRemaining >= 15;
          return true;
      })
      .filter(t => {
          if (!searchTerm) return true;
          const search = searchTerm.toLowerCase();
          return (
            t.sampleId.toLowerCase().includes(search) ||
            t.patientName.toLowerCase().includes(search) ||
            t.testName.toLowerCase().includes(search)
          );
      })
      .filter(t => t.status === 'unassigned')
      .map(t => t.id);

    if (visibleUnassignedIds.length === 0) {
      toast.info('No unassigned tasks match the current filters');
      return;
    }

    setSelectedTasks(new Set(visibleUnassignedIds));
    toast.info(`Selected ${visibleUnassignedIds.length} unassigned tasks`);
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      setIsProcessing(taskId);
      await TaskService.updateTaskPriority(taskId, newPriority);
      toast.success('Priority Updated', {
        description: `Sample priority upgraded to ${newPriority.toUpperCase()}`
      });
    } catch (error) {
      toast.error('Failed to update priority');
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const sections = ['All', 'Hematology', 'Biochemistry', 'Serology', 'Microbiology'];
  const priorities = ['All', 'Routine', 'Urgent', 'Stat'];

  if (isResultEntryOpen) {
    return (
      <div className="p-8">
        <ResultEntryUI 
          taskId={isResultEntryOpen.id}
          sampleId={isResultEntryOpen.sampleId}
          patientName={isResultEntryOpen.patientName}
          testName={isResultEntryOpen.testName}
          onSave={handleResultsSave}
          onCancel={() => setIsResultEntryOpen(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/20">
      {/* Connection Status & Critical Alerts */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-amber-900/20 mb-4"
          >
            <div className="flex items-center gap-3 text-left">
              <WifiOff size={18} className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-[0.2em] leading-none">Offline Mode Active</span>
                <span className="text-[9px] font-bold opacity-80 mt-1">{syncQueueCount} changes queued for synchronization</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {criticalAlert && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-red-900/30 flex items-center justify-between mb-4 ring-4 ring-red-500/20 outline-none"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center animate-pulse shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight">Critical Interrupt</h4>
                <p className="text-[10px] font-bold text-red-100">{criticalAlert.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCriticalAlert(null)}
                className="px-6 py-3 bg-white text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shrink-0 shadow-lg"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Production Control Header */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none scale-150">
            <Microscope size={240} />
         </div>

         <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform">
              <ActivityIcon size={40} className="animate-pulse" />
            </div>
            <div>
               <h1 className="text-4xl font-black tracking-tight leading-none mb-2">Work Intelligence <span className="text-indigo-400">Queue</span></h1>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Neural Link</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 gap-2 items-center ml-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Runtime Integrity: Verified</span>
                  </div>
                  
                  {/* State Control Simulation */}
                  <div className="flex bg-white/10 p-1 rounded-xl border border-white/5 shrink-0 gap-1 ml-2 scale-90 translate-y-[-1px]">
                    <div 
                      className={cn("p-1.5 rounded-lg transition-all", isOffline ? "bg-amber-500 text-white shadow-lg" : "text-white/40")}
                      title="Network Status"
                    >
                      {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
                    </div>
                    <button 
                      onClick={() => setCriticalAlert({ message: 'Major analyzer calibration error detected. Manual routing required for critical samples.', severity: 'critical' })}
                      className="p-1.5 text-white/40 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                      title="Simulate Critical Alert"
                    >
                      <AlertTriangle size={12} />
                    </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative z-10 flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {(['technician', 'pathologist', 'manager'] as const).map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === mode ? "bg-white text-slate-900 shadow-md" : "text-white/40 hover:text-white/80"
                )}
              >
                {mode}
              </button>
            ))}
         </div>

         <div className="relative z-10 flex gap-4">
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Throughput</p>
               <p className="text-2xl font-black">42 Samples/hr</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden lg:block" />
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{t.stat} Alert</p>
               <p className="text-2xl font-black text-red-500">2 Pending</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Queue Filtering</h3>
               
               <div className="space-y-6">
                 <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Specialized Section</span>
                    {sections.map(section => (
                      <button 
                        key={section}
                        onClick={() => setFilterSection(section)}
                        className={cn(
                          "w-full text-right p-4 rounded-2xl text-xs font-bold transition-all border",
                          filterSection === section ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {section}
                      </button>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">Priority Level</span>
                    <div className="grid grid-cols-2 gap-2">
                      {priorities.map(p => (
                        <button 
                          key={p}
                          onClick={() => setFilterPriority(p)}
                          className={cn(
                            "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            filterPriority === p ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">SLA Deadline Status</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['All', 'Warning', 'Critical'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setFilterSla(s)}
                          className={cn(
                            "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                            filterSla === s 
                              ? (s === 'Critical' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 
                                 s === 'Warning' ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 
                                 'bg-slate-900 border-slate-900 text-white shadow-lg')
                              : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
               <h3 className="text-sm font-black mb-6 flex items-center gap-2">
                 <Zap size={18} className="text-amber-400 fill-amber-400" /> System Automation
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                     <span className="opacity-60 font-medium">Instrumentation Link</span>
                     <span className="font-bold text-emerald-400 uppercase">Connected</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="opacity-60 font-medium">QC Integration</span>
                     <span className="font-bold text-emerald-400 uppercase">Passed</span>
                  </div>
               </div>
               <button className="w-full mt-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                  Device Monitoring
               </button>
            </div>
         </div>

         <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between px-2 mt-4">
               <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Active Execution</h2>
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-100">
                     <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                     <span className="text-[10px] font-black tracking-widest">{labTasks.length} Samples</span>
                  </div>
               </div>
               
               <AnimatePresence>
                 {selectedTasks.size > 0 && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20, scale: 0.9 }}
                     animate={{ opacity: 1, x: 0, scale: 1 }}
                     exit={{ opacity: 0, x: 20, scale: 0.9 }}
                     className="flex items-center gap-4 bg-white border border-indigo-100 p-2 pl-6 rounded-[2rem] shadow-2xl"
                   >
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{selectedTasks.size} Selected for Batch</span>
                      <button 
                        onClick={handleBulkClaim}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        Claim Batch
                      </button>
                   </motion.div>
                 )}
               </AnimatePresence>
                <div className="flex gap-2">
                   <button 
                     onClick={selectAllUnassigned}
                     className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
                   >
                     <Box size={14} />
                     Select All Unassigned
                   </button>
                   <div className="relative">
                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                     <input 
                        type="text" 
                        placeholder="Search sample, patient, test..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl py-2 pl-4 pr-10 text-xs focus:ring-4 focus:ring-indigo-100 transition-all outline-none" 
                      />
                  </div>
                  <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
                     <button 
                       onClick={() => setSortBy('priority')}
                       className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                         sortBy === 'priority' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                       Priority
                     </button>
                     <button 
                       onClick={() => setSortBy('due')}
                       className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                         sortBy === 'due' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                       Due
                     </button>
                  </div>
                  <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-indigo-600 transition-all">
                     <Filter size={18} />
                  </button>
               </div>
            </div>

            <div className="space-y-4">
               {tasks.length === 0 ? (
                 <>
                   <TaskSkeleton />
                   <TaskSkeleton />
                   <TaskSkeleton />
                 </>
               ) : (
                <AnimatePresence mode="popLayout">
                  {labTasks
                    .filter(t => filterSection === 'All' || t.section === filterSection)
                    .filter(t => filterPriority === 'All' || t.priority === filterPriority.toLowerCase())
                    .filter(t => {
                        if (filterSla === 'All') return true;
                        if (filterSla === 'Critical') return t.timeRemaining < 15;
                        if (filterSla === 'Warning') return t.timeRemaining < 30 && t.timeRemaining >= 15;
                        return true;
                    })
                    .filter(t => {
                        if (!searchTerm) return true;
                        const search = searchTerm.toLowerCase();
                        return (
                          t.sampleId.toLowerCase().includes(search) ||
                          t.patientName.toLowerCase().includes(search) ||
                          t.testName.toLowerCase().includes(search)
                        );
                    })
                    .sort((a, b) => {
                       if (sortBy === 'priority') {
                         const priorityMap = { stat: 0, urgent: 1, routine: 2 };
                         return priorityMap[a.priority] - priorityMap[b.priority];
                       }
                       return a.dueAt.getTime() - b.dueAt.getTime();
                    })
                    .map((task, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      key={task.id}
                      onClick={() => {
                        setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                        TelemetryService.trackClick('expand_task', 'WorkQueue');
                      }}
                      className={cn(
                        "bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm group hover:border-indigo-600 transition-all cursor-pointer relative overflow-hidden",
                        task.priority === 'stat' && "border-l-[12px] border-l-red-500",
                        selectedTasks.has(task.id) && "ring-2 ring-indigo-600 ring-offset-4 bg-indigo-50/10",
                        expandedTaskId === task.id && "shadow-xl shadow-indigo-100 border-indigo-400"
                      )}
                    >
                       <div className="absolute top-4 right-4 z-20">
                          <input 
                            type="checkbox" 
                            checked={selectedTasks.has(task.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelect(task.id);
                            }}
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 checked:border-transparent transition-all cursor-pointer"
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                          <div className="md:col-span-4 flex items-center gap-6">
                             <div className={cn(
                               "w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-2",
                               task.priority === 'stat' ? 'bg-red-600 shadow-red-200' :
                               task.priority === 'urgent' ? 'bg-amber-500 shadow-amber-200' : 'bg-slate-900 shadow-slate-200'
                             )}>
                                <span className="text-[8px] font-black uppercase mb-1 tracking-tighter opacity-80">{task.priority}</span>
                                {task.priority === 'stat' ? <AlertCircle size={32} className="animate-pulse" /> : <PlayCircle size={32} className="group-hover:fill-white/20" />}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{task.sampleId}</h4>
                                   {task.status === 'in-progress' && (
                                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                   )}
                                </div>
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">{task.testName}</p>
                             </div>
                          </div>

                          <div className="md:col-span-4 flex flex-col gap-4 border-l border-r border-slate-100 px-8">
                                 <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                       <span className="text-slate-400">SLA {t.progress || 'Progress'}</span>
                                       <span className={cn(
                                          task.timeRemaining < 10 || task.priority === 'stat' ? 'text-red-500 font-black' : 
                                          task.timeRemaining < 30 || task.priority === 'urgent' ? 'text-amber-500' : 
                                          'text-emerald-600'
                                       )}>{task.timeRemaining}m {t.remaining || 'Left'}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                                       <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.max(0, Math.min(100, (task.timeRemaining / task.slaMinutes) * 100))}%` }}
                                          className={cn(
                                             "h-full rounded-full transition-all duration-1000",
                                             (task.timeRemaining / task.slaMinutes) < 0.2 || task.priority === 'stat' ? 'bg-red-500' : 
                                             (task.timeRemaining / task.slaMinutes) < 0.5 || task.priority === 'urgent' ? 'bg-amber-500' : 
                                             'bg-emerald-500'
                                          )} 
                                       />
                                    </div>
                                 </div>
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                   <Users size={12} className="text-slate-300" />
                                   <span className="text-[10px] font-bold text-slate-500 uppercase">{task.section}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                   <User size={12} className="text-slate-300" />
                                   <span className="text-[10px] font-bold text-slate-500 uppercase">{task.owner || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                   <Clock size={12} className="text-slate-300" />
                                   <span className="text-[10px] font-bold text-slate-500 uppercase">
                                      Due: {task.dueAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                </div>
                             </div>
                          </div>

                          <div className="md:col-span-4 flex items-center justify-end gap-4 pl-8">
                             {task.status === 'unassigned' ? (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleClaim(task.id);
                                 }}
                                 disabled={isProcessing === task.id}
                                 className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-slate-900 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                               >
                                 {isProcessing === task.id || isProcessing === 'bulk' && selectedTasks.has(task.id) ? (
                                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                 ) : (
                                   <>
                                     Claim Task
                                     <Zap size={14} className="group-hover/btn:fill-amber-400 group-hover/btn:text-amber-400 transition-all" />
                                   </>
                                 )}
                               </button>
                             ) : task.status === 'claimed' || task.status === 'in-progress' ? (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   startWork(task);
                                 }}
                                 className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                               >
                                 Result Intelligence
                                 <Terminal size={14} className="text-indigo-400" />
                               </button>
                             ) : task.status === 'review' ? (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   updateTaskStatus(task.id, 'completed');
                                 }}
                                 className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                 Validate [Digital Twin]
                                 <Shield size={14} />
                               </button>
                             ) : (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setViewingCertificate(task);
                                 }}
                                 className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                               >
                                 {t.digitalCertificate}
                                 <QrCode size={14} className="text-indigo-400" />
                               </button>
                             )}
                             <button 
                               onClick={(e) => e.stopPropagation()}
                               className="p-5 border border-slate-200 rounded-3xl hover:border-indigo-600 hover:text-indigo-600 transition-all hover:bg-indigo-50"
                             >
                                <MoreVertical size={20} />
                             </button>
                          </div>
                       </div>

                       {/* Expansion Panel */}
                       <AnimatePresence>
                         {expandedTaskId === task.id && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden"
                           >
                              <div className="pt-8 mt-8 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                 <div className="space-y-4">
                                    <div className="p-6 bg-slate-50 rounded-3xl">
                                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block italic">Patient Identifier</span>
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <User size={18} className="text-indigo-600" />
                                             </div>
                                             <div>
                                                <span className="text-[10px] font-black text-slate-400 block tracking-widest">{task.patientId}</span>
                                                <span className="text-sm font-black text-slate-900 tracking-tight">{task.patientName}</span>
                                             </div>
                                          </div>
                                          <button className="p-2 hover:bg-white rounded-lg transition-colors text-indigo-600">
                                             <ArrowRight size={14} />
                                          </button>
                                       </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-3xl">
                                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block italic">Manual Prioritization Override</span>
                                       <div className="flex gap-2">
                                          {(['routine', 'urgent', 'stat'] as const).map(p => (
                                             <button
                                                key={p}
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handlePriorityChange(task.id, p);
                                                }}
                                                className={cn(
                                                   "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2",
                                                   task.priority === p 
                                                      ? (p === 'stat' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 
                                                         p === 'urgent' ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 
                                                         'bg-slate-900 border-slate-900 text-white shadow-lg')
                                                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                                )}
                                             >
                                                {p}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl">
                                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block italic">Digital Node Assignment</span>
                                       <span className="text-xs font-bold text-slate-700">{task.section} Analytics Node-42</span>
                                    </div>
                                 </div>
                                 
                                 <div className="lg:col-span-2 space-y-4">
                                    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                       <div className="flex items-center gap-2 mb-4">
                                          <ClipboardList size={16} className="text-indigo-600" />
                                          <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Clinical Handover Notes</span>
                                       </div>
                                       <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                          "{task.notes || 'No clinical notes provided for this sample phase.'}"
                                       </p>
                                    </div>

                                    {task.attachments && task.attachments.length > 0 && (
                                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                                         {task.attachments.map((file, idx) => (
                                           <div key={idx} className="flex-none flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 group/file cursor-pointer hover:bg-slate-900 hover:text-white transition-all">
                                              <ImageIcon size={14} />
                                              <span className="text-[10px] font-black truncate max-w-[120px]">{file}</span>
                                           </div>
                                         ))}
                                      </div>
                                    )}
                                 </div>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </motion.div>
                  ))}
               </AnimatePresence>
               )}
            </div>
         </div>
      </div>

      <ConfirmationDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
      />

      <AnimatePresence>
        {viewingCertificate && (
          <ResultCertificate 
            taskId={viewingCertificate.id}
            patientName={viewingCertificate.patientName}
            testName={viewingCertificate.testName}
            resultValue="14.2" // Simulated value
            unit="g/dL"
            referenceRange="13.5 - 17.5"
            issuedAt={new Date().toLocaleDateString()}
            issuedBy="SYS-LAB-772"
            onClose={() => setViewingCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
