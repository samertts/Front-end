import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Zap, 
  ShieldAlert, 
  Settings, 
  MessageSquare,
  Activity,
  UserPlus,
  QrCode,
  FilePlus,
  Command
} from 'lucide-react';
import { useNavigationStore } from '../store/navigationStore';
import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentWing } = useNavigationStore();
  const { setCommandPalette } = useUIStore();

  const wingActions = {
    doctor: [
      { icon: UserPlus, label: 'Add Patient', color: 'bg-indigo-600' },
      { icon: FilePlus, label: 'New Order', color: 'bg-indigo-500' },
      { icon: Activity, label: 'Vitals', color: 'bg-indigo-400' },
    ],
    lab: [
      { icon: QrCode, label: 'Scan Sample', color: 'bg-emerald-600' },
      { icon: Plus, label: 'Add Result', color: 'bg-emerald-500' },
    ],
    citizen: [
      { icon: ShieldAlert, label: 'Emergency', color: 'bg-rose-600' },
      { icon: MessageSquare, label: 'Ask AI', color: 'bg-amber-500' },
    ],
    ministry: [
      { icon: ShieldAlert, label: 'Issue Alert', color: 'bg-rose-600' },
      { icon: Zap, label: 'Critical Ops', color: 'bg-slate-900' },
    ],
    admin: [],
    researcher: [],
    regulator: [],
    system: []
  };

  const actions = wingActions[currentWing as keyof typeof wingActions] || [];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 items-end mb-2">
            {actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-2xl font-black text-[10px] uppercase tracking-widest",
                   action.color
                )}
              >
                {action.label}
                <action.icon size={16} />
              </motion.button>
            ))}
            
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: actions.length * 0.05 }}
              onClick={() => {
                setCommandPalette(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl font-black text-[10px] uppercase tracking-widest"
            >
              Open Command Palette
              <div className="flex items-center gap-1 opacity-40">
                <Command size={10} /> <span>K</span>
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl transform active:scale-95",
          isOpen ? "bg-slate-900 text-white rotate-45" : "bg-indigo-600 text-white hover:scale-110"
        )}
      >
        <Plus size={32} />
      </button>
    </div>
  );
}
