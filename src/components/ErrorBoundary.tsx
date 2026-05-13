import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Simple frontend telemetry integration
    try {
      const telemetry = JSON.parse(localStorage.getItem('gula_telemetry') || '[]');
      telemetry.push({
        type: 'crash',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      localStorage.setItem('gula_telemetry', JSON.stringify(telemetry.slice(-100)));
    } catch (e) {
      // Ignore telemetry errors
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-white rounded-[3rem] border border-slate-200 p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-[2] pointer-events-none">
              <ShieldAlert size={240} />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-600 mb-8 border border-red-100 shadow-xl shadow-red-100">
                <AlertTriangle size={48} />
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">
                Self-Healing <span className="text-red-600">Protocol Initiated</span>
              </h1>
              
              <p className="text-slate-500 font-medium leading-relaxed mb-10 px-8">
                The GULA UI engine encountered a localized execution fault. Our autonomous recovery systems are attempting to isolate the affected component.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 w-full mb-10 text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block italic">Error Trace [Encrypted]</span>
                <code className="text-xs font-mono text-red-500 line-clamp-2">
                  {this.state.error?.message || 'Unknown Execution Error'}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button 
                  onClick={this.handleReset}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  Attempt Hot Reload
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex-1 py-5 border border-slate-200 text-slate-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Home size={14} />
                  Return to Matrix
                </button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Global Sentry Operational</span>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
