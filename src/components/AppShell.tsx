import React from 'react';
import { Sidebar } from './Sidebar.tsx';
import { Topbar } from './Topbar.tsx';
import { EditorInterface } from './EditorInterface.tsx';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isMobileMenuOpen, setMobileMenuOpen, panels, currentView } = useWorkspace();

  return (
    <div className="flex h-screen bg-neutral-950 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <EditorInterface />
      
      {/* Desktop Sidebar (Left Panel) */}
      <AnimatePresence mode="popLayout">
        {panels.history && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'var(--sidebar-width)', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:block border-r border-white/5 shrink-0"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] lg:hidden w-[85vw] max-w-[320px] shadow-2xl"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-neutral-950">
        <Topbar />
        
        <div className="flex-1 flex overflow-hidden min-w-0 relative">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 h-full overflow-hidden relative">
            {children}
          </main>

          {/* Right Panel (Tools/Analytics/Advanced View) */}
          <AnimatePresence mode="popLayout">
            {panels.tools && currentView === 'chat' && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'var(--side-panel-width)', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden xl:block border-l border-white/5 shrink-0 bg-black/20"
              >
                <div className="p-var(--spacing-density-6) h-full overflow-y-auto">
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-4 px-2">Analysis Hub</h3>
                   <div className="space-y-4">
                      <div className="glass-card p-4 space-y-2">
                        <div className="h-2 w-2/3 bg-white/5 rounded" />
                        <div className="h-2 w-full bg-white/5 rounded" />
                        <div className="h-2 w-1/2 bg-white/5 rounded" />
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
