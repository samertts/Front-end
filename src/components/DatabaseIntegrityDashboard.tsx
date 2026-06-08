import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Cpu, 
  FileText, 
  Zap, 
  TrendingUp, 
  RefreshCw, 
  Layers,
  ShieldCheck,
  Binary
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  DatabaseIntegrityService, 
  SQLiteDbState, 
  WalCheckResult, 
  IndexAuditResult 
} from '../services/DatabaseIntegrityService';

interface DatabaseIntegrityDashboardProps {
  dbId: string;
  dbState: SQLiteDbState;
  onRefresh?: () => void;
}

interface HistoricalData {
  timestamp: string;
  walSize: number;
  dbSize: number;
  uncommitted: number;
  fragmentation: number;
}

export const DatabaseIntegrityDashboard: React.FC<DatabaseIntegrityDashboardProps> = ({
  dbId,
  dbState,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wal' | 'btree'>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [walSecurity, setWalSecurity] = useState<WalCheckResult | null>(null);
  const [indexAudit, setIndexAudit] = useState<IndexAuditResult | null>(null);
  const [history, setHistory] = useState<HistoricalData[]>([]);

  // Calculate sector counts for visualization
  const sectorSummary = React.useMemo(() => {
    const counts = { free: 0, data: 0, index: 0, wal: 0, corrupt: 0 };
    dbState.pageMap.forEach(cell => {
      if (cell === 0) counts.free++;
      else if (cell === 1) counts.data++;
      else if (cell === 2) counts.index++;
      else if (cell === 3) counts.wal++;
      else if (cell === 4) counts.corrupt++;
    });

    const total = 64;
    return [
      { name: 'Free Space', value: counts.free, color: '#94a3b8', raw: cellText(0) },
      { name: 'Data Records', value: counts.data, color: '#10b981', raw: cellText(1) },
      { name: 'B-Tree Index', value: counts.index, color: '#818cf8', raw: cellText(2) },
      { name: 'Active WAL', value: counts.wal, color: '#f59e0b', raw: cellText(3) },
      { name: 'Corrupt Page', value: counts.corrupt, color: '#f43f5e', raw: cellText(4) }
    ].filter(item => item.value > 0);
  }, [dbState.pageMap]);

  function cellText(type: number): string {
    switch(type) {
      case 0: return 'Empty Space';
      case 1: return 'Data Records';
      case 2: return 'Index B-Tree';
      case 3: return 'Write-Ahead Log (WAL)';
      case 4: return 'Corrupt Sector';
      default: return 'Sector';
    }
  }

  // Effect to load live deep diagnostic results from the DatabaseIntegrityService
  useEffect(() => {
    let active = true;
    const fetchDiagnostics = async () => {
      setLoading(true);
      try {
        const [walResult, indexResult] = await Promise.all([
          DatabaseIntegrityService.verifyWalSecurity(dbId),
          DatabaseIntegrityService.performIndexAudit(dbId)
        ]);
        if (active) {
          setWalSecurity(walResult);
          setIndexAudit(indexResult);
        }
      } catch (err) {
        console.error('Failed to run detailed diagnostics', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDiagnostics();
    return () => {
      active = false;
    };
  }, [dbId, dbState.status, dbState.walSize, dbState.uncommittedTransactions, dbState.fragmentation]);

  // Record historical points for real-time tracking
  useEffect(() => {
    const newPoint: HistoricalData = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      walSize: dbState.walSize,
      dbSize: dbState.dbSize,
      uncommitted: dbState.uncommittedTransactions,
      fragmentation: dbState.fragmentation
    };

    setHistory(prev => {
      const updated = [...prev, newPoint];
      // Keep last 10 points
      if (updated.length > 10) {
        return updated.slice(updated.length - 10);
      }
      return updated;
    });
  }, [dbState.walSize, dbState.dbSize, dbState.uncommittedTransactions, dbState.fragmentation]);

  const getStatusColor = () => {
    switch (dbState.status) {
      case 'healthy':
        return 'text-emerald-500 border-emerald-500/20 bg-emerald-50';
      case 'fragmented_index':
        return 'text-amber-500 border-amber-500/20 bg-amber-50';
      default:
        return 'text-rose-500 border-rose-500/20 bg-rose-50 animate-pulse';
    }
  };

  const getStatusLabel = () => {
    switch (dbState.status) {
      case 'healthy':
        return 'Sovereign Consensus Certified';
      case 'corrupt_wal_header':
        return 'WAL Header Signature Mismatch';
      case 'power_loss_dirty':
        return 'Power Interruption Inconsistencies';
      case 'orphaned_wal':
        return 'Orphaned Journal Diverged';
      case 'fragmented_index':
        return 'High Index Degradation Warning';
      default:
        return 'Unchecked State';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[2rem] shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Sovereign DB Real-Time Integrity Analyzer</h3>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Live-Consuming DatabaseIntegrityService Probes</p>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-[11px] font-black uppercase tracking-wider ${getStatusColor()}`}>
          <div className={`w-2 h-2 rounded-full ${dbState.status === 'healthy' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
          <span>{getStatusLabel()}</span>
        </div>
      </div>

      {/* TABS Selector */}
      <div className="flex gap-2.5 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/30">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider select-none cursor-pointer transition-all flex items-center justify-center gap-1.5
            ${activeTab === 'overview' 
              ? 'bg-white text-indigo-900 shadow-sm font-black' 
              : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Activity size={13} /> Sector Overview
        </button>
        <button
          onClick={() => setActiveTab('wal')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider select-none cursor-pointer transition-all flex items-center justify-center gap-1.5
            ${activeTab === 'wal' 
              ? 'bg-white text-indigo-900 shadow-sm font-black' 
              : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Lock size={13} /> WAL Journaling Security
        </button>
        <button
          onClick={() => setActiveTab('btree')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider select-none cursor-pointer transition-all flex items-center justify-center gap-1.5
            ${activeTab === 'btree' 
              ? 'bg-white text-indigo-900 shadow-sm font-black' 
              : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Layers size={13} /> B-Tree Indices Structure
        </button>
      </div>

      {/* MAIN VISUALIZATION STAGE */}
      <div className="min-h-[260px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-indigo-600" />
            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Querying diagnostic probes...</p>
          </div>
        )}

        {/* TAB 1: SECTOR OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sector Disk Breakdown Custom Pie Chart */}
            <div className="flex flex-col justify-between border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <span>Disk Allocation Distribution</span>
                <span className="font-mono text-[9px] text-indigo-600">64-Sector Cluster representation</span>
              </div>
              
              <div className="h-44 w-full flex items-center justify-center mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorSummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sectorSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} 
                      itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends with percentages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 mt-2 text-[9px] font-extrabold uppercase text-slate-500">
                {sectorSummary.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}: {((item.value / 64) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Size & Transactions History Flow Chart */}
            <div className="flex flex-col justify-between border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <span>WAL Size & Write Buffers Flow</span>
                <span className="flex items-center gap-1 text-[9px] font-sans text-rose-500 animate-pulse lowercase font-bold">
                  ● real-time diagnostics stream
                </span>
              </div>

              <div className="h-44 w-full mt-2">
                {history.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorUncommitted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 8, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 8, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="walSize" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWal)" name="WAL Size (KB)" />
                      <Area type="monotone" dataKey="uncommitted" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUncommitted)" name="Uncommitted TXs" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center flex-col text-slate-400 text-xs">
                    <TrendingUp size={20} className="mb-1" />
                    Preparing dynamic trend metrics...
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest pt-2 border-t border-slate-100 mt-2">
                <span>Active Transactions Buffer</span>
                <span className="text-slate-700">{dbState.uncommittedTransactions} Block(s) pending checkpoint</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: WAL WRITING AND HEADER SECURITY */}
        {activeTab === 'wal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card A: WAL Storage Size Block */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Journal Cache Allocation</p>
                    <Binary className="text-amber-500" size={15} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{walSecurity?.sizeKb ?? dbState.walSize} <span className="text-xs font-bold text-slate-400 font-mono">KB</span></h4>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 leading-normal">
                  Consolidation coefficient: <span className="font-mono text-slate-700 font-bold">{((dbState.walSize / dbState.dbSize) * 100).toFixed(1)}%</span> of total database payload size.
                </div>
              </div>

              {/* Card B: Magic Header Signature Verification */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Consensus Signature Verification</p>
                    <ShieldCheck className={walSecurity?.headerValid ? "text-emerald-500" : "text-rose-500 animate-pulse"} size={16} />
                  </div>
                  <h4 className="text-lg font-black font-mono text-slate-800 tracking-tight mt-2.5">
                    {walSecurity?.magicNumber ?? '0x377F0621'}
                  </h4>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 leading-normal">
                  Signature Verification: <span className={`font-black uppercase ${walSecurity?.headerValid ? 'text-emerald-500' : 'text-rose-600 animate-pulse'}`}>
                    {walSecurity?.headerValid ? 'VALIDATED SYNCED (0x21)' : 'CORRUPTED WAL MAGIC BYTES'}
                  </span>
                </div>
              </div>

              {/* Card C: Integrity Status Mapping */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Checkpoint Pipeline State</p>
                    <Cpu className="text-indigo-500" size={15} />
                  </div>
                  <h4 className="text-md font-black uppercase text-indigo-905 tracking-wide mt-3 truncate">
                    {walSecurity?.checkpointStatus ?? 'synced'}
                  </h4>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 leading-normal">
                  Uncommitted transaction sequences: <span className="font-bold text-slate-700 font-mono">{dbState.uncommittedTransactions} blocks</span> on system stack.
                </div>
              </div>

            </div>

            {/* Header Inspection Deep Diagnostic Logs Log-rail */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2 max-h-36 overflow-y-auto">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none border-b border-slate-800 pb-2 flex justify-between items-center">
                <span>[WAL EXPLANATIVE COMPRESSED TELEMETRY ENGINE]</span>
                <span className="text-teal-400 animate-pulse">● active monitoring</span>
              </p>
              {walSecurity && walSecurity.logs ? (
                walSecurity.logs.map((log, idx) => (
                  <div key={idx} className={`p-1 leading-relaxed rounded ${log.includes('[CRITICAL]') ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 pl-2' : log.includes('[WARNING]') ? 'bg-amber-950/40 text-amber-300' : ''}`}>
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">Injecting diagnostic probes inside clinical assets sandboxes...</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: B-TREE INDEX AND SCHEMATIC DEEP CHECKS */}
        {activeTab === 'btree' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Index fragmentation breakdown */}
              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-405 uppercase tracking-wider">B-Tree Nodes Splitting & Fragmentation</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">High fragmentation cascades slow traversal limits in clinical search engines.</p>
                </div>

                <div className="my-3 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>INDEX HEALTH MATRIX SCORE</span>
                    <span className={dbState.fragmentation > 15 ? 'text-rose-500' : 'text-emerald-500'}>
                      {dbState.fragmentation > 40 ? 'DEGRADED STRUCTURE' : 'Fully Balanced'}
                    </span>
                  </div>
                  
                  {/* Progress bar representing fragmentation */}
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-700 ${dbState.fragmentation > 40 ? 'bg-rose-500' : dbState.fragmentation > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, dbState.fragmentation)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[8.5px] font-mono text-slate-400 pt-1">
                    <span>0% (Perfect)</span>
                    <span>15% (Threshold Limit)</span>
                    <span>100% (Bit-Rot Spikers)</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between items-center">
                  <span>Current Index Fragmentation Rate</span>
                  <span className="font-bold text-slate-800">{dbState.fragmentation}%</span>
                </div>
              </div>

              {/* B-Tree Constraints audit reports */}
              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-405 uppercase tracking-wider">Constraint Alignments & Index Keys Depth</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">Tracks whether physical references are correctly mapped in indexes.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2 text-center">
                  <div className="p-2 border border-slate-100 rounded-xl bg-white">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unresolved Keys</p>
                    <p className={`text-xl font-black mt-1 ${dbState.unresolvedKeys > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {dbState.unresolvedKeys}
                    </p>
                  </div>
                  <div className="p-2 border border-slate-100 rounded-xl bg-white">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Index Tree Depth</p>
                    <p className={`text-xl font-black mt-1 ${dbState.status === 'fragmented_index' ? 'text-amber-600' : 'text-slate-800'}`}>
                      {dbState.status === 'fragmented_index' ? '5 Lay' : '2 Lay'}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between items-center">
                  <span>Re-indexing action urgency</span>
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider
                    ${dbState.fragmentation > 15 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    {dbState.fragmentation > 15 ? 'CRITICAL REQUIREMENT' : 'OPTIMAL CALIBRATION'}
                  </span>
                </div>
              </div>

            </div>

            {/* B-tree verification report outputs */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none border-b border-slate-800 pb-2">
                [B-TREE ALIGNMENT STRUCTURE COMPREHENSIVE AUDIT REPORT]
              </p>
              {indexAudit && indexAudit.logs ? (
                indexAudit.logs.map((log, idx) => (
                  <div key={idx} className={`p-1 leading-relaxed rounded ${log.includes('[DEGRADED]') ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 pl-2' : ''}`}>
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">Reading indices catalog lists...</p>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Explanation Footer Alert badge */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/40 text-[11px] font-semibold text-slate-700 leading-relaxed flex items-center gap-3">
        <Zap className="text-indigo-600 animate-pulse shrink-0" size={16} />
        <div>
          <span className="font-bold text-indigo-905">Real-time Telemetry:</span> This visualization dashboard directly binds to underlying virtual SQLite subsystems. Triggering chaos scenarios simulates exact hardware errors which can then be synchronized and healed via standard SQLITE operators.
        </div>
      </div>

    </div>
  );
};
