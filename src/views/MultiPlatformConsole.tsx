import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getClinicalInsight } from '../services/geminiService';
import { PageTransition } from '../components/PageTransition';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Users, 
  QrCode, 
  ClipboardList, 
  Brain, 
  Heart, 
  Activity, 
  Sparkles, 
  Mic, 
  Volume2, 
  ShieldAlert, 
  Award, 
  Database, 
  Key, 
  Trash2, 
  Globe, 
  Check, 
  AlertTriangle, 
  Play, 
  Camera, 
  Radio, 
  FileText,
  User,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Multi-Language Translation Map for all modules (Section 10 and 11 compliance)
const I18N_DICT = {
  EN: {
    title: "Multi-Platform Executive Portal",
    subtitle: "Unified Cognitive Workspace Simulator & Client Deployments",
    configPanel: "Operational Controls",
    simDevice: "Simulation Target",
    simBandwidth: "Network Flow Latency",
    simStatus: "System Status",
    highBandwidth: "Enterprise Peak High-Speed",
    lowBandwidth: "Intermittent Rural Satellite (<2% Peak)",
    offlineFirst: "Autonomous Offline-First Grid",
    biometrics: "Biometric Authentication Key",
    nodeSync: "State Synchronization Nodes",
    remoteSession: "Remote Session Integrity",
    forceLogout: "Invalidate Remote Device",
    syncQueue: "Delayed Synchronized Queue",
    syncTrigger: "Reconcile Edge Data",
    digitalTwin: "Digital Health Twin Nodes",
    familyGraph: "Family Health Registry Links",
    smartLab: "Smart Lab Reference Panels",
    aiAssistant: "AI Consultation Dialect Engine",
    emergencyProfile: "Field Ambulance QR Profile",
    privacyDashboard: "Citizen Cryptographic Controls",
    clinicalTimeline: "Longitudinal Bedside Timeline",
    decisionSupport: "CDSS Safety Protocol Framework",
    aiCopilot: "Physician AI Copilot gateway",
    voiceNotes: "Bedside Voice Diagnostic notes",
    analyzerTelemetry: "Analyzer Real-Time Calibration Drift",
    qualityControl: "LIMS Standard QC Reference Distribution",
    specimenScanner: "Specimen RFID/Barcode Scanner",
    bedsideCollection: "Touch bedside barcode validator",
    reagentAlerts: "Critical reagent shelf-life alert",
    noDiagnosisAdv: "Zero Autonomous Diagnosis Guardrail: Manual Physician validation is strictly mandatory.",
    promptPlh: "Ask GULA in any regional dialect (e.g., Arabizi, Sorani)...",
    send: "Inquire Core Node",
    analyzing: "Resolving GULA Core routing..."
  },
  AR: {
    title: "بوابة الإدارة الطبية متعددة المنصات",
    subtitle: "محاكي بيئة العمل الإدراكية وطبقات النشر السيادية",
    configPanel: "عناصر التحكم التشغيلية",
    simDevice: "هدف المحاكاة الإقليمي",
    simBandwidth: "سرعة تدفق الشبكة",
    simStatus: "حالة النظام",
    highBandwidth: "النطاق العريض عالي السرعة",
    lowBandwidth: "قمر صناعي ريفي متقطع (<2% تسريب)",
    offlineFirst: "شبكة محلية مستقلة دون اتصال",
    biometrics: "مفتاح البصمة الحيوية المؤمن",
    nodeSync: "مزامنة عقد الحالة النشطة",
    remoteSession: "سلامة الجلسة البعيدة",
    forceLogout: "إلغاء تنشيط الجهاز عن بعد",
    syncQueue: "طابور البيانات المحلي المؤجل",
    syncTrigger: "مصالحة بيانات الأطراف فورًا",
    digitalTwin: "عقد التوأم الرقمي الصحي",
    familyGraph: "سجل حوكمة العائلة الصحي",
    smartLab: "لوحة الفحص الذكي ومرجع LOINC",
    aiAssistant: "مساعد الذكاء الاصطناعي ولهجات جولا",
    emergencyProfile: "رمز طوارئ الإسعاف السريع QR",
    privacyDashboard: "ضوابط الخصوصية المشفرة للمواطن",
    clinicalTimeline: "الخط الزمني الممتد بجانب السرير",
    decisionSupport: "بروتوكول دعم القرار الطبي المعتمد",
    aiCopilot: "مساعد الطبيب الذكي المباشر",
    voiceNotes: "تسجيل الملاحظات الصوتية السريرية",
    analyzerTelemetry: "مراقبة انحراف معايرة جهاز التحليل",
    qualityControl: "توزيع ضبط الجودة المعتمدة LIMS",
    specimenScanner: "ماسح عينات الباركود و RFID المدمج",
    bedsideCollection: "التحقق المزدوج من عينة المريض",
    reagentAlerts: "إنذار عاجل لتلف المواد الكيميائية",
    noDiagnosisAdv: "قاعدة دعم القرار الآمن: التشخيص التلقائي محظور تمامًا. التحقق الطبي البشري إلزامي.",
    promptPlh: "اسأل جولا بأي لهجة إقليمية (عربيزي، سوراني)...",
    send: "إرسال إلى العقدة المركزية",
    analyzing: "جاري استدعاء حكمة جولا..."
  },
  KU: {
    title: "بۆردی بەڕێوەبردنی سەکۆ فرەکان",
    subtitle: "ئامێری ھاوشێوەکردنی ژینگەی پزیشکی GULA",
    configPanel: "کۆنتڕۆڵەکانی چالاکی",
    simDevice: "ئامانجی ھاوشێوەکردن",
    simBandwidth: "خێرایی گواستنەوەی تۆڕ",
    simStatus: "بارودۆخی سیستم",
    highBandwidth: "خێرایی زۆر و بەرفراوانی سازراو",
    lowBandwidth: "مانگی دەستکردی لادێیی ناڕێک (<2% دزەکردن)",
    offlineFirst: "تۆڕی خۆبەڕێوەبەری دەرەوەی هێڵ",
    biometrics: "ناسنامەی زیندەیی پارێزراو",
    nodeSync: "مزامەنەی بنکەکانی زانیاری",
    remoteSession: "پشکنینی ئاسایشی دانیشتن",
    forceLogout: "پەکخستنی ئامێر لە دوورەوە",
    syncQueue: "ڕیزبەندی نوێکردنەوەی ناوخۆیی",
    syncTrigger: "مزامەنەکردنی دەستبەجێ",
    digitalTwin: "سیستمی هاوشێوەی تەندروستی دیجیتاڵی",
    familyGraph: "سجلی هێڵی خێزانی پارێزراو",
    smartLab: "ئەنجامە فرەپسپۆڕییەکانی تاقیگە",
    aiAssistant: "یارمەتیدەری پزیشکی هۆشمەندی GULA",
    emergencyProfile: "کۆدی فریاکەوتنی خێرا (QR)",
    privacyDashboard: "سەکۆی کۆنترۆڵی پاراستنی زانیاری",
    clinicalTimeline: "هێڵی کاتی پزیشکی بەردەم نەخۆش",
    decisionSupport: "سیستمی خۆپاراستن لە کاتی بڕیار",
    aiCopilot: "هاوکاری پزیشکی هۆشمەند لە کاتی کار",
    voiceNotes: "تۆمارکردنی تێبینی دەنگی بەردەم نەخۆش",
    analyzerTelemetry: "چاودێری ڕێکخستنی ئامێری پشکنین",
    qualityControl: "نەخشەی دابەشبوونی کۆنترۆڵی جۆری بەردەوام",
    specimenScanner: "خوێنەری بارکۆدی نموونەکانی پشکنین",
    bedsideCollection: "پشکنینی هاوڕێکی کەسی نەخۆش و نموونە",
    reagentAlerts: "ئاگادارکەرەوەی بەسەرچوونی ماددەی کیمیایی تاقیگە",
    noDiagnosisAdv: "یاسای نیشانەی پاراستن: بڕیاری ئوتۆنۆم قەدەغەیە. تەنها پزیشک دەتوانێت بڕیار بدات.",
    promptPlh: "بە هەر شێوەزارێکی عێراقی پرسیار بکە (عەرەبی، کوردی)...",
    send: "بنێرە بۆ ناوەندی سەرەکی",
    analyzing: "خەریکی پرۆسێسکردنی زانیارییە..."
  },
  TR: {
    title: "Sovereign Çoklu Platform Yönetim Portali",
    subtitle: "GULA Tümleşik Tıbbi Algı Alanı ve Ağ Katmanları Simülatörü",
    configPanel: "İşletimsel Parametreler",
    simDevice: "Simülasyon Hedef Cihazı",
    simBandwidth: "Ağ Bağı Bant Genişliği",
    simStatus: "Sistem Sağlığı",
    highBandwidth: "Yüksek Kapasiteli Kesintisiz Ağ",
    lowBandwidth: "Kırsal Kesintili Uydu Modu (<2% Kaçak)",
    offlineFirst: "Bağımsız Çevrimdışı Çalışma Hücresi",
    biometrics: "Biyometrik Kimlik Doğrulama Anahtarı",
    nodeSync: "Aktif Durum Senkronizasyon Düğümü",
    remoteSession: "Uzaktan Oturum Güvenliği",
    forceLogout: "Cihaz Yetkisini Uzaktan Kaldır",
    syncQueue: "Gecikmeli Yerel Veri Kuyruğu",
    syncTrigger: "Düğüm Dosyalarını Senkronize Et",
    digitalTwin: "Dijital Sağlık İkizi Hücreleri",
    familyGraph: "Güvenli Aile Sağlık Grafikleri",
    smartLab: "LOINC Akıllı Laboratuvar Panelleri",
    aiAssistant: "GULA Yapay Zeka Diyalektik Motoru",
    emergencyProfile: "Hızlı Ambulans QR Sağlık Kartı",
    privacyDashboard: "Şifreli Vatandaş Gizlilik Paneli",
    clinicalTimeline: "Hasta Başı Boylamsal Kronolojik Akış",
    decisionSupport: "CDSS Karar Destek Güvenlik Matrisi",
    aiCopilot: "Hekim Yapay Zeka Canlı Yardımcısı",
    voiceNotes: "Ses Destekli Klinik Hasta Başı Notları",
    analyzerTelemetry: "Kalibrasyon Sapma Analiz Telemetrisi",
    qualityControl: "LIMS Standardizasyon QC Dağılım Grafiği",
    specimenScanner: "Entegre RFID/Barkod Numune Okuyucu",
    bedsideCollection: "Hasta Başı Çift Numune Doğrulama",
    reagentAlerts: "Ömrü Azalan Kritik Reaktif Uyarıları",
    noDiagnosisAdv: "Güvenlik Sınırı: Otonom nihai teşhis yasaktır. İnsan hekim denetimi zorunludur.",
    promptPlh: "GULA bölgesel sistemine yazın (Arabizi, Türkçe, Sorani)...",
    send: "Ana Düğüme Gönder",
    analyzing: "Yapay zeka yanıtı işleniyor..."
  },
  SY: {
    title: "ܦܘܪܬܠ ܕܕܒܪܢܘܬܐ ܕܚܘܠܡܢܐ ܕܣܢܕܩ̈ܐ ܣܓܝܐܐ",
    subtitle: "محاكي بيئة العمل السريانية الإدراكية لشبكة جولا",
    configPanel: "ܚܘܕܬܐ ܕܣܘܥܪܢܐ",
    simDevice: "ܢܝܫܐ ܕܕܘܡܝܐ ܩܠܝܡܝܐ",
    simBandwidth: "ܚܝܠܐ ܕܢܝܪܐ ܕܚܘܕܬܐ",
    simStatus: "ܐܝܟܢܘܬܐ ܕܛܟܣܐ",
    highBandwidth: "ܛܟܣܐ ܩܠܝܠܐ ܕܡܠܟܘܬܐ",
    lowBandwidth: "ܛܟܣܐ ܡܚܝܠܐ ܕܐܘܝܪܐ ܡܫܚܠܦܐ (<2% ܠܝܩ)",
    offlineFirst: "ܛܟܣܐ ܡܚܝܠܐ ܕܛܟܣܐ ܕܒܠܥܕ ܚܘܕܬܐ",
    biometrics: "ܡܦܬܚܐ ܕܪܘܫܡܐ ܕܚܝܐ ܡܗܝܡܢܐ",
    nodeSync: "ܡܙܕܘܓܢܘܬܐ ܕܩܘܛܪ̈ܐ ܟܢܝܫܐ",
    remoteSession: "ܫܝܢܐ ܕܝܬܒܬܐ ܕܣܢܕܩܐ",
    forceLogout: "ܒܛܠ ܡܨܥܐ ܕܣܢܕܩܐ ܡܢ ܪܘܚܩܐ",
    syncQueue: "ܣܕܪܐ ܕܡܘܕܥܢܘܬܐ ܕܠܐ ܡܙܕܘܓܢܘܬܐ",
    syncTrigger: "ܣܕܪ ܡܘܕܥܢܘܬܐ ܕܟܝܗ̈ܐ ܗܫܐ",
    digitalTwin: "ܬܘܡܐ ܕܝܠܝܕܐ ܕܚܘܠܡܢܐ ܕܝܓܝܛܠܝܐ",
    familyGraph: "ܣܓܠܐ ܕܒܝܬܘܬܐ ܕܚܘܠܡܢܐ ܫܝܢܐ",
    smartLab: "ܨܘܪܬܐ ܕܦܘܚܡܐ ܕܟܝܠܝܐ ܕLOINC",
    aiAssistant: "ܝܩܝܪܐ ܕܚܘܠܡܢܐ ܕܓܘܠܐ ܐܝܣܝܐ",
    emergencyProfile: "ܩܘܕܐ ܕܚܘܠܡܢܐ ܩܠܝܠܐ ܩܐ ܣܥܘܪܬܐ QR",
    privacyDashboard: "ܦܘܪܩܢܐ ܕܡܕܒܪܢܘܬܐ ܕܝܬܝܪܘܬܐ ܕܡܫܝܚܐ",
    clinicalTimeline: "ܩܘܕܐ ܕܟܪܘܢܝܩܐ ܕܟܪܝܗܐ ܩܪܝܒܐ ܠܥܪܣܐ",
    decisionSupport: "ܛܟܣܐ ܕܣܘܥܪܢܐ ܕܣܘܡܟܐ ܕܒܘܚܪܢܐ",
    aiCopilot: "ܣܥܘܪܐ ܚܝܐ ܕܐܣܝܐ ܕܟܠܐ ܗܫܐ",
    voiceNotes: "ܟܬܒܐ ܕܡܘܕܥܢܘܬܐ ܕܩܠܐ ܩܪܝܒܐ ܠܟܪܝܗܐ",
    analyzerTelemetry: "ܟܝܠܝܐ ܕܛܥܢܘܬܐ ܕܡܨܥܐ ܕܕܒܪܢܘܬܐ ܬܩܢܐ",
    qualityControl: "ܨܘܪܬܐ ܕܚܘܕܬܐ ܕܛܘܝܒܐ LIMS",
    specimenScanner: "ܩܪܝܢܐ ܕܒܪܩܘܕ ܘ RFID ܕܣܝܥܬܐ ܕܕܡܐ",
    bedsideCollection: "ܟܝܠܝܐ ܕܣܝܥܬܐ ܬܪܝܢܐ ܩܪܝܒܐ ܠܥܪܣܐ",
    reagentAlerts: "ܡܘܕܥܢܘܬܐ ܥܓܝܠܬܐ ܕܚܒܠܐ ܕܟܝܡܝܐ",
    noDiagnosisAdv: "ܐܣܝܘܬܐ ܒܠܥܕ ܫܘܛܦܢܘܬܐ: ܠܐ ܫܒܝܩܐ ܐܣܝܘܬܐ ܐܘܬܘܢܘܡܝܬܐ. ܚܘܕܬܐ ܕܐܣܝܐ ܡܗܝܪܐ ܐܠܨܝܬܐ.",
    promptPlh: "ܫܐܠ ܠܓܘܠܐ ܒܟܠ ܠܫܢܐ ܐܘ ܠܥܙܐ ܩܠܝܡܝܐ...",
    send: "ܫܕܪ ܠܩܘܛܪܐ ܡܨܥܝܐ",
    analyzing: "ܓܘܠܐ ܫܘܚܠܦܐ ܡܣܕܪܢܐ..."
  }
};

type SimDeviceType = 'desktop' | 'tablet_clinical' | 'smartphone_citizen' | 'smartphone_doctor' | 'smartphone_lab' | 'pwa_offline';
type NetworkMode = 'enterprise' | 'rural_unstable' | 'offline';

export function MultiPlatformConsole() {
  const { language, dir } = useLanguage();
  const { profile } = useAuth();
  const tSim = I18N_DICT[language as keyof typeof I18N_DICT] || I18N_DICT.AR;
  const isRtl = dir === 'rtl';

  // State controls for Simulator
  const [activeDevice, setActiveDevice] = useState<SimDeviceType>('desktop');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('enterprise');
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'stale'>('synced');
  const [offlineQueue, setOfflineQueue] = useState<{ id: string; type: string; summary: string; time: string }[]>([
    { id: 'TX-901', type: 'SYMPTOM_SUBMIT', summary: 'Severe Cough (3 weeks) - Arabizi detected', time: '10m ago' },
    { id: 'TX-902', type: 'LAB_SPECIMEN_SCAN', summary: 'Vial-8842 Hemoglobin Target Scan', time: '2m ago' }
  ]);
  const [remoteDevices, setRemoteDevices] = useState([
    { name: 'Dr. Erbil - iPad bedside 04', ip: '192.168.12.82', state: 'Active' },
    { name: 'Basra Labs - Rugged Android Specimen Handheld', ip: '10.0.4.152', state: 'Active' }
  ]);

  // Citizen interactive twin & profile state
  const [selectedOrgan, setSelectedOrgan] = useState<'brain' | 'heart' | 'blood' | null>('heart');
  const [familyNodes, setFamilyNodes] = useState([
    { id: 'member-01', name: 'Zaid K. (Father)', link: 'Primary Parent', active: true },
    { id: 'member-02', name: 'Layla S. (Mother)', link: 'Primary Node', active: true },
    { id: 'member-03', name: 'Yasir Z. (Son)', link: 'Dependent Ward', active: false }
  ]);

  // Citizen chatbot simulated Gemini
  const [citizenPrompt, setCitizenPrompt] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai'; text: string; dialect?: string }[]>([
    { role: 'ai', text: language === 'AR' ? "أنا مستشار جولا الصحي الذكي. كيف يمكنني مساعدتك الطبية اليوم في العراق؟" : "I am GULA's sovereign healthcare intelligence assistant. How can I support your medical decision workspace today?" }
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Lab simulation live calibration drift and QC charts data
  const [timeStep, setTimeStep] = useState(0);
  const [calibrationDrift, setCalibrationDrift] = useState<{ time: string; stable: number; drift: number }[]>([
    { time: '10AM', stable: 98.2, drift: 97.5 },
    { time: '11AM', stable: 98.4, drift: 97.2 },
    { time: '12PM', stable: 98.1, drift: 96.8 },
    { time: '01PM', stable: 98.5, drift: 95.7 },
    { time: '02PM', stable: 98.3, drift: 94.3 }
  ]);
  const [qcScatter] = useState([
    { x: -1.5, y: 95.2, label: 'Calib-A (Stale)' },
    { x: -0.8, y: 97.4, label: 'Calib-B (Stale)' },
    { x: 0.2, y: 98.5, label: 'Calib-C (Nominal)' },
    { x: 0.5, y: 99.1, label: 'Calib-D (Nominal)' },
    { x: 1.2, y: 97.9, label: 'Calib-E (Shift)' }
  ]);
  const [barcodeState, setBarcodeState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [reagents, setReagents] = useState([
    { name: 'Hematology Diluent Block-H4', status: 'Optimal', life: '92%' },
    { name: 'Atypical Viral Antibody Reagent R9', status: 'CRITICAL STABILITY SHIFT', life: '04%' }
  ]);

  // Physician voice review & telemetry
  const [isRecNotes, setIsRecNotes] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(94.2);

  // Simulated live counter for lab drift
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStep(prev => prev + 1);
      setCalibrationDrift(prev => {
        const nextTime = new Date().toLocaleTimeString(language === 'AR' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastValStable = prev[prev.length - 1].stable;
        const lastValDrift = prev[prev.length - 1].drift;
        // Introduce small random fluctuations and standard drift matching our analyzer predictions
        const newStable = +(lastValStable + (Math.random() - 0.5) * 0.4).toFixed(2);
        const newDrift = +(lastValDrift - Math.random() * 0.6).toFixed(2);
        return [...prev.slice(1), { time: nextTime, stable: newStable, drift: newDrift }];
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [language]);

  // Handle simulated Gemini call for the active language & dialetic translation
  const handleBotConsult = async () => {
    if (!citizenPrompt.trim()) return;
    const userMsg = citizenPrompt;
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setCitizenPrompt('');
    setIsBotThinking(true);

    try {
      // Direct integration with our real translation API endpoint we extended in server.ts
      const context = "Multi-platform simulation hub. Active client testing sovereign dialects and Iraqi health indicators.";
      const result = await getClinicalInsight(userMsg, context, undefined, language);
      
      // Let's analyze if query contains Arabizi/Kurdish phrases
      const hasArabizi = /[2-9]/.test(userMsg) && /[a-zA-Z]/.test(userMsg);
      const hasKurdish = /[\u0671-\u06D3]/.test(userMsg) && (userMsg.includes('بۆ') || userMsg.includes('تەندروستی'));
      let dialect = 'Standard Medical Classical';
      if (hasArabizi) dialect = 'Iraqi Arabizi-Vocal Shift';
      if (hasKurdish) dialect = 'Kurdish Sorani Lexicon';

      setChatLog(prev => [...prev, { 
        role: 'ai', 
        text: result.text,
        dialect: dialect
      }]);
    } catch (e) {
      setChatLog(prev => [...prev, { 
        role: 'ai', 
        text: `Network failure safety: Active Local GULA node has logged the diagnostic query to edge storage.\n\n[Disclaimer]: Safe local clinical evaluation mandatory.` 
      }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Barcode Scanning automation
  const triggerBarcodeScan = () => {
    setBarcodeState('scanning');
    toast.info('Accessing device optical container scan API...', { duration: 1500 });
    setTimeout(() => {
      const mockBarcode = 'RFID-GULA-992-1045';
      setBarcodeState('success');
      setScannedBarcode(mockBarcode);
      // Automatically add to offline queue as evidence
      setOfflineQueue(prev => [
        { id: `TX-${Math.floor(Math.random() * 1000)}`, type: 'LAB_SAMPLE_REGISTER', summary: `Specimen matched to parent: Primary Case File 1045`, time: 'Just Now' },
        ...prev
      ]);
      toast.success(`Successfully bound barcode: ${mockBarcode}`, { duration: 3000 });
    }, 2000);
  };

  const handleSyncDatabase = () => {
    if (offlineQueue.length === 0) {
      toast.info('Edge queues are already fully reconciled.');
      return;
    }
    setSyncStatus('syncing');
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Syncing decentralized transactions to national medical registry ...',
        success: () => {
          setOfflineQueue([]);
          setSyncStatus('synced');
          return 'Edge synchronization reconciled. Zero conflicts detected.';
        },
        error: 'Sovereign synchronization validation failed. Check gateway credentials.'
      }
    );
  };

  const terminateRemoteSession = (ip: string) => {
    setRemoteDevices(prev => prev.filter(d => d.ip !== ip));
    toast.error(`Invalidated remote keys for terminal: ${ip}`, { icon: <ShieldAlert className="text-rose-500" /> });
  };

  return (
    <PageTransition>
      <div className={`min-h-screen p-4 md:p-10 pb-32 max-w-7xl mx-auto space-y-8 select-none ${isRtl ? 'rtl' : 'ltr'}`}>
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-white/5">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 block">
              Sovereign Medical Infrastructure Control Core
            </span>
            <h1 className="text-2xl md:text-4xl font-headline font-black text-slate-900 dark:text-white tracking-tight">
              {tSim.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
              {tSim.subtitle}
            </p>
          </div>

          {/* Active stats display */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[11px] font-black uppercase tracking-wider ${
              networkMode === 'enterprise' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : networkMode === 'rural_unstable' 
              ? 'bg-amber-50 border-amber-100 text-amber-700' 
              : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              <Radio size={12} className="animate-pulse" />
              {networkMode === 'enterprise' ? tSim.highBandwidth : networkMode === 'rural_unstable' ? tSim.lowBandwidth : tSim.offlineFirst}
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-950 text-white border border-white/10 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <RefreshCw size={12} className={syncStatus === 'syncing' ? 'animate-spin text-indigo-400' : 'text-slate-400'} />
              <span>Edge:</span>
              <span className={syncStatus === 'synced' ? 'text-emerald-400' : 'text-amber-400'}>{syncStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Master Control Panel */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Controls Hub Card (Left 4 Columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Server size={140} className="text-indigo-400" />
              </div>

              <div className="flex items-center gap-2 text-indigo-400">
                <Database size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">{tSim.configPanel}</h3>
              </div>

              {/* Selector Devices */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{tSim.simDevice}</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'desktop', title: 'Desktop Workspace', desc: 'Physician Command Center & LIMS', icon: Monitor },
                    { id: 'tablet_clinical', title: 'Bedside Clinical Cockpit', desc: 'Rugged Tablet Bedside Touch-UI', icon: Tablet },
                    { id: 'smartphone_citizen', title: 'Smartphone Citizen Mode', desc: 'Symptom Consultation & Digital Twin', icon: Smartphone },
                    { id: 'smartphone_doctor', title: 'Smartphone Physician Mode', desc: 'Fast Triage Action Alert System', icon: ClipboardList },
                    { id: 'smartphone_lab', title: 'Smartphone Lab Assistant', desc: 'Specimen scanning & RFID emulator', icon: Smartphone },
                    { id: 'pwa_offline', title: 'Field Mobile PWA Grid', desc: 'Offline asynchronous first', icon: WifiOff }
                  ].map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => setActiveDevice(dev.id as SimDeviceType)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left border transition-all active:scale-95 ${
                        activeDevice === dev.id 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${activeDevice === dev.id ? 'bg-white/20' : 'bg-white/5'}`}>
                        <dev.icon size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{dev.title}</span>
                        <span className={`text-[9px] font-medium truncate ${activeDevice === dev.id ? 'text-white/70' : 'text-slate-400'}`}>{dev.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bandwidth Selector */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{tSim.simBandwidth}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'enterprise', label: '10GB/s' },
                    { mode: 'rural_unstable', label: 'Edge Satellite' },
                    { mode: 'offline', label: 'Local-Only' }
                  ].map((bw) => (
                    <button
                      key={bw.mode}
                      onClick={() => setNetworkMode(bw.mode as NetworkMode)}
                      className={`p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border text-center transition-all ${
                        networkMode === bw.mode
                        ? 'bg-white text-slate-950 border-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      {bw.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Biometrics */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">{tSim.biometrics}</span>
                  <span className="text-[9px] text-slate-400">IRIS-GULA security bounds</span>
                </div>
                <button 
                  onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${biometricsEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${biometricsEnabled ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                </button>
              </div>

            </div>

            {/* Offline Sync State tracker (Section 8 and 14 conformity) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.syncQueue}</span>
                </div>
                <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
                  {offlineQueue.length}
                </div>
              </div>

              {offlineQueue.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto text-emerald-500">
                    <Check size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block">Local edge core reconciled</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {offlineQueue.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black font-mono text-indigo-600 block">{item.id}</span>
                          <span className="text-[8px] font-medium text-slate-400">{item.time}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block truncate">{item.type}</span>
                        <p className="text-[9px] text-slate-400 font-medium truncate">{item.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSyncDatabase}
                disabled={offlineQueue.length === 0}
                className="w-full py-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                {tSim.syncTrigger}
              </button>
            </div>

            {/* Remote sessions invalidate controller */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.remoteSession}</span>
              </div>

              <div className="space-y-2">
                {remoteDevices.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-4">All edge terminals isolated.</p>
                ) : (
                  remoteDevices.map((dev) => (
                    <div key={dev.ip} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">{dev.name}</span>
                        <span className="text-[8px] font-mono text-indigo-500 block">{dev.ip}</span>
                      </div>
                      <button
                        onClick={() => terminateRemoteSession(dev.ip)}
                        className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        title={tSim.forceLogout}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Simulated Device Sandbox Viewport (Right 8 Columns) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col justify-between">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-[3rem] p-4 md:p-8 flex-1 flex flex-col min-h-[700px] relative shadow-2xl overflow-hidden">
              
              {/* Virtual Device Frame Wrapper */}
              <div className="absolute top-0 inset-x-0 h-10 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="px-3 py-0.5 rounded bg-slate-900/10 text-slate-500 text-[8px] font-black uppercase tracking-widest">
                  GULA Virtual Device Canvas - {activeDevice.replace('_', ' ').toUpperCase()}
                </div>
                <div className="flex items-center gap-3">
                  <Wifi size={12} className={networkMode === 'offline' ? 'text-slate-300' : 'text-emerald-500'} />
                  {biometricsEnabled && <ShieldCheck size={12} className="text-indigo-500" />}
                </div>
              </div>

              {/* Viewport Content Area (padding-top offsets frame banner) */}
              <div className="pt-10 flex-1 flex flex-col">
                <AnimatePresence mode="wait">

                  {/* 1. CITIZEN SMARTPHONE MODE */}
                  {activeDevice === 'smartphone_citizen' && (
                    <motion.div 
                      key="citizen_view"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6 py-4"
                    >
                      {/* Interactive Anatomical Twin (Digital Health Twin - Section 3.1) */}
                      <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Brain size={80} />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <Brain size={16} className="text-indigo-400 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest block">{tSim.digitalTwin}</span>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-12 md:col-span-6 flex justify-center py-2">
                            {/* Simple SVG humanoid Profile vector blueprint */}
                            <svg className="w-24 h-48 text-indigo-500/20" viewBox="0 0 100 200" fill="none">
                              <circle cx="50" cy="30" r="16" className={`${selectedOrgan === 'brain' ? 'fill-indigo-500/40 stroke-indigo-400' : 'fill-indigo-500/10'} transition-all cursor-pointer`} onClick={() => setSelectedOrgan('brain')} />
                              <circle cx="50" cy="70" r="12" className={`${selectedOrgan === 'heart' ? 'fill-indigo-500/40 stroke-indigo-400' : 'fill-indigo-500/10'} transition-all cursor-pointer`} onClick={() => setSelectedOrgan('heart')} />
                              <path d="M42,90 L42,140" className={`${selectedOrgan === 'blood' ? 'stroke-indigo-400 stroke-2' : 'stroke-indigo-500/20'}`} />
                              <path d="M58,90 L58,140" className={`${selectedOrgan === 'blood' ? 'stroke-indigo-400 stroke-2' : 'stroke-indigo-500/20'}`} />
                              <path d="M30,50 L42,90 L50,90 L58,90 L70,50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          
                          <div className="col-span-12 md:col-span-6 space-y-3 font-sans">
                            {selectedOrgan === 'brain' ? (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Cognitive Cortex load</span>
                                <h4 className="text-sm font-black">98.2% Sovereign Synaptic Integrity</h4>
                                <p className="text-[9px] text-slate-400">Sleep, activity, and bilingual mental focus intervals are stable.</p>
                              </div>
                            ) : selectedOrgan === 'heart' ? (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">Myocardial Pulse Wave</span>
                                <h4 className="text-sm font-black">72bpm - Regular Sinus</h4>
                                <p className="text-[9px] text-slate-400">Heart-Rate Variability (HRV) mapped cleanly to historic citizen baseline database.</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Hematology Stabilization</span>
                                <h4 className="text-sm font-black">SpB2 Core Blood count</h4>
                                <p className="text-[9px] text-slate-400">Stable, verified Oxygen and platelet levels mapped using non-invasive IoT scan.</p>
                              </div>
                            )}

                            <div className="flex gap-1.5 pt-2">
                              {['brain', 'heart', 'blood'].map((org) => (
                                <button
                                  key={org}
                                  onClick={() => setSelectedOrgan(org as any)}
                                  className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    selectedOrgan === org 
                                    ? 'bg-white text-slate-950 font-bold' 
                                    : 'bg-white/5 border border-white/5 text-slate-400'
                                  }`}
                                >
                                  {org.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Family Health Hierarchy (Section 3.5) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-md space-y-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-indigo-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.familyGraph}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {familyNodes.map((fam) => (
                            <button
                              key={fam.id}
                              onClick={() => {
                                setFamilyNodes(prev => prev.map(f => f.id === fam.id ? { ...f, active: !f.active } : f));
                                toast.info(`Toggled active tracking sharing for ${fam.name}`);
                              }}
                              className={`p-4 rounded-2xl text-left border transition-all ${
                                fam.active 
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200' 
                                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'
                              }`}
                            >
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">{fam.name}</span>
                              <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider block">{fam.link}</span>
                              <div className="flex items-center gap-1 mt-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${fam.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className="text-[8px] font-black uppercase text-slate-400">{fam.active ? 'SHARING' : 'OPT-OUT'}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Smart Lab result panel (Section 3.3) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList size={16} className="text-teal-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.smartLab}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            { name: 'Hemoglobin (A1C)', val: '5.4%', range: '4.0 - 5.6%', status: 'Nominal' },
                            { name: 'Glucose (HbA1c)', val: '104 mg/dL', range: '70 - 100 mg/dL', status: 'Slight High' }
                          ].map((res, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{res.name}</span>
                                <span className="text-[9px] font-mono text-slate-400">LOINC 17856-6 • Bound: {res.range}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                res.status === 'Nominal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>{res.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Translated GPT Chatbot (Section 3.2 and Section 8) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-md flex-1 flex flex-col gap-3 min-h-[300px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.aiAssistant}</span>
                          </div>
                        </div>

                        {/* Interactive message lists */}
                        <div className="flex-1 overflow-y-auto max-h-48 border border-slate-100 dark:border-white/5 p-3 rounded-2xl space-y-2 custom-scrollbar text-xs">
                          {chatLog.map((log, idx) => (
                            <div key={idx} className={`flex flex-col ${log.role === 'user' ? 'items-end' : 'items-start'}`}>
                              {log.dialect && (
                                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest pb-0.5">{log.dialect}</span>
                              )}
                              <div className={`p-3 rounded-2xl max-w-[85%] ${
                                log.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-white/5'
                              }`}>
                                {log.text}
                              </div>
                            </div>
                          ))}
                          {isBotThinking && (
                            <div className="flex items-center gap-2 p-2 text-slate-400 font-bold uppercase text-[8px] tracking-widest animate-pulse">
                              <RefreshCw size={10} className="animate-spin" /> {tSim.analyzing}
                            </div>
                          )}
                        </div>

                        {/* Message input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={tSim.promptPlh}
                            value={citizenPrompt}
                            onChange={(e) => setCitizenPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleBotConsult()}
                            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={handleBotConsult}
                            disabled={isBotThinking}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs transition-colors"
                          >
                            {tSim.send}
                          </button>
                        </div>
                      </div>

                      {/* Emergency Ambulance profile layout */}
                      <div className="bg-rose-900 border border-rose-800 p-6 rounded-[2rem] text-white space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-300">
                            <ShieldAlert size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest block">{tSim.emergencyProfile}</span>
                          </div>
                          <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-md text-glow-rose">BLOOD GROUP: O-</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-tight">Kamil M. Al-Rubaye</h4>
                            <p className="text-[9px] text-rose-200">National Sovereign ID: GULA-771-002</p>
                            <p className="text-[9px] text-rose-300 font-bold">ALLERGIES: Penicillin, Intolerance-K9</p>
                          </div>
                          
                          <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-lg shadow-rose-950/40">
                            {/* SVG mockup of a real QR code to unlock medical profile on local edges */}
                            <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                              <rect x="0" y="0" width="20" height="20" />
                              <rect x="10" y="10" width="10" height="10" fill="none" />
                              <rect x="80" y="0" width="20" height="20" />
                              <rect x="0" y="80" width="20" height="20" />
                              <rect x="40" y="40" width="20" height="10" />
                              <rect x="70" y="70" width="10" height="20" />
                              <rect x="30" y="10" width="10" height="10" />
                              <rect x="80" y="50" width="20" height="10" />
                            </svg>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* 2. PHYSICIAN CLINICAL COCKPIT (DESKTOP / TABLET CLINICAL) */}
                  {(activeDevice === 'desktop' || activeDevice === 'tablet_clinical') && (
                    <motion.div 
                      key="physician_view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 space-y-6 py-4"
                    >
                      {/* Bedside Triage Alert Banner */}
                      <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-6 rounded-[2rem] flex items-start gap-4 shadow-md relative overflow-hidden">
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-700">
                          <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 block mb-1">Live Clinical Alert Trigger</span>
                          <h4 className="text-sm font-black text-slate-900">Atypical CRP & Leukocytosis Shift Identified</h4>
                          <p className="text-[10px] text-slate-600 italic font-medium mt-1 leading-relaxed">
                            {tSim.noDiagnosisAdv}
                          </p>
                        </div>
                      </div>

                      {/* Side-by-Side Clinical Command & Evidence Provenance */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Clinical Timeline & Reports (Section 5.A) */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
                          <div className="flex items-center gap-2">
                            <ClipboardList size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.clinicalTimeline}</span>
                          </div>

                          <div className="relative border-l-2 border-slate-200 dark:border-white/10 pl-4 space-y-4">
                            {[
                              { date: 'MAY 2026', title: 'Viral Load Anomalous CRP Spike (CRP 42)', result: 'High Risk Cluster Index' },
                              { date: 'JAN 2026', title: 'Echocardiogram Stable Range 58%', result: 'Nominal Left Ventricular' },
                              { date: 'SEP 2025', title: 'Hypertensive Incident Log (H-12)', result: 'Scaled Baseline Dosage' }
                            ].map((hist, idx) => (
                              <div key={idx} className="relative group">
                                <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500 border border-white dark:border-slate-900 group-hover:scale-125 transition-transform" />
                                <div>
                                  <span className="text-[8px] font-black text-indigo-500 block">{hist.date}</span>
                                  <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{hist.title}</h5>
                                  <p className="text-[9px] text-slate-400 font-medium">{hist.result}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cognitive Orchestrated Copilot Trace showing safety indicators (Section 5.C) */}
                        <div className="bg-slate-950 text-white border border-white/10 p-6 rounded-[2rem] shadow-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-400">
                              <Brain size={16} className="animate-pulse" />
                              <span className="text-[9px] font-black uppercase tracking-widest block">{tSim.aiCopilot}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[8px] font-black tracking-widest uppercase">Safe CDSS</span>
                          </div>

                          <div className="space-y-3 font-mono">
                            <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/5">
                              <span className="text-slate-400">AI Confidence Score:</span>
                              <span className="text-emerald-400 font-bold">{confidenceScore}% Stability</span>
                            </div>
                            
                            <div className="space-y-2 text-[9px]">
                              <div className="p-2 bg-white/5 rounded-xl">
                                <span className="text-indigo-400 block font-bold uppercase tracking-wider">Provenance Reference Code</span>
                                <span className="text-slate-300">LOINC: 1988-5 • SNOMED-CT: 30129-4</span>
                              </div>
                              <div className="p-2 bg-white/5 rounded-xl">
                                <span className="text-indigo-400 block font-bold uppercase tracking-wider">Gateway Telemetry Check</span>
                                <span className="text-slate-300">Cognitive alignment validated against GULA Local Kernel Core.</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Bedside Voice Notes review interface (Section 5.B) */}
                      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic size={16} className="text-rose-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.voiceNotes}</span>
                          </div>
                          {isRecNotes && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> LISTENING
                            </span>
                          )}
                        </div>

                        <div className="flex gap-4 items-center">
                          <button
                            onClick={() => {
                              setIsRecNotes(!isRecNotes);
                              if (!isRecNotes) {
                                setVoiceTranscript('Analyzing patient notes in Iraqi dialect: CRP 42 with persistent cough for three weeks...');
                              } else {
                                setVoiceTranscript('');
                              }
                            }}
                            className={`p-5 rounded-2xl border transition-all active:scale-95 ${
                              isRecNotes 
                              ? 'bg-rose-500 border-rose-400 text-white shadow-lg' 
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 text-slate-500'
                            }`}
                          >
                            <Mic size={24} />
                          </button>
                          
                          <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 min-h-12 relative">
                            {voiceTranscript ? (
                              <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold italic">{voiceTranscript}</p>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tap mic to dictate clinical notes Bedside</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* 3. LABORATORY ASSISTANT MODE */}
                  {(activeDevice === 'smartphone_lab' || activeDevice === 'smartphone_doctor') && (
                    <motion.div 
                      key="lab_view"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6 py-4"
                    >
                      {/* Live Analyzer calibration drift curves (Section 4.C LIMS Telemetry) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-md space-y-4">
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-indigo-600 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.analyzerTelemetry}</span>
                        </div>

                        <div className="h-48 w-full -mx-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={calibrationDrift}>
                              <XAxis dataKey="time" hide />
                              <YAxis domain={[90, 100]} hide />
                              <Tooltip content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl text-[9px] font-mono text-white">
                                      Drift: {payload[0].value}% Stability
                                    </div>
                                  );
                                }
                                return null;
                              }} />
                              <Line type="monotone" dataKey="stable" stroke="#10b981" strokeWidth={2.5} dot={false} strokeDasharray="3 3" />
                              <Line type="monotone" dataKey="drift" stroke="#6366f1" strokeWidth={3} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Advanced QC (Section 4.A.3 Advanced QC Levey-Jennings) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-teal-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.qualityControl}</span>
                        </div>
                        
                        <div className="h-28 w-full -mx-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis type="number" dataKey="x" hide />
                              <YAxis type="number" dataKey="y" domain={[90, 102]} hide />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-slate-950 px-2.5 py-1 rounded-lg text-[8px] text-white">
                                      {payload[0].payload.label}: {payload[0].payload.y}%
                                    </div>
                                  );
                                }
                                return null;
                              }} />
                              <Scatter name="Calibrators" data={qcScatter} fill="#14b8a6" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Barcode / RFID specimen scanning (Section 4.B) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Camera size={16} className="text-indigo-600 animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.specimenScanner}</span>
                          </div>
                          {barcodeState === 'scanning' && (
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">ACCESSING CAMERA</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl relative overflow-hidden group">
                          {barcodeState === 'idle' ? (
                            <button
                              onClick={triggerBarcodeScan}
                              className="px-6 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                            >
                              Scan Blood Container
                            </button>
                          ) : barcodeState === 'scanning' ? (
                            <div className="flex flex-col items-center gap-3">
                              <RefreshCw size={24} className="animate-spin text-indigo-600" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Decoding RFID boundaries...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              {/* Vector of a scanned specimen container barcode */}
                              <div className="w-24 h-10 border border-slate-300 rounded p-1 flex items-center justify-center bg-white">
                                <span className="text-xl font-bold tracking-[0.2em] font-mono text-slate-800">||| || | ||</span>
                              </div>
                              <span className="text-xs font-black text-emerald-600 uppercase">Bound to parent: Case File 1045</span>
                              <button onClick={() => setBarcodeState('idle')} className="text-[9px] font-black text-indigo-500 uppercase">Reset Scanner</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bedside patient validation checkboxes (Section 4.B.Bedside Collection) */}
                      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-[2.5rem] space-y-3 shadow-md">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-indigo-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tSim.bedsideCollection}</span>
                        </div>
                        
                        {[
                          'Patient Unique National ID verified under GULA Auth',
                          'Vial specimen RFID bar matches physical patient case file',
                          'Edge local offline queue buffer initialized for transport sync'
                        ].map((chk, i) => (
                          <div key={i} className="flex gap-3 text-xs font-medium leading-relaxed pr-2">
                            <div className="w-4 h-4 bg-emerald-500 text-white rounded-md flex items-center justify-center mt-0.5">
                              <Check size={12} />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300">{chk}</span>
                          </div>
                        ))}
                      </div>

                      {/* Urgent Reagent Shelf-life warnings (Section 4.C) */}
                      <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] text-rose-950 space-y-4 shadow-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 block">{tSim.reagentAlerts}</span>
                        <div className="space-y-2">
                          {reagents.map((rg, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs pb-1 border-b border-rose-100/30">
                              <span className="font-bold">{rg.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                rg.status === 'Optimal' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-200 text-rose-700 animate-pulse'
                              }`}>{rg.life}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* 4. PWA FIELD CLINIC OFFLINE MODE */}
                  {activeDevice === 'pwa_offline' && (
                    <motion.div
                      key="pwa_view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 space-y-6 py-4"
                    >
                      {/* Zero connectivity diagnostic panel (Section 9 and 14) */}
                      <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                          <WifiOff size={100} />
                        </div>

                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500/30 font-mono uppercase tracking-widest">Autonomous Edge Grid Isolation</span>
                            <h3 className="text-xl font-black font-headline tracking-tighter mt-2">Mobile PWA Field Station Offline</h3>
                          </div>
                          <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center animate-pulse">
                            <WifiOff size={18} />
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                          Local edge biometric buffers and diagnostics are locked locally inside Dexie DB. Payloads are heavily compressed to adapt safely to rural village and satellite networks.
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-400 block font-sans">English Leakage Risk:</span>
                            <span className="text-emerald-400 font-bold">&lt; 1.04% Checked</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-sans">Local Queue Latency:</span>
                            <span className="text-indigo-400 font-bold">4.2 Seconds Synced</span>
                          </div>
                        </div>
                      </div>

                      {/* Offline emergency registration mock form */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem] space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Offline Citizen Intake</span>
                        
                        <div className="space-y-3">
                          <input type="text" placeholder="Citizen Full Name (Classical Arabic)" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl text-xs" />
                          <input type="text" placeholder="Biometric Identity Key (IRIS-99)" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl text-xs" />
                          <button 
                            onClick={() => {
                              setOfflineQueue(prev => [
                                { id: `TX-${Math.floor(Math.random() * 1000)}`, type: 'OFFLINE_USER_REGISTER', summary: 'Intake: Ahmed S. (Basra Field Clinic)', time: 'Just Now' },
                                ...prev
                              ]);
                              toast.info('Ingested to local device database.');
                            }}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                          >
                            Enqueue Local Registry
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
