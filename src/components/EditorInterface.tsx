import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  RotateCcw, 
  Undo, 
  Redo, 
  History, 
  Eye, 
  Keyboard,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { cn } from '../lib/utils.ts';

export function EditorInterface() {
  const { editingInfo, setEditing, updateConversation } = useWorkspace();
  const [content, setContent] = useState(editingInfo.initialContent || '');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setContent(editingInfo.initialContent || '');
    setIsDirty(false);
  }, [editingInfo.initialContent]);

  const handleSave = useCallback(() => {
    if (!editingInfo.id || !editingInfo.type || !isDirty) return;

    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      if (editingInfo.type === 'conversation-title') {
        updateConversation(editingInfo.id!, { title: content });
      }
      
      setSaveStatus('saved');
      setIsDirty(false);
      
      setTimeout(() => {
        setEditing(null, null);
      }, 400);
    }, 600);
  }, [content, editingInfo, updateConversation, setEditing, isDirty]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      if (window.confirm('Discard unsaved changes?')) {
        setEditing(null, null);
      }
    } else {
      setEditing(null, null);
    }
  }, [isDirty, setEditing]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingInfo.type) return;

      // Cmd/Ctrl + S to Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Esc to Close
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }

      // Cmd/Ctrl + P to Toggle Preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreview(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingInfo.type, handleSave, handleClose]);

  if (!editingInfo.type) return null;

  return (
    <AnimatePresence>
      {editingInfo.type && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Editor Container */}
          <motion.div 
            initial={{ scale: 0.98, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-3xl overflow-hidden"
          >
            {/* Toolbar */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded bg-neutral-800 text-neutral-400">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white capitalize">
                    Edit {editingInfo.type.replace('-', ' ')}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">
                      ID: {editingInfo.id?.slice(0, 8)}...
                    </span>
                    {isDirty && (
                      <span className="w-1 h-1 rounded-full bg-sage-500" />
                    )}
                    <span className="text-[10px] text-neutral-600 font-medium">
                      {saveStatus === 'saved' ? 'All changes saved' : (isDirty ? 'Unsaved changes' : 'Synced')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPreview(!isPreview)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-all",
                    isPreview ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isPreview ? 'Editor' : 'Preview'}
                </button>
                <div className="w-px h-4 bg-neutral-800 mx-2" />
                <button 
                  onClick={handleClose}
                  className="p-2 text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Editor Area */}
            <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Main Content Area */}
              <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300",
                isPreview ? "bg-neutral-950" : "bg-neutral-900"
              )}>
                {isPreview ? (
                  <div className="flex-1 overflow-y-auto p-4 md:p-12 max-w-3xl mx-auto w-full prose prose-invert prose-neutral">
                    <div className="text-neutral-300 whitespace-pre-wrap leading-relaxed break-words">
                      {content || 'No content to preview.'}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col p-4 md:p-12 relative">
                    <textarea 
                      autoFocus
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setIsDirty(true);
                        setSaveStatus('idle');
                      }}
                      placeholder="Start typing..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-lg md:text-xl text-neutral-200 leading-relaxed resize-none p-0 placeholder:text-neutral-800"
                    />
                  </div>
                )}
              </div>

              {/* Side Panel (Context/Metadata) */}
              <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col bg-neutral-900/50 shrink-0">
                <div className="p-6 border-b border-neutral-800">
                  <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] mb-4">Metadata</h3>
                  <div className="space-y-4">
                    <MetaItem label="Type" value={editingInfo.type || 'Unknown'} />
                    <MetaItem label="Created" value="2 hours ago" />
                    <MetaItem label="Version" value="v1.0.4" />
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] mb-3">Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between group cursor-pointer">
                        <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">Wrap text</span>
                        <div className="w-8 h-4 rounded-full bg-neutral-800 border border-neutral-700 relative">
                          <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-neutral-600" />
                        </div>
                      </label>
                      <label className="flex items-center justify-between group cursor-pointer">
                        <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">Spell check</span>
                        <div className="w-8 h-4 rounded-full bg-sage-500 relative">
                          <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                     <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] mb-3">Actions</h3>
                     <button className="w-full flex items-center justify-between px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors group">
                        <span className="text-xs text-neutral-400 group-hover:text-neutral-200">View history</span>
                        <Clock className="w-3.5 h-3.5 text-neutral-600" />
                     </button>
                  </div>
                </div>
              </aside>
            </main>

            {/* Footer */}
            <footer className="h-16 flex items-center justify-between px-6 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                    <Undo className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                    <Redo className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-px h-4 bg-neutral-800" />
                <button 
                  onClick={() => setContent(editingInfo.initialContent || '')}
                  className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-300 transition-colors text-[11px] font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to draft
                </button>
              </div>

              <div className="flex items-center gap-3">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-medium">Auto-saving</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-medium">Saved</span>
                  </div>
                )}
                <button 
                  onClick={handleSave}
                  disabled={!isDirty || saveStatus === 'saving'}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded font-medium text-[12px] transition-all",
                    isDirty 
                      ? "bg-white text-neutral-950 hover:bg-neutral-200" 
                      : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  Confirm changes
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-tight">{label}</span>
      <span className="text-xs text-neutral-400 font-medium">{value}</span>
    </div>
  );
}
