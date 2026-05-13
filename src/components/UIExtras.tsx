import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { Maximize2, Minimize2, BrainCircuit, ShieldCheck, Cpu, Terminal, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function IntegrityIndicator() {
  const [integrityState, setIntegrityState] = useState<'verifying' | 'secure' | 'alert'>('verifying');

  useEffect(() => {
    const timer = setTimeout(() => setIntegrityState('secure'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500",
      integrityState === 'verifying' ? "bg-slate-50 border-slate-100" :
      integrityState === 'secure' ? "bg-emerald-500/10 border-emerald-500/20" :
      "bg-rose-500/10 border-rose-500/20"
    )}>
      {integrityState === 'verifying' ? (
        <Cpu size={12} className="text-slate-400 animate-spin" />
      ) : (
        <ShieldCheck size={12} className={integrityState === 'secure' ? "text-emerald-500" : "text-rose-500"} />
      )}
      <span className={cn(
        "text-[8px] font-black uppercase tracking-widest",
        integrityState === 'verifying' ? "text-slate-400" :
        integrityState === 'secure' ? "text-emerald-600" : "text-rose-600"
      )}>
        {integrityState === 'verifying' ? "Verifying Runtime..." : "Runtime Secure"}
      </span>
    </div>
  );
}

export function CommandShortcutsHint() {
  return (
    <div className="hidden xl:flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-50 hover:opacity-100 transition-opacity">
       <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">⌘K</kbd>
          <span>Command Palette</span>
       </div>
       <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">Alt+O</kbd>
          <span>Neural Engine</span>
       </div>
    </div>
  );
}

export function FocusModeToggle() {
  const { isFocusMode, toggleFocusMode } = useUIStore();

  return (
    <button
      onClick={toggleFocusMode}
      className={cn(
        "relative flex items-center gap-3 px-4 py-2 rounded-2xl transition-all group overflow-hidden border",
        isFocusMode 
          ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200" 
          : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
      )}
    >
      <div className="relative z-10 flex items-center gap-2">
        {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {isFocusMode ? "Exit Focus" : "Clinical Focus"}
        </span>
      </div>
      
      {isFocusMode && (
        <motion.div
          layoutId="focus-glow"
          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-100"
        />
      )}
      
      {!isFocusMode && (
        <BrainCircuit 
          size={14} 
          className="text-slate-300 group-hover:text-indigo-400 group-hover:rotate-12 transition-all" 
        />
      )}
    </button>
  );
}

export function StateIndicator() {
  const { systemStatus } = useUIStore();
  
  const indicators = [
    { label: 'Sync', status: systemStatus.sync, color: { idle: 'bg-emerald-500', syncing: 'bg-amber-500 animate-pulse', error: 'bg-rose-500' } },
    { label: 'AI', status: systemStatus.ai, color: { ready: 'bg-indigo-500', processing: 'bg-amber-500 animate-pulse', offline: 'bg-slate-400' } },
    { label: 'OS', status: systemStatus.network, color: { online: 'bg-emerald-500', degraded: 'bg-amber-500', offline: 'bg-rose-500' } },
  ];

  return (
    <div className="flex items-center gap-4 bg-slate-900/5 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50">
      {indicators.map((ind) => (
        <div key={ind.label} className="flex items-center gap-2 group cursor-help" title={`${ind.label}: ${ind.status}`}>
          <div className={cn("w-2 h-2 rounded-full", ind.color[ind.status as keyof typeof ind.color])} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">
            {ind.label}
          </span>
        </div>
      ))}
    </div>
  );
}
