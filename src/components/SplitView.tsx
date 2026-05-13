import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Maximize2, Minimize2, Columns, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkspacePanel {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface SplitViewProps {
  panels: WorkspacePanel[];
}

export function SplitView({ panels }: SplitViewProps) {
  const [activePanelIds, setActivePanelIds] = useState<string[]>([panels[0]?.id].filter(Boolean));
  const [isSplit, setIsSplit] = useState(false);

  const togglePanel = (id: string) => {
    if (isSplit) {
      if (activePanelIds.includes(id)) {
        if (activePanelIds.length > 1) {
          setActivePanelIds(activePanelIds.filter(pid => pid !== id));
        }
      } else {
        setActivePanelIds([activePanelIds[0], id]);
      }
    } else {
      setActivePanelIds([id]);
    }
  };

  const currentPanels = panels.filter(p => activePanelIds.includes(p.id));

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl">
      {/* Workspace Control Bar */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2">
          {panels.map(panel => (
            <button
              key={panel.id}
              onClick={() => togglePanel(panel.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                activePanelIds.includes(panel.id) 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              )}
            >
              {panel.icon}
              {panel.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 border-l border-slate-100 ml-4">
          <button 
            onClick={() => setIsSplit(!isSplit)}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isSplit ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 hover:text-slate-900"
            )}
            title="Split Workspace Mode"
          >
            <Columns size={18} />
          </button>
          <button className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className={cn(
        "flex-1 p-6 gap-6 overflow-hidden",
        isSplit && activePanelIds.length > 1 ? "grid grid-cols-2" : "flex flex-col"
      )}>
        <AnimatePresence mode="popLayout">
          {currentPanels.map((panel, idx) => (
            <motion.div
              key={panel.id}
              layout
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="text-indigo-600">
                    {panel.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">
                    {panel.title} Panel
                  </span>
                </div>
                <div className="flex items-center gap-1">
                   <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <Maximize2 size={14} />
                   </button>
                   {isSplit && (
                      <button 
                        onClick={() => setActivePanelIds(activePanelIds.filter(id => id !== panel.id))}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                   )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-elegant">
                {panel.component}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
