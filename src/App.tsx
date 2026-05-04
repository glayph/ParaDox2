import React from 'react';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext.tsx';
import { AppShell } from './components/AppShell.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ChatWorkspace } from './components/ChatWorkspace.tsx';

import { KnowledgeBase } from './components/KnowledgeBase.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { PromptsView } from './components/PromptsView.tsx';
import { ModelsView } from './components/ModelsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { CreateProject } from './components/CreateProject.tsx';

function MainContent() {
  const { currentView } = useWorkspace();
  
  switch(currentView) {
    case 'chat': return <ChatWorkspace />;
    case 'knowledge': return <KnowledgeBase />;
    case 'history': return <HistoryView />;
    case 'prompts': return <PromptsView />;
    case 'models': return <ModelsView />;
    case 'settings': return <SettingsView />;
    case 'create-project': return <CreateProject />;
    case 'dashboard':
    default: return <Dashboard />;
  }
}

export default function App() {
  return (
    <WorkspaceProvider>
      <CommandPalette />
      <AppShell>
        <MainContent />
      </AppShell>
    </WorkspaceProvider>
  );
}

