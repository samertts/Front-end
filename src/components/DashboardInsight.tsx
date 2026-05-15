import React from 'react';
import { BrainCircuit, Sparkles, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export function DashboardInsight() {
  const { t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-8 rounded-[3rem] text-white shadow-2xl overflow-hidden group min-h-[300px] flex flex-col justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-900 animate-gradient-xy" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
        <BrainCircuit size={180} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 relative">
            <Sparkles size={24} className="text-indigo-200" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-700 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-200">{t?.medicalIntelligence || 'Medical Intelligence'}</span>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Neural Engine v4.2 Active</span>
            </div>
          </div>
        </div>

        <h3 className="text-3xl lg:text-4xl font-black font-headline mb-6 tracking-tighter leading-none italic max-w-2xl">
          "Regional data suggests a shift in resource allocation priorities."
        </h3>

        <p className="text-base text-indigo-100/80 font-medium leading-relaxed mb-10 max-w-xl">
          Based on real-time epidemiological tracking, there is an <span className="text-emerald-400 font-black">82% probability</span> of increased diagnostics load in the North-East corridor over the next 72 hours.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <button className="px-10 py-4 bg-white text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95 transition-all">
            Authorize Allocation
          </button>
          <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all group/btn">
            View Analytics <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
