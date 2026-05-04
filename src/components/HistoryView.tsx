import React, { useState } from 'react';
import { 
  Search, 
  MessageSquare, 
  Filter, 
  Archive, 
  Star, 
  Share2, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Clock,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '../lib/utils.ts';
import { Conversation } from '../types.ts';

type FilterType = 'all' | 'pinned' | 'archived' | 'shared';
type SortKey = 'updatedAt' | 'title';
type SortOrder = 'asc' | 'desc';

export function HistoryView() {
  const { conversations, setActiveConversation, deleteConversation, updateConversation } = useWorkspace();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'updatedAt', order: 'desc' });

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredConversations = (conversations || [])
    .filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      
      switch (filter) {
        case 'pinned': return c.pinned;
        case 'archived': return c.archived;
        case 'shared': return c.shared;
        default: return !c.archived; // Default view hides archived unless filtered
      }
    })
    .sort((a, b) => {
      const fieldA = a[sortConfig.key];
      const fieldB = b[sortConfig.key];
      if (fieldA < fieldB) return sortConfig.order === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="h-full bg-natural-950 p-4 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-white tracking-widest">Archives</h2>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            <MinimalFilter label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            <MinimalFilter label="Pinned" active={filter === 'pinned'} onClick={() => setFilter('pinned')} />
            <MinimalFilter label="Archived" active={filter === 'archived'} onClick={() => setFilter('archived')} />
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredConversations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredConversations.map((chat) => (
                  <motion.div 
                    key={chat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group relative bg-neutral-900/30 border border-neutral-900 hover:border-neutral-800 rounded-lg p-5 flex items-center justify-between transition-all cursor-pointer"
                    onClick={() => setActiveConversation(chat.id)}
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-600 transition-colors group-hover:text-neutral-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-medium text-neutral-200 block truncate leading-tight group-hover:text-white transition-colors">{chat.title}</h4>
                        <p className="text-[11px] text-neutral-600 truncate max-w-[400px] mt-1">{chat.lastMessage || 'No messages yet'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-medium text-neutral-500">{formatDate(chat.updatedAt)}</span>
                        <span className="text-[9px] text-neutral-700">{chat.model.split('-')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={e => { e.stopPropagation(); updateConversation(chat.id, { pinned: !chat.pinned }); }} className={cn("p-2 rounded hover:bg-neutral-800 transition-colors", chat.pinned ? "text-neutral-200" : "text-neutral-600")}>
                           <Star className={cn("w-4 h-4", chat.pinned && "fill-current")} />
                         </button>
                         <button onClick={e => { e.stopPropagation(); deleteConversation(chat.id); }} className="p-2 rounded hover:bg-red-500/10 hover:text-red-400 text-neutral-600 transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <p className="text-xs text-neutral-600 uppercase tracking-widest font-medium">Clear archives</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MinimalFilter({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "text-[11px] font-medium uppercase tracking-widest transition-colors whitespace-nowrap",
        active ? "text-white border-b border-white pb-1" : "text-neutral-600 hover:text-neutral-400"
      )}
    >
      {label}
    </button>
  );
}

function ActionButton({ icon: Icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all active:scale-95", 
        active 
          ? "text-sage-500 bg-sage-500/10 shadow-sm" 
          : "text-natural-800 hover:text-bone-200 hover:bg-natural-800"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function FilterPill({ label, active, onClick, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-sage-500 text-natural-950 shadow-md shadow-sage-500/5" 
          : "text-natural-800 hover:text-bone-200 hover:bg-natural-800"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}
