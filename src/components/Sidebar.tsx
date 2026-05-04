import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Settings, 
  History, 
  FolderOpen, 
  Star, 
  LayoutDashboard,
  Trash2,
  Cpu,
  Terminal,
  Edit2,
  FolderPlus,
  Home,
  MessageCircle,
  Hash
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const { 
    projects,
    activeProjectId,
    setActiveProject,
    conversations = [], 
    activeConversationId, 
    currentView,
    setView,
    setActiveConversation, 
    createConversation, 
    deleteConversation,
    updateConversation,
    setMobileMenuOpen,
    density
  } = useWorkspace();

  const handleRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const submitRename = (id: string) => {
    if (renameValue.trim()) {
      updateConversation(id, { title: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(c => c.pinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.pinned);

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <aside className="w-full h-full flex flex-col bg-neutral-950 border-r border-white/5 text-neutral-400 overflow-hidden">
      {/* Brand & Navigation */}
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-black text-[12px]">P</div>
          <span className="text-white font-bold tracking-tight text-sm">Project Client</span>
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-3 mb-4 space-y-2">
        <button 
          onClick={() => createConversation()}
          className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[11px] font-semibold text-neutral-200"
        >
          <Plus className="w-3.5 h-3.5" />
          New Conversation
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 space-y-6">
        <section>
          <div className="px-2 mb-1">
            <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">Main</span>
          </div>
          <nav className="space-y-0.5">
            <NavItem icon={Home} label="Home" onClick={() => { setActiveConversation(null); setView('dashboard'); setMobileMenuOpen(false); }} active={currentView === 'dashboard'} />
            <NavItem icon={MessageCircle} label="Chat" onClick={() => setView('chat')} active={currentView === 'chat'} />
            <NavItem icon={FolderPlus} label="Project" onClick={() => setView('create-project')} active={currentView === 'create-project'} />
            <NavItem icon={FolderOpen} label="Files" onClick={() => { setView('knowledge'); setMobileMenuOpen(false); }} active={currentView === 'knowledge'} />
            <NavItem icon={Terminal} label="Prompts" onClick={() => { setView('prompts'); setMobileMenuOpen(false); }} active={currentView === 'prompts'} />
            <NavItem icon={Cpu} label="Models" onClick={() => { setView('models'); setMobileMenuOpen(false); }} active={currentView === 'models'} />
            <NavItem icon={History} label="History" onClick={() => { setView('history'); setMobileMenuOpen(false); }} active={currentView === 'history'} />
          </nav>
        </section>

        {pinnedConversations.length > 0 && (
          <section>
            <div className="px-2 mb-2">
              <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">Pinned</span>
            </div>
            <div className="space-y-px">
              <AnimatePresence mode="popLayout">
                {pinnedConversations.map(chat => (
                  <ChatNavItem 
                    key={chat.id}
                    chat={chat}
                    active={activeConversationId === chat.id}
                    onClick={() => { setActiveConversation(chat.id); setMobileMenuOpen(false); }}
                    onPin={() => updateConversation(chat.id, { pinned: false })}
                    onDelete={() => deleteConversation(chat.id)}
                    onRename={() => handleRename(chat.id, chat.title)}
                    isRenaming={renamingId === chat.id}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    submitRename={() => submitRename(chat.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        <section>
          <div className="px-2 mb-2">
            <span className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">Recent Chats</span>
          </div>
          
          <div className="space-y-px">
            <AnimatePresence mode="popLayout">
              {unpinnedConversations.length === 0 && pinnedConversations.length === 0 ? (
                <p className="px-3 py-4 text-[10px] text-neutral-600 italic">No conversations yet</p>
              ) : (
                unpinnedConversations.map(chat => (
                  <ChatNavItem 
                    key={chat.id}
                    chat={chat}
                    active={activeConversationId === chat.id}
                    onClick={() => { setActiveConversation(chat.id); setMobileMenuOpen(false); }}
                    onPin={() => updateConversation(chat.id, { pinned: true })}
                    onDelete={() => deleteConversation(chat.id)}
                    onRename={() => handleRename(chat.id, chat.title)}
                    isRenaming={renamingId === chat.id}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    submitRename={() => submitRename(chat.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 bg-black/20">
        <button 
          onClick={() => { setView('settings'); setMobileMenuOpen(false); }}
          className={cn(
            "w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors group",
            currentView === 'settings' ? "bg-white/5 text-white" : "text-neutral-500 hover:text-neutral-300"
          )}
        >
          <Settings className={cn("w-4 h-4", currentView === 'settings' ? "text-white" : "opacity-40 group-hover:opacity-100")} />
          <p className="text-[11px] font-semibold flex-1 text-left tracking-tight">Settings</p>
        </button>
      </div>
    </aside>
  );
}

function ChatNavItem({ 
  chat, 
  active, 
  onClick, 
  onPin, 
  onDelete, 
  onRename,
  isRenaming,
  renameValue,
  setRenameValue,
  submitRename
}: { 
  chat: any, 
  active: boolean, 
  onClick: () => void,
  onPin: () => void,
  onDelete: () => void,
  onRename: () => void,
  isRenaming: boolean,
  renameValue: string,
  setRenameValue: (v: string) => void,
  submitRename: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      layout
      className="group relative"
    >
      {isRenaming ? (
        <div className="px-2 py-1">
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            className="w-full bg-neutral-900 border border-white/20 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-white/40"
          />
        </div>
      ) : (
        <>
          <button
            onClick={onClick}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all text-left",
              active 
                ? "bg-white/10 text-white" 
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]"
            )}
          >
            <div className="shrink-0 flex items-center justify-center">
              {chat.pinned ? (
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              ) : (
                <Hash className={cn("w-3 h-3", active ? "text-white/50" : "text-neutral-700")} />
              )}
            </div>
            <span className="truncate flex-1 text-[11px] font-medium leading-none">{chat.title}</span>
          </button>
          
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-transparent px-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onPin(); }}
              className="p-1 text-neutral-600 hover:text-white transition-colors"
              title={chat.pinned ? "Unpin" : "Pin"}
            >
              <Star className={cn("w-3 h-3", chat.pinned ? "fill-current text-white" : "")} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRename(); }}
              className="p-1 text-neutral-600 hover:text-white transition-colors"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

function NavItem({ icon: Icon, label, count, onClick, active }: { 
  icon: any, 
  label: string, 
  count?: number, 
  onClick?: () => void,
  active?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] transition-all group",
        active 
          ? "bg-white/5 text-white shadow-sm" 
          : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0 transition-opacity", active ? "opacity-100" : "opacity-40 group-hover:opacity-80")} />
      <span className="flex-1 text-left font-semibold tracking-tight">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[9px] text-neutral-600 font-bold bg-white/5 px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  );
}
