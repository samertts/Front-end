import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Zap, 
  Terminal, 
  User, 
  FileText, 
  FlaskConical, 
  Activity,
  Command,
  ArrowRight,
  History,
  Settings,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useNavigation } from '../hooks/useNavigation';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPalette, addRecentAction, recentActions } = useUIStore();
  const { navSections } = useNavigation();
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all navigation items for searching
  const allModules = navSections.flatMap(section => 
    section.items.map(item => ({
      ...item,
      section: section.label,
      type: 'module'
    }))
  );

  const filteredItems = query === '' 
    ? [] 
    : allModules.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) || 
        item.subtext.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPalette(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape') setCommandPalette(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPalette]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  const handleSelect = (item: any) => {
    addRecentAction({ label: item.label, to: item.to });
    navigate(item.to);
    setCommandPalette(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPalette(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={cn(
              "relative w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200",
              isRtl ? "font-arabic" : ""
            )}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center px-6 py-5 border-b border-slate-100 gap-4 bg-slate-50/50">
              <Search size={22} className="text-slate-400" />
              <input
                ref={inputRef}
                autoFocus
                placeholder={isRtl ? "ابحث عن ملف، مريض، أو أمر..." : "Search for a patient, lab, or command..."}
                className="w-full bg-transparent border-none outline-none text-xl font-medium text-slate-800 placeholder:text-slate-300"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Command size={10} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400">K</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {query === '' && recentActions.length > 0 && (
                <div className="mb-6">
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                    <History size={12} /> Recent Workflows
                  </h3>
                  <div className="space-y-1">
                    {recentActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleSelect(action)}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 shadow-sm transition-all">
                          <Zap size={18} />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-bold text-slate-700">{action.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Recently used</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredItems.length > 0 ? (
                <div className="space-y-1">
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Found Modules</h3>
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.to}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group",
                        selectedIndex === index ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2" : "hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        selectedIndex === index ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <item.icon size={18} />
                      </div>
                      <div className="text-left flex-1">
                        <p className={cn("text-sm font-bold", selectedIndex === index ? "text-white" : "text-slate-700")}>
                          {item.label}
                        </p>
                        <p className={cn("text-[10px] font-medium", selectedIndex === index ? "text-white/70" : "text-slate-400")}>
                          {item.section} • {item.subtext}
                        </p>
                      </div>
                      {selectedIndex === index && <ArrowRight size={14} className="opacity-60" />}
                    </button>
                  ))}
                </div>
              ) : query !== '' && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm tracking-tight italic">
                    No results found for "{query}". Try searching for patients or labs.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
               <div className="flex gap-4">
                 <span className="flex items-center gap-1"><ArrowRight size={10} /> Select</span>
                 <span className="flex items-center gap-1"><Command size={10} /> K Toggle</span>
               </div>
               <div className="flex items-center gap-2">
                  <BrainCircuit size={12} className="text-indigo-400" />
                  <span>GULA Command AI Engine v1.0</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
