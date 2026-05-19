import { useLanguage } from '../contexts/LanguageContext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, Task } from '../types/domain';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabDashboard } from './lab/LabDashboard';
import { ResearcherDashboard } from './research/ResearcherDashboard';
import { CitizenHealth } from './citizen/CitizenHealth';
import { MinistryDashboard } from './ministry/MinistryDashboard';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { TaskQueue } from '../components/TaskQueue';
import { DashboardInsight } from '../components/DashboardInsight';
import { SmartAlertSystem, Alert } from '../components/SmartAlertSystem';
import { HealthTrendChart } from '../components/HealthTrendChart';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Activity as ActivityIcon,
  TrendingUp,
  AlertTriangle,
  Microscope,
  Network,
  Users,
  ChevronRight,
  Globe,
  Heart,
  Plus,
  Download,
  Server,
  Zap,
  Sparkles,
  ArrowUpRight,
  Shield,
  MessageSquare,
  HelpCircle,
  Eye,
  Settings,
  BrainCircuit,
  TriangleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InfrastructureView } from './admin/InfrastructureView';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageTransition } from '../components/PageTransition';
import { ClickToCopy } from '../components/ClickToCopy';

const data = [
  { name: '00:00', value: 400 },
  { name: '04:00', value: 300 },
  { name: '08:00', value: 600 },
  { name: '12:00', value: 800 },
  { name: '16:00', value: 500 },
  { name: '20:00', value: 900 },
  { name: '23:59', value: 700 },
];

const StatCard = ({ label, value, progress, color = "bg-indigo-600", trend, icon: Icon }: { label: string, value: string, progress: number, color?: string, trend?: { value: string, up: boolean }, icon?: any }) => (
  <div className="flex flex-col group p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
    <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-20 group-hover:opacity-100 transition-opacity", color)} />
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
          {Icon && <Icon size={18} className={color.replace('bg-', 'text-')} />}
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
          trend.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend.up ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {trend.value}
        </div>
      )}
    </div>
    <div className="text-4xl lg:text-5xl font-headline font-black text-slate-900 dark:text-white tracking-tighter mb-6">{value}</div>
    <div className="mt-auto">
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
         <span>Utilization</span>
         <span>{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={`h-full ${color} shadow-[0_0_15px_rgba(79,70,229,0.3)]`}
        ></motion.div>
      </div>
    </div>
  </div>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ActivityItem = ({ icon: Icon, title, subtitle, status, statusColor, patientId }: { icon: any, title: string, subtitle: string, status: string, statusColor: string, patientId?: string }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => patientId && navigate(`/patients/${patientId}`)}
      className="flex items-center justify-between group cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 p-5 rounded-[2rem] transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 active:scale-[0.98]"
    >
      <div className="flex items-center gap-5 lg:gap-7">
        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-3xl flex items-center justify-center shadow-sm group-hover:rotate-6 group-hover:scale-110 transition-all">
          <Icon size={24} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm lg:text-base font-black text-slate-900 dark:text-white tracking-tight">{title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">{subtitle}</p>
            {patientId && (
              <div onClick={(e) => e.stopPropagation()}>
                <ClickToCopy 
                   text={patientId} 
                   className="text-[9px] font-black text-indigo-600/60 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className={`px-4 lg:px-6 py-2 ${statusColor} text-[9px] lg:text-[11px] font-black rounded-2xl uppercase tracking-[0.15em] shadow-sm`}>
          {status}
        </div>
        <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all group-hover:translate-x-1">
           <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};

export function DashboardView() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [isGuided, setIsGuided] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const isRtl = language === 'AR' || language === 'KU' || language === 'SY';

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          
          // Decision Intelligence Alerts
          setAlerts([
            {
              id: 'ALT-01',
              type: 'critical',
              title: 'Critical Bio-Sync Anomaly',
              description: 'Unexpected variation detected in regional bio-node stabilization. Data suggests a 15% deviation from baseline safety protocols.',
              timestamp: 'Just Now',
              actionLabel: 'Initialize Protocol-9',
              onAction: () => console.log('Protocol-9 triggered')
            },
            {
              id: 'ALT-02',
              type: 'warning',
              title: 'Predictive Load Warning',
              description: 'Incoming data flow from North-East corridor expected to exceed capacity within 4 hours based on pre-diagnostic patterns.',
              timestamp: '12m ago',
              actionLabel: 'Scale Bandwidth'
            }
          ]);

          // Seed dummy diagnostic tasks
          setActiveTasks([
            { 
              id: 'TASK-102', 
              title: 'Atypical Viral Load Verification', 
              type: 'validation', 
              status: 'pending', 
              priority: 'critical', 
              entityId: 'LAB-SOUTH', 
              relatedResourceId: 'PATIENT-8812', 
              slaDeadline: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { 
              id: 'TASK-105', 
              title: 'Reagent Stock Optimization', 
              type: 'inventory_check', 
              status: 'in_progress', 
              priority: 'medium', 
              entityId: 'W-01', 
              relatedResourceId: 'ST-900', 
              slaDeadline: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              assignedTo: user.uid
            }
          ]);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleBulkAction = (action: 'assign' | 'complete' | 'hold' | 'process', taskIds: string[]) => {
    setActiveTasks(prev => prev.map(t => {
      if (taskIds.includes(t.id)) {
        switch (action) {
          case 'assign': return { ...t, assignedTo: auth.currentUser?.uid || 'anonymous', status: 'assigned' as const, updatedAt: new Date().toISOString() };
          case 'complete': return { ...t, status: 'completed' as const, updatedAt: new Date().toISOString() };
          case 'hold': return { ...t, status: 'on_hold' as const, updatedAt: new Date().toISOString() };
          case 'process': return { ...t, status: 'in_progress' as const, updatedAt: new Date().toISOString() };
          default: return t;
        }
      }
      return t;
    }));
  };

  const handleTaskUpdate = (taskId: string, status: Task['status']) => {
    setActiveTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  };

  const handleTaskAssign = (taskId: string) => {
    setActiveTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: auth.currentUser?.uid || 'anonymous', status: 'assigned', updatedAt: new Date().toISOString() } : t));
  };

  if (loading) return <DashboardSkeleton />;

  // Multi-Wing Logic
  if (profile?.role === 'technician' || profile?.role === 'pathologist' || profile?.role === 'lab_admin') {
     return <LabDashboard />;
  }
  if (profile?.role === 'ministry_admin' || profile?.role === 'ministry_analyst' || profile?.role === 'ministry_inspector') {
     return <MinistryDashboard />;
  }
  if (profile?.role === 'researcher' || profile?.role === 'regulator') {
     return <ResearcherDashboard />;
  }
  if (profile?.role === 'admin' || profile?.role === 'master_admin') {
     return <InfrastructureView />;
  }
  if (profile?.role === 'citizen') {
     return <CitizenHealth />;
  }

  return (
    <PageTransition>
      <div className={cn("min-h-screen relative overflow-hidden bg-slate-50", isRtl ? "rtl" : "ltr")}>
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 space-y-10 p-4 md:p-10 pb-32">
          {/* Quick Action Floating Hub */}
          <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
             <AnimatePresence>
                {isGuided && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.5, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.5, y: 20 }}
                     className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 w-64 backdrop-blur-xl"
                   >
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <Sparkles size={16} />
                         </div>
                         <h4 className="text-xs font-black uppercase tracking-widest">{t.aiAssistant}</h4>
                      </div>
                      <p className="text-[10px] font-medium leading-relaxed opacity-60 mb-4">
                         I'm monitoring regional bio-sync. Would you like to optimize current workloads?
                      </p>
                      <button className="w-full py-3 bg-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                         {t.optimizeLoad}
                      </button>
                   </motion.div>
                )}
             </AnimatePresence>
             <button className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border border-white/10">
                <Plus size={32} className="group-hover:rotate-90 transition-transform" />
             </button>
          </div>
          <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="editorial-stack space-y-1">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400"
                >
                  <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-ping" />
                  {t.dailyOverview} • {new Date().toLocaleDateString(language === 'AR' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </motion.div>
                <div className="flex items-center gap-4">
                  <h2 className="font-headline text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none text-glow-indigo">{t.intelligenceCanvas}</h2>
                  <button 
                    onClick={() => setIsGuided(!isGuided)}
                    className={cn(
                      "p-2 rounded-full border-2 transition-all group relative",
                      isGuided ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/10 text-slate-300 hover:text-indigo-600 hover:border-indigo-600"
                    )}
                  >
                    <Zap size={18} fill={isGuided ? "currentColor" : "none"} />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {isGuided ? "Guided Mode: ON" : "Toggle Guided Mode"}
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-100 text-slate-700 font-bold text-sm rounded-2xl shadow-xl shadow-slate-200/40 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  <Download size={18} className="text-indigo-600 group-hover:-translate-y-1 transition-transform" />
                  {t.exportReport}
                </button>
                <button className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-slate-900 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Plus size={22} className="stroke-[3]" />
                  {t.newDiagnosis}
                </button>
              </div>
            </div>

            {/* Sovereign Command Palette - Quick Search & Action Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-white/5 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-2 flex items-center gap-2 ring-1 ring-slate-200 dark:ring-white/10 group-focus-within:ring-indigo-500/50 transition-all">
                <div className="flex items-center gap-4 px-4 flex-1">
                  <LayoutDashboard className="text-indigo-600" size={20} />
                  <input 
                    type="text" 
                    placeholder={language === 'AR' ? "ابحث عن مريض، فحص، أو أمر نظام..." : "Search patient, diagnostic, or system command..."} 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="hidden md:flex items-center gap-1">
                   <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="opacity-40">CMD</span>
                      <span className="w-4 h-4 rounded-md bg-white dark:bg-white/10 flex items-center justify-center text-[8px] border border-slate-200 dark:border-white/20">K</span>
                   </div>
                   <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Settings size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-12 gap-8 max-w-7xl mx-auto w-full"
        >
              <div className="col-span-12">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                      label={t.activePos || "Active Users"} 
                      value="12.4k" 
                      progress={78} 
                      color="bg-indigo-600" 
                      icon={Users} 
                      trend={{ value: "+2.4%", up: true }}
                    />
                    <StatCard 
                      label={t.interoperability || "Interoperability"} 
                      value="98.4%" 
                      progress={98} 
                      color="bg-indigo-600" 
                      icon={Network} 
                      trend={{ value: "+1.2%", up: true }}
                    />
                    <StatCard 
                      label={t.successRate || "Success Rate"} 
                      value="99.2%" 
                      progress={92} 
                      color="bg-emerald-500" 
                      icon={ActivityIcon} 
                      trend={{ value: "+0.4%", up: true }}
                    />
                    <StatCard 
                      label={t.lowStock || "Low Stock"} 
                      value="12" 
                      progress={45} 
                      color="bg-amber-500" 
                      icon={ShoppingCart} 
                      trend={{ value: "+2", up: true }}
                    />
                    <StatCard 
                      label={t.criticalAlerts || "Critical Alerts"} 
                      value="04" 
                      progress={12} 
                      color="bg-rose-500" 
                      icon={TriangleAlert} 
                      trend={{ value: "-25%", up: false }}
                    />
                 </div>
              </div>

              {/* Decision Intelligence Layer */}
          <div className="col-span-12">
            <SmartAlertSystem 
              alerts={alerts} 
              onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
            />
          </div>

          {/* Decision & Action Hub */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Regional Impact Smart Monitor */}
              <motion.div variants={item} className="col-span-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                         <TriangleAlert size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-slate-900">{t.priorityNode}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic animate-pulse">{t.criticalIntervention}</p>
                      </div>
                   </div>
                   <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                      <Eye size={16} />
                   </button>
                </div>

                <div className="flex-1 space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.activeViolations}</span>
                      <span className="text-xl font-black text-rose-600">14</span>
                   </div>
                   <div className="space-y-3">
                      {[
                        { label: t.latencyOutliers, val: '24ms', risk: 'high' },
                        { label: t.dataCorruption, val: '0.04%', risk: 'low' },
                        { label: t.unauthorizedAccess, val: '0', risk: 'safe' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-500">{item.label}</span>
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded",
                            item.risk === 'high' ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                          )}>{item.val}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                   <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">
                      {t.openTerminal}
                   </button>
                </div>
              </motion.div>

              {/* Data Flow Forecast */}
              <motion.div variants={item} className="col-span-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.throughputForecast}</h4>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase">{t.predictedTrend}</span>
                   </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-headline font-black text-slate-900 tracking-tighter">8.4<span className="text-indigo-400">GB/s</span></h3>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">+14% vs LAST 24H</p>
                </div>
                
                <div className="flex-1 -mx-6 mt-6">
                  <HealthTrendChart 
                    data={[
                      { time: '00', value: 40, forecast: 42 },
                      { time: '04', value: 30, forecast: 35 },
                      { time: '08', value: 60, forecast: 65 },
                      { time: '12', value: 80, forecast: 85 },
                      { time: '16', value: 50, forecast: 60 },
                      { time: '20', value: 90, forecast: 95 },
                      { time: '24', value: 70, forecast: 75 },
                    ]} 
                    color="#6366f1"
                    showForecast={true}
                  />
                </div>

                <div className="flex items-center gap-2 mt-4">
                   <button className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                      {t.optimizeLoad}
                   </button>
                   <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                      <Settings size={14} />
                   </button>
                </div>
              </motion.div>
            </div>

              {/* AI Decision Summary */}
              <div className="flex flex-col gap-4">
                <motion.div variants={item}>
                  <DashboardInsight />
                </motion.div>
                <motion.div variants={item} className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group h-full">
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                      <Sparkles className="text-indigo-400" size={24} />
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded-lg border border-indigo-500/30">{t.intelligenceActive}</span>
                  </div>
                  <h4 className="text-xl font-bold font-headline mb-3">{t.predictiveInsight}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">Neural processing identified a cluster of symptoms match in <span className="text-indigo-300">Region-04</span>. Recommend increasing supply bandwidth by <span className="text-emerald-400 font-bold">15%</span>.</p>
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900" />)}
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
                       {t.reviewPatterns} <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col group">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.capacityTrend}</h4>
                    <TrendingUp size={16} className="text-emerald-500" />
                 </div>
                 <div className="flex-1 -mx-6">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data}>
                       <XAxis dataKey="name" hide />
                       <YAxis hide />
                       <defs>
                         <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 px-3 py-2 rounded-xl text-[10px] font-bold text-white shadow-xl border border-white/10">
                                  {payload[0].value} OPS/SEC
                                </div>
                              );
                            }
                            return null;
                          }}
                       />
                       <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-center gap-4 relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] group-hover:rotate-6 transition-all">
                    <Server size={100} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{t.infraHealth}</p>
                 <h3 className="text-xl font-bold font-headline text-slate-800 leading-tight">{t.gridStatus} <span className="text-indigo-600">{t.peakFluidity}</span></h3>
                 <div className="flex items-center gap-2 mt-2">
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">{t.synchronized}</div>
                   <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">{t.tlsActive}</div>
                 </div>
              </div>
            </motion.div>

            {/* Operational Execution Queue */}
            <motion.div variants={item} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                 <Shield size={120} />
               </div>
               <TaskQueue 
                 tasks={activeTasks} 
                 onAssign={handleTaskAssign}
                 onUpdateStatus={handleTaskUpdate}
                 onBulkAction={handleBulkAction}
               />
            </motion.div>

          {/* Intelligence Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            
            {/* National Network Hub Card */}
            <motion.div 
               variants={item}
               onClick={() => navigate('/network')}
               className="p-10 bg-slate-900 rounded-[3.5rem] border border-white/10 text-white shadow-2xl relative overflow-hidden group cursor-pointer"
            >
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                 <Network className="text-indigo-400" size={140} />
               </div>
               <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
                        <Globe size={20} className="text-indigo-400" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.3em] font-mono">{t.networkHub}</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter leading-tight font-headline">
                     National Health <br /> <span className="text-indigo-400 text-glow-indigo">Interconnect</span>
                   </h3>
                   <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20 self-start">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      128 Institutions Syncing
                   </div>
                   <p className="text-xs text-indigo-100/60 font-medium leading-relaxed max-w-[200px]">
                     Real-time telemetry and interoperability layer active across all regional clusters.
                   </p>
               </div>
            </motion.div>

            {/* Recent Decisions & Logs */}
            <motion.section variants={item} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-headline text-2xl font-black text-slate-900 tracking-tight">{t.recentLogs}</h3>
                <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                  <Download size={18} />
                </button>
              </div>
              <div className="space-y-2 flex-1">
                <ActivityItem icon={Microscope} title="Hematology Sync" subtitle="12:40 PM" status={t.normal} statusColor="bg-emerald-50 text-emerald-700" patientId="P-9021" />
                <ActivityItem icon={Users} title="Rapid Admission" subtitle="11:15 AM" status={t.pending} statusColor="bg-amber-50 text-amber-900" patientId="P-8842" />
                <ActivityItem icon={AlertTriangle} title="Critical Bio-Sync" subtitle="10:55 AM" status={t.urgent} statusColor="bg-rose-50 text-rose-700" patientId="P-7721" />
                <ActivityItem icon={ActivityIcon} title="Node Stabilization" subtitle="09:30 AM" status={t.optimal} statusColor="bg-indigo-50 text-indigo-700" />
              </div>
              <button className="w-full mt-10 py-5 bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-3xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                {t.viewAllIntelligence}
              </button>
            </motion.section>

            {/* Regional Health Reach */}
            <motion.div variants={item} className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col justify-between shadow-2xl group min-h-[400px] border border-white/5">
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                  <Globe size={180} className="animate-spin-slow" />
               </div>
               <div className="relative z-10 text-right rtl">
                  <div className="flex justify-between items-start mb-12 flex-row-reverse">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-indigo-300 mb-2 font-headline">{t.nationalReach}</p>
                        <h4 className="text-4xl font-black font-headline tracking-tighter">{t.healthGrid}</h4>
                     </div>
                     <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                        <Globe size={28} className="text-slate-400 group-hover:text-white transition-colors" />
                     </div>
                  </div>
                  <div className="space-y-6">
                     {[
                        { name: t.kurdistan, capacity: 82, trend: 'up' },
                        { name: t.iraqCentral, capacity: 74, trend: 'down' },
                        { name: t.turkeyBorder, capacity: 91, trend: 'up' }
                     ].map((r, i) => (
                        <div key={i} className="group/row">
                           <div className="flex justify-between items-center text-xs mb-3 flex-row-reverse">
                              <span className="font-bold opacity-70 group-hover/row:opacity-100 transition-opacity">{r.name}</span>
                              <span className={cn(
                                 "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                 r.trend === 'up' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                              )}>{r.capacity}% LOAD</span>
                           </div>
                           <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${r.capacity}%` }}
                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="relative z-10 pt-10 mt-10 border-t border-white/5 flex flex-col gap-4">
                  <p className="italic text-xs text-slate-400 font-medium leading-relaxed">"{t.motto}"</p>
                  <div className="flex items-center gap-3">
                     <div className="flex -space-x-1">
                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 text-[8px] flex items-center justify-center font-bold">M{i}</div>)}
                     </div>
                     <span className="text-[10px] font-bold text-slate-500">{t.consensusProtocol}</span>
                  </div>
               </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </PageTransition>
  );
}
