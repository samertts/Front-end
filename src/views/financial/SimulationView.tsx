import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, ShieldAlert, TrendingUp, Info, Zap, Search, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SimulationView() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/financial/simulate');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
            Economic <span className="text-indigo-600">Sim_Engine</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
            National Health Market Stability & Fraud Stress Testing
          </p>
        </div>
        <button 
          onClick={runSimulation}
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} />}
          Initialize Market Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Market Stability</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{results?.marketFairnessScore || '0.00'}</span>
            <span className="text-emerald-500 text-xs font-bold font-mono">OPTIMAL</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Average Service Quality</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{results?.averageQuality || '0.0'}</span>
            <span className="text-indigo-500 text-xs font-bold font-mono">/ 10.0</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fraud Resistance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">99.8%</span>
            <span className="text-indigo-500 text-xs font-bold font-mono">AIR-GAP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-slate-900 uppercase">Provider Rank Distribution</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pricing-Stable</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results?.rankings || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xl font-black text-slate-900 uppercase mb-8">Live Simulation Log</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {(results?.rankings || []).map((p: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={p.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-default group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[10px] font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-800">{p.name}</p>
                      <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Quality Index: {p.quality}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{p.score?.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Final Score</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!results && (
              <div className="py-20 text-center space-y-4 opacity-50">
                <LayoutGrid size={40} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-400">Initialize engine to see market behavior</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
