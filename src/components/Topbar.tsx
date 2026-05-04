import React from 'react';
import { 
  ChevronDown, 
  ChevronLeft,
  Bell, 
  Share2, 
  Cpu, 
  Layers,
  Zap,
  Users,
  Archive,
  ArchiveX,
  Menu,
  X,
  PanelLeft as SidebarIcon
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';

export function Topbar() {
  const { 
    models, 
    activeModelId, 
    setActiveModel, 
    activeConversationId, 
    setActiveConversation,
    conversations,
    collaborators,
    currentView,
    setView,
    updateConversation,
    isMobileMenuOpen,
    setMobileMenuOpen,
    panels,
    togglePanel
  } = useWorkspace();
  
  const activeModel = models.find(m => m.id === activeModelId);
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const roomCollaborators = (collaborators || []).filter(c => 
    c.currentRoom === (activeConversationId || currentView)
  );

  const showBack = currentView !== 'dashboard';

  const handleBack = () => {
    if (activeConversationId) {
      setActiveConversation(null);
    }
    setView('dashboard');
  };

  return (
    <header className="h-var(--spacing-density-8) md:h-11 flex items-center justify-between px-[var(--spacing-density-4)] bg-black border-b border-white/5 z-30 sticky top-0 shrink-0">
      <div className="flex items-center gap-[var(--spacing-density-3)] min-w-0">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 text-neutral-500 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
        </button>

        {/* Back Button */}
        <AnimatePresence mode="wait">
          {showBack && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={handleBack}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all active:scale-95 group"
            >
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Back</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Panel Toggle Control (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 mr-2">
           <button 
             onClick={() => togglePanel('history')}
             className={cn("p-1.5 rounded-lg transition-colors", panels.history ? "text-white" : "text-neutral-600 hover:text-neutral-400")}
           >
             <SidebarIcon className="w-3 h-3" />
           </button>
           {currentView === 'chat' && (
             <button 
              onClick={() => togglePanel('tools')}
              className={cn("p-1.5 rounded-lg transition-colors", panels.tools ? "text-white text-cyan-400" : "text-neutral-600 hover:text-neutral-400")}
             >
              <Zap className="w-3 h-3" />
             </button>
           )}
        </div>
 
        {/* Model Selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-all active:scale-95">
            <span className="text-[11px] font-medium text-neutral-500 truncate max-w-[80px] md:max-w-none">{activeModel?.name || 'Model'}</span>
            <ChevronDown className="w-3 h-3 text-neutral-700" />
          </button>
 
          <div className="invisible group-hover:visible absolute top-full left-0 mt-1 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setActiveModel(model.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-1.5 text-left rounded-lg transition-all",
                  activeModelId === model.id ? "bg-white/10 text-white" : "hover:bg-white/5 text-neutral-500"
                )}
              >
                <span className="text-[11px] font-medium truncate">{model.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
 
      <div className="flex items-center gap-2">
        {activeConversationId && (
          <button className="px-2.5 py-1 bg-white text-black rounded text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95">
            Save
          </button>
        )}
      </div>
    </header>
  );
}
