import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { motion } from 'framer-motion';
import { FolderPlus, Info, Save } from 'lucide-react';

export function CreateProject() {
  const { projects, activeProjectId, setActiveProject, createProject, setView } = useWorkspace();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsCreating(true);
    await createProject(name, location || undefined);
    setIsCreating(false);
    setView('dashboard');
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 p-6 flex flex-col items-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] space-y-12"
      >
        {/* Workspace Switcher Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Project</h2>
            <p className="text-[13px] text-neutral-500">Manage your local workspaces and active environments.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
             <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest px-1">Active Workspace</label>
             <select 
              value={activeProjectId || ''}
              onChange={(e) => setActiveProject(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-white/10 transition-all cursor-pointer"
            >
              {projects.length === 0 && <option value="">No Projects Found</option>}
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.path})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* Create Section */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-neutral-500" />
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Create New</h3>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest px-1">Project Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Research Project"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest px-1">Project Location</label>
              <div className="relative">
                <FolderPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Project Location"
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all font-mono"
                />
              </div>
              <div className="flex items-start gap-2 px-1 pt-1 opacity-50">
                <Info className="w-3 h-3 text-neutral-400 mt-0.5" />
                <p className="text-[9px] text-neutral-500 leading-normal">
                  If left empty, projects are stored in ~/.config/Project by default.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={!name || isCreating}
              className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-white/5"
            >
              {isCreating ? 'Creating...' : (
                <>
                  <Save className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="px-6 py-3 rounded-xl border border-white/5 text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-all text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
          <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Project Structure</h4>
          <div className="grid grid-cols-2 gap-4 text-[10px] text-neutral-600">
            <div>
              <p className="font-mono text-neutral-500">/data</p>
              <p>Metadata & Exports</p>
            </div>
            <div>
              <p className="font-mono text-neutral-500">/chat</p>
              <p>Markdown history</p>
            </div>
            <div>
              <p className="font-mono text-neutral-500">/.Research</p>
              <p>Research link logs</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
