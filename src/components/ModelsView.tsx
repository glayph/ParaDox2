import React from 'react';
import { 
  Cpu, 
  Search, 
  Settings, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { cn } from '../lib/utils.ts';

export function ModelsView() {
  const { models, activeModelId, setActiveModel, setView } = useWorkspace();

  return (
    <div className="h-full bg-natural-950 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-4 border-b border-white/5 pb-3">
          <button 
            onClick={() => setView('dashboard')}
            className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-[14px] font-bold text-white">Inference Models</h2>
            <p className="text-[10px] text-neutral-500 mt-0.5">Select and configure the intelligence engine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(models || []).map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "relative bg-natural-900 border p-4 rounded-xl space-y-4 group transition-all",
                activeModelId === model.id 
                  ? "border-sage-500 bg-sage-500/[0.02]" 
                  : "border-natural-700 hover:border-natural-600"
              )}
            >
              <div className="flex justify-between items-start">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center border transition-colors",
                  activeModelId === model.id 
                    ? "bg-sage-500 text-natural-950 border-sage-500" 
                    : "bg-natural-950 text-natural-800 border-natural-700 group-hover:text-bone-200"
                )}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-end gap-1">
                   {activeModelId === model.id && (
                     <span className="text-[8px] font-bold bg-white text-black px-1.5 py-0.5 rounded">Active</span>
                   )}
                   <span className="text-[9px] font-medium text-neutral-500">{model.provider}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[13px] font-bold text-white tracking-tight">{model.name}</h4>
                <p className="text-[11px] text-neutral-500 leading-none mb-2">Context: {model.context}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <Metric icon={Zap} label="Latency" val="120ms" />
                 <Metric icon={ShieldCheck} label="Safety" val="Secure" />
                 <Metric icon={Database} label="Knowledge" val="Q1 2024" />
                 <Metric icon={Globe} label="Region" val="US-CENTRAL" />
              </div>

              <div className="pt-4 border-t border-natural-800/50 flex gap-2">
                 <button 
                   onClick={() => setActiveModel(model.id)}
                   className={cn(
                     "flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                     activeModelId === model.id 
                       ? "bg-white/10 text-white cursor-default" 
                       : "bg-white text-black hover:bg-neutral-200"
                   )}
                 >
                   {activeModelId === model.id ? 'Current Model' : 'Select Model'}
                 </button>
                 <button className="p-1.5 rounded-lg bg-natural-800 border border-natural-700 text-natural-800 hover:text-bone-200 transition-colors">
                    <Settings className="w-3.5 h-3.5" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, val }: any) {
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 p-1.5 rounded-lg">
      <Icon className="w-2.5 h-2.5 text-neutral-600" />
      <div className="flex flex-col">
         <span className="text-[7px] font-medium text-neutral-500 tracking-wide leading-none">{label}</span>
         <span className="text-[9px] font-bold text-neutral-300">{val}</span>
      </div>
    </div>
  );
}
