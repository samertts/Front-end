import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, CreditCard, ChevronRight, Info, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function MarketplaceView() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/financial/rank');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderClick = async (provider: any) => {
    // Record ad click
    try {
      const fingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`;
      const response = await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaignId: `camp-${provider.id}`, 
          providerId: provider.id,
          userId: 'anonymous-citizen', // ideally get from profile
          fingerprint
        })
      });
      
      if (response.status === 403) {
        toast.error("Security alert: Excessive activity detected.");
        return;
      }
      
      toast.success(`Booking redirected to ${provider.name}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            Provider <span className="text-indigo-600">Registry</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
            Quality-Verified Healthcare Services • 100% Free for Citizens
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Nearby</button>
          <button className="px-6 py-3 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">Best Rated</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for Lab Tests, Facilities, or Diagnostics..."
          className="w-full pl-16 pr-8 py-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
           <button className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
             <Filter size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {providers
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((provider, i) => (
            <motion.div 
              key={provider.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleProviderClick(provider)}
              className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer group"
            >
              <div className="p-10 relative">
                {i < 2 && (
                  <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                    <Zap size={10} /> Recommended
                  </div>
                )}
                
                <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all shadow-inner">
                  <span className="text-xl font-black text-slate-400 group-hover:text-white">{provider.name[0]}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{provider.name}</h3>
                  {provider.qualityScore > 8 && <ShieldCheck size={18} className="text-indigo-500" />}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-slate-800">{provider.qualityScore?.toFixed(1)}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fast Track</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Biochemistry</span>
                  <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Genomics</span>
                </div>

                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Rating</span>
                    <span className="text-sm font-black text-slate-900 mt-1">Excellent (4.9/5)</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-indigo-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Zap size={240} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight leading-none mb-6 italic">
            Zero-Cost Digital Health For All Citizens.
          </h2>
          <p className="text-indigo-200 font-bold mb-10 leading-relaxed">
            GULA operates on a provider-funded model. We charge institutions per-test fees to maintain the world's most advanced health infrastructure, keeping quality diagnostics accessible to every citizen at zero direct cost.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Apply for Subsidy</button>
            <button className="px-8 py-4 bg-indigo-800 text-white border border-indigo-700/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Transparency Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}
