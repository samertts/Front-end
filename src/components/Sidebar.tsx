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
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff,
  Grid,
  Search,
  Zap as QuickZap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserWing } from '../types/domain';
import { useNavigationStore, Wing } from '../store/navigationStore';
import { WingSwitcher } from './navigation/WingSwitcher';
import { WingMenu } from './navigation/WingMenu';
import { useNavigation } from '../hooks/useNavigation';
import { useUIStore } from '../store/uiStore';
import { FocusModeToggle, StateIndicator } from './UIExtras';
import { CommandPalette } from './CommandPalette';
import { QuickActions } from './QuickActions';

export function Sidebar() {
  const { t, dir } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isWingMenuOpen, setIsWingMenuOpen] = useState(false);
  const { currentWing, setWing: setStoreWing } = useNavigationStore();
  const { navSections } = useNavigation();
  const { isFocusMode, recentActions, setCommandPalette, isSidebarPinned, setSidebarPinned } = useUIStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const isRtl = dir === 'rtl';
  const isExpanded = isSidebarPinned || isHovered || isOpen;

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

  // Real-time Search Filter for sidebar items
  const filteredNavSections = useMemo(() => {
    if (!searchQuery) return navSections;
    const query = searchQuery.toLowerCase();
    return navSections.map(section => {
      const items = section.items.filter(item => 
        item.label.toLowerCase().includes(query) || 
        (item.subtext && item.subtext.toLowerCase().includes(query))
      );
      return { ...section, items };
    }).filter(section => section.items.length > 0);
  }, [navSections, searchQuery]);

  return (
    <>
      {/* Mobile Drawer Trigger */}
      <button 
        id="mobile-drawer-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden fixed z-50 p-3 bg-white shadow-xl rounded-2xl top-4 border border-slate-100 flex items-center justify-center transition-all active:scale-95",
          isRtl ? 'left-4' : 'right-4'
        )}
      >
        {isOpen ? <X size={24} className="text-indigo-600" /> : <Menu size={24} className="text-slate-600" />}
      </button>

      <aside 
        id="sidebar-nav" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setSearchQuery(''); // Clear search on collapse for clean interface
        }}
        className={cn(
          "fixed inset-y-0 z-40 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isRtl ? "right-0 border-l" : "left-0 border-r",
          isExpanded ? "w-72" : "lg:w-20 w-0 overflow-hidden",
          isOpen ? "translate-x-0" : (isRtl ? "translate-x-full" : "-translate-x-full")
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between gap-3 relative border-b border-slate-50 dark:border-slate-900">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-4 cursor-pointer transition-all min-w-0"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 relative">
               <div className="absolute inset-0 bg-indigo-400 animate-pulse opacity-10" />
               <span className="text-sm font-black font-headline text-white">G</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col truncate">
                <span className="text-md font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1 font-headline">{t.appName}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-600 leading-none">{t.medicalIntelligence}</span>
              </div>
            )}
          </div>

          {/* Pin/Lock Toggle for Sidebar Collapsing */}
          {isExpanded && (
            <button 
              id="sidebar-pin-toggle"
              onClick={() => setSidebarPinned(!isSidebarPinned)}
              className={cn(
                "p-1.5 rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-900",
                isSidebarPinned 
                  ? "border-indigo-100 bg-indigo-50/50 text-indigo-600 dark:border-indigo-900/30" 
                  : "border-slate-200 text-slate-400 dark:border-slate-800"
              )}
              title={isSidebarPinned ? "Unlock / Auto-collapse Sidebar" : "Pin Sidebar Expanded"}
            >
              <Pin size={14} className={cn("transition-transform", isSidebarPinned ? "rotate-45" : "")} />
            </button>
          )}
        </div>

        {/* Search & Operational Controls */}
        <div className="px-4 py-3 space-y-3 border-b border-slate-50 dark:border-slate-900">
          {isExpanded ? (
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input 
                id="sidebar-search-input"
                ref={searchInputRef}
                type="text" 
                placeholder="Quick Filter Menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs ml-2 focus:ring-0 focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-rose-500">
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsHovered(true)} 
              className="w-12 h-10 mx-auto rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <Search size={16} />
            </button>
          )}

          {isExpanded && !isFocusMode && (
            <div className="space-y-2">
              <FocusModeToggle />
              <StateIndicator />
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Favorites/Pinned Quick Access */}
          {pinnedItems.length > 0 && (
            <div className="space-y-1">
              {isExpanded && (
                <div className="px-3 py-1 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  <span>{t.quickAccess}</span>
                  <Pin size={10} className="text-indigo-400" />
                </div>
              )}
              <div className="space-y-0.5">
                {pinnedItems.map((item) => (
                  <NavLink
                    key={`pinned-${item.to}`}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-300 group relative",
                      isExpanded ? "px-3 py-2" : "p-2 justify-center",
                      isActive 
                        ? "bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 border border-indigo-100/30 dark:border-indigo-900/30" 
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                      "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                    )}>
                      <item.icon size={13} />
                    </div>
                    {isExpanded && (
                      <span className="text-xs font-semibold tracking-tight truncate flex-1">{item.label}</span>
                    )}
                    {isExpanded && (
                      <button 
                        onClick={(e) => togglePin(e, item.to)}
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500"
                      >
                        <PinOff size={11} />
                      </button>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Main Navigation Matrix Blocks */}
          <div className="space-y-1.5">
            {isExpanded && (
              <div className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Menu Matrix
              </div>
            )}
            
            {filteredNavSections.map((section) => (
              <div key={section.wing} className="space-y-1">
                {isExpanded && (
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, [section.wing]: !prev[section.wing] }))}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group hover:bg-slate-50 dark:hover:bg-slate-900",
                      expandedSections[section.wing] ? "text-indigo-700 dark:text-indigo-400 font-bold" : "text-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <section.icon size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] font-headline">{section.label}</span>
                    </div>
                    {expandedSections[section.wing] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                )}

                {/* Display items when expanded */}
                {(!isExpanded || expandedSections[section.wing]) && (
                  <div className={cn(
                    "space-y-0.5",
                    isExpanded ? "ml-4 border-l border-slate-100 dark:border-slate-900 pl-2 py-0.5" : "flex flex-col items-center gap-1.5"
                  )}>
                    {section.items.map((item: any) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 rounded-xl transition-all duration-300 group relative",
                          isExpanded ? "px-3 py-2" : "p-2.5 justify-center",
                          isActive 
                            ? "bg-slate-900 dark:bg-indigo-600 text-white font-bold shadow-md" 
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                        )}
                        title={!isExpanded ? item.label : undefined}
                      >
                        <item.icon size={15} className={cn("transition-all duration-300 group-hover:scale-110")} />
                        {isExpanded && (
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs tracking-tight">{item.label}</span>
                            {item.subtext && (
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{item.subtext}</span>
                            )}
                          </div>
                        )}
                        {isExpanded && (
                          <button 
                            onClick={(e) => togglePin(e, item.to)}
                            className={cn(
                              "p-1 opacity-0 group-hover:opacity-100 transition-all active:scale-90",
                              pinnedPaths.includes(item.to) ? "text-indigo-500 opacity-100" : "text-slate-300 hover:text-indigo-600"
                            )}
                          >
                            <Pin size={11} className={pinnedPaths.includes(item.to) ? "fill-current text-indigo-500" : ""} />
                          </button>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Operational Matrix Switcher */}
          {isExpanded && !isFocusMode && (
            <div className="bg-slate-900 shadow-xl p-2 rounded-2xl border border-white/5 relative overflow-hidden space-y-2 mt-4">
              <WingSwitcher />
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsWingMenuOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all flex items-center justify-center gap-2 group border border-white/5"
                >
                  <Grid size={12} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">Matrix</span>
                </button>
                <button 
                  onClick={() => setCommandPalette(true)}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-2 group border border-indigo-500/20"
                >
                  <Search size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">Command</span>
                </button>
              </div>
            </div>
          )}

          {/* Recent Items */}
          {isExpanded && recentActions.length > 0 && (
            <div className="space-y-1.5 mt-4 px-1">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                <History size={10} />
                <span>Recent Activities</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentActions.map(action => (
                  <NavLink 
                    key={action.id} 
                    to={action.to}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                  >
                    {action.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer with user account */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-900 mt-auto">
          {isExpanded && (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-3 group">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Network Link</span>
                 <div className="flex items-center gap-1">
                    <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">SECURE</span>
                    <div className="relative">
                       <div className="w-1 h-1 rounded-full bg-emerald-500" />
                       <div className="absolute inset-0 w-1 h-1 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </div>
                 </div>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[8px] text-slate-500 font-bold">Node-9 Erbil</span>
                 <span className="text-[8px] font-black text-indigo-500 uppercase">14MS</span>
              </div>
            </div>
          )}

          <div className={cn("flex items-center gap-3", isExpanded ? "" : "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-110">
              <img 
                className="w-full h-full object-cover" 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=6366f1&color=fff&bold=true`} 
                alt="Profile"
                referrerPolicy="no-referrer"
              />
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile?.name || 'Connecting...'}</span>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider truncate">
                  {profile?.role === 'master_admin' ? t.masterAdmin : (
                    profile?.role === 'ministry_admin' ? t.ministryAdmin : (
                      profile?.role === 'ministry_analyst' ? t.ministryAnalyst : (
                        profile?.role === 'ministry_inspector' ? t.ministryInspector : profile?.role?.replace('_', ' ')
                      )
                    )
                  ) || 'Authenticating'}
                </span>
              </div>
            )}
            {isExpanded && (
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar background overlay for mobile drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <WingMenu isOpen={isWingMenuOpen} onClose={() => setIsWingMenuOpen(false)} />
      <CommandPalette />
      <QuickActions />
    </>
  );
}
