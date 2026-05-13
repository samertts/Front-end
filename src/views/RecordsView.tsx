import { Plus, Search, Filter, MoreHorizontal, User, ChevronRight, Activity, ShieldAlert, Heart, CheckCircle2, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/offlineDb';
import { PatientService } from '../services/patientService';
import { useEffect, useState } from 'react';

export function RecordsView() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = useLiveQuery(
    async () => {
      const all = await PatientService.getAllPatients();
      if (!searchTerm) return all;
      return all.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [searchTerm]
  );

  const isOffline = !navigator.onLine;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Critical':
        return {
          color: 'text-red-700 bg-red-50 border-red-100',
          dot: 'bg-red-500',
          icon: <ShieldAlert size={12} className="mr-1.5" />
        };
      case 'Active':
        return {
          color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
          dot: 'bg-indigo-500',
          icon: <Activity size={12} className="mr-1.5" />
        };
      case 'Stable':
        return {
          color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          dot: 'bg-emerald-500',
          icon: <Heart size={12} className="mr-1.5" />
        };
      case 'Recovered':
        return {
          color: 'text-slate-700 bg-slate-50 border-slate-100',
          dot: 'bg-slate-400',
          icon: <CheckCircle2 size={12} className="mr-1.5" />
        };
      default:
        return {
          color: 'text-slate-700 bg-slate-50 border-slate-100',
          dot: 'bg-slate-400',
          icon: null
        };
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">{t.healthRecords}</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{t.clinicalDatabase}</h2>
          <p className="text-sm text-slate-400 font-medium mt-2">{t.manageMonitorHealth}</p>
        </div>
        <button 
          onClick={() => navigate('/citizen/register')}
          className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={18} />
          {t.addPatient}
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="px-8 py-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div className="relative w-full sm:w-96 flex items-center">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPatientPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
             {isOffline && (
               <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-[10px] font-black uppercase tracking-widest">
                 <WifiOff size={14} />
                 <span>Viewing Offline Cache</span>
               </div>
             )}
             <div className="flex items-center gap-3 w-full sm:w-auto">
               <button className="flex-1 sm:flex-none px-4 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                 <Filter size={16} />
                 {t.filters}
               </button>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={cn("w-full", isRtl ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 border-r border-slate-100 uppercase tracking-widest">{t.identSubject}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 border-r border-slate-100 uppercase tracking-widest">NHID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 border-r border-slate-100 uppercase tracking-widest">{t.age}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 border-r border-slate-100 uppercase tracking-widest">{t.bloodType}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 border-r border-slate-100 uppercase tracking-widest">{t.status}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}</th>
                <th className="px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients?.map((patient, i) => {
                const statusCfg = getStatusConfig(patient.status);
                return (
                  <tr 
                    key={patient.id} 
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    className="hover:bg-indigo-50/30 transition-all cursor-pointer group relative"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                          <User size={20} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{patient.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tighter mt-1">{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100 group-hover:bg-indigo-100 transition-all">
                        GULA-{patient.nationalId}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-600">{patient.age}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black border border-slate-200">{patient.bloodType}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        statusCfg.color
                      )}>
                        <div className={cn("w-2 h-2 rounded-full mr-2", isRtl ? "ml-2 mr-0" : "mr-2", "animate-pulse", statusCfg.dot)} />
                        {statusCfg.icon}
                        {patient.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-slate-600">{patient.lastVisit}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black mt-1">{t.lastUpdate}</p>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center justify-end gap-2 pr-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-indigo-600 border border-slate-100">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.showingResults} 4 of 482</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-not-allowed">{t.prev}</button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">{t.next}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
