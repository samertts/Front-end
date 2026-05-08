import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Database, 
  Cpu, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Lock,
  Search,
  Server,
  Network,
  Binary,
  Microscope,
  HardDrive,
  CheckCircle2,
  XCircle,
  Terminal,
  Share2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const generateMetrics = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    time: i,
    resilience: 85 + Math.random() * 14,
    latency: 120 + Math.random() * 40,
    throughput: 15000 + Math.random() * 5000,
    risk: Math.random() * 10,
    epidemic_r0: 0.8 + Math.random() * 0.4
  }));
};

const SIMULATION_TYPES = [
  { id: 'latency', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'service', icon: Server, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'network', icon: Network, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'security', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export const ControlPlane: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [metrics, setMetrics] = useState(generateMetrics(20));
  const [activeSims, setActiveSims] = useState<string[]>([]);
  const [logs, setLogs] = useState<Array<{ id: string; msg: string; type: 'info' | 'warn' | 'error'; time: string }>>([]);
  const [digitalTwinSearch, setDigitalTwinSearch] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const next = [...prev.slice(1), {
          time: prev[prev.length - 1].time + 1,
          resilience: 85 + Math.random() * 14 - (activeSims.length * 5),
          latency: 120 + Math.random() * 40 + (activeSims.includes('latency') ? 200 : 0),
          throughput: 15000 + Math.random() * 5000 - (activeSims.includes('service') ? 8000 : 0),
          risk: Math.random() * 10 + (activeSims.includes('security') ? 40 : 0),
          epidemic_r0: 0.8 + Math.random() * 0.4
        }];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSims]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' = 'info') => {
    setLogs(prev => [
      { id: Math.random().toString(36), msg, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49)
    ]);
  };

  const toggleSimulation = (id: string) => {
    setActiveSims(prev => {
      const isRemoving = prev.includes(id);
      if (isRemoving) {
        addLog(`${id.toUpperCase()} Sim Deactivated. Protocol restored.`, 'info');
        return prev.filter(x => x !== id);
      } else {
        addLog(`INJECTING ${id.toUpperCase()} FAILURE... Monitor resilience delta.`, 'warn');
        return [...prev, id];
      }
    });
  };

  const avgResilience = useMemo(() => 
    Math.round(metrics.reduce((acc, curr) => acc + curr.resilience, 0) / metrics.length), 
    [metrics]
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.cp_controlPlane}</h1>
              <p className="text-slate-500 font-medium">{t.manageMonitorHealth}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 text-center border-r border-slate-100 last:border-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t.cp_resilienceScore}</p>
            <p className={`text-xl font-black tracking-tighter ${avgResilience > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {avgResilience}%
            </p>
          </div>
          <div className="px-4 py-2 text-center border-r border-slate-100 last:border-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t.cp_activeSimulations}</p>
            <p className="text-xl font-black tracking-tighter text-indigo-600">
              {activeSims.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Chaos Engine & Self-Healing */}
        <div className="lg:col-span-1 space-y-8">
          {/* Chaos Resilience Engine */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Activity className="text-amber-600" size={20} />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight">{t.cp_chaosEngine}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SIMULATION_TYPES.map((sim) => (
                <button
                  key={sim.id}
                  onClick={() => toggleSimulation(sim.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-300 group
                    ${activeSims.includes(sim.id) 
                      ? `${sim.bg} border-${sim.color.split('-')[1]}-200 ring-2 ring-${sim.color.split('-')[1]}-500/20 shadow-lg` 
                      : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 shadow-sm'}`}
                >
                  <sim.icon className={`mb-2 transition-transform group-active:scale-90 ${activeSims.includes(sim.id) ? sim.color : 'text-slate-400'}`} size={24} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSims.includes(sim.id) ? sim.color : 'text-slate-500'}`}>
                    {sim.id}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t.cp_selfHealing}</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Active</span>
                </div>
              </div>
              <div className="space-y-3 h-48 overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <Clock size={10} className="mt-1 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className={`text-[10px] font-bold leading-tight ${
                          log.type === 'error' ? 'text-red-600' : 
                          log.type === 'warn' ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {log.msg}
                        </p>
                        <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">{log.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* National API Gateway */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Share2 className="text-indigo-400" size={20} />
                </div>
                <h3 className="font-black tracking-tight">{t.cp_nationalApiGateway}</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Active Connectors', value: '4,291', color: 'text-emerald-400' },
                  { label: 'Avg Latency', value: '84ms', color: 'text-indigo-400' },
                  { label: 'Throughput', value: '22k/s', color: 'text-indigo-400' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-xl font-black tracking-tighter ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Middle Columns: Intelligence & Infrastructure */}
        <div className="lg:col-span-3 space-y-8">
          {/* Sovereign Intelligence Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <Globe className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">{t.cp_sovereignIntelligence}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">National Health Brain v4.2</p>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics}>
                    <defs>
                      <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resilience" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRes)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">R0 Factor</p>
                  <p className="text-xl font-black tracking-tighter text-slate-900">0.82</p>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Stable</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resource Opt.</p>
                  <p className="text-xl font-black tracking-tighter text-slate-900">94.8%</p>
                  <div className="flex items-center gap-1 text-indigo-600">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Peak</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Predictive Acc.</p>
                  <p className="text-xl font-black tracking-tighter text-slate-900">99.1%</p>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">{t.cp_zeroTrustAudit}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forensic Engine: Enabled</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 h-[340px] overflow-y-auto custom-scrollbar pr-2">
                {[
                  { user: 'Identity Node 48', action: 'EHR Access', risk: 'Low', time: 'Just now' },
                  { user: 'Public API v2', action: 'Batch Read', risk: 'Medium', time: '2m ago' },
                  { user: 'Researcher (X81)', action: 'Query Exec', risk: 'Low', time: '5m ago' },
                  { user: 'Unknown IP (Edge)', action: 'Auth Attempt', risk: 'High', time: '12m ago' },
                  { user: 'Admin Console', action: 'Key Rotation', risk: 'Low', time: '18m ago' },
                  { user: 'System Service', action: 'Cache Flush', risk: 'Low', time: '25m ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                    {item.risk === 'High' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.risk === 'High' ? 'bg-red-500/10 text-red-600' : 
                        item.risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 
                        'bg-slate-200 text-slate-600'
                      }`}>
                        <Lock size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{item.user}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.risk === 'High' ? 'bg-red-500 text-white' : 
                        item.risk === 'Medium' ? 'bg-amber-500 text-white' : 
                        'bg-emerald-500 text-white'
                      }`}>
                        {item.risk}
                      </span>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Facility Digital Twin */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Database className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">{t.cp_digitalTwin}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-Time Facility Orchestration</p>
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center pointer-events-none`}>
                  <Search className="text-slate-400" size={16} />
                </div>
                <input
                  type="text"
                  placeholder={t.searchFacility}
                  value={digitalTwinSearch}
                  onChange={(e) => setDigitalTwinSearch(e.target.value)}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { name: 'Al-Basrah General', status: 'Optimal', pressure: 68, power: 'Stable', type: 'Hospital' },
                { name: 'Baghdad Central Lab', status: 'Peak Load', pressure: 92, power: 'Stable', type: 'Lab' },
                { name: 'Erbil Med-Node 12', status: 'Optimal', pressure: 42, power: 'Local', type: 'Edge' },
                { name: 'Najaf Diagnostic', status: 'Maintenance', pressure: 15, power: 'Backup', type: 'Hospital' },
                { name: 'Mosul Rapid Care', status: 'Optimal', pressure: 74, power: 'Stable', type: 'Hospital' },
                { name: 'Sulaymaniyah Lab Core', status: 'Optimal', pressure: 58, power: 'Stable', type: 'Lab' },
                { name: 'Kirkuk Clinical Node', status: 'Offline', pressure: 0, power: 'Failure', type: 'Edge' },
                { name: 'Dhi Qar Health Grid', status: 'Optimal', pressure: 81, power: 'Stable', type: 'Lab' },
              ].filter(f => f.name.toLowerCase().includes(digitalTwinSearch.toLowerCase())).map((facility, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      facility.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-600' :
                      facility.status === 'Peak Load' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-200 text-slate-400'
                    }`}>
                      {facility.type === 'Hospital' ? <Activity size={20} /> : facility.type === 'Lab' ? <Microscope size={20} /> : <Share2 size={20} />}
                    </div>
                    {facility.status === 'Optimal' ? <CheckCircle2 className="text-emerald-500" size={16} /> : <AlertTriangle className="text-amber-500" size={16} />}
                  </div>
                  
                  <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{facility.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{facility.type}</p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pressure Load</span>
                        <span className="text-xs font-black text-slate-900">{facility.pressure}%</span>
                      </div>
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${facility.pressure}%` }}
                          className={`h-full ${facility.pressure > 90 ? 'bg-red-500' : facility.pressure > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={10} className={facility.power === 'Failure' ? 'text-red-500' : 'text-amber-500'} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{facility.power}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase text-indigo-600`}>{facility.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
