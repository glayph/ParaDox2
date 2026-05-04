import React from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  CreditCard, 
  Code,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.ts';

export function SettingsView() {
  return (
    <div className="h-full bg-natural-950 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h2 className="text-sm font-black text-white tracking-widest uppercase">Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-0.5">
             <SettingsNavItem icon={User} label="Profile" active />
             <SettingsNavItem icon={Shield} label="Security" disabled />
             <SettingsNavItem icon={Bell} label="Alerts" disabled />
             <SettingsNavItem icon={CreditCard} label="Billing" disabled />
             <SettingsNavItem icon={Code} label="API" disabled />
          </div>

          <div className="md:col-span-3 space-y-4">
             <section className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Identity</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                         <User className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-[12px] font-bold text-white truncate">Architect</h4>
                         <p className="text-[9px] text-neutral-600 uppercase">devin@aether.ai</p>
                      </div>
                      <button 
                        disabled
                        className="text-[8px] font-bold uppercase text-neutral-800 cursor-not-allowed"
                        title="Editing disabled"
                      >
                        edit
                      </button>
                   </div>
                </div>
             </section>

             <section className="space-y-4">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Preferences</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg divide-y divide-white/5">
                   <ToggleOption label="Neural Text" active />
                   <ToggleOption label="Blur FX" active />
                   <ToggleOption label="Memory" />
                </div>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active, disabled }: any) {
  return (
    <button 
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group",
        active ? "bg-white/[0.05] text-white" : "text-neutral-600 hover:text-neutral-300",
        disabled && "opacity-30 cursor-not-allowed"
      )}
      title={disabled ? "Coming soon" : undefined}
    >
       <div className="flex items-center gap-2.5">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
       </div>
       <ChevronRight className={cn("w-3 h-3 transition-transform", active ? "rotate-90" : "")} />
    </button>
  );
}

function ToggleOption({ label, active }: any) {
  return (
    <div className="flex items-center justify-between px-4 py-3 opacity-50 cursor-not-allowed" title="Settings not synced in demo">
       <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-tight">{label}</span>
       <button 
         disabled
         className={cn(
           "w-8 h-4 rounded-full relative transition-colors",
           active ? "bg-emerald-500/50" : "bg-neutral-800"
         )}
       >
          <div className={cn(
            "absolute top-0.5 w-[10px] h-[10px] rounded-full bg-neutral-950 transition-all",
            active ? "left-4.5" : "left-0.5"
          )} />
       </button>
    </div>
  );
}
