import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Zap, Shield, Search, Database, Fingerprint, Activity, Link2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Node {
  id: string;
  type: 'patient' | 'lab' | 'disease' | 'medication';
  label: string;
  x: number;
  y: number;
  value: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

export function GraphIntelligenceLayer() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    // Generate complex semi-random graph for visualization
    const initialNodes: Node[] = [
      { id: '1', type: 'disease', label: 'COVID-24 Variant', x: 50, y: 50, value: 80 },
      { id: '2', type: 'lab', label: 'Baghdad Central', x: 30, y: 30, value: 60 },
      { id: '3', type: 'lab', label: 'Basrah Regional', x: 70, y: 30, value: 50 },
      { id: '4', type: 'medication', label: 'Sovereign Sentinel-V', x: 50, y: 80, value: 70 },
      { id: '5', type: 'patient', label: 'Patient Cluster A', x: 20, y: 60, value: 40 },
      { id: '6', type: 'patient', label: 'Patient Cluster B', x: 80, y: 60, value: 45 },
    ];

    const initialLinks: Link[] = [
      { source: '1', target: '2', strength: 0.8 },
      { source: '1', target: '3', strength: 0.6 },
      { source: '2', target: '5', strength: 0.9 },
      { source: '3', target: '6', strength: 0.7 },
      { source: '4', target: '1', strength: 0.5 },
      { source: '4', target: '5', strength: 0.4 },
      { source: '4', target: '6', strength: 0.4 },
    ];

    setNodes(initialNodes);
    setLinks(initialLinks);
  }, []);

  return (
    <div className="bg-slate-900 rounded-[3rem] border border-white/10 p-10 relative overflow-hidden h-[600px] flex flex-col">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <div className="relative z-10 flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Share2 size={18} className="text-white" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">National Health Graph Engine</h3>
          </div>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.25em] italic">Multi-Dimensional Semantic Relationship Mapping</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" />
              Intelligence Core: Active
           </div>
        </div>
      </div>

      <div className="flex-1 relative border border-white/5 rounded-[2.5rem] bg-black/20 overflow-hidden cursor-crosshair">
         <svg className="w-full h-full">
            {/* Links */}
            {links.map((link, i) => {
              const source = nodes.find(n => n.id === link.source);
              const target = nodes.find(n => n.id === link.target);
              if (!source || !target) return null;
              return (
                <motion.line
                  key={`link-${i}`}
                  x1={`${source.x}%`}
                  y1={`${source.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth={link.strength * 4}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              );
            })}
            
            {/* Nodes */}
            {nodes.map((node) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
              >
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={node.value / 2}
                  className={cn(
                    "transition-colors",
                    node.type === 'disease' ? "fill-rose-500/20 stroke-rose-500" :
                    node.type === 'lab' ? "fill-indigo-500/20 stroke-indigo-500" :
                    node.type === 'medication' ? "fill-emerald-500/20 stroke-emerald-500" :
                    "fill-amber-500/20 stroke-amber-500"
                  )}
                  strokeWidth="2"
                />
                <text
                  x={`${node.x}%`}
                  y={`${node.y + 10}%`}
                  className="fill-white/60 text-[10px] font-black uppercase text-center"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
              </motion.g>
            ))}
         </svg>

         <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-8 right-8 w-64 bg-slate-900 border border-indigo-500/30 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl"
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-2 rounded-xl",
                      selectedNode.type === 'disease' ? "bg-rose-500/20 text-rose-500" :
                      selectedNode.type === 'lab' ? "bg-indigo-500/20 text-indigo-500" :
                      "bg-emerald-500/20 text-emerald-500"
                    )}>
                       <Database size={18} />
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-white/20 hover:text-white transition-colors uppercase text-[8px] font-black">Close</button>
                 </div>
                 <h4 className="text-sm font-black text-white mb-1 uppercase italic tracking-tighter">{selectedNode.label}</h4>
                 <p className="text-[10px] font-bold text-white/40 uppercase mb-4">{selectedNode.type} Entity</p>
                 
                 <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-[8px] font-black text-indigo-400 uppercase block mb-1">Global Weight</span>
                       <span className="text-xs font-bold text-white">{selectedNode.value} / 100</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-[8px] font-black text-indigo-400 uppercase block mb-1">Connections</span>
                       <span className="text-xs font-bold text-white">{links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length} Active Nodes</span>
                    </div>
                 </div>

                 <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                    Semantic Drill-down
                 </button>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
         {[
            { label: 'Patient Density', val: 'High', icon: Users, color: 'rose' },
            { label: 'Lab Accuracy', val: '99.9%', icon: Shield, color: 'indigo' },
            { label: 'Inference Delay', val: '14ms', icon: Zap, color: 'amber' },
            { label: 'Integrity Sigs', val: 'Matched', icon: Fingerprint, color: 'emerald' },
         ].map((kpi, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
               <div className={cn("p-2 rounded-xl", `bg-${kpi.color}-500/20 text-${kpi.color}-500`)}>
                  <kpi.icon size={16} />
               </div>
               <div>
                  <span className="text-[8px] font-black text-white/30 uppercase block mb-0.5">{kpi.label}</span>
                  <span className="text-xs font-black text-white italic">{kpi.val}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
