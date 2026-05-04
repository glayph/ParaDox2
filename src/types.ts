export type ModelProvider = 'google' | 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  status: 'online' | 'offline' | 'loading';
  context: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string; // Model ID
  lastMessage: string;
  updatedAt: string;
  pinned: boolean;
  messages: Message[];
  archived?: boolean;
  shared?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  attachments?: FileAttachment[];
  // Advanced features
  reasoningSummary?: string;
  researchTrail?: ResearchTrail;
  howIAnswered?: string[];
  confidence?: number;
  sources?: Source[];
  activity?: ToolActivityStatus;
}

export interface ResearchTrail {
  query: string;
  sourcesChecked: number;
  steps: ResearchStep[];
}

export interface ResearchStep {
  id: string;
  type: 'search' | 'read' | 'extract' | 'summarize';
  title: string;
  description: string;
  timestamp: string;
  sources?: Source[];
}

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  favicon?: string;
  timestamp?: string;
}

export type ToolActivityStatus = 'searching' | 'reading' | 'analyzing' | 'summarizing' | 'generating' | 'idle';

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'online' | 'away' | 'idle';
  lastActive: string;
  currentRoom?: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  size: string;
  status: 'ready' | 'sync' | 'error';
  type: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  indexedPaths?: string[];
  settings?: {
    modelId?: string;
    temperature?: number;
  };
}

export interface ResearchLink {
  url: string;
  title: string;
  timestamp: string;
}

export interface WorkspaceState {
  projects: Project[];
  activeProjectId: string | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  activeModelId: string;
  models: Model[];
  knowledge: KnowledgeFile[];
  prompts: Prompt[];
  collaborators: Collaborator[];
  isLoading: boolean;
  currentView: 'dashboard' | 'chat' | 'knowledge' | 'settings' | 'history' | 'prompts' | 'models' | 'create-project';
  isMobileMenuOpen: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  panels: {
    history: boolean;
    tools: boolean;
    chat: boolean;
  };
  usageStats: {
    [key: string]: number;
  };
  storageConfig: {
    defaultPath: string;
    customPath?: string;
  };
  editingInfo: {
    id: string | null;
    type: 'message' | 'conversation-title' | 'prompt' | 'setting' | 'project' | null;
    initialContent?: string;
  };
}
