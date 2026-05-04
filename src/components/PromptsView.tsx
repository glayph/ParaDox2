import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Plus, 
  Copy, 
  ArrowUpRight,
  Edit2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { cn } from '../lib/utils.ts';

export function PromptsView() {
  const { prompts, addPrompt, setEditing, setView } = useWorkspace();

  const handleAdd = () => {
    addPrompt({
      title: 'New Prompt',
      content: 'Write your prompt here...',
      tags: ['General']
    });
  };

  return (
    <div className="h-full bg-natural-950 p-4 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-[14px] font-bold text-white">Prompt Templates</h2>
              <p className="text-[10px] text-neutral-500 mt-0.5">Reusable instruction sets for precision output</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-medium hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {(prompts || []).map((p) => (
            <div
              key={p.id}
              className="group flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-default"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Terminal className="w-3 h-3 text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-neutral-300 truncate">
                    {p.title}
                  </h4>
                  <div className="flex gap-2">
                    {p.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-bold uppercase text-neutral-700 tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditing(p.id, 'prompt', p.content)}
                  className="text-[9px] font-bold uppercase text-neutral-600 hover:text-white"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
