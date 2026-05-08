import { 
  LayoutDashboard, 
  Calendar, 
  Settings,
  Image as ImageIcon,
  Menu,
  X,
  Stethoscope,
  Microscope,
  User,
  Activity as ActivityIcon,
  Box,
  Server,
  ClipboardList,
  ShieldCheck,
  CreditCard,
  FlaskConical,
  Fingerprint,
  LogOut,
  Pill,
  Users,
  BrainCircuit,
  TestTube,
  Shield,
  Globe,
  Building2,
  Code2,
  History,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff,
  Zap as QuickZap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserWing } from '../types/domain';
import { useNavigationStore, Wing } from '../store/navigationStore';
import { WingSwitcher } from './navigation/WingSwitcher';
import { WingMenu } from './navigation/WingMenu';
import { useNavigation } from '../hooks/useNavigation';

export function Sidebar() {
  const { t, dir } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isWingMenuOpen, setIsWingMenuOpen] = useState(false);
  const { currentWing, setWing: setStoreWing } = useNavigationStore();
  const { navSections } = useNavigation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);
  
  const isRtl = dir === 'rtl';

  useEffect(() => {
    const savedPinned = localStorage.getItem('gula_pinned_nav');
    if (savedPinned) {
      try {
        setPinnedPaths(JSON.parse(savedPinned));
      } catch (e) {
        console.error('Failed to parse pinned items');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gula_pinned_nav', JSON.stringify(pinnedPaths));
  }, [pinnedPaths]);

  const togglePin = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedPaths(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  useEffect(() => {
    if (profile?.wing) {
      setStoreWing(profile.wing as Wing);
      setExpandedSections(prev => ({ ...prev, [profile.wing]: true }));
    }
  }, [profile, setStoreWing]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const pinnedItems = useMemo(() => {
    const allItems = navSections.flatMap(s => s.items);
    // Remove duplicates by path
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.to, item])).values());
    return uniqueItems.filter(item => pinnedPaths.includes(item.to));
  }, [navSections, pinnedPaths]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden fixed z-50 p-3 bg-white shadow-xl rounded-2xl top-4 border border-slate-100 flex items-center justify-center transition-all active:scale-95",
          isRtl ? 'left-4' : 'right-4'
        )}
      >
        {isOpen ? <X size={24} className="text-indigo-600" /> : <Menu size={24} className="text-slate-600" />}
      </button>

      <aside id="sidebar-nav" className={cn(
        "fixed inset-y-0 z-40 w-72 bg-white border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isRtl ? "right-0 border-l" : "left-0 border-r",
        isOpen ? "translate-x-0" : (isRtl ? "translate-x-full" : "-translate-x-full")
      )}>
        <div className="px-6 py-10 flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-200 transition-all group-hover:rotate-6 group-hover:scale-110 overflow-hidden relative">
             <div className="absolute inset-0 bg-indigo-400 animate-pulse opacity-20" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
             <div className="w-7 h-7 text-white bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm relative z-10 transition-all group-hover:border-white/50">
                <span className="text-[10px] font-black font-headline tracking-tighter">G</span>
             </div>
          </div>
          <div className="flex flex-col transition-transform group-hover:translate-x-1">
            <span className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1 font-headline">{t.appName}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 opacity-80 leading-none">{t.medicalIntelligence}</span>
          </div>
        </div>

        <div className="px-4 mb-2">
          {pinnedItems.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-indigo-600/5 rounded-[2rem] p-2 border border-indigo-100/50 mb-4 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                <QuickZap size={40} className="text-indigo-600 rotate-12" />
              </div>
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{t.quickAccess}</span>
                </div>
                <QuickZap size={10} className="text-indigo-400" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                {pinnedItems.map((item) => (
                  <NavLink
                    key={`pinned-${item.to}`}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100/50 border border-indigo-50" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                      "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                    )}>
                      <item.icon size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold tracking-tight truncate">{item.label}</span>
                    </div>
                    <button 
                      onClick={(e) => togglePin(e, item.to)}
                      className="ml-auto p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500"
                    >
                      <PinOff size={12} />
                    </button>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}

          <div className="bg-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.3)] p-1.5 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/5 pointer-events-none" />
            <div className="px-1">
              <WingSwitcher />
            </div>
            
            <button 
              onClick={() => setIsWingMenuOpen(true)}
              className="w-full mt-2 py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <Grid size={12} className="group-hover:rotate-90 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-widest">Global Wing Directory</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 overflow-y-auto pt-2 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.wing} className="space-y-1.5">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, [section.wing]: !prev[section.wing] }))}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group relative overflow-hidden",
                  expandedSections[section.wing] ? "text-indigo-700 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className={cn(
                    "p-2 rounded-xl transition-all shadow-sm",
                    expandedSections[section.wing] ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100/50" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-100"
                  )}>
                    <section.icon size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-headline">{section.label}</span>
                </div>
                {expandedSections[section.wing] ? <ChevronDown size={14} className="text-indigo-400" /> : <ChevronRight size={14} className="text-slate-300" />}
              </button>
              
              <AnimatePresence initial={false}>
                {expandedSections[section.wing] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden space-y-1 ml-6 border-l-2 border-slate-100 pl-3 py-1"
                  >
                    {section.items.map((item: any) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group relative hover:translate-x-1",
                          isActive 
                            ? "bg-slate-900 text-white font-bold shadow-xl shadow-slate-200" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <div className={cn(
                              "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none",
                              isActive && "hidden"
                            )} />
                            <item.icon size={18} className={cn("transition-all duration-300 group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-600")} />
                            <div className="flex flex-col relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                              <span className="text-sm tracking-tight">{item.label}</span>
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-indigo-300" : "text-slate-400 opacity-60 group-hover:opacity-100")}>{item.subtext}</span>
                            </div>
                            <button 
                              onClick={(e) => togglePin(e, item.to)}
                              className={cn(
                                "ml-auto p-2 opacity-0 group-hover:opacity-100 transition-all active:scale-90 relative z-20",
                                pinnedPaths.includes(item.to) ? "text-indigo-500 opacity-100" : "text-slate-300 hover:text-indigo-600"
                              )}
                            >
                              {pinnedPaths.includes(item.to) ? <Pin size={14} className="fill-current" /> : <Pin size={14} />}
                            </button>
                            {isActive && (
                              <motion.div 
                                layoutId="active-nav-bg"
                                className="absolute inset-0 bg-slate-950 rounded-2xl -z-10 shadow-[0_0_20px_rgba(15,23,42,0.2)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div className="pt-4 border-t border-slate-50 mt-4 space-y-1">
            <NavLink
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <Settings size={20} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-sm tracking-tight">{t.settings}</span>
              </div>
            </NavLink>
          </div>
        </nav>

        <div className="p-4 bg-slate-50/50 mt-auto border-t border-slate-100">
           <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-4 group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Network Interlink</span>
                 <div className="flex items-center gap-1.5">
                    <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">SECURE</span>
                    <div className="relative">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
                       <span className="text-[9px] text-slate-600 font-bold">Node-9 Erbil</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-400">14MS</span>
                 </div>
                 <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "30%" }}
                      animate={{ width: ["30%", "70%", "30%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full bg-indigo-400"
                    />
                 </div>
                 <div className="flex items-center justify-between pt-1">
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Last Bio-Sync</span>
                    <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest">JUST NOW</span>
                 </div>
              </div>
           </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm transition-transform hover:scale-110">
              <img 
                className="w-full h-full object-cover" 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=6366f1&color=fff&bold=true`} 
                alt="Profile"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{profile?.name || 'Connecting...'}</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider truncate">
                {profile?.role === 'master_admin' ? t.masterAdmin : (
                  profile?.role === 'ministry_admin' ? t.ministryAdmin : (
                    profile?.role === 'ministry_analyst' ? t.ministryAnalyst : (
                      profile?.role === 'ministry_inspector' ? t.ministryInspector : profile?.role?.replace('_', ' ')
                    )
                  )
                ) || 'Authenticating'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <WingMenu isOpen={isWingMenuOpen} onClose={() => setIsWingMenuOpen(false)} />
    </>
  );
}
