import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Folder,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ArrowLeft,
  FileCode,
  FileBox,
  Hash,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils.ts';
import { useWorkspace } from '../WorkspaceContext.tsx';

export function KnowledgeBase() {
  const { activeProjectId, projects, setView, indexFiles } = useWorkspace();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const activeProject = projects.find(p => p.id === activeProjectId);

  const indexedPaths = useMemo(() => new Set(activeProject?.indexedPaths || []), [activeProject?.indexedPaths]);

  useEffect(() => {
    const loadFiles = async () => {
      const activeId = activeProjectId;
      if (!activeId || !activeProject) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/projects/${activeId}/files?path=${encodeURIComponent(activeProject.path)}`);
        if (!res.ok) throw new Error('Failed to fetch project files');
        const data = await res.json();
        setFiles(data);
        
        // Auto-select indexed files
        const initialSelected = new Set(activeProject.indexedPaths || []);
        setSelectedPaths(initialSelected);
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiles();
  }, [activeProjectId]);

  const togglePath = (path: string, isDirectory: boolean, children?: any[]) => {
    const next = new Set(selectedPaths);
    
    const toggleRecursive = (p: string, kids?: any[]) => {
      if (next.has(p)) {
        next.delete(p);
        kids?.forEach(k => toggleRecursive(k.path, k.children));
      } else {
        next.add(p);
        kids?.forEach(k => toggleRecursive(k.path, k.children));
      }
    };

    if (isDirectory) {
      toggleRecursive(path, children);
    } else {
      if (next.has(path)) next.delete(path);
      else next.add(path);
    }
    
    setSelectedPaths(next);
  };

  const handleSync = async () => {
    if (!activeProjectId) return;
    setIsSyncing(true);
    try {
      await indexFiles(activeProjectId, Array.from(selectedPaths));
    } finally {
      setIsSyncing(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-neutral-950 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <FileBox className="w-8 h-8 text-neutral-600" />
        </div>
        <div className="max-w-[280px]">
          <h3 className="text-white font-bold text-lg tracking-tight">No Project Active</h3>
          <p className="text-[12px] text-neutral-500 mt-2">Select a project from the sidebar to browse your local workspace files.</p>
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(Array.from(selectedPaths).sort()) !== JSON.stringify(Array.from(indexedPaths).sort());

  return (
    <div className="h-full bg-[#050505] overflow-hidden flex flex-col selection:bg-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className="p-2 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-neutral-400" />
                Knowledge Base
              </h2>
              <p className="text-[11px] font-medium text-neutral-500 mt-0.5 max-w-[300px] truncate">
                Grounding environment: <span className="text-neutral-300">{activeProject.path}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Status</span>
               <span className={cn(
                 "text-[12px] font-bold mt-1",
                 hasChanges ? "text-amber-500" : "text-emerald-500"
               )}>
                 {hasChanges ? "Pending Changes" : "Synced"}
               </span>
             </div>
             <button 
                onClick={handleSync}
                disabled={!hasChanges || isSyncing}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg",
                  hasChanges && !isSyncing 
                    ? "bg-white text-black hover:bg-neutral-200 shadow-white/5" 
                    : "bg-neutral-900 border border-white/10 text-neutral-600 cursor-not-allowed opacity-50"
                )}
             >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isSyncing ? "Syncing..." : "Apply Sync"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input 
              type="text" 
              placeholder="Search local project files for grounding..."
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/10 text-white placeholder:text-neutral-700 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-neutral-500">
            <Info className="w-3.5 h-3.5 text-neutral-700" />
            <span>Select files to ground AI logic</span>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Project Filesystem</h3>
            <span className="text-[10px] font-mono text-neutral-700">{selectedPaths.size} items selected</span>
          </div>

          <div className="border border-white/5 rounded-3xl overflow-hidden bg-neutral-900/20 backdrop-blur-sm">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-neutral-800 animate-spin" />
                <div className="text-[11px] text-neutral-600 font-mono tracking-widest uppercase animate-pulse">
                  Scanning Project Directory...
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.02]">
                {files.map((file) => (
                  <FileRow 
                    key={file.path} 
                    file={file} 
                    depth={0} 
                    selectedPaths={selectedPaths} 
                    togglePath={togglePath}
                    indexedPaths={indexedPaths}
                  />
                ))}
                {files.length === 0 && (
                  <div className="bg-neutral-900/50 p-20 text-center space-y-3">
                    <Folder className="w-10 h-10 text-neutral-800 mx-auto" />
                    <p className="text-neutral-600 text-sm font-medium">Directory is empty or inaccessible.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold text-blue-100">Indexing & Grounding</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Selecting files here makes them accessible to the AI model during conversations. 
                Large binaries and binary folders (node_modules, .git) are automatically excluded from indexing to save context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({ 
  file, 
  depth, 
  selectedPaths, 
  togglePath,
  indexedPaths
}: { 
  file: any, 
  depth: number, 
  selectedPaths: Set<string>,
  togglePath: (path: string, isDirectory: boolean, children?: any[]) => void,
  indexedPaths: Set<string>
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPaths.has(file.path);
  const isIndexed = indexedPaths.has(file.path);
  
  // Folder icon or file icon based on extension
  const getIcon = () => {
    if (file.isDirectory) return Folder;
    if (file.name.endsWith('.md')) return Hash;
    if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js')) return FileCode;
    return FileText;
  };
  
  const Icon = getIcon();

  return (
    <>
      <div 
        className={cn(
          "group flex items-center gap-4 p-3.5 hover:bg-white/[0.03] transition-all cursor-pointer",
          isSelected && "bg-white/[0.01]"
        )}
        style={{ paddingLeft: `${(depth * 16) + 16}px` }}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            togglePath(file.path, file.isDirectory, file.children);
          }}
          className={cn(
            "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
            isSelected 
              ? "bg-white border-white text-black" 
              : "border-white/10 group-hover:border-white/30"
          )}
        >
          {isSelected && <CheckCircle2 className="w-3 h-3" />}
        </button>

        <div 
          onClick={() => file.isDirectory && setIsOpen(!isOpen)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          {file.isDirectory && (
            <ChevronRight className={cn("w-3 h-3 text-neutral-700 transition-transform", isOpen && "rotate-90")} />
          )}
          <div className="relative">
            <Icon className={cn(
              "w-4 h-4 shrink-0 transition-colors", 
              file.isDirectory ? "text-neutral-600 group-hover:text-blue-400" : "text-neutral-700 group-hover:text-neutral-300",
              isSelected && "text-white"
            )} />
            {isIndexed && !isSelected && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-black shadow-lg" />
            )}
          </div>
          <span className={cn(
            "text-[13px] transition-colors truncate",
            isSelected ? "text-white font-semibold" : "text-neutral-400 group-hover:text-neutral-200",
            isIndexed && !isSelected && "text-emerald-400/80 font-medium"
          )}>
            {file.name}
          </span>
        </div>
        
        <div className="flex items-center gap-4 shrink-0 px-2">
          {!file.isDirectory && (
             <span className="text-[10px] font-mono text-neutral-700 tabular-nums">
               {(file.size / 1024).toFixed(1)} KB
             </span>
          )}
          <span className="text-[10px] font-mono text-neutral-800 tabular-nums hidden sm:block">
            {new Date(file.updatedAt).toLocaleDateString()}
          </span>
          <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/5 text-neutral-600 hover:text-white transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {file.isDirectory && isOpen && file.children?.map((child: any) => (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            key={child.path}
          >
            <FileRow 
              file={child} 
              depth={depth + 1} 
              selectedPaths={selectedPaths} 
              togglePath={togglePath}
              indexedPaths={indexedPaths}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
