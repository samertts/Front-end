import React, { useState, useEffect, useMemo } from 'react';
import { 
  FlaskConical, 
  Cpu, 
  Zap, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Gauge, 
  ShieldAlert, 
  RefreshCw, 
  Layers, 
  Database,
  Sliders,
  Play,
  Clock,
  Check,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { LabAutomationService } from '../../services/lab/LabAutomationService';
import { LabAnalyzer, LabTestDefinition } from '../../types/lab';
import { Priority } from '../../types/domain';

export interface TriageSample {
  id: string;
  patientName: string;
  patientId: string;
  testCode: string; // e.g. CBC, CRP, HIV, COVID-19, DIFF
  testName: string;
  clinicalSeverity: 'critical' | 'high' | 'medium' | 'routine';
  receivedAt: string; // ISO string
  status: 'pending_triage' | 'routing' | 'dispatched' | 'processing' | 'completed';
  assignedAnalyzerId?: string;
  triageScore?: number; // Calculated dynamic priority score
  notes?: string;
}

export const AutonomousSampleTriage: React.FC = () => {
  const [analyzers, setAnalyzers] = useState<LabAnalyzer[]>([]);
  const [samples, setSamples] = useState<TriageSample[]>([]);
  const [autoDispatch, setAutoDispatch] = useState<boolean>(true);
  const [isTriageRunning, setIsTriageRunning] = useState<boolean>(false);
  const [triageLogs, setTriageLogs] = useState<string[]>([]);
  const [testCatalog, setTestCatalog] = useState<LabTestDefinition[]>([]);
  const [selectedSample, setSelectedSample] = useState<TriageSample | null>(null);

  // Initialize data
  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const [loadedAnalyzers, loadedCatalog] = await Promise.all([
          LabAutomationService.getAnalyzers(),
          LabAutomationService.getTestCatalog()
        ]);
        
        if (active) {
          // Clone analyzer structures to allow local sandbox manipulation
          setAnalyzers(JSON.parse(JSON.stringify(loadedAnalyzers)));
          setTestCatalog(loadedCatalog);
        }
      } catch (err) {
        console.error("Failed to load initial automation triage data:", err);
      }
    };

    loadInitialData();

    // Default mock incoming triage samples queue
    const initialSamples: TriageSample[] = [
      {
        id: 'SMP-8812',
        patientName: 'Ali Al-Hassan',
        patientId: 'PT-4091',
        testCode: 'HIV',
        testName: 'HIV Screening',
        clinicalSeverity: 'high',
        receivedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
        status: 'pending_triage',
        notes: 'Pre-surgery screen requirement.'
      },
      {
        id: 'SMP-9914',
        patientName: 'Muna Abbas',
        patientId: 'PT-5521',
        testCode: 'CBC',
        testName: 'Complete Blood Count',
        clinicalSeverity: 'routine',
        receivedAt: new Date(Date.now() - 40 * 60000).toISOString(), // 40 mins ago
        status: 'pending_triage',
        notes: 'Routine outpatient consultation check.'
      },
      {
        id: 'SMP-4112',
        patientName: 'Karrar Jassim',
        patientId: 'PT-1033',
        testCode: 'CRP',
        testName: 'C-Reactive Protein',
        clinicalSeverity: 'critical',
        receivedAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
        status: 'pending_triage',
        notes: 'ICU patient, suspected septic shock.'
      },
      {
        id: 'SMP-3301',
        patientName: 'Zainab Hussein',
        patientId: 'PT-9022',
        testCode: 'COVID-19',
        testName: 'SARS-CoV-2 PCR',
        clinicalSeverity: 'medium',
        receivedAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 mins ago
        status: 'pending_triage',
        notes: 'Respiratory symptoms, isolation ward.'
      },
      {
        id: 'SMP-6712',
        patientName: 'Hussein Mohammed',
        patientId: 'PT-7112',
        testCode: 'DIFF',
        testName: 'WBC Differential Count',
        clinicalSeverity: 'medium',
        receivedAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 mins ago
        status: 'pending_triage',
        notes: 'Pediatric high fever investigation.'
      }
    ];

    setSamples(initialSamples);
    addLog("System initialized. Triage algorithms loaded with zero-latency priority modeling.");

    return () => {
      active = false;
    };
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTriageLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Autonomous Triage Engine: Computes real-time prioritization score (0 - 100) for samples
  const enrichedSamples = useMemo(() => {
    return samples.map(sample => {
      // Calculate waiting duration in minutes
      const waitTimeMin = Math.max(0, Math.floor((Date.now() - new Date(sample.receivedAt).getTime()) / 60000));
      
      // Compute weights
      let severityWeight = 0;
      switch (sample.clinicalSeverity) {
        case 'critical': severityWeight = 60; break;
        case 'high': severityWeight = 40; break;
        case 'medium': severityWeight = 20; break;
        case 'routine': severityWeight = 5; break;
      }

      // Age acceleration weight: +1.2 points for each minute in the queue (capped at 40 points)
      const ageWeight = Math.min(40, waitTimeMin * 1.2);
      
      const computedScore = Math.min(100, Math.round(severityWeight + ageWeight));

      // Dynamic Analyzer Routing recommendation based on tests and loads
      let recommendedAnalyzer: LabAnalyzer | null = null;
      let minLoad = 101;

      analyzers.forEach(analyzer => {
        if (analyzer.status !== 'error' && analyzer.status !== 'maintenance') {
          // Check if analyzer supports this test code
          const supports = analyzer.supportedTests.includes(sample.testCode) || 
                           (sample.testCode === 'DIFF' && analyzer.supportedTests.includes('DIFF')) ||
                           (sample.testCode === 'CBC' && analyzer.supportedTests.includes('CBC')) ||
                           (sample.testCode === 'CRP' && analyzer.supportedTests.includes('CRP')) ||
                           (sample.testCode === 'HIV' && analyzer.supportedTests.includes('HIV')) ||
                           (sample.testCode === 'COVID-19' && analyzer.supportedTests.includes('COVID-19'));

          if (supports) {
            // Pick analyzer with the lowest current load
            if (analyzer.currentLoad < minLoad) {
              minLoad = analyzer.currentLoad;
              recommendedAnalyzer = analyzer;
            }
          }
        }
      });

      return {
        ...sample,
        triageScore: computedScore,
        waitTimeMin,
        recommendedAnalyzer: recommendedAnalyzer ? (recommendedAnalyzer as LabAnalyzer).name : 'No Compatible Subsystem',
        recommendedAnalyzerId: recommendedAnalyzer ? (recommendedAnalyzer as LabAnalyzer).id : undefined
      };
    }).sort((a, b) => (b.triageScore ?? 0) - (a.triageScore ?? 0)); // Highly prioritized first
  }, [samples, analyzers]);

  // Execute continuous autonomous dispatcher if auto-dispatch is active
  useEffect(() => {
    if (!autoDispatch || samples.filter(s => s.status === 'pending_triage').length === 0) return;

    const timer = setTimeout(() => {
      runTriageExecution(true); // silent auto dispatch
    }, 6000);

    return () => clearTimeout(timer);
  }, [autoDispatch, samples]);

  // Triage algorithm execution
  const runTriageExecution = async (isSilent: boolean = false) => {
    if (isTriageRunning) return;
    
    if (!isSilent) {
      setIsTriageRunning(true);
      addLog("Starting autonomous sample triage calculation cycle...");
    }

    const pendingSamples = enrichedSamples.filter(s => s.status === 'pending_triage');
    
    if (pendingSamples.length === 0) {
      if (!isSilent) {
        setIsTriageRunning(false);
        toast.info("Triage Complete", { description: "No pending samples left in triage buffer." });
      }
      return;
    }

    // Process top prioritized sample
    const targetSample = pendingSamples[0];
    const targetAnalyzerId = targetSample.recommendedAnalyzerId;

    if (!targetAnalyzerId) {
      if (!isSilent) {
        setIsTriageRunning(false);
        addLog(`[ALERT] Failed to route ${targetSample.id}: No active or compatible analyzer found.`);
        toast.error(`Routing Failed`, { description: `No active analyzer found for sample ${targetSample.id} (${targetSample.testCode}).` });
      }
      return;
    }

    // Simulate dispatch
    if (!isSilent) {
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // Update state safely
    setSamples(prev => prev.map(s => {
      if (s.id === targetSample.id) {
        return {
          ...s,
          status: 'dispatched',
          assignedAnalyzerId: targetAnalyzerId
        };
      }
      return s;
    }));

    // Update analyzer loads
    setAnalyzers(prev => prev.map(a => {
      if (a.id === targetAnalyzerId) {
        const newLoad = Math.min(100, a.currentLoad + 15);
        return {
          ...a,
          currentLoad: newLoad,
          status: 'busy',
          activeJobs: [...a.activeJobs, targetSample.id]
        };
      }
      return a;
    }));

    addLog(`[DISPATCH] Routed ${targetSample.id} (${targetSample.testCode}) to ${targetSample.recommendedAnalyzer} (Score: ${targetSample.triageScore}).`);
    
    toast.success(`Sample Routed Automatically`, {
      description: `${targetSample.id} (${targetSample.testCode}) assigned to ${targetSample.recommendedAnalyzer}.`,
      duration: 5000
    });

    if (!isSilent) {
      setIsTriageRunning(false);
    }
  };

  // Reset the triage demonstration environment
  const resetTriageDemonstration = () => {
    // Reload original analyzers
    LabAutomationService.getAnalyzers().then(loadedAnalyzers => {
      setAnalyzers(JSON.parse(JSON.stringify(loadedAnalyzers)));
    });

    // Reset initial sample list
    setSamples([
      {
        id: 'SMP-8812',
        patientName: 'Ali Al-Hassan',
        patientId: 'PT-4091',
        testCode: 'HIV',
        testName: 'HIV Screening',
        clinicalSeverity: 'high',
        receivedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'pending_triage',
        notes: 'Pre-surgery screen requirement.'
      },
      {
        id: 'SMP-9914',
        patientName: 'Muna Abbas',
        patientId: 'PT-5521',
        testCode: 'CBC',
        testName: 'Complete Blood Count',
        clinicalSeverity: 'routine',
        receivedAt: new Date(Date.now() - 40 * 60000).toISOString(),
        status: 'pending_triage',
        notes: 'Routine outpatient consultation check.'
      },
      {
        id: 'SMP-4112',
        patientName: 'Karrar Jassim',
        patientId: 'PT-1033',
        testCode: 'CRP',
        testName: 'C-Reactive Protein',
        clinicalSeverity: 'critical',
        receivedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'pending_triage',
        notes: 'ICU patient, suspected septic shock.'
      },
      {
        id: 'SMP-3301',
        patientName: 'Zainab Hussein',
        patientId: 'PT-9022',
        testCode: 'COVID-19',
        testName: 'SARS-CoV-2 PCR',
        clinicalSeverity: 'medium',
        receivedAt: new Date(Date.now() - 12 * 60000).toISOString(),
        status: 'pending_triage',
        notes: 'Respiratory symptoms, isolation ward.'
      },
      {
        id: 'SMP-6712',
        patientName: 'Hussein Mohammed',
        patientId: 'PT-7112',
        testCode: 'DIFF',
        testName: 'WBC Differential Count',
        clinicalSeverity: 'medium',
        receivedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        status: 'pending_triage',
        notes: 'Pediatric high fever investigation.'
      }
    ]);
    
    setTriageLogs([]);
    setSelectedSample(null);
    addLog("Consensary triage environment reset to clinical zero-point.");
    toast.info("Sandbox Environment Reset", { description: "Analyzers and samples queue have been reset." });
  };

  // Force dispatch of a specific sample manually
  const forceManualDispatch = (sampleId: string) => {
    const sample = enrichedSamples.find(s => s.id === sampleId);
    if (!sample || sample.status !== 'pending_triage') return;

    const targetAnalyzerId = sample.recommendedAnalyzerId;
    if (!targetAnalyzerId) {
      toast.error("Routing Error", { description: "Cannot find compatible active machine to receive this test." });
      return;
    }

    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        return {
          ...s,
          status: 'dispatched',
          assignedAnalyzerId: targetAnalyzerId
        };
      }
      return s;
    }));

    setAnalyzers(prev => prev.map(a => {
      if (a.id === targetAnalyzerId) {
        return {
          ...a,
          currentLoad: Math.min(100, a.currentLoad + 12),
          status: 'busy',
          activeJobs: [...a.activeJobs, sampleId]
        };
      }
      return a;
    }));

    addLog(`[MANUAL DISPATCH] User authorized manual route for ${sample.id} to ${sample.recommendedAnalyzer}.`);
    toast.success("Manual Override Approved", {
      description: `Sample ${sample.id} successfully dispatched to ${sample.recommendedAnalyzer}.`
    });
  };

  // Inject a critical emergency ICU specimen
  const injectEmergencySample = () => {
    const randomId = `SMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const emergencySpecimen: TriageSample = {
      id: randomId,
      patientName: 'Emergency Trauma Code Red',
      patientId: 'PT-9999',
      testCode: 'CRP',
      testName: 'C-Reactive Protein (Sepsis Probe)',
      clinicalSeverity: 'critical',
      receivedAt: new Date().toISOString(),
      status: 'pending_triage',
      notes: 'Hyper-urgent clinical preemption requested.'
    };

    setSamples(prev => [emergencySpecimen, ...prev]);
    addLog(`[EMERGENCY INJECTED] High severity ${randomId} inserted. Recalculating dynamic priorities...`);
    
    toast.warning("🚨 EMERGENCY SAMPLE DETECTED", {
      description: `ICU Trauma Patient Sample ${randomId} injected. Priority Score recalculations initialized instantly.`,
      duration: 8000
    });
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'medium':
        return 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100/40';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200/50';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/40';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-[2.5rem] shadow-sm overflow-hidden p-6 md:p-8 space-y-8">
      
      {/* Header section with integrated system status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Cpu size={22} className={autoDispatch ? "animate-spin" : ""} style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Autonomous Clinical Triage Engine
              {autoDispatch && (
                <span className="inline-flex items-center gap-1 text-[8px] font-sans text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase font-black tracking-wider animate-pulse">
                  ● Real-time Optimizing
                </span>
              )}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Machine Capacity & Clinical Severity Threshold Allocator</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reset Sandbox */}
          <button
            type="button"
            onClick={resetTriageDemonstration}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/40 dark:border-white/5 rounded-xl transition-all cursor-pointer text-slate-500 dark:text-slate-400 active:scale-95"
            title="Reset Sandbox"
          >
            <RotateCcw size={16} />
          </button>

          {/* Toggle Auto dispatch switch */}
          <button
            type="button"
            onClick={() => {
              setAutoDispatch(!autoDispatch);
              addLog(`Autonomous dispatch pipeline ${!autoDispatch ? 'ENABLED' : 'DISABLED'}.`);
              toast.info(`Auto-Dispatch ${!autoDispatch ? 'Enabled' : 'Disabled'}`, {
                description: !autoDispatch ? "The triage engine will automatically dispatch pending samples." : "Manual review and dispatch required."
              });
            }}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border",
              autoDispatch 
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/5'
            )}
          >
            {autoDispatch ? 'Auto-Dispatch ON' : 'Auto-Dispatch OFF'}
          </button>

          {/* Emergency Sample Injection Button */}
          <button
            type="button"
            onClick={injectEmergencySample}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-100 dark:shadow-none transition-all cursor-pointer active:scale-95"
          >
            <Plus size={14} /> Inject ICU Emergency
          </button>
        </div>
      </div>

      {/* Grid: 1. Machine Load / Analyzer Status. 2. Pending Triage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Subsystems status & live loads (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 tracking-widest">
            <span>Machine Cluster Capacities</span>
            <span className="text-[9px] text-slate-400 font-mono">Total Nodes: {analyzers.length}</span>
          </div>

          <div className="space-y-4">
            {analyzers.map((analyzer) => {
              const isError = analyzer.status === 'error';
              const isBusy = analyzer.currentLoad > 75;

              return (
                <div 
                  key={analyzer.id} 
                  className={cn(
                    "p-4 border rounded-2xl transition-all relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/40",
                    isError ? 'border-rose-300 dark:border-rose-900/30' : 'border-slate-200/50 dark:border-white/5'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{analyzer.name}</h4>
                      <p className="text-[9px] text-slate-450 mt-1 font-mono">{analyzer.model} • SN-{analyzer.serialNumber}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        analyzer.status === 'error' ? 'bg-rose-500 animate-ping' :
                        analyzer.status === 'maintenance' ? 'bg-amber-500' :
                        analyzer.status === 'busy' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
                        {analyzer.status}
                      </span>
                    </div>
                  </div>

                  {/* Load bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Live Load utilization</span>
                      <span className={cn(isBusy ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300')}>{analyzer.currentLoad}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isError ? 'bg-rose-500' : isBusy ? 'bg-indigo-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${analyzer.currentLoad}%` }}
                      />
                    </div>
                  </div>

                  {/* Test capabilities listing */}
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-white/5">
                    {analyzer.supportedTests.map(test => (
                      <span key={test} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[8.5px] font-black uppercase font-mono tracking-wider rounded text-slate-500 dark:text-slate-400">
                        {test}
                      </span>
                    ))}
                  </div>

                  {/* Active jobs counts */}
                  <div className="mt-2 text-[9.5px] text-slate-450 dark:text-slate-500 font-semibold flex justify-between">
                    <span>Active Queued Jobs:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{analyzer.activeJobs.length}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/40 dark:border-indigo-500/10 text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5">
            <p className="font-black text-indigo-900 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-widest text-[9.5px]">
              <Zap size={12} /> Triage Score Formula
            </p>
            <p className="font-medium text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">Urgency = ClinicalSeverityWeight + AgeAcceleration</strong>. Emergency ICU Sepsis samples automatically pre-empt normal, low-severity outpatients on highly congested analyzers.
            </p>
          </div>
        </div>

        {/* Right Column: Triage Queue list & logs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 tracking-widest">
            <span>Incoming Sample Queue ({enrichedSamples.filter(s => s.status === 'pending_triage').length} pending)</span>
            <span>Real-time Dynamic Rank</span>
          </div>

          <div className="border border-slate-150 dark:border-white/5 rounded-3xl overflow-hidden bg-slate-950/5 dark:bg-slate-950/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-450 tracking-widest">
                    <th className="py-3 px-4">Triage Score</th>
                    <th className="py-3 px-4">Sample Node</th>
                    <th className="py-3 px-4">Patient / Clinic</th>
                    <th className="py-3 px-4">Procedure</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4">Dynamic Route Recommendation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans text-xs">
                  {enrichedSamples.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-450 dark:text-slate-500 italic">
                        <FlaskConical size={32} className="mx-auto text-slate-300 mb-2" />
                        No clinical specimens inside the triage sandbox pipeline.
                      </td>
                    </tr>
                  ) : (
                    enrichedSamples.map((sample) => {
                      const isPending = sample.status === 'pending_triage';
                      
                      return (
                        <tr 
                          key={sample.id} 
                          onClick={() => setSelectedSample(sample)}
                          className={cn(
                            "group hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer",
                            selectedSample?.id === sample.id ? "bg-slate-100/85 dark:bg-slate-800/60" : ""
                          )}
                        >
                          {/* Score indicator */}
                          <td className="py-4 px-4 font-mono font-black">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-xl font-bold text-xs border",
                                (sample.triageScore ?? 0) > 75 
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                                  : (sample.triageScore ?? 0) > 40 
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100/30'
                              )}>
                                {sample.triageScore}
                              </span>
                            </div>
                          </td>

                          {/* Sample ID */}
                          <td className="py-4 px-4 font-mono">
                            <div className="font-black text-slate-800 dark:text-slate-200">{sample.id}</div>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-semibold">
                              <Clock size={10} /> {sample.waitTimeMin}m waiting
                            </span>
                          </td>

                          {/* Patient name & ID */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{sample.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{sample.patientId}</div>
                          </td>

                          {/* Test code & Name */}
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 border border-indigo-100/40 font-mono text-[9px] font-black uppercase rounded shrink-0">
                              {sample.testCode}
                            </span>
                            <div className="text-[9.5px] text-slate-450 mt-1">{sample.testName}</div>
                          </td>

                          {/* Clinical Severity badge */}
                          <td className="py-4 px-4 text-center">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                              getSeverityBadgeClass(sample.clinicalSeverity)
                            )}>
                              {sample.clinicalSeverity}
                            </span>
                          </td>

                          {/* Recommended analyzer */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <Cpu size={12} className="text-slate-400" />
                              <span className={cn(
                                "font-black uppercase tracking-tight text-[10px]",
                                sample.recommendedAnalyzer.includes('No') ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'
                              )}>
                                {sample.recommendedAnalyzer}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 italic block mt-0.5">{isPending ? 'Optimal Available Target' : 'Routed successfully'}</span>
                          </td>

                          {/* Action dispatch button */}
                          <td className="py-4 px-4 text-right">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  forceManualDispatch(sample.id);
                                }}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer select-none"
                              >
                                Dispatch
                              </button>
                            ) : (
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                getStatusBadgeClass(sample.status)
                              )}>
                                <CheckCircle2 size={11} /> {sample.status}
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Sample Deep Diagnostics Inspector */}
          {selectedSample && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 border border-slate-150 dark:border-white/5 rounded-3xl bg-slate-50/70 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest leading-none">Diagnostic Inspector</span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-slate-900 dark:text-white font-black font-mono text-xs">{selectedSample.id}</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedSample.patientName} ({selectedSample.patientId})</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{selectedSample.notes || "No clinical annotation entered."}</p>
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-450">
                  <span>Received at: {new Date(selectedSample.receivedAt).toLocaleTimeString()}</span>
                  <span>Procedure: {selectedSample.testName} ({selectedSample.testCode})</span>
                </div>
              </div>

              <div className="flex items-end justify-between md:flex-col md:items-end gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block mb-1">Severity / Triage Score</span>
                  <span className="text-xl font-black text-indigo-905 dark:text-indigo-400">{selectedSample.triageScore} / 100</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedSample(null)}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedSample.status === 'pending_triage' && (
                    <button 
                      onClick={() => {
                        forceManualDispatch(selectedSample.id);
                        setSelectedSample(null);
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
                    >
                      Authorize Dispatch
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Autonomous Triage Execution Logs (Real-time telemetry trace log-rail) */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Triage Pipeline Live Trace logs</p>
            <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 font-mono text-[10.5px] text-slate-300 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none border-b border-slate-800 pb-2 flex justify-between items-center">
                <span>[TRIA-TRIAGE TELEMETRY AUDIT CHANNEL]</span>
                <span className={autoDispatch ? "text-emerald-400 animate-pulse" : "text-slate-500"}>
                  {autoDispatch ? "● autonomous routing active" : "○ pipeline idle"}
                </span>
              </p>
              {triageLogs.length === 0 ? (
                <p className="text-slate-500 italic">Telemetry stream clear. Trigger automated triage to emit diagnostic traces.</p>
              ) : (
                triageLogs.map((log, idx) => (
                  <div key={idx} className={cn(
                    "p-0.5 leading-relaxed",
                    log.includes('[ALERT]') ? 'text-rose-400 bg-rose-950/20 px-1.5 rounded' : 
                    log.includes('[DISPATCH]') ? 'text-emerald-400' : 'text-slate-400'
                  )}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
