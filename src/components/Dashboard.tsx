import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Files,
  Settings,
  FolderPlus
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.ts';

export function Dashboard() {
  const { createConversation, setView, activeProjectId, projects, setActiveProject, conversations } = useWorkspace();
  
  const activeProject = projects.find(p => p.id === activeProjectId);
  const recentConversations = conversations.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0a] text-neutral-200 selection:bg-white/10">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-12">
        
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {activeProject ? (
                <>
                  <span className="bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
                    {activeProject.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                    Active
                  </span>
                </>
              ) : (
                "Workspaces"
              )}
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              {activeProject 
                ? `Managing ${activeProject.path}`
                : "Select a project to access your local environment."}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('create-project')}
              className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-xl shadow-white/5"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              New Project
            </button>
            {activeProject && (
              <button 
                onClick={() => setActiveProject(null)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-neutral-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
              >
                Switch
              </button>
            )}
          </div>
        </motion.header>

        {!activeProject ? (
          /* Empty State / Project Selection */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {projects.length === 0 ? (
              <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <FolderPlus className="w-6 h-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">No projects yet</h3>
                  <p className="text-sm text-neutral-500 max-w-xs mx-auto mt-1">Create your first workspace to start building with multi-model AI.</p>
                </div>
                <button 
                  onClick={() => setView('create-project')}
                  className="px-6 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-neutral-800 transition-all"
                >
                  Get Started
                </button>
              </div>
            ) : (
              projects.map((p, idx) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveProject(p.id)}
                  className="group relative p-6 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/20 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:translate-x-1 transition-transform">{p.name}</h3>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate max-w-[200px]">{p.path}</p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        ) : (
          /* Active Project Dashboard */
          <>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Quick Actions */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionCard 
                  onClick={() => createConversation()}
                  icon={<Plus className="w-5 h-5" />}
                  title="New Chat"
                  description="Start a fresh conversation with your selected model"
                />
                <ActionCard 
                  onClick={() => setView('knowledge')}
                  icon={<Files className="w-5 h-5" />}
                  title="Explorer"
                  description="Browse and manage project files locally"
                />
                <ActionCard 
                  onClick={() => setView('prompts')}
                  icon={<Zap className="w-5 h-5" />}
                  title="Library"
                  description="Reusable prompt templates and system instructions"
                />
                <ActionCard 
                  onClick={() => setView('models')}
                  icon={<Cpu className="w-5 h-5" />}
                  title="Model Hub"
                  description="Configure providers and performance overrides"
                />
              </div>

              {/* Stats Card */}
              <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5 space-y-6">
                <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest pl-1 border-l-2 border-white/10">Workspace Stats</h3>
                <div className="space-y-4">
                  <DashboardStat label="Conversations" value={conversations.length} subValue="Local MD files" />
                  <DashboardStat label="Knowledge Base" value={0} subValue="Indexed docs" />
                  <DashboardStat label="Storage Used" value="1.2 MB" subValue="Local cache" />
                </div>
              </div>
            </motion.div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              {/* Recent Conversations */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Recent Chats</h3>
                  {conversations.length > 0 && (
                    <button onClick={() => setView('history')} className="text-[10px] font-bold text-neutral-400 hover:text-white transition-colors">View History</button>
                  )}
                </div>
                <div className="space-y-2">
                  {recentConversations.length > 0 ? recentConversations.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => createConversation(c.title)} // In a real app we'd load this chat, here we just use it for nav
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-neutral-700" />
                        <span className="text-[13px] font-medium text-neutral-300 truncate max-w-[200px]">{c.title}</span>
                      </div>
                      <span className="text-[10px] text-neutral-600 font-mono italic">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )) : (
                    <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-[12px] text-neutral-600">
                      No recent activity
                    </div>
                  )}
                </div>
              </section>

              {/* Research Log */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Research Log</h3>
                  <TrendingUp className="w-3 h-3 text-neutral-800" />
                </div>
                <div className="space-y-2">
                   <ActivityItem label="Research link added" detail="github.com/google/genai" />
                   <ActivityItem label="Conversation saved" detail="AI-Assistance.md" />
                   <ActivityItem label="Project metadata" detail="config.json" />
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="group p-5 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/10 hover:bg-neutral-900 transition-all text-left relative overflow-hidden"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-500 group-hover:text-white group-hover:scale-110 transition-all mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed pr-6">{description}</p>
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-neutral-800" />
      </div>
    </button>
  );
}

function DashboardStat({ label, value, subValue }: { label: string, value: string | number, subValue: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold text-neutral-500">{label}</span>
        <span className="text-sm font-black text-white tabular-nums">{value}</span>
      </div>
      <p className="text-[9px] text-neutral-700 font-mono tracking-tighter uppercase">{subValue}</p>
    </div>
  );
}

function ActivityItem({ label, detail }: { label: string, detail: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-neutral-600 transition-colors" />
        <span className="text-[11px] text-neutral-400 font-medium">{label}</span>
      </div>
      <span className="text-[10px] text-neutral-600 font-mono truncate max-w-[120px]">{detail}</span>
    </div>
  );
}

