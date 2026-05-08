import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { useNavigationStore } from '../../store/navigationStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Settings, 
  BrainCircuit, 
  Activity, 
  Microscope, 
  User, 
  Globe, 
  Server,
  Stethoscope,
  FlaskConical,
  Database,
  Search,
  Grid,
  ChevronRight
} from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';

export function WingMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentWing } = useNavigationStore();
  const { navSections } = useNavigation();
  const { t, dir } = useLanguage();
  const { profile } = useAuth();
  const isRtl = dir === 'rtl';

  const wingData = {
    doctor: { label: t.doctorWing, icon: Stethoscope, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    lab: { label: t.labWing, icon: Microscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    citizen: { label: t.citizenWing, icon: User, color: 'text-amber-600', bg: 'bg-amber-50' },
    ministry: { label: t.ministryWing, icon: Globe, color: 'text-slate-900', bg: 'bg-slate-100' },
    admin: { label: t.adminWing, icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
    researcher: { label: t.researcherWing, icon: BrainCircuit, color: 'text-rose-600', bg: 'bg-rose-50' },
    regulator: { label: t.regulatorWing, icon: Microscope, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    system: { label: 'System', icon: Database, color: 'text-slate-500', bg: 'bg-slate-50' }
  };

  const activeWing = wingData[currentWing as keyof typeof wingData];
  const items = navSections.flatMap(s => s.items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed z-[70] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] p-12 max-w-5xl w-[90vw] max-h-[85vh] overflow-y-auto custom-scrollbar",
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              isRtl ? "font-arabic" : ""
            )}
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                <div className={cn("w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-transform hover:scale-110", activeWing?.bg)}>
                  {activeWing && <activeWing.icon size={48} className={activeWing.color} />}
                </div>
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                    {activeWing?.label} <span className="text-indigo-600">GULA</span>
                  </h2>
                  <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-indigo-200" /> Administrative Context & Module Matrix
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all hover:rotate-90 group"
              >
                <Grid size={28} className="group-hover:scale-110" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <item.icon size={80} />
                  </div>
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 transition-all">
                    <item.icon size={24} className="text-indigo-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">{item.label}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.subtext}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest">
                    <span>Explore Module</span>
                    <ChevronRight size={14} />
                  </div>
                </NavLink>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
              <span className="text-[10px] font-black uppercase tracking-widest">GULA OS v4.2.0</span>
              <div className="flex gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest">Secure Interlink Active</span>
                 <Database size={12} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
