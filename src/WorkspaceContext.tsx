import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Model, WorkspaceState, Message, KnowledgeFile, Prompt, Collaborator, Project } from './types.ts';

interface WorkspaceContextType extends WorkspaceState {
  setView: (view: WorkspaceState['currentView']) => void;
  setActiveProject: (id: string | null) => void;
  setActiveConversation: (id: string | null) => void;
  setActiveModel: (id: string) => void;
  createProject: (name: string, location?: string) => Promise<void>;
  createConversation: (title?: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addMessage: (conversationId: string, message: Message) => void;
  addKnowledge: (file: Omit<KnowledgeFile, 'id' | 'updatedAt' | 'status'>) => void;
  addPrompt: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  logResearch: (url: string) => Promise<void>;
  setMobileMenuOpen: (open: boolean) => void;
  setEditing: (id: string | null, type: WorkspaceState['editingInfo']['type'], content?: string) => void;
  setDensity: (density: WorkspaceState['density']) => void;
  togglePanel: (panel: keyof WorkspaceState['panels']) => void;
  trackInteraction: (feature: string) => void;
  indexFiles: (projectId: string, paths: string[]) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const DEFAULT_MODELS: Model[] = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: 'google', status: 'online', context: '128k' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'google', status: 'online', context: '1M' },
];

const INITIAL_STATE: WorkspaceState = {
  projects: [],
  activeProjectId: null,
  conversations: [],
  activeConversationId: null,
  activeModelId: 'gemini-3-flash-preview',
  models: DEFAULT_MODELS,
  knowledge: [],
  prompts: [],
  collaborators: [],
  isLoading: true,
  currentView: 'dashboard',
  isMobileMenuOpen: false,
  density: 'comfortable',
  panels: {
    history: true,
    tools: false,
    chat: true,
  },
  usageStats: {},
  storageConfig: {
    defaultPath: '',
  },
  editingInfo: {
    id: null,
    type: null,
  },
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(INITIAL_STATE);

  // Initialize: Load projects
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        
        setState(prev => ({ 
          ...prev, 
          projects, 
          isLoading: false,
          activeProjectId: projects.length > 0 ? projects[0].id : null
        }));
      } catch (err) {
        console.error('Failed to load projects:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    init();
  }, []);

  // Sync chats when active project changes
  useEffect(() => {
    const loadChats = async () => {
      const activeId = state.activeProjectId;
      if (!activeId) return;
      const project = state.projects.find(p => p.id === activeId);
      if (!project) return;

      try {
        const res = await fetch(`/api/projects/${activeId}/chats?path=${encodeURIComponent(project.path)}`);
        if (!res.ok) throw new Error('Failed to fetch chats');
        const chats: Conversation[] = await res.json();
        setState(prev => {
          // Deduplicate based on ID to prevent React key errors
          const existingIds = new Set(prev.conversations.map(c => c.id));
          const newChats = chats.filter(c => !existingIds.has(c.id));
          
          return { 
            ...prev, 
            conversations: [...newChats, ...prev.conversations],
            isLoading: false,
            // Auto-select latest chat if none active 
            activeConversationId: prev.activeConversationId || (chats.length > 0 ? chats[0].id : null)
          };
        });
      } catch (err) {
        console.error('Failed to load chats:', err);
      }
    };
    loadChats();
  }, [state.activeProjectId]);

  const setView = React.useCallback((view: WorkspaceState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view, isMobileMenuOpen: false }));
  }, []);

  const setActiveProject = React.useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeProjectId: id, activeConversationId: null, conversations: [] }));
  }, []);

  const setActiveConversation = React.useCallback((id: string | null) => {
    setState(prev => ({ 
      ...prev, 
      activeConversationId: id,
      currentView: id ? 'chat' : prev.currentView,
      isMobileMenuOpen: false
    }));
  }, []);

  const setActiveModel = React.useCallback((id: string) => {
    setState(prev => ({ ...prev, activeModelId: id }));
  }, []);

  const createProject = React.useCallback(async (name: string, location?: string) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location })
      });
      const newProject = await res.json();
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        activeProjectId: newProject.id,
        currentView: 'dashboard',
        conversations: [] // Clear for new project
      }));
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  }, []);

  const createConversation = React.useCallback(async (title?: string) => {
    setState(prev => {
      const activeId = prev.activeProjectId;
      if (!activeId) return prev;
      const project = prev.projects.find(p => p.id === activeId);
      if (!project) return prev;

      const run = async () => {
        try {
          const res = await fetch(`/api/projects/${activeId}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              projectPath: project.path,
              title: title || 'New Conversation',
              messages: []
            })
          });
          const newChat = await res.json();
          setState(s => {
            // Check if already exists to prevent duplicates
            if (s.conversations.some(c => c.id === newChat.id)) return s;
            return {
              ...s,
              conversations: [newChat, ...s.conversations],
              activeConversationId: newChat.id,
              currentView: 'chat'
            };
          });
        } catch (err) {
          console.error('Failed to create chat:', err);
        }
      };
      run();
      return prev;
    });
  }, []);

  const logResearch = React.useCallback(async (url: string) => {
    setState(prev => {
      const activeId = prev.activeProjectId;
      if (!activeId) return prev;
      const project = prev.projects.find(p => p.id === activeId);
      if (!project) return prev;

      fetch(`/api/projects/${activeId}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: project.path, url })
      });
      return prev;
    });
  }, []);

  const deleteConversation = React.useCallback(async (id: string) => {
    setState(prev => {
      const activeId = prev.activeProjectId;
      if (!activeId) return prev;
      const project = prev.projects.find(p => p.id === activeId);
      if (!project) return prev;

      fetch(`/api/projects/${activeId}/chats/${id}?path=${encodeURIComponent(project.path)}`, {
        method: 'DELETE'
      }).catch(err => console.error('Failed to delete chat on server:', err));

      return {
        ...prev,
        conversations: prev.conversations.filter(c => c.id !== id),
        activeConversationId: prev.activeConversationId === id ? null : prev.activeConversationId
      };
    });
  }, []);

  const updateConversation = React.useCallback((id: string, updates: Partial<Conversation>) => {
    setState(prev => {
      const activeId = prev.activeProjectId;
      const project = prev.projects.find(p => p.id === activeId);
      const conversation = prev.conversations.find(c => c.id === id);

      if (project && conversation && (updates.title !== undefined || updates.pinned !== undefined)) {
        fetch(`/api/projects/${activeId}/chats/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectPath: project.path,
            title: updates.title,
            pinned: updates.pinned
          })
        }).then(res => res.json()).then(updated => {
          if (updated.id && updated.id !== id) {
            setState(s => ({
              ...s,
              conversations: s.conversations.map(c => c.id === id ? { ...c, ...updates, id: updated.id } : c),
              activeConversationId: s.activeConversationId === id ? updated.id : s.activeConversationId
            }));
          }
        }).catch(err => console.error('Failed to update chat on server:', err));
      }

      return {
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        )
      };
    });
  }, []);

  const addMessage = React.useCallback((conversationId: string, message: Message) => {
    setState(prev => {
      const newConversations = prev.conversations.map(c => 
        c.id === conversationId 
          ? { 
              ...c, 
              messages: [...(c.messages || []), message],
              lastMessage: message.content,
              updatedAt: new Date().toISOString()
            } 
          : c
      );

      const activeId = prev.activeProjectId;
      const project = prev.projects.find(p => p.id === activeId);
      const conversation = newConversations.find(c => c.id === conversationId);

      if (project && conversation) {
        fetch(`/api/projects/${activeId}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectPath: project.path,
            title: conversation.title,
            messages: conversation.messages
          })
        });
      }

      return {
        ...prev,
        conversations: newConversations
      };
    });
  }, []);

  const addKnowledge = React.useCallback((file: Omit<KnowledgeFile, 'id' | 'updatedAt' | 'status'>) => {
    const newFile: KnowledgeFile = {
      ...file,
      id: Math.random().toString(36).substring(7),
      status: 'ready',
      updatedAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, knowledge: [newFile, ...prev.knowledge] }));
  }, []);

  const addPrompt = React.useCallback((prompt: Omit<Prompt, 'id' | 'updatedAt'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: Math.random().toString(36).substring(7),
      updatedAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, prompts: [newPrompt, ...prev.prompts] }));
  }, []);

  const setMobileMenuOpen = React.useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isMobileMenuOpen: open }));
  }, []);

  const setEditing = React.useCallback((id: string | null, type: WorkspaceState['editingInfo']['type'], content?: string) => {
    setState(prev => ({
      ...prev,
      editingInfo: { id, type, initialContent: content }
    }));
  }, []);

  const setDensity = React.useCallback((density: WorkspaceState['density']) => {
    setState(prev => ({ ...prev, density }));
  }, []);

  const togglePanel = React.useCallback((panel: keyof WorkspaceState['panels']) => {
    setState(prev => ({
      ...prev,
      panels: { ...prev.panels, [panel]: !prev.panels[panel] }
    }));
  }, []);

  const trackInteraction = React.useCallback((feature: string) => {
    setState(prev => ({
      ...prev,
      usageStats: {
        ...prev.usageStats,
        [feature]: (prev.usageStats[feature] || 0) + 1
      }
    }));
  }, []);

  const indexFiles = React.useCallback(async (projectId: string, paths: string[]) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectPath: project.path,
          indexedPaths: paths
        })
      });
      const updatedProject = await res.json();
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updatedProject : p)
      }));
    } catch (err) {
      console.error('Failed to index files:', err);
    }
  }, [state.projects]);

  const contextValue = React.useMemo(() => ({
    ...state,
    setView,
    setActiveProject,
    setActiveConversation,
    setActiveModel,
    createProject,
    createConversation,
    deleteConversation,
    updateConversation,
    addMessage,
    addKnowledge,
    addPrompt,
    logResearch,
    setMobileMenuOpen,
    setEditing,
    setDensity,
    togglePanel,
    trackInteraction,
    indexFiles
  }), [
    state,
    setView,
    setActiveProject,
    setActiveConversation,
    setActiveModel,
    createProject,
    createConversation,
    deleteConversation,
    updateConversation,
    addMessage,
    addKnowledge,
    addPrompt,
    logResearch,
    setMobileMenuOpen,
    setEditing,
    setDensity,
    togglePanel,
    trackInteraction,
    indexFiles
  ]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
