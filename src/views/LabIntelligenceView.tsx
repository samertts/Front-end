import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Activity as ActivityIcon, 
  Send, 
  Sparkles, 
  AlertCircle, 
  Bot, 
  User, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Cpu, 
  Zap, 
  BrainCircuit, 
  Terminal, 
  Database, 
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Gauge,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  HardDrive,
  Globe,
  Languages,
  BookOpen,
  ArrowRight,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getClinicalInsight } from '../services/geminiService';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

interface DialectRule {
  phrase: string;
  translation: string;
  canonCode: string;
  details: string;
}

interface FaultScenario {
  id: string;
  name: string;
  impactNode: string;
  description: string;
  steps: string[];
}

export function LabIntelligenceView() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<{ 
    role: 'user' | 'ai'; 
    text: string; 
    image?: string;
    safetyCortex?: any;
    orchestrationTrace?: any[];
  }[]>([
    { 
      role: 'ai', 
      text: "GULA Sovereign Cognitive Core online. Cross-provincial Iraqi healthcare grids indexed. Emergency protocol layers initialized.",
      safetyCortex: {
        confidence_score: 1.00,
        uncertainty_score: 0.00,
        evidence_quality: "Nominal System Boot Core",
        hallucination_risk_score: 0.00,
        medical_risk_level: "informational",
        escalation_recommendation: "Operational baseline nominal. Standard digital security layers active.",
        retrieval_provenance: ["GULA Secure Kernel Core"],
        dialect_normalized_entities: {}
      },
      orchestrationTrace: [
        {
          step: "System Boot Alignment",
          status: "Nominal",
          service: "gateway/system_kernel",
          latencyMs: 140,
          output: "Sovereign cognitive core nodes loaded. Verification registries synchronized."
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Tabs representing different sections of vFinal Cognitive Directive
  const [activeTab, setActiveTab] = useState<'noc' | 'chat' | 'cortex' | 'resilience' | 'benchmarks'>('noc');
  
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [indexingProgress] = useState(99.4);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected message for detailed Safety Audit
  const [selectedAuditMessage, setSelectedAuditMessage] = useState<any>(null);

  // 1. Regional Nodes
  const [regionalNodes, setRegionalNodes] = useState([
    { id: 'bag', province: 'Baghdad Central Node', load: 82, nodes: 14, status: 'Active', latency: '8ms' },
    { id: 'bas', province: 'Basrah South Hub', load: 45, nodes: 8, status: 'Active', latency: '14ms' },
    { id: 'nin', province: 'Nineveh Regional Node', load: 68, nodes: 6, status: 'Active', latency: '12ms' },
    { id: 'erb', province: 'Erbil Kurdistan Hub', load: 32, nodes: 4, status: 'Active', latency: '11ms' }
  ]);

  // Adjust regional workload manually
  const balanceLoad = (id: string, newLoad: number) => {
    setRegionalNodes(prev => prev.map(n => n.id === id ? { ...n, load: Math.min(100, Math.max(0, newLoad)) } : n));
  };

  // 2. Iraqi dialect normalizer database
  const DIALECT_DICTIONS: DialectRule[] = [
    { phrase: "فحص سكر الشيبتنه", translation: "Elderly Glycated Hemoglobin Diagnostic", canonCode: "LOINC 4548-4 (HbA1c Blood)", details: "Colloquial phrase for monitoring paternal diabetes. High-priority metabolic pattern analysis triggered." },
    { phrase: "ألم بالصدر وبلعومي بلاويزه تلتهب", translation: "Acute Chest Distress & Chronic Tonsillitis", canonCode: "SNOMED 40611003 (Acute Tonsillitis)", details: "Arabic phonetic compounding. Requires urgent medical classification due to potential cardiovascular crossover." },
    { phrase: "تحليل دم كامل تفصيلي مال ابوي", translation: "Paternal Advanced Complete Blood Count", canonCode: "LOINC 58410-2 (CBC Panel)", details: "Traditional colloquial instruction requesting full leukocyte differentials." },
    { phrase: "ضغط دمه صاعد كلش", translation: "Severe Elevated Blood Pressure Status", canonCode: "LOINC 85354-9 (Blood Pressure Panel)", details: "Severe symptomatic status. Automatic safety threshold alerts routed to provincial physician queue." },
    { phrase: "فحص ادرار اعتيادي", translation: "Standard Routine Urinalysis", canonCode: "LOINC 50580-0 (Urinalysis Screen)", details: "Colloquial reference for baseline biochemical urinary analysis." },
    { key: "كلى", phrase: "فحص الكلية مالتها تعبانه", translation: "Compromised Renal Function Assessment", canonCode: "LOINC 24342-8 (Renal Function)", details: "Dialect indicator expressing suspected progressive nephropathy." }
  ] as any[];

  const [activePhoneticRule, setActivePhoneticRule] = useState<DialectRule | null>(DIALECT_DICTIONS[0]);

  // 3. Digital Twin Chaos Scenarios
  const FAULTS: FaultScenario[] = [
    { 
      id: 'bag_out', 
      name: "Inject Baghdad Central Link Outage", 
      impactNode: "Baghdad Central Node",
      description: "Tests GULA's immediate satellite link failover to Erbil APN networks to avoid regional downtime.",
      steps: [
        "Baghdad core fiber link offline... Zero signal detected.",
        "Automatic failover routine triggered. Graceful degradation active.",
        "Rerouting active medical queues to Erbil satellite transceiver.",
        "Erbil APN carrying 100% of telemetry. Traffic throttle active.",
        "Rollback protocol armed. Monitoring telemetry queues... Green."
      ]
    },
    { 
      id: 'bas_drift', 
      name: "Simulate Basrah Hematology Calibration Drift", 
      impactNode: "Basrah South Hub",
      description: "Tests automated self-healing firmware calibration triggers on blood analyzers to mitigate measurement offsets.",
      steps: [
        "Analyzing basal hematology counts... Alert: Calibration drift > 0.15 index.",
        "Isolating compromised device channels in Basrah Node 02.",
        "Applying predictive recovery corrections locally to telemetry stream.",
        "Injecting baseline compensation factors to restore reference ranges.",
        "Sovereign integrity check: NOMINAL. Auto-recalibration successful."
      ]
    },
    { 
      id: 'peak_over', 
      name: "Trigger Population Outbreak Simulation", 
      impactNode: "Nineveh Regional Node",
      description: "Injects rapid epidemic test arrivals to evaluate load shedding and localized buffer pooling.",
      steps: [
        "Atypical viral marker reports indexing from Mosul Central Lab.",
        "Incoming queue demand exceeds 200%. Load shedding active.",
        "Instantiating 800 additional virtual server containers across Erbil server grids.",
        "Regional cache synchronized. Epidemic telemetry isolated to protect standard diagnostic pipelines."
      ]
    }
  ];

  const [activeFailureLog, setActiveFailureLog] = useState<string[]>([]);
  const [runningChaosScenario, setRunningChaosScenario] = useState<string | null>(null);
  const [chaosProgress, setChaosProgress] = useState(0);

  const runScenario = (scenario: FaultScenario) => {
    setRunningChaosScenario(scenario.id);
    setActiveFailureLog([]);
    setChaosProgress(0);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < scenario.steps.length) {
        setActiveFailureLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${scenario.steps[currentStep]}`]);
        setChaosProgress(Math.round(((currentStep + 1) / scenario.steps.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setRunningChaosScenario(null);
      }
    }, 2000);
  };

  const [contextLayers] = useState([
    { id: 'hem', name: 'Hematology Pattern', active: true },
    { id: 'bio', name: 'Bio-Grid Telemetry', active: true },
    { id: 'gen', name: 'Genomic Markers', active: true },
    { id: 'inf', name: 'Infection Outbreaks', active: true },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle uploading of files/images for OCR/data processing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedImage) return;
    
    const userMessage = input || (attachedImage ? "OCR request: Review and normalize laboratory findings." : "");
    const imgData = attachedImage;
    
    setInput('');
    setAttachedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage, image: imgData || undefined }]);
    setIsTyping(true);

    const activeLayers = contextLayers.map(l => l.name);
    const context = `Active Sovereign Systems: ${activeLayers.join(', ')}. Contextual medical intelligence ready.`;
    
    const result = await getClinicalInsight(userMessage, context, imgData || undefined, language);
    
    const aiMsg = { 
      role: 'ai' as const, 
      text: result.text, 
      safetyCortex: result.safetyCortex,
      orchestrationTrace: result.orchestrationTrace
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setSelectedAuditMessage(aiMsg);
    setIsTyping(false);
  };

  // Pre-load Audit message at mount
  useEffect(() => {
    if (messages[0]) {
      setSelectedAuditMessage(messages[0]);
    }
  }, []);

  return (
    <div className="p-8 max-w-[1700px] mx-auto min-h-[calc(100vh-120px)] flex flex-col gap-8">
      {/* Dynamic Header with National Context Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe size={180} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl animate-pulse">
            <Cpu size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 font-mono">GULA Clinical Core</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-mono font-bold leading-none">Iraq Telework Ready</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1 italic leading-none font-headline font-semibold">
              Sovereign Medical <span className="text-indigo-400">Cognitive Infrastructure</span>
            </h1>
          </div>
        </div>

        {/* Live System stats */}
        <div className="flex flex-wrap gap-4 relative z-10 font-mono">
          <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-left">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Operational Security</span>
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mt-1">
              <ShieldCheck size={14} /> Zero Trust Active
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-left">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Auditability Index</span>
            <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5 mt-1">
              <FileCheck size={14} /> HL7/FHIR Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-[2rem] w-fit font-mono font-medium self-start">
        {[
          { id: 'noc', label: '1. National Ops Center', icon: ActivityIcon },
          { id: 'chat', label: '2. Clinical Reasoning', icon: Bot },
          { id: 'cortex', label: '3. Safety Cortex', icon: ShieldCheck },
          { id: 'resilience', label: '4. Digital Twin Chaos', icon: RefreshCw },
          { id: 'benchmarks', label: '5. Model Benchmarks', icon: Gauge },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all",
              activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
            )}
          >
             <tab.icon size={15} />
             {tab.label}
          </button>
        ))}
      </div>

      {/* Main viewport Container */}
      <div className="flex-1 bg-white min-h-[640px] rounded-[3rem] border border-slate-200/80 shadow-2xl relative overflow-hidden flex flex-col">
         <AnimatePresence mode="wait">
            {/* activeTab == noc */}
            {activeTab === 'noc' && (
              <motion.div
                key="noc"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10"
              >
                {/* Visual Bio-Grid Distribution */}
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column - Live Nodes Control */}
                  <div className="col-span-12 lg:col-span-8 bg-slate-900 text-white rounded-[3rem] p-8 lg:p-12 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                       <Server size={300} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic text-glow-indigo">Bio-Grid Regional Distribution</h3>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.25em] mt-3 italic">Autonomous load balancing layer active across Iraq clusters</p>
                       </div>
                       <div className="flex gap-2 shrink-0">
                          <div className="px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                             Satellite APN Uplink: Nominal
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                      {regionalNodes.map((reg) => (
                        <div key={reg.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] space-y-4">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div>
                                 <span className="text-lg font-black italic">{reg.province}</span>
                                 <span className="text-[9px] font-black text-white/40 uppercase ml-4 tracking-widest">{reg.nodes} Core Cluster Nodes Online</span>
                              </div>
                              <span className="text-xs font-mono font-black text-indigo-400 italic">Load: {reg.load}% • Ping: {reg.latency}</span>
                           </div>

                           {/* Load Balance Slider bar */}
                           <div className="flex items-center gap-4">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DRAG BALANCE</span>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={reg.load} 
                                onChange={(e) => balanceLoad(reg.id, Number(e.target.value))}
                                className="flex-1 accent-indigo-500 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                              />
                              <div className="h-6 w-12 bg-white/5 border border-white/10 text-center rounded-lg text-xs leading-6 font-mono font-bold">
                                {reg.load}%
                              </div>
                           </div>

                           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  reg.load > 85 ? "bg-rose-500" :
                                  reg.load > 65 ? "bg-amber-500" :
                                  "bg-emerald-500"
                                )}
                                style={{ width: `${reg.load}%` }}
                              />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Incident Console & Status Parameters */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                     {/* Dynamic Telemetry Box */}
                     <div className="bg-white border border-slate-200/80 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                              <TrendingUp size={20} />
                           </div>
                           <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">National Throughput</h4>
                        </div>
                        <div className="space-y-3">
                           <div className="text-4xl font-extrabold text-slate-900 italic tracking-tighter">124,502 <span className="text-xs font-mono font-semibold text-slate-500">records/hr</span></div>
                           <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Cross-provincial clinical queue monitoring registered nominal latency across the national grid.</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                           <span className="text-slate-400">P95 Analysis delay</span>
                           <span className="text-emerald-600 font-extrabold">240ms (Nominal)</span>
                        </div>
                     </div>

                     {/* Sovereign Verification Panel */}
                     <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white">
                                 <Terminal size={18} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Live Telemetry Out</span>
                           </div>
                           <div className="space-y-4 font-mono text-[10px] text-slate-400 max-h-[180px] overflow-y-auto">
                              <p>[12:01] Baghdad-N1: Diagnostic thread initialized</p>
                              <p className="text-indigo-400">[12:02] GULA Model: Dynamic dialect expansion verified</p>
                              <p>[12:04] Safety Cortex: Risk evaluation nominal</p>
                              <p className="text-emerald-400">[12:05] Audit Service: Signed transaction indexed on local db</p>
                           </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-[10px] text-slate-400">
                          Sovereign GULA system ensures compliance with Iraqi data boundary borders. Remote diagnostic metadata storage strictly forbidden.
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* activeTab == chat */}
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col lg:flex-row h-full min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100"
              >
                {/* Chat Panel */}
                <div className="flex-1 flex flex-col overflow-hidden">
                   {/* Messages Frame */}
                   <div 
                     ref={scrollRef}
                     className="flex-1 overflow-y-auto p-8 space-y-8 max-h-[480px] custom-scrollbar"
                   >
                     {messages.map((msg, i) => (
                       <div key={i} className="space-y-2">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex items-start gap-4 cursor-pointer group",
                              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                            onClick={() => msg.role === 'ai' && setSelectedAuditMessage(msg)}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105",
                              msg.role === 'user' ? "bg-slate-950 text-white" : "bg-indigo-600 text-white"
                            )}>
                              {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                            </div>
                            <div className={cn("flex flex-col gap-3 max-w-[80%]", msg.role === 'user' && "items-end")}>
                              {msg.image && (
                                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg max-w-sm">
                                  <img referrerPolicy="no-referrer" src={msg.image} alt="report-diagnostic" className="w-full h-auto" />
                                </div>
                              )}
                              <div className={cn(
                                "p-6 rounded-[2rem] text-xs leading-relaxed transition-all shadow-sm",
                                msg.role === 'user' 
                                  ? "bg-slate-950 text-white rounded-tr-none" 
                                  : "bg-slate-50 border border-slate-100 rounded-tl-none text-slate-800 hover:border-indigo-200"
                              )}>
                                <Markdown>{msg.text}</Markdown>
                              </div>

                              {/* Clickable Safety Cortex indicator */}
                              {msg.role === 'ai' && msg.safetyCortex && (
                                 <button 
                                   onClick={() => setSelectedAuditMessage(msg)}
                                   className={cn(
                                     "flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border shadow-sm self-start transition-colors",
                                     msg.safetyCortex.medical_risk_level === 'emergency-risk' 
                                       ? "text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100" 
                                       : "text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100"
                                   )}
                                 >
                                    <ShieldCheck size={12} />
                                    Cortex: {msg.safetyCortex.medical_risk_level} • Inspect
                                 </button>
                              )}
                            </div>
                          </motion.div>
                       </div>
                     ))}
                     {isTyping && (
                       <div className="flex items-center gap-3 text-indigo-500 font-mono">
                         <div className="flex gap-1.5">
                           <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                           <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                           <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest">GULA Sovereign Cortex Evaluating</span>
                       </div>
                     )}
                   </div>

                   {/* Input Bar */}
                   <div className="p-8 border-t border-slate-100 bg-slate-50/50 mt-auto">
                     <div className="relative group">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-slate-300">
                          <BrainCircuit size={18} />
                       </div>
                       <input 
                         type="text"
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                         placeholder="  Type clinical findings or ask questions (supports Arabic & Kurdish dialect)..."
                         className="w-full bg-white border border-slate-200 rounded-3xl py-5 px-14 text-xs focus:outline-none focus:border-indigo-600 transition-all shadow-md group-hover:border-slate-300"
                       />
                       <div className="absolute right-4 top-2 bottom-2 flex gap-2">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                            title="Upload Lab Document / OCR Test"
                          >
                             <Camera size={18} />
                          </button>
                          <button 
                            onClick={handleSend}
                            disabled={isTyping || (!input.trim() && !attachedImage)}
                            className="px-6 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
                          >
                             <Send size={15} />
                          </button>
                       </div>
                     </div>
                     {attachedImage && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100 max-w-md">
                           <ImageIcon size={20} className="text-indigo-600" />
                           <span className="text-[10px] font-mono font-bold text-slate-600 flex-1 truncate">Image loaded for OCR analyzer</span>
                           <button onClick={() => setAttachedImage(null)} className="text-slate-400 hover:text-rose-500">
                             <X size={16} />
                           </button>
                        </div>
                     )}
                   </div>
                </div>

                {/* Right Auditor Sidebar */}
                <div className="w-full lg:w-[420px] p-8 space-y-6 bg-slate-50/50 overflow-y-auto">
                   <div className="flex items-center gap-2">
                      <ShieldCheck className="text-indigo-600" size={20} />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Safety Cortex Auditor</h3>
                   </div>

                   {selectedAuditMessage ? (
                     <div className="space-y-6">
                        {/* Summary rating */}
                        <div className={cn(
                          "p-6 rounded-3xl border text-slate-900 shadow-sm",
                          selectedAuditMessage.safetyCortex?.medical_risk_level === 'emergency-risk' ? "bg-rose-50 border-rose-100" :
                          selectedAuditMessage.safetyCortex?.medical_risk_level === 'moderate-risk' ? "bg-amber-50 border-amber-100" :
                          "bg-indigo-50/30 border-indigo-100/50"
                        )}>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Medical Risk Classification</span>
                           <span className="text-lg font-black italic block mt-1 uppercase tracking-tight text-indigo-950">
                             {selectedAuditMessage.safetyCortex?.medical_risk_level || "Standard Informational"}
                           </span>
                           <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-2">
                             {selectedAuditMessage.safetyCortex?.escalation_recommendation || "System assessed: General clinical inquiry. No active physician escalation mandatory."}
                           </p>
                        </div>

                        {/* Metrical Details */}
                        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Core Cognitive Metrics</span>
                           
                           <div className="grid grid-cols-2 gap-4 text-left">
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-[8px] font-bold text-slate-400 uppercase block">Model Confidence</span>
                                 <span className="text-sm font-black text-indigo-600">
                                   {selectedAuditMessage.safetyCortex?.confidence_score ? `${(selectedAuditMessage.safetyCortex.confidence_score * 100).toFixed(0)}%` : "N/A"}
                                 </span>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-[8px] font-bold text-slate-400 uppercase block">Uncertainty index</span>
                                 <span className="text-sm font-black text-amber-600 font-mono">
                                   {selectedAuditMessage.safetyCortex?.uncertainty_score ? `${(selectedAuditMessage.safetyCortex.uncertainty_score * 100).toFixed(0)}%` : "N/A"}
                                 </span>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-[8px] font-bold text-slate-400 uppercase block">Hallucination risk</span>
                                 <span className="text-sm font-black text-rose-500 font-mono">
                                   {selectedAuditMessage.safetyCortex?.hallucination_risk_score !== undefined ? `${(selectedAuditMessage.safetyCortex.hallucination_risk_score * 100).toFixed(2)}%` : "N/A"}
                                 </span>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-[8px] font-bold text-slate-400 uppercase block">Evidence Quality</span>
                                 <span className="text-xs font-black text-slate-800 tracking-tight block truncate">
                                   {selectedAuditMessage.safetyCortex?.evidence_quality || "Verified High"}
                                 </span>
                              </div>
                           </div>
                        </div>

                         {/* Cognitive Orchestrator Flow matching Section 4 & 5 */}
                         {selectedAuditMessage.orchestrationTrace && (
                           <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] space-y-4 text-left text-white shadow-xl relative overflow-hidden mb-6">
                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                               <BrainCircuit size={80} />
                             </div>
                             <div className="flex items-center gap-2 text-indigo-400">
                               <BrainCircuit size={16} />
                               <span className="text-[9px] font-black uppercase tracking-widest block font-sans">Cognitive Orchestration Trace</span>
                             </div>
                             
                             <div className="relative border-l-2 border-white/10 pl-4 space-y-5 mt-2">
                               {selectedAuditMessage.orchestrationTrace.map((node: any, idx: number) => (
                                 <div key={idx} className="relative group">
                                   {/* Dot indicator */}
                                   <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500 border border-slate-900 group-hover:scale-125 transition-transform" />
                                   <div className="space-y-1 font-sans">
                                     <div className="flex items-center justify-between col-span-12">
                                       <span className="text-[10px] font-black text-white/95 leading-none">{node.step}</span>
                                       <span className="text-[8px] font-mono bg-white/10 px-1 py-0.5 rounded text-indigo-300 leading-none">{node.latencyMs}ms</span>
                                     </div>
                                     <span className="text-[8px] font-medium text-slate-400 font-mono tracking-tight block">
                                       Service: {node.service} • Status: <span className="text-indigo-400 font-bold">{node.status}</span>
                                     </span>
                                     <p className="text-[10px] text-slate-300 font-sans leading-relaxed pt-0.5 select-text font-normal">
                                       {node.output}
                                     </p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}

                        {/* Provenance attribution */}
                        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-3">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Evidence Retrieval Provenance</span>
                           <div className="space-y-2 font-mono text-[9px]">
                              {(selectedAuditMessage.safetyCortex?.retrieval_provenance || ["Local Reference Module", "LOINC Dictionary Codes"]).map((ref: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-indigo-50/25 border border-indigo-100/50 rounded-xl text-indigo-700">
                                   <Database size={12} />
                                   <span className="truncate">{ref}</span>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Semantic mappings */}
                        {selectedAuditMessage.safetyCortex?.dialect_normalized_entities && Object.keys(selectedAuditMessage.safetyCortex.dialect_normalized_entities).length > 0 && (
                          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-3">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Dialect Term Normalization</span>
                             <div className="space-y-2">
                               {Object.entries(selectedAuditMessage.safetyCortex.dialect_normalized_entities).map(([k, v]: any) => (
                                 <div key={k} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Colloquial "{k}"</span>
                                    <div className="text-xs font-bold text-slate-800 font-mono mt-1">{v}</div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="text-center py-20 text-slate-400">
                        <ShieldCheck size={40} className="mx-auto text-slate-300 mb-3" />
                        <span className="text-xs block font-mono">Select any AI insights message to inspect the sovereign safety audit trail in real-time.</span>
                     </div>
                   )}
                </div>
              </motion.div>
            )}

            {/* activeTab == cortex */}
            {activeTab === 'cortex' && (
              <motion.div
                key="cortex"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 p-8 lg:p-12 grid grid-cols-12 gap-8"
              >
                {/* Visual Arabic phonetic normalizer */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                   <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                         <Languages size={240} />
                      </div>
                      <div className="relative z-10 flex items-center gap-3 mb-8">
                         <div className="p-2.5 bg-indigo-600 rounded-2xl">
                            <Languages size={20} />
                         </div>
                         <h3 className="text-lg font-black uppercase tracking-tight italic text-glow-indigo">Iraqi Colloquial Phonetic Resolution</h3>
                      </div>

                      <p className="text-xs text-indigo-100/70 font-medium leading-relaxed mb-8 max-w-xl">
                        Traditional LLMs hallucinate medical instructions in Iraqi colloquial dialect or Arabizi. GULA's custom perception layer intercepts phrases and extracts canonical coding parameters deterministically.
                      </p>

                      {/* Selectable prompts list */}
                      <div className="space-y-3">
                         <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">CHOOSE Iraqi DIALECT QUERY TO MAP</span>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {DIALECT_DICTIONS.map((rule) => (
                             <button
                               key={rule.phrase}
                               onClick={() => setActivePhoneticRule(rule)}
                               className={cn(
                                 "p-4 rounded-2xl border text-left text-xs font-semibold hover:bg-white/10 hover:border-white/20 transition-all",
                                 activePhoneticRule?.phrase === rule.phrase 
                                   ? "bg-indigo-600/30 border-indigo-500/70 text-white" 
                                   : "bg-white/5 border-white/5 text-slate-300"
                               )}
                             >
                                <span className="block font-mono font-bold">"{rule.phrase}"</span>
                                <span className="text-[10px] text-indigo-300 font-normal mt-1 block tracking-tight line-clamp-1">{rule.translation}</span>
                             </button>
                           ))}
                         </div>
                      </div>
                   </div>

                   {/* Ontology metadata display card */}
                   {activePhoneticRule && (
                     <div className="bg-white border border-slate-200/80 p-8 rounded-[2.5rem] shadow-sm space-y-6 text-left">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                              <BookOpen size={18} />
                           </div>
                           <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">Semantic Extraction Schema</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                           <div>
                              <span className="text-slate-400 uppercase text-[9px] block">Extracted Colloquial Target</span>
                              <span className="text-lg font-extrabold text-slate-800 block mt-1">"{activePhoneticRule.phrase}"</span>
                           </div>
                           <div>
                              <span className="text-slate-400 uppercase text-[9px] block">Standard Clinical Translation</span>
                              <span className="text-sm font-semibold text-slate-600 block mt-1">{activePhoneticRule.translation}</span>
                           </div>
                           <div>
                              <span className="text-slate-400 uppercase text-[9px] block">Standardized Ontology parameters</span>
                              <span className="text-xs font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg inline-block mt-2">
                                {activePhoneticRule.canonCode}
                              </span>
                           </div>
                           <div>
                              <span className="text-slate-400 uppercase text-[9px] block">Resolution Action details</span>
                              <span className="text-[11px] text-slate-500 block leading-relaxed mt-2">{activePhoneticRule.details}</span>
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                {/* Left side Ontological Guidelines */}
                <div className="col-span-12 lg:col-span-5 bg-slate-50/50 rounded-[2.5rem] border border-slate-200/50 p-8 lg:p-10 space-y-6 flex flex-col justify-between">
                   <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                         <ShieldCheck className="text-indigo-600" size={20} />
                         <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Ontology Integrity Guidelines</h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                         All queries made to GULA must adhere to standard data boundary codes (Section 5). Direct retrieval mappings are calculated dynamically without client-side embeddings exposure.
                      </p>

                      <div className="space-y-4 pt-4">
                         {[
                           { system: 'SNOMED CT', version: 'v2026-03', coverage: 'Symptoms & Outbreaks' },
                           { system: 'LOINC Codes', version: 'v2.74', coverage: 'Biomarker Reference Intervals' },
                           { system: 'ICD-10-AM', version: 'v11', coverage: 'Sovereign Clinical Codes' }
                         ].map((sys, idx) => (
                           <div key={idx} className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                 <span className="font-extrabold text-slate-900 italic">{sys.system}</span>
                              </div>
                              <span className="text-slate-400 font-mono text-[10px]">{sys.coverage} ({sys.version})</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-6 bg-slate-950 text-white rounded-3xl space-y-2 text-left">
                      <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-mono">Governed Safety Rules Core</h4>
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                         Medical ontology rules override any predictive generative text. In the event of semantic conflict, GULA locks diagnostics to preserve physician governance.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}

            {/* activeTab == resilience */}
            {activeTab === 'resilience' && (
              <motion.div
                key="resilience"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 p-8 lg:p-12 space-y-10"
              >
                <div className="grid grid-cols-12 gap-8 text-left">
                  {/* Left Column - Active Fault Injector list */}
                  <div className="col-span-12 lg:col-span-6 space-y-6">
                     <div className="bg-slate-950 text-white p-10 rounded-[2.5rem] space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-600 text-white rounded-xl">
                              <RefreshCw size={18} />
                           </div>
                           <h3 className="text-base font-black uppercase italic tracking-tight text-glow-indigo">Chaos Engineering Simulator</h3>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-lg">
                           Section 13 & 17 mandates that GULA resilient systems undergo structured chaos testing. Inject simulated failures on our bio-grid to audit automatic failover loops.
                        </p>
                     </div>

                     <div className="space-y-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Available Failover Simulations</span>
                        {FAULTS.map((fault) => (
                          <div key={fault.id} className="p-6 bg-white border border-slate-200/80 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors">
                             <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase text-slate-900 font-mono italic">{fault.name}</h4>
                                <p className="text-[11px] text-slate-400 font-medium max-w-sm leading-snug">{fault.description}</p>
                             </div>
                             <button
                               onClick={() => runScenario(fault)}
                               disabled={runningChaosScenario !== null}
                               className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl hover:bg-slate-800 disabled:opacity-40 shrink-0 transition-all active:scale-95"
                             >
                                Inject Fault
                             </button>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Right Column - Healing Console */}
                  <div className="col-span-12 lg:col-span-6 bg-slate-900 border border-white/10 text-white rounded-[3rem] p-8 lg:p-10 flex flex-col h-full min-h-[480px]">
                     <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                           <h3 className="text-xs font-black uppercase tracking-widest">Self-Healing Console</h3>
                        </div>
                        {runningChaosScenario && (
                          <span className="px-3 py-1 bg-indigo-600 text-white font-mono text-[9px] uppercase font-extrabold rounded-lg">
                            Healing Loop Active {chaosProgress}%
                          </span>
                        )}
                     </div>

                     {/* Log viewer screen */}
                     <div className="flex-1 bg-black/60 rounded-3xl p-6 font-mono text-[10px] text-emerald-400 space-y-4 border border-white/5 max-h-[300px] overflow-y-auto mb-6">
                        {activeFailureLog.length === 0 ? (
                          <div className="text-slate-500 text-center py-20 uppercase tracking-widest animate-pulse">
                             // LISTENING_FOR_SIMULATION_TRIGGERS
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeFailureLog.map((log, i) => (
                              <div key={i} className="flex gap-3 text-left">
                                <span className="text-slate-500 shrink-0">&gt;&gt;</span>
                                <span className={cn(
                                  log.includes("offline") || log.includes("drift") ? "text-amber-500" :
                                  log.includes("NOMINAL") || log.includes("successful") ? "text-emerald-400 font-extrabold" :
                                  "text-white/80"
                                )}>
                                  {log}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>

                     <div className="bg-white/5 p-5 rounded-2xl font-sans text-slate-300">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Resilience Protocol Audit</span>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                           <div>
                              <span className="text-slate-500 text-[10px] block">Average Failover Transition</span>
                              <span className="font-mono text-white font-black">1.42s (Nominal)</span>
                           </div>
                           <div>
                              <span className="text-slate-500 text-[10px] block">Graceful Degradation Buffer</span>
                              <span className="font-mono text-white font-black">Ready (98% bandwidth preserved)</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* activeTab == benchmarks */}
            {activeTab === 'benchmarks' && (
              <motion.div
                key="benchmarks"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 p-8 lg:p-12 space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                  {[
                    { label: 'Uptime Stability', real: '99.98%', target: '≥99.95%', color: 'emerald', status: 'Optimal' },
                    { label: 'Precision Recall', real: '99.4%', target: '≥99.0%', color: 'indigo', status: 'Optimal' },
                    { label: 'Phonetic Accuracy', real: '98.2%', target: '≥98.0%', color: 'indigo', status: 'Optimal' },
                    { label: 'Inference Latency', real: '340ms', target: '<1000ms', color: 'emerald', status: 'Optimal' }
                  ].map((tar, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-200/80 shadow-md relative overflow-hidden group">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tar.label}</span>
                       <div className="flex items-baseline gap-2 mt-2">
                          <h4 className="text-3xl font-extrabold text-slate-900 italic tracking-tighter">{tar.real}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">Target: {tar.target}</span>
                       </div>
                       <div className="mt-4 flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-mono font-black uppercase tracking-wider px-2 header py-0.5 rounded-lg border",
                            tar.color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                          )}>
                             {tar.status}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Comparative Matrix table */}
                <div className="bg-white border border-slate-200/80 rounded-[3rem] px-8 py-10 text-left shadow-sm space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                         <Gauge size={18} />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Sovereign Validation Matrix</h4>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-700 select-all border-collapse font-mono">
                         <thead>
                            <tr className="border-b border-slate-100 uppercase tracking-widest text-slate-400 text-[10px] text-left">
                               <th className="py-4">Security Parameters</th>
                               <th className="py-4">Standard Public LLM</th>
                               <th className="py-4 text-indigo-600 font-black">GULA Sovereign OS</th>
                               <th className="py-4 text-right">Mandated Compliance vFinal</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-sans font-medium">
                            {[
                              { label: 'Uncontrolled Hallucination Rate', std: '3.40%', GULA: '0.001%', target: '0% (Diagnostic Excluded)', badge: 'Critical' },
                              { label: 'Handwritten Laboratory OCR Parsing', std: 'No support / Low accuracy', GULA: '98.4%', target: '≥95% (Parsed locally)', badge: 'Compliant' },
                              { label: 'Phonetic Iraqi dialetic understanding', std: 'Poor / Literal translations', GULA: '98.2%', target: 'Canonical Ontology lookup', badge: 'Compliant' },
                              { label: 'Physical Data Boundary', std: 'Offshore public cloud API keys', GULA: 'Sovereign Private APN Container', target: 'Zero-exposure', badge: 'Critical' },
                              { label: 'Physician-assisted override loop', std: 'Zero oversight mechanisms', GULA: 'Active Annotation Console', target: 'Audit Trail Enforced', badge: 'Compliant' },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="py-4 font-bold text-slate-900">{row.label}</td>
                                 <td className="py-4 text-slate-500 font-mono text-[11px]">{row.std}</td>
                                 <td className="py-4 text-indigo-600 font-black font-mono text-sm">{row.GULA}</td>
                                 <td className="py-4 text-right font-mono text-[11px]">{row.target}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
}
