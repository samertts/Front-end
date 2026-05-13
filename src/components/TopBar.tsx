import { Search, Globe, Bell, LogOut, Activity, Cpu, Zap, User, Network, Wifi, WifiOff, X, ShieldAlert, FlaskConical, Stethoscope, Command } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import { Language } from '../translations';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { NeuralSparkline } from './NeuralSparkline';
import { SystemDiagnosticsDrawer } from './SystemDiagnosticsDrawer';
import { toast } from 'sonner';
import { useNavigationStore } from '../store/navigationStore';
import { IntegrityIndicator, CommandShortcutsHint } from './UIExtras';

export function TopBar() {
  const { t, setLanguage, language, dir } = useLanguage();
  const { unreadCount } = useNotifications();
  const { user, profile, logout } = useAuth();
  const { openCommand } = useNavigationStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [throughput, setThroughput] = useState(42.8);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [clinicalMode, setClinicalMode] = useState<'clinic' | 'emergency' | 'research'>('clinic');
  const isRtl = dir === 'rtl';

  useEffect(() => {
    const timer = setInterval(() => {
      setThroughput(prev => Math.max(30, Math.min(60, prev + (Math.random() * 2 - 1))));
    }, 4000);

    const savedLowBandwidth = localStorage.getItem('gula_low_bandwidth') === 'true';
    setIsLowBandwidth(savedLowBandwidth);

    const savedMode = localStorage.getItem('clinical_mode') as any;
    if (savedMode) setClinicalMode(savedMode);

    return () => clearInterval(timer);
  }, []);

  const toggleMode = (mode: 'clinic' | 'emergency' | 'research') => {
    setClinicalMode(mode);
    localStorage.setItem('clinical_mode', mode);
    toast.info(`Clinical Mode Switched to ${mode.toUpperCase()}`);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const langs: Language[] = ['EN', 'AR', 'KU', 'TR', 'SY'];

  return (
    <div className="sticky top-0 z-40 bg-white">
      <SystemDiagnosticsDrawer 
        isOpen={showDiagnostics} 
        onClose={() => setShowDiagnostics(false)} 
      />
      
      {/* OS Status Strip */}
      <div className="bg-slate-950 text-white py-1 px-6 flex items-center justify-between gap-4 overflow-hidden relative border-b border-white/5 h-10">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
         
         <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setShowDiagnostics(true)}>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-emerald-400 transition-colors">
                 Grid Operations: Nominal
               </span>
            </div>

            <div className="h-4 w-px bg-white/10 mx-2" />
            <IntegrityIndicator />
            <div className="h-4 w-px bg-white/10 mx-2 ml-4" />
            <CommandShortcutsHint />
            
            <div className="hidden md:flex items-center gap-4">
               <div className="w-px h-3 bg-white/10" />
               <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Throughput</span>
                  <span className="text-[10px] font-mono font-bold text-white/60">{throughput.toFixed(1)} GB/s</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6 relative z-10">
            <div className="flex items-center gap-3">
               <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">{t.nav_systemStatus}</span>
               <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={cn("w-1 h-3 rounded-full", i < 4 ? "bg-indigo-500" : "bg-white/10")} />
                  ))}
               </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
               <ShieldAlert size={10} className="text-indigo-400" />
               <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t.quantumEncryption}</span>
            </div>
         </div>
      </div>

      {/* Main Navbar */}
      <header className="w-full bg-white/80 backdrop-blur-3xl border-b border-slate-100 h-20 flex items-center shadow-sm px-6 gap-6">
        {/* Universal Command Trigger */}
        <button 
          onClick={openCommand}
          className="flex-1 max-w-xl group relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 py-3 px-6 h-12"
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-4">
              <Search size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-tight">
                {t.nav_globalSearch}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Command size={10} className="text-slate-400" />
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                <span className="text-[10px] font-black text-slate-400">K</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-indigo-500 opacity-0 group-active:opacity-5 transition-opacity" />
        </button>

        <div className="flex items-center gap-4 ml-auto">
          {/* Clinical Modes */}
          <div className="hidden lg:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
             {(['clinic', 'emergency', 'research'] as const).map((mode) => (
               <button
                 key={mode}
                 onClick={() => toggleMode(mode)}
                 className={cn(
                   "px-4 py-2 rounded-xl text-[9px] font-black transition-all flex items-center gap-2 uppercase tracking-tighter",
                   clinicalMode === mode 
                    ? (mode === 'emergency' ? "bg-red-600 text-white" : mode === 'research' ? "bg-amber-500 text-white" : "bg-white text-indigo-600")
                    : "text-white/40 hover:text-white/60"
                 )}
               >
                 {mode === 'clinic' && <Stethoscope size={14} />}
                 {mode === 'emergency' && <ShieldAlert size={14} />}
                 {mode === 'research' && <FlaskConical size={14} />}
                 {mode}
               </button>
             ))}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          {/* Lang Switcher */}
          <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-2xl hidden md:flex">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all relative",
                  language === l 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all relative border border-transparent hover:border-slate-100"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className={cn(
                  "absolute top-2.5 w-5 h-5 bg-red-500 border-2 border-white rounded-lg text-[9px] font-black text-white flex items-center justify-center shadow-lg",
                  isRtl ? "left-2" : "right-2"
                )}>
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center gap-4 group cursor-pointer p-1 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
             <div className="flex flex-col items-end text-right hidden sm:flex">
                <p className="text-xs font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                  {profile?.name || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5 opacity-60">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{profile?.role || 'User'}</p>
                </div>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <User size={22} />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
             </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>
    </div>
  );
}
