import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, Edit2, Trash2, 
  Beaker, Clock, BadgeDollarSign, Activity,
  ChevronRight, Save, X, Layers, Settings,
  FlaskConical, Thermometer, Zap
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabTestDefinition, LabTestCategory } from '../../types/lab';
import { LabAutomationService } from '../../services/lab/LabAutomationService';
import { cn } from '../../lib/utils';

export function TestManager() {
  const { t } = useLanguage();
  const [tests, setTests] = useState<LabTestDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<LabTestCategory | 'all'>('all');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTestDefinition | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    const data = await LabAutomationService.getTestCatalog();
    setTests(data);
    setLoading(false);
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: LabTestCategory[] = ['hematology', 'biochemistry', 'immunology', 'molecular', 'microbiology', 'toxicology'];

  return (
    <div className="space-y-8 p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
            Test <span className="text-indigo-600">Catalog</span> Manager
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
            Definitive Protocol Management • GULA Lab Systems
          </p>
        </div>
        <button 
          onClick={() => setIsAddingMode(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Protocol
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search protocols, codes, or methodologies..."
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
            onClick={() => setFilterCategory('all')}
            className={cn(
              "px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
              filterCategory === 'all' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
            )}
          >
            All Disciplines
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                filterCategory === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTests.map((test, index) => (
            <motion.div 
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden"
            >
              {/* Bg Accent */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <FlaskConical size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Beaker size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{test.code}</span>
                        {!test.automated && (
                          <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Manual</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{test.name}</h3>
                    </div>
                  </div>
                  <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                    <Edit2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Turnaround Time</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 italic">{test.processingTimeMin} MIN</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <BadgeDollarSign size={12} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Market Price</span>
                    </div>
                    <p className="text-lg font-black text-indigo-600 italic">{test.price.toLocaleString()} IQD</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference Parameters</p>
                  {test.referenceRanges.map((range, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{range.gender} Normal Range</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{range.min} - {range.max}</span>
                        <span className="text-[10px] font-bold text-slate-400">{range.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protocol Active</span>
                   </div>
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                          <Settings size={12} className="text-slate-400" />
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Editor Modal Overlay (Simplified) */}
      <AnimatePresence>
        {isAddingMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
             >
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">New <span className="text-indigo-600">Protocol</span></h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specify clinical test parameters & reference metadata</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingMode(false)}
                    className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Activity size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Identification</span>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Nomenclature</label>
                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" placeholder="e.g. Glucose Tolerance Test" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Test Code</label>
                            <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase" placeholder="GTT" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                            <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none">
                              {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Settings size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Operation Dynamics</span>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 text-emerald-500">Processing Time</label>
                              <div className="relative">
                                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" placeholder="30" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Min</span>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 text-indigo-500">Service Fee</label>
                              <div className="relative">
                                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" placeholder="15000" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">IQD</span>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Specimen Collection Type</label>
                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" placeholder="e.g. Plasma, Saliva" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/30">
                   <button 
                    onClick={() => setIsAddingMode(false)}
                    className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all"
                   >
                     Cancel Draft
                   </button>
                   <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                     Deploy Protocol System-Wide
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
