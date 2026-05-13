import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, Activity, Bell, X, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CriticalAlert {
  id: string;
  type: 'critical_lab' | 'system_anomaly' | 'emergency_protocol';
  title: string;
  patientName?: string;
  location?: string;
  value?: string;
  timestamp: string;
  priority: 'V' | 'IV' | 'III';
}

export function CriticalAlertOverlay() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  // Simulate receiving a critical national alert
  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts([
        {
          id: 'alt-9901',
          type: 'critical_lab',
          title: 'EXTREME HYPOKALEMIA DETECTED',
          patientName: 'Ahmed Khalaf (ID: P-1022)',
          location: 'Karkh Central - Ward 4',
          value: '1.2 mmol/L (REF 3.5-5.0)',
          timestamp: new Date().toISOString(),
          priority: 'V'
        }
      ]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (alerts.length === 0 || isDismissed) return null;

  const activeAlert = alerts[0];

  return (
    <div className="fixed top-24 right-8 z-[100] w-96">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          className="bg-white rounded-[2.5rem] border-2 border-red-500 shadow-[0_32px_64px_-16px_rgba(239,68,68,0.4)] overflow-hidden"
        >
          <div className="bg-red-600 p-6 flex items-center justify-between relative overflow-hidden">
            {/* Pulsing warning animation */}
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-xl">
                <AlertCircle size={24} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">Emergency Priority V</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tighter mt-1">Medical Anomaly</h4>
              </div>
            </div>
            <button 
              onClick={() => setIsDismissed(true)}
              className="relative z-10 p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Source: Bio-Network v4</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                {activeAlert.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</span>
                <span className="text-[10px] font-bold text-slate-900">{activeAlert.patientName}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Registry Value</span>
                <span className="text-[10px] font-black text-red-600 italic underline decoration-2">{activeAlert.value}</span>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 flex items-center gap-4 border border-red-100">
               <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm">
                  <Activity size={16} />
               </div>
               <div>
                  <span className="text-[8px] font-black text-red-800 uppercase tracking-widest block">Action Required</span>
                  <span className="text-[10px] font-medium text-red-700">Immediate Clinical Verification via Neural Link</span>
               </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
                onClick={() => window.location.href = `/doctor/patient/P-1022`}
              >
                Go to Profile <ShieldAlert size={14} />
              </button>
              <button className="p-4 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                <Bell size={18} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sovereign Grid Sync Active
            </div>
            <ShieldCheck size={14} className="text-slate-200" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
