import { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  BrainCircuit, 
  Activity, 
  Microscope, 
  User, 
  Globe, 
  Server,
  Stethoscope,
  FlaskConical,
  Database,
  History,
  Code2,
  Box,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Calendar,
  Pill,
  Users,
  Shield,
  Building2,
  ShoppingCart,
  TrendingUp,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Zap as QuickZap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { UserWing } from '../types/domain';
import { useNavigationStore } from '../store/navigationStore';

export function useNavigation() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { currentWing } = useNavigationStore();

  const availableWings = useMemo((): UserWing[] => {
    if (!profile) return ['citizen'];
    const role = profile.role;
    
    const wingMapping: Record<string, UserWing[]> = {
      master_admin: ['admin', 'ministry', 'doctor', 'lab', 'citizen', 'researcher', 'regulator', 'system'],
      admin: ['admin', 'ministry', 'doctor', 'lab', 'citizen', 'researcher', 'regulator'],
      ministry_admin: ['ministry', 'citizen'],
      ministry_analyst: ['ministry', 'citizen', 'researcher'],
      ministry_inspector: ['ministry', 'citizen', 'regulator'],
      physician: ['doctor', 'citizen'],
      technician: ['lab', 'citizen'],
      pathologist: ['lab', 'citizen'],
      lab_admin: ['lab', 'citizen'],
      researcher: ['researcher', 'citizen'],
      regulator: ['regulator', 'citizen'],
      auditor: ['regulator', 'citizen'],
      integration_service: ['admin', 'system'],
      citizen: ['citizen']
    };

    return wingMapping[role] || ['citizen'];
  }, [profile]);

  const navSections = useMemo(() => {
    const sections: Record<UserWing, { icon: any; label: string; items: any[] }> = {
      doctor: {
        icon: Stethoscope,
        label: t.doctorWing,
        items: [
          { to: '/', icon: LayoutDashboard, label: t.dashboard, subtext: t.clinicalOps },
          { to: '/patients', icon: User, label: t.healthRecords, subtext: t.patientRegistry },
          { to: '/appointments', icon: Calendar, label: t.appointments, subtext: t.schedules },
          { to: '/intelligence', icon: BrainCircuit, label: t.medicalIntelligence, subtext: t.aiSupport },
          { to: '/messages', icon: MessageSquare, label: t.messages, subtext: t.clinicalOps },
        ],
      },
      lab: {
        icon: Microscope,
        label: t.labWing,
        items: [
          { to: '/lab/dashboard', icon: LayoutDashboard, label: t.dashboard, subtext: t.limsOverview },
          { to: '/lab/orchestrator', icon: Zap, label: "Lab Orchestrator", subtext: "Autonomous Routing" },
          { to: '/lab/tests', icon: ClipboardList, label: "Test Manager", subtext: "Protocol Catalog" },
          { to: '/lab/queue', icon: TestTube, label: t.workQueue, subtext: t.processing },
          { to: '/lab/samples', icon: Box, label: t.sampleTracking, subtext: t.inventory },
          { to: '/lab/qc', icon: ShieldCheck, label: t.qcControl, subtext: t.standardization },
          { to: '/lab/imaging', icon: ImageIcon, label: "Imaging Lab", subtext: "Image Intelligence" },
          { to: '/lab/devices', icon: Microscope, label: t.deviceManagement, subtext: t.connectivity },
          { to: '/messages', icon: MessageSquare, label: t.messages, subtext: t.limsOverview },
        ],
      },
      citizen: {
        icon: User,
        label: t.citizenWing,
        items: [
          { to: '/citizen/dashboard', icon: LayoutDashboard, label: t.dashboard, subtext: t.healthOS },
          { to: '/citizen/assistant', icon: BrainCircuit, label: "AI Assistant", subtext: "GULA Intelligence" },
          { to: '/citizen/profile', icon: Activity, label: t.myHealth, subtext: t.healthTrends },
          { to: '/citizen/results', icon: TestTube, label: t.labResults, subtext: t.interpretation },
          { to: '/citizen/medications', icon: Pill, label: t.medicineCabinet, subtext: t.medicationAdherence },
          { to: '/citizen/appointments', icon: Calendar, label: t.appointments, subtext: t.consultDoctor },
          { to: '/financial/marketplace', icon: ShoppingCart, label: "Booking Center", subtext: "Find Labs & Clinics" },
          { to: '/citizen/family', icon: Users, label: t.familyManagement, subtext: t.familyNetwork },
          { to: '/messages', icon: MessageSquare, label: t.messages, subtext: t.assistantWelcome },
          { to: '/citizen/security', icon: ShieldCheck, label: t.privacyDashboard, subtext: t.dataControl },
        ],
      },
      admin: {
        icon: Shield,
        label: t.adminWing,
        items: [
          { to: '/', icon: LayoutDashboard, label: t.systemDashboard, subtext: t.globalStatus, roles: ['master_admin', 'admin'] },
          { to: '/admin/audit', icon: History, label: t.auditLogs, subtext: t.compliance, roles: ['master_admin', 'admin', 'ministry_inspector'] },
          { to: '/admin/architecture', icon: Code2, label: t.systemsArchitecture, subtext: t.globalStatus, roles: ['master_admin'] },
          { to: '/admin/integrations', icon: Globe, label: t.connectedApis, subtext: t.interoperability, roles: ['master_admin', 'admin', 'integration_service'] },
          { to: '/admin/infrastructure', icon: Server, label: t.clusterHealth, subtext: t.nodeNetwork, roles: ['master_admin'] },
          { to: '/settings', icon: Settings, label: t.infrastructure, subtext: t.settings, roles: ['master_admin', 'admin', 'integration_service'] },
        ],
      },
      researcher: {
        icon: BrainCircuit,
        label: t.researcherWing,
        items: [
          { to: '/research/analytics', icon: BrainCircuit, label: t.predictiveTrends, subtext: t.aiIntelligence, roles: ['researcher', 'ministry_analyst', 'master_admin'] },
          { to: '/research/population', icon: Globe, label: t.populationHealth, subtext: t.gisSurveillance, roles: ['researcher', 'ministry_analyst', 'master_admin'] },
        ],
      },
      regulator: {
        icon: ShieldCheck,
        label: t.regulatorWing,
        items: [
          { to: '/admin/audit', icon: History, label: t.auditLogs, subtext: t.compliance, roles: ['regulator', 'ministry_inspector', 'master_admin', 'auditor'] },
          { to: '/lab/dashboard', icon: LayoutDashboard, label: t.standardization, subtext: t.qualityControl, roles: ['regulator', 'master_admin'] },
        ],
      },
      ministry: {
        icon: Building2,
        label: t.ministryWing,
        items: [
          { to: '/ministry/control-plane', icon: QuickZap, label: t.cp_controlPlane, subtext: "National OS", roles: ['ministry_admin', 'master_admin'] },
          { to: '/ministry/dashboard', icon: LayoutDashboard, label: t.nationalCommand, subtext: t.populationHealth, roles: ['ministry_admin', 'ministry_analyst', 'master_admin'] },
          { to: '/ministry/epidemiology', icon: Globe, label: t.epiSurveillance, subtext: t.activeOutbreaks, roles: ['ministry_analyst', 'master_admin', 'researcher'] },
          { to: '/ministry/labs', icon: Microscope, label: t.labControl, subtext: t.labThroughput, roles: ['ministry_admin', 'master_admin'] },
          { to: '/ministry/audit', icon: History, label: t.complianceAudit, subtext: t.integrityRating, roles: ['ministry_inspector', 'master_admin', 'regulator'] },
          { to: '/ministry/emergency', icon: QuickZap, label: t.emergencyCenter, subtext: t.criticalAlerts, roles: ['ministry_admin', 'master_admin'] },
          { to: '/ministry/licensing', icon: ClipboardList, label: t.regulatoryControl, subtext: t.regulator, roles: ['ministry_inspector', 'master_admin'] },
          { to: '/ministry/finance', icon: CreditCard, label: t.healthFinance, subtext: t.financeResources, roles: ['ministry_admin', 'master_admin'] },
          { to: '/financial/simulation', icon: TrendingUp, label: "Market Simulator", subtext: "Stress Testing", roles: ['master_admin', 'ministry_admin'] },
          { to: '/ministry/users', icon: Users, label: t.userGovernance, subtext: t.iamPolicies, roles: ['ministry_admin', 'master_admin'] },
          { to: '/ministry/integration', icon: Globe, label: t.integrationGateway, subtext: t.interoperabilityHub, roles: ['ministry_admin', 'master_admin'] },
        ],
      },
      system: {
        icon: Server,
        label: "System",
        items: [
          { to: '/', icon: LayoutDashboard, label: t.systemDashboard, subtext: t.globalStatus, roles: ['master_admin'] },
          { to: '/admin/audit', icon: History, label: t.auditLogs, subtext: t.compliance, roles: ['master_admin'] },
          { to: '/admin/architecture', icon: Code2, label: t.systemsArchitecture, subtext: t.globalStatus, roles: ['master_admin'] },
        ],
      }
    };

    return Object.entries(sections)
      .filter(([wing]) => wing === currentWing && availableWings.includes(wing as UserWing))
      .map(([wing, config]) => ({
        wing: wing as UserWing,
        ...config,
        items: config.items.filter(item => {
          if (item.to.startsWith('/financial') && !(import.meta as any).env.VITE_ENABLE_FINANCIAL_ENGINE) return false;
          if (!item.roles) return true;
          return profile && item.roles.includes(profile.role);
        })
      }))
      .filter(section => section.items.length > 0);
  }, [availableWings, t, profile, currentWing]);

  return { navSections, availableWings };
}

const TestTube = FlaskConical; // Alias
