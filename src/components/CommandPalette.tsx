import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  Command as CommandIcon, 
  User, 
  Activity, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Calculator, 
  Microscope, 
  Pill, 
  FileText, 
  Zap, 
  BrainCircuit,
  History,
  Star,
  Globe,
  ShieldCheck,
  LayoutDashboard,
  Server,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore, Wing } from '../store/navigationStore';

export function CommandPalette() {
  const { t, language } = useLanguage();
  const { activeCommand, closeCommand, toggleCommand, history, favorites, setWing } = useNavigationStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const isRtl = language === 'AR' || language === 'KU' || language === 'SY';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommand();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleCommand]);

  const runCommand = (action: () => void) => {
    action();
    closeCommand();
  };

  const navItems = [
    { id: 'dash', label: t.nav_command_goDashboard, icon: LayoutDashboard, category: 'Navigation', action: () => navigate('/') },
    { id: 'patients', label: t.nav_command_openPatient, icon: User, category: 'Navigation', action: () => navigate('/doctor/patients') },
    { id: 'lab', label: t.nav_command_searchLab, icon: Microscope, category: 'Navigation', action: () => navigate('/lab/dashboard') },
    { id: 'audit', label: t.nav_command_viewAudit, icon: ShieldCheck, category: 'Navigation', action: () => navigate('/ministry/control-plane') },
    { id: 'settings', label: t.settings, icon: Settings, category: 'Navigation', action: () => navigate('/settings') },
  ];

  const wingItems = [
    { id: 'wing-doctor', label: 'Switch to Doctor Wing', wing: 'doctor' as Wing, icon: Activity },
    { id: 'wing-lab', label: 'Switch to Laboratory Wing', wing: 'lab' as Wing, icon: Microscope },
    { id: 'wing-ministry', label: 'Switch to Ministry Wing', wing: 'ministry' as Wing, icon: Globe },
    { id: 'wing-admin', label: 'Switch to Admin Wing', wing: 'admin' as Wing, icon: Server },
  ];

  const quickActions = [
    { id: 'qa-cbc', label: 'Order CBC Panel', icon: Microscope, shortcut: 'O C' },
    { id: 'qa-script', label: 'New Prescription', icon: Pill, shortcut: 'O P' },
    { id: 'qa-calc', label: 'Dose Calculator', icon: Calculator, shortcut: 'T C' },
  ];

  return (
    <AnimatePresence>
      {activeCommand && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommand}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 overflow-hidden border border-slate-100 font-sans"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <Command className="flex flex-col h-full overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 flex-shrink-0">
                   <Search size={28} />
                </div>
                <Command.Input 
                  autoFocus
                  placeholder={t.nav_globalSearch}
                  value={search}
                  onValueChange={setSearch}
                  className="flex-1 bg-transparent border-none outline-none text-2xl font-black text-slate-900 placeholder:text-slate-200 tracking-tight"
                />
                <div className="hidden md:flex items-center gap-3">
                   <div className="px-3 py-1.5 bg-slate-900 rounded-xl text-[10px] font-black text-white shadow-xl">ESC</div>
                </div>
              </div>

              <Command.List className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
                <Command.Empty className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <History size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg">{t.noResultsFound || "No matching commands found."}</p>
                </Command.Empty>

                {history.length > 0 && (
                  <Command.Group heading={t.nav_recent} className="mb-8">
                    {history.map((path) => (
                      <Command.Item
                        key={path}
                        onSelect={() => runCommand(() => navigate(path))}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all group cursor-pointer aria-selected:bg-white aria-selected:shadow-lg"
                      >
                        <History size={20} className="text-slate-400" />
                        <span className="font-bold text-slate-700">{path}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading={t.nav_switchWing} className="mb-8">
                  <div className="grid grid-cols-2 gap-3 p-2">
                    {wingItems.map((wing) => (
                      <Command.Item
                        key={wing.id}
                        onSelect={() => runCommand(() => setWing(wing.wing))}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer aria-selected:border-indigo-500 aria-selected:ring-2 aria-selected:ring-indigo-500/20"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <wing.icon size={20} />
                        </div>
                        <span className="font-bold text-slate-900">{wing.label}</span>
                      </Command.Item>
                    ))}
                  </div>
                </Command.Group>

                <Command.Group heading={t.nav_commandPalette} className="mb-8">
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      onSelect={() => runCommand(item.action)}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all group cursor-pointer aria-selected:bg-white aria-selected:shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <item.icon size={20} />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-indigo-900">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading={t.nav_quickActions}>
                  {quickActions.map((action) => (
                    <Command.Item
                      key={action.id}
                      onSelect={() => runCommand(() => alert(`Executed: ${action.label}`))}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all group cursor-pointer aria-selected:bg-white aria-selected:shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <action.icon size={20} />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-indigo-900">{action.label}</span>
                      </div>
                      <kbd className="px-3 py-1.5 bg-slate-900 rounded-lg text-[10px] font-black text-white shadow-lg">{action.shortcut}</kbd>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400">
                <div className="flex gap-6">
                  <span className="flex items-center gap-2 text-indigo-400"><LayoutDashboard size={14} /> {t.nav_nationalOs}</span>
                  <span className="flex items-center gap-2 uppercase tracking-widest"><CommandIcon size={14} /> Control Layer</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <BrainCircuit size={14} className="animate-pulse" /> GULA OS Intelligence (v4.2)
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
