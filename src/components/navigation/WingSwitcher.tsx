import React from 'react';
import { motion } from 'motion/react';
import { Activity, Microscope, Globe, ShieldCheck, Server, User } from 'lucide-react';
import { useNavigationStore, Wing } from '../../store/navigationStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

const wings: { id: Wing; icon: any; color: string; labelKey: string }[] = [
  { id: 'doctor', icon: Activity, color: 'bg-indigo-600', labelKey: 'doctor' },
  { id: 'lab', icon: Microscope, color: 'bg-emerald-600', labelKey: 'laboratory' },
  { id: 'citizen', icon: User, color: 'bg-amber-500', labelKey: 'citizen' },
  { id: 'ministry', icon: Globe, color: 'bg-slate-900', labelKey: 'ministryWing' },
  { id: 'admin', icon: Server, color: 'bg-purple-600', labelKey: 'admin' },
];

export function WingSwitcher() {
  const { currentWing, setWing } = useNavigationStore();
  const { t } = useLanguage();

  return (
    <div className="flex p-2 bg-slate-100 rounded-[2rem] gap-1 overflow-x-auto no-scrollbar max-w-full">
      {wings.map((wing) => {
        const isActive = currentWing === wing.id;
        return (
          <button
            key={wing.id}
            onClick={() => setWing(wing.id)}
            className={cn(
              "relative flex items-center gap-3 px-6 py-3 rounded-[1.5rem] transition-all duration-500 flex-shrink-0 group",
              isActive ? "bg-white shadow-xl shadow-slate-200" : "hover:bg-slate-50"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500",
              isActive ? wing.color : "bg-slate-200 text-slate-400 group-hover:bg-slate-300"
            )}>
              <wing.icon size={16} className={cn(isActive ? "text-white" : "text-slate-500")} />
            </div>
            
            <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
              <span className={cn(
                "text-xs font-black tracking-tight transition-colors",
                isActive ? "text-slate-900" : "text-slate-400"
              )}>
                {t[wing.labelKey as keyof typeof t] || wing.id.toUpperCase()}
              </span>
              {isActive && (
                <motion.span 
                  layoutId="wing-status"
                  className="text-[8px] font-black uppercase text-indigo-600 tracking-widest"
                >
                  Active Context
                </motion.span>
              )}
            </div>

            {isActive && (
              <motion.div
                layoutId="active-wing-bg"
                className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
