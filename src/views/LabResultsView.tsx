import { Microscope, FileText, Download, CheckCircle2, AlertCircle, FileSearch, Plus, Loader2, ShieldCheck, X, Sparkles, BrainCircuit, TrendingUp, Activity as ActivityIcon, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AISummary } from '../components/AISummary';
import { toast } from 'sonner';
import { analyzeLabTrends } from '../services/aiService';
import Markdown from 'react-markdown';

interface LabReport {
  id?: string;
  testName: string;
  date: any;
  status: 'Normal' | 'Critical' | 'Action Required';
  findings: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  patientId: string;
}

export function LabResultsView() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [globalSummary, setGlobalSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'lab_results'), 
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          testName: data.testName || data.title || "Unknown Test"
        } as LabReport;
      });
      setReports(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'lab_results');
    });

    return () => unsubscribe();
  }, []);

  const generateGlobalSummary = async () => {
    if (reports.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await analyzeLabTrends(reports.map(r => ({
        test: r.testName,
        findings: r.findings,
        status: r.status,
        date: r.date?.toDate?.()?.toLocaleDateString() || 'N/A'
      })));
      setGlobalSummary(summary.split('---')[0]);
    } catch (error) {
      toast.error("Failed to generate global summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

   const addTestReport = async (preset?: 'glucose') => {
    if (!auth.currentUser) return;
    
    setIsAdding(true);
    try {
      let testName = newTestName.trim() || 'General Chemistry';
      let status: 'Normal' | 'Critical' | 'Action Required' = 'Normal';
      let findings = "All parameters within normal limits.";
      let value = "95";
      let unit = "mg/dL";
      let range = "70 - 99";

      if (preset === 'glucose') {
        testName = 'Blood Glucose (Fasting)';
        status = 'Critical';
        findings = "Severely elevated glucose levels detected. Patient shows signs of potential acute hyperglycemic crisis. Immediate insulin protocol check recommended.";
        value = "450";
        unit = "mg/dL";
        range = "70 - 99";
      } else {
        // Random simulation for other cases
        const statuses: ('Normal' | 'Critical' | 'Action Required')[] = ['Normal', 'Critical', 'Action Required'];
        status = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (status === 'Critical') {
          findings = "Severely elevated levels detected. Urgent clinical review required.";
          value = "380";
        } else if (status === 'Action Required') {
          findings = "Borderline high. Recommend lifestyle adjustment.";
          value = "105";
        }
      }

      await addDoc(collection(db, 'lab_results'), {
        testName,
        title: testName,
        findings,
        status,
        value,
        unit,
        referenceRange: range,
        date: serverTimestamp(),
        patientId: "TEST-001",
        ownerId: auth.currentUser.uid
      });
      setNewTestName("");
      setShowSimulateModal(false);
      toast.success('Simulation successful: Result added', {
        description: `${testName} added to the records.`
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'lab_results');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full">
        <div className="editorial-stack">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{t.laboratoryReports}</span>
          <h2 className="font-headline text-3xl lg:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Diagnostics Hub</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={generateGlobalSummary}
            disabled={isGeneratingSummary || reports.length === 0}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingSummary ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Smart Summary
          </button>
          <button 
            onClick={() => setShowSimulateModal(true)}
            disabled={isAdding}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Simulate Lab Data
          </button>
        </div>
      </div>

      <AnimatePresence>
        {globalSummary && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative shadow-2xl shadow-indigo-200 mb-8 overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                  <Sparkles size={120} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <BrainCircuit size={24} />
                      </div>
                      <h3 className="text-xl font-black italic tracking-tight">Intelligence Cloud Insights</h3>
                    </div>
                    <button onClick={() => setGlobalSummary(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="markdown-body text-indigo-50 text-sm leading-relaxed prose-invert">
                    <Markdown>{globalSummary}</Markdown>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Clinical Intelligence v2.1</div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Cross-Report Trend Analysis</div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimulateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900 italic tracking-tighter uppercase">Analytical Simulation</h3>
                <button onClick={() => setShowSimulateModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3">
                   <button 
                     onClick={() => addTestReport('glucose')}
                     disabled={isAdding}
                     className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between group hover:bg-rose-100 transition-all text-left"
                   >
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                            <ActivityIcon size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight">Simulate Hyperglycemia</p>
                            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">Blood Glucose: 450 mg/dL</p>
                         </div>
                      </div>
                      <ArrowRight size={18} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-100"></div>
                   </div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                      <span className="bg-white px-4">Custom Analysis</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5">{t.testName}</label>
                    <input 
                      autoFocus
                      type="text"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      placeholder="e.g. Lipids Profile"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-medium text-slate-900 shadow-inner"
                      onKeyDown={(e) => e.key === 'Enter' && addTestReport()}
                    />
                  </div>
                  
                  <button 
                    onClick={() => addTestReport()}
                    disabled={isAdding}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                  >
                    {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Execute Random Sync
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {reports.map((report, i) => (
              <motion.div 
                key={report.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group",
                  report.status === 'Critical' ? 'border-rose-200 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/20' : 
                  report.status === 'Action Required' ? 'border-amber-200 shadow-md shadow-amber-500/5' :
                  'border-slate-100 shadow-sm hover:shadow-md'
                )}
              >
                {/* Visual Status Indicator Bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  report.status === 'Critical' ? 'bg-rose-600' :
                  report.status === 'Action Required' ? 'bg-amber-500' :
                  'bg-emerald-500'
                )} />

                {report.status === 'Critical' && (
                  <motion.div 
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-rose-600 pointer-events-none"
                  />
                )}

                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0",
                    report.status === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                    report.status === 'Action Required' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                    'bg-emerald-50 border-emerald-100 text-emerald-600'
                  )}>
                    {report.status === 'Normal' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                       <h4 className="text-base font-bold text-slate-900 truncate max-w-[150px]">{report.testName}</h4>
                       {report.status === 'Critical' && (
                         <span className="animate-pulse bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">Vital</span>
                       )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] text-slate-400 font-mono tracking-tighter truncate max-w-[80px]">{report.id}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase whitespace-nowrap">
                        {report.date?.toDate ? report.date.toDate().toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 md:px-8 space-y-3 relative z-10">
                  <div className="flex items-end gap-3 mb-2">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Result Value</span>
                        <div className="flex items-baseline gap-1">
                           <span className={cn(
                             "text-2xl font-black tracking-tight",
                             report.status === 'Critical' ? 'text-rose-600' :
                             report.status === 'Action Required' ? 'text-amber-600' :
                             'text-slate-900'
                           )}>
                             {report.value || "--"}
                           </span>
                           <span className="text-xs font-bold text-slate-400">{report.unit || ""}</span>
                        </div>
                     </div>
                     
                     {report.referenceRange && (
                       <div className="flex flex-col ml-4">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Ref. Range</span>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                             {report.referenceRange}
                          </span>
                       </div>
                     )}

                     {/* Delta Check Visualization */}
                     {reports.slice(i + 1).find(r => r.testName === report.testName) && (
                       <div className="flex flex-col ml-4">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Delta Δ</span>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black",
                            (() => {
                              const prev = reports.slice(i + 1).find(r => r.testName === report.testName);
                              const diff = parseFloat(report.value || '0') - parseFloat(prev?.value || '0');
                              return diff > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100";
                            })()
                          )}>
                             {(() => {
                               const prev = reports.slice(i + 1).find(r => r.testName === report.testName);
                               const diff = parseFloat(report.value || '0') - parseFloat(prev?.value || '0');
                               return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                             })()}
                             {(() => {
                               const prev = reports.slice(i + 1).find(r => r.testName === report.testName);
                               const diff = parseFloat(report.value || '0') - parseFloat(prev?.value || '0');
                               return diff > 0 ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />;
                             })()}
                          </div>
                       </div>
                     )}

                     {(report.status === 'Critical' || report.status === 'Action Required') && (
                       <div className={cn(
                         "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 mb-0.5",
                         report.status === 'Critical' ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-800"
                       )}>
                          {report.status === 'Critical' ? "H+" : "H"}
                          <TrendingUp size={10} />
                       </div>
                     )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2 italic">
                     <FileText size={12} className="inline mr-1 opacity-50" />
                     {report.findings}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-1">
                    <AISummary findings={report.findings} testTitle={report.testName} />
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-tight">
                       <ShieldCheck size={10} />
                       Verified 
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-100">
                    <Download size={16} />
                    {t.exportReport}
                  </button>
                  <button className="p-3 bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100">
                    <FileSearch size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {reports.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Microscope size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No laboratory records found in the intelligence cloud.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
