import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  Database, 
  Cpu, 
  Plus, 
  Command,
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { cn } from '../lib/utils.ts';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  category: 'Actions' | 'Navigation' | 'Conversations';
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { 
    conversations, 
    setView, 
    createConversation, 
    setActiveConversation,
    models
  } = useWorkspace();

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  const actions: CommandItem[] = [
    {
      id: 'new-chat',
      title: 'New Conversation',
      subtitle: 'Start a fresh AI thread',
      icon: Plus,
      category: 'Actions',
      action: () => {
        createConversation();
        close();
      }
    },
    {
      id: 'go-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Overview of system status',
      icon: Command,
      category: 'Navigation',
      action: () => {
        setView('dashboard');
        close();
      }
    },
    {
      id: 'go-knowledge',
      title: 'Manage Knowledge Base',
      subtitle: 'Upload and index documents',
      icon: Database,
      category: 'Navigation',
      action: () => {
        setView('knowledge');
        close();
      }
    },
    {
      id: 'manage-models',
      title: 'Model Configuration',
      subtitle: 'Switch between providers',
      icon: Cpu,
      category: 'Actions',
      action: () => {
        // Just for demo, maybe open settings
        console.log('Manage models');
        close();
      }
    }
  ];

  const conversationItems: CommandItem[] = (conversations || []).map(c => ({
    id: `conv-${c.id}`,
    title: c.title,
    subtitle: `Last active: ${new Date(c.updatedAt).toLocaleDateString()}`,
    icon: MessageSquare,
    category: 'Conversations',
    action: () => {
      setActiveConversation(c.id);
      setView('chat');
      close();
    }
  }));

  const allItems = [...actions, ...conversationItems];
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-natural-950/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-natural-900 border border-natural-700 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              onKeyDown={handleKeyDown}
            >
              <div className="relative border-b border-natural-700">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-natural-700" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="w-full bg-transparent py-5 pl-12 pr-4 text-bone-200 placeholder:text-natural-700 outline-none text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-natural-950 rounded border border-natural-700 text-[10px] font-bold text-natural-700">ESC</kbd>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 focus:outline-none">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-natural-700 font-medium italic">No results found for "{search}"</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    {['Actions', 'Navigation', 'Conversations'].map(category => {
                      const categoryItems = filteredItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category} className="space-y-1">
                          <h3 className="px-3 text-[10px] font-bold text-moss-500 uppercase tracking-widest mb-2">{category}</h3>
                          {categoryItems.map((item) => {
                            const globalIndex = filteredItems.indexOf(item);
                            const isActive = selectedIndex === globalIndex;

                            return (
                              <button
                                key={item.id}
                                onClick={item.action}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={cn(
                                  "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all text-left group",
                                  isActive 
                                    ? "bg-sage-500 text-natural-950 shadow-lg shadow-sage-500/10" 
                                    : "text-bone-200 hover:bg-natural-800"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                  isActive ? "bg-black/10" : "bg-natural-950 border border-natural-700"
                                )}>
                                  <item.icon className={cn("w-5 h-5", isActive ? "text-natural-950" : "text-sage-500")} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm">{item.title}</div>
                                  {item.subtitle && (
                                    <div className={cn(
                                      "text-[10px] uppercase font-bold tracking-tight mt-0.5",
                                      isActive ? "text-natural-950/60" : "text-natural-700"
                                    )}>
                                      {item.subtitle}
                                    </div>
                                  )}
                                </div>
                                {isActive && (
                                  <ArrowRight className="w-4 h-4 mr-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 bg-natural-950 border-t border-natural-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-natural-900 rounded border border-natural-700 text-[10px] font-bold text-natural-700">↑↓</kbd>
                    <span className="text-[10px] font-bold text-natural-700 uppercase">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-natural-900 rounded border border-natural-700 text-[10px] font-bold text-natural-700">ENTER</kbd>
                    <span className="text-[10px] font-bold text-natural-700 uppercase">Select</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sage-500" />
                  <span className="text-[10px] font-bold text-natural-700 uppercase tracking-widest">Aesthetic Spotlight</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
