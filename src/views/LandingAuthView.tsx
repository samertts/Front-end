import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Mail, Lock, UserPlus, LogIn, Heart, 
  AlertCircle, Chrome, User, Stethoscope, 
  Beaker, ChevronRight, ChevronLeft, Upload,
  Fingerprint, Smartphone, CheckCircle2, ScanFace,
  RefreshCcw, ShieldCheck, Key, Activity as ActivityIcon, WifiOff, Search,
  Eye, EyeOff, Globe, MapPin, Monitor, History, Bell
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { UserRole, UserWing } from '../types/domain';
import { PasswordStrength } from '../components/auth/PasswordStrength';
import { OTPInput } from '../components/auth/OTPInput';
import { SovereignBiometrics } from '../components/auth/SovereignBiometrics';

import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types/domain';

type AuthStep = 'entry' | 'identify' | 'authenticate' | 'signup_role' | 'signup_form' | 'security_layer' | 'forgot_password' | 'success';

export const LandingAuthView: React.FC = () => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { bypassAuth } = useAuth();
  const isMounted = useRef(true);
  
  // Refactored Steps
  const [step, setStep] = useState<AuthStep>('entry');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Identity State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration State
  const [role, setRole] = useState<UserRole>('citizen');
  const [wing, setWing] = useState<UserWing>('citizen');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [license, setLicense] = useState('');
  const [specialization, setSpecialization] = useState('');
  
  // Security Layer
  const [otp, setOtp] = useState('');
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [deviceTrusted, setDeviceTrusted] = useState(true);
  const [showBiometricOverlay, setShowBiometricOverlay] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastLoginInfo, setLastLoginInfo] = useState({
    location: 'Baghdad, Iraq',
    device: 'Samsung Galaxy S24 Ultra',
    time: '2 hours ago'
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Smart Login: Check for saved email
    const savedEmail = localStorage.getItem('gula_last_login_email');
    if (savedEmail) {
      setEmail(savedEmail);
      // We could automatically move to identify if we wanted a returning experience
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      isMounted.current = false;
    };
  }, []);

  const langs: any[] = ['EN', 'AR', 'KU', 'TR', 'SY'];

  const handleEntry = async () => {
    setIsDetecting(true);
    // Simulate session detection
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsDetecting(false);
    setStep('identify');
  };

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, we check if user exists. 
      // For the demo, we assume emails with 'new' are new users.
      // const methods = await fetchSignInMethodsForEmail(auth, email);
      // const exists = methods.length > 0;
      
      const exists = email.includes('user') || email === 'samertts2@gmail.com'; // Simulation
      setIsNewUser(!exists);
      
      if (exists) {
        setStep('authenticate');
        localStorage.setItem('gula_last_login_email', email);
      } else {
        setStep('signup_role');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const isMasterAdmin = result.user.email === 'samertts2@gmail.com';
      
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          role: isMasterAdmin ? 'master_admin' : 'citizen',
          wing: isMasterAdmin ? 'admin' : 'citizen',
          verified: true,
          updatedAt: serverTimestamp(),
          displayName: result.user.displayName || result.user.email?.split('@')[0],
        });
      }
    } catch (err: any) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Post-auth security layer if needed (e.g. OTP)
      // setStep('security_layer'); 
    } catch (err: any) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleBiometricAuth = () => {
    setShowBiometricOverlay(true);
  };

  const handleBiometricLoginSuccess = () => {
    const isPrimaryAdmin = email === 'samertts2@gmail.com' || email.includes('admin');
    const isLabUser = email.includes('lab') || email.includes('tech');
    const isDoctor = email.includes('doctor') || email.includes('physician') || email.includes('clinic');

    let simulatedRole: UserRole = 'citizen';
    let simulatedWing: UserWing = 'citizen';
    let displayName = 'Authorized Health Citizen';

    if (isPrimaryAdmin) {
      simulatedRole = 'master_admin';
      simulatedWing = 'admin';
      displayName = 'Master Administrator';
    } else if (isLabUser) {
      simulatedRole = 'technician';
      simulatedWing = 'lab';
      displayName = 'Senior Lab Pathologist';
    } else if (isDoctor) {
      simulatedRole = 'physician';
      simulatedWing = 'doctor';
      displayName = 'Clinical Lead Physician';
    }

    const biometricProfile: UserProfile = {
      uid: 'demo-sovereign-mfa-user',
      email: email || 'samertts2@gmail.com',
      name: fullName || displayName,
      displayName: displayName + ' (MFA Secured)',
      role: simulatedRole,
      wing: simulatedWing,
      verified: true,
      isBiometricEnrolled: true,
      createdAt: new Date().toISOString(),
      biometricCredentials: [
        {
          credentialId: 'HSM-CRED-MFA',
          publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsomekey',
          deviceName: 'TouchID Platform Biometrics',
          createdAt: new Date().toISOString(),
          userVerification: 'required',
          keyAlgorithm: 'ECDSA-ES256'
        }
      ]
    };

    bypassAuth(biometricProfile, true);
    setShowBiometricOverlay(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        name: fullName,
        phone,
        nationalId,
        licenseNumber: license,
        role,
        wing,
        verified: role === 'citizen',
        createdAt: serverTimestamp(),
      });
      await updateProfile(user, { displayName: fullName });
      setStep('security_layer');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityComplete = () => {
    // Finalize profile and go to app (AuthContext handles redirect)
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-[2rem] md:rounded-[48px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-200/60 relative z-10 min-h-[600px] md:min-h-[750px]">
        {/* Left Panel: High-Tech Branding - Hidden on mobile */}
        <div className="hidden md:flex bg-slate-900 p-12 text-white flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30" />
          
          {/* Animated Matrix-like Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none font-mono text-[8px] leading-tight overflow-hidden break-all p-4">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="whitespace-nowrap">
                {Math.random().toString(36).substring(2, 60)}
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase leading-none">{t.appName}</h1>
                <p className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-[0.3em] mt-1">{t.medicalIntelligence}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                    {step === 'entry' ? t.futurePublicHealth : 
                     isNewUser ? t.newAccount : 
                     t.returningUser}
                  </h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                    {step === 'entry' ? t.motto : t.seamlessIdentity}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{t.identityGuardTitle}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.identityGuardDesc}</p>
                    </div>
                  </div>
                  
                  {step !== 'entry' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{t.auditTrail}</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                          <span className="text-emerald-400">{t.live}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[10px] text-slate-300 font-medium">
                          <MapPin size={12} className="text-indigo-400" />
                          <span>{t.lastLogin}: {lastLoginInfo.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-300 font-medium">
                          <Monitor size={12} className="text-indigo-400" />
                          <span>{lastLoginInfo.device}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{t.systemStatusOptimal}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{t.uptimeStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Content */}
        <div className={cn("p-6 md:p-16 flex flex-col justify-center relative bg-white", isRtl ? "text-right" : "text-left")}>
          {/* Top Bar */}
          <div className={cn("absolute top-8 left-8 right-8 flex items-center justify-between z-20")}>
            {/* Language Toggle */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all",
                    language === l ? "bg-white text-indigo-600 shadow-sm shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {isOffline && (
              <div className="bg-amber-50 rounded-full py-1.5 px-4 border border-amber-100 flex items-center gap-2">
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">{t.offlineMode}</span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {step === 'entry' && (
              <motion.div
                key="entry"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                    <ActivityIcon className="w-3 h-3 text-indigo-600" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-700">{t.medicalIntelligence}</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{t.welcomeBack}</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">{t.nationalCommandCenter}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleEntry}
                    disabled={isDetecting || isOffline}
                    className="w-full bg-slate-900 text-white flex items-center justify-center gap-4 p-6 rounded-[2rem] hover:bg-black transition-all group relative overflow-hidden shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      {isDetecting ? (
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      )}
                      <span className="text-sm font-black uppercase tracking-[0.15em]">
                        {isDetecting ? t.detectingSession : t.continue}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isOffline}
                    className="w-full bg-white border border-slate-200 flex items-center justify-center gap-4 p-6 rounded-[2rem] hover:border-indigo-600 hover:bg-indigo-50/30 transition-all font-black text-sm uppercase tracking-widest text-slate-700 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Chrome className="w-5 h-5 text-indigo-600" />
                    <span>{t.signInWithGoogle}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.smartLogin}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Developer Fast Access */}
                <button
                  onClick={() => {
                    bypassAuth({
                      uid: 'demo-master-admin',
                      email: 'samertts2@gmail.com',
                      displayName: 'Master Administrator',
                      role: 'master_admin',
                      wing: 'admin',
                      verified: true,
                    } as UserProfile);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={14} />
                  {t.quickAccessDev}
                </button>
              </motion.div>
            )}

            {step === 'identify' && (
              <motion.div
                key="identify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <button onClick={() => setStep('entry')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    {t.cancel}
                  </button>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{t.securityCheck}</h3>
                  <p className="text-slate-500 font-medium">{t.enterEmailPhone}</p>
                </div>

                <form onSubmit={handleIdentify} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                      {t.accountEmail} / {t.phone}
                    </label>
                    <div className="relative group">
                      <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors", isRtl ? "right-5" : "left-5")} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="identity@gula.md"
                        className={cn(
                          "w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] py-5 md:py-6 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-base md:text-lg transition-all font-medium",
                          isRtl ? "pr-14 pl-6" : "pl-14 pr-6"
                        )}
                        required
                        autoFocus
                        autoComplete="username email"
                      />
                    </div>
                  </div>

                  {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3"><AlertCircle size={18} /> {error}</div>}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-indigo-600 text-white flex items-center justify-center gap-4 p-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <span>{t.continue}</span>}
                    {!isLoading && <ChevronRight className={cn("w-5 h-5", isRtl && "rotate-180")} />}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'authenticate' && (
              <motion.div
                key="authenticate"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{email}</h4>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{t.accountExists}</p>
                    </div>
                    <button onClick={() => setStep('identify')} className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 underline">
                      {t.changeRegion}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleBiometricAuth}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] hover:border-indigo-600 hover:bg-white transition-all group overflow-hidden relative"
                  >
                    <div className="bg-indigo-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <span className="font-black text-[10px] text-slate-700 uppercase tracking-widest leading-tight text-center">{t.biometricLog}</span>
                  </button>

                  <button
                    onClick={() => setShowPassword(true)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] hover:border-indigo-600 hover:bg-white transition-all group",
                      showPassword && "border-indigo-600 bg-white"
                    )}
                  >
                    <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", showPassword ? "bg-indigo-600 text-white" : "bg-white text-slate-400 shadow-sm")}>
                      <Key className="w-6 h-6" />
                    </div>
                    <span className="font-black text-[10px] text-slate-700 uppercase tracking-widest leading-tight text-center">{t.password}</span>
                  </button>
                </div>

                {showPassword && (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleLogin} 
                    className="space-y-6"
                  >
                    <div className="relative group">
                      <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors", isRtl ? "right-5" : "left-5")} />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          "w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] py-5 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium",
                          isRtl ? "pr-14 pl-6" : "pl-14 pr-6"
                        )}
                        required
                        autoFocus
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setStep('forgot_password')} className={cn("absolute top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline", isRtl ? "left-6" : "right-6")}>
                        {t.forgotPassword}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-950 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all"
                    >
                      {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin mx-auto" /> : t.login}
                    </button>
                  </motion.form>
                )}

                {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3"><AlertCircle size={18} /> {error}</div>}
              </motion.div>
            )}

            {step === 'signup_role' && (
              <motion.div
                key="signup_role"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setStep('identify')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                       {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} {t.previousStep}
                    </button>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[8px] font-black uppercase tracking-widest">{t.newAccount}</div>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{t.chooseOperationalDomain}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { id: 'citizen', wing: 'citizen', icon: User, title: t.citizenSignup, desc: t.personalHealthVault },
                    { id: 'physician', wing: 'doctor', icon: Stethoscope, title: t.doctorSignup, desc: t.clinicalSurveillance },
                    { id: 'technician', wing: 'lab', icon: Beaker, title: t.labSignup, desc: t.labAnalytics },
                    { id: 'lab_admin', wing: 'lab', icon: Shield, title: t.labAdmin, desc: t.labOperations },
                    { id: 'admin', wing: 'admin', icon: ShieldCheck, title: t.admin, desc: t.systemAudit },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setRole(p.id as UserRole); setWing(p.wing as UserWing); setStep('signup_form'); }}
                      className="w-full p-6 flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] hover:border-indigo-600 hover:bg-white transition-all text-left group shadow-sm"
                    >
                      <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {React.createElement(p.icon as any, { size: 24 })}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 uppercase tracking-tight leading-tight">{p.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{p.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'signup_form' && (
              <motion.div
                key="signup_form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <button onClick={() => setStep('signup_role')} className={cn("text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest")}>
                    {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} {t.previousStep}
                  </button>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t.onboarding}</h3>
                  <p className="text-slate-500 font-medium">{t.provisioningAccount}</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.fullName}</label>
                        <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-100" required autoComplete="name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.phone}</label>
                        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-100" required autoComplete="tel" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.password}</label>
                      <div className="relative group">
                         <Key className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                         <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-100" required autoComplete="new-password" />
                      </div>
                      <PasswordStrength password={password} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.nationalId}</label>
                      <input type="text" value={nationalId} onChange={e=>setNationalId(e.target.value)} placeholder="000-0000-000000-0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-100" required />
                    </div>

                    {role !== 'citizen' && (
                      <div className="p-6 bg-slate-900 rounded-3xl space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.licenseNumber}</label>
                          <input type="text" value={license} onChange={e=>setLicense(e.target.value)} placeholder="MD-882-990-2" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all" required />
                        </div>
                        <button type="button" className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-2xl hover:bg-white/10 transition-all font-black text-[9px] uppercase tracking-widest">
                          <Upload size={14} />
                          {t.uploadLicense}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t.submitRegistration}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'security_layer' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t.securityCheck}</h3>
                  <p className="text-slate-500 font-medium">Finalize your hardware binding and biometric enrollment.</p>
                </div>

                <div className="space-y-4">
                  {/* Device Binding */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <Smartphone className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{t.deviceBinding}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.activeSessionsDesc}</p>
                      </div>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full p-1 transition-all cursor-pointer", deviceTrusted ? "bg-indigo-600" : "bg-slate-300")} onClick={() => setDeviceTrusted(!deviceTrusted)}>
                      <motion.div animate={{ x: deviceTrusted ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>

                  {/* Biometric Enrollment */}
                  <button 
                    onClick={() => setIsBiometricEnrolled(true)}
                    className={cn(
                      "w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between group transition-all hover:border-indigo-600 hover:bg-white",
                      isBiometricEnrolled && "bg-emerald-50/50 border-emerald-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Fingerprint className={cn("w-6 h-6", isBiometricEnrolled ? "text-emerald-600" : "text-slate-400")} />
                      <div className="text-left">
                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{t.biometricVaulting}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isBiometricEnrolled ? t.validated : t.startBiometricScan}</p>
                      </div>
                    </div>
                    {isBiometricEnrolled && <CheckCircle2 className="text-emerald-600" size={20} />}
                  </button>

                  {/* Verification Code */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.phoneVerificationRequired}</p>
                    <OTPInput length={6} value={otp} onChange={setOtp} />
                  </div>
                </div>

                <button
                  onClick={handleSecurityComplete}
                  className="w-full bg-slate-950 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all"
                >
                  {t.enterCommandCenter}
                </button>
              </motion.div>
            )}

            {step === 'forgot_password' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                  <button onClick={() => setStep('identify')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <ChevronLeft size={14} /> {t.backToLogin}
                  </button>
                <div className="space-y-2">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t.recovery}</h3>
                   <p className="text-slate-500 font-medium">{t.accessResetLink}</p>
                </div>
                
                {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-3"><CheckCircle2 size={18} /> {message}</div>}
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.accountEmail}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl"
                  >
                    {t.requestOtp}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pointer-events-none opacity-40">
        <div className="flex items-center gap-2">
          <Shield size={12} />
          <span>{t.encryptionTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe size={12} />
          <span>{t.trustedNodes}</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-400">
          <ActivityIcon size={12} />
          <span>GULA Core v2.4.82</span>
        </div>
      </div>

      <AnimatePresence>
        {showBiometricOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowBiometricOverlay(false)}
                className="absolute top-6 right-6 text-slate-450 hover:text-slate-650 dark:hover:text-white text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-xl z-20 active:scale-95 transition-transform"
              >
                ✕ Close
              </button>
              <SovereignBiometrics 
                mode="login" 
                targetEmail={email} 
                onVerificationSuccess={handleBiometricLoginSuccess} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
