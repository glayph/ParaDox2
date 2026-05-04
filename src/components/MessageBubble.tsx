import React, { useEffect } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, RotateCcw, ThumbsUp, MoreHorizontal, Edit2, Brain, Search, Info, ChevronDown, ChevronRight, ExternalLink, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { Message, Source, ResearchStep } from '../types.ts';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'framer-motion';

export function MessageBubble({ message, isLast }: { message: Message, isLast?: boolean }) {
  const { setEditing } = useWorkspace();
  const [isReasoningOpen, setIsReasoningOpen] = React.useState(false);
  const [isResearchOpen, setIsResearchOpen] = React.useState(false);
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group flex w-full py-1"
    >
      <div className={cn(
        "flex-1 flex gap-3 items-start w-full",
        !isAssistant && "flex-row-reverse"
      )}>
        {/* Avatar - Smaller */}
        <div className={cn(
          "w-5 h-5 rounded shrink-0 flex items-center justify-center text-[8px] font-bold border transition-all duration-300",
          isAssistant 
            ? "bg-neutral-950 border-white/10 text-neutral-500" 
            : "bg-white border-white text-neutral-900"
        )}>
          {isAssistant ? <Brain className="w-2.5 h-2.5" /> : 'U'}
        </div>

        {/* Content Container */}
        <div className={cn(
          "flex-1 flex flex-col gap-0.5 min-w-0",
          !isAssistant && "items-end text-right"
        )}>
          {/* Header info - Concise */}
          <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-neutral-500 font-medium tracking-tight">
              {isAssistant ? 'Assistant' : 'You'}
            </span>
            <span className="text-[9px] text-neutral-600 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={cn(
            "text-[13px] leading-snug relative break-words overflow-hidden",
            isAssistant ? "text-neutral-300" : "text-white bg-white/5 px-2.5 py-1 rounded-lg max-w-full"
          )}>
            <div className={cn(
              "markdown-body break-words w-full",
              isAssistant ? "opacity-90" : "text-white"
            )}>
              <Markdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="my-2 rounded-lg overflow-hidden border border-white/5 bg-black/40">
                        <div className="flex items-center justify-between px-3 py-1 bg-white/5">
                          <span className="text-[8px] font-bold text-neutral-500 uppercase">{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ background: 'transparent', padding: '0.75rem', margin: 0, fontSize: '11px' }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={cn("bg-white/10 text-white px-1 rounded font-mono text-[11px]", className)} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </Markdown>
            </div>

            {/* Actions - Tiny */}
            <div className={cn(
              "flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
              !isAssistant && "justify-end"
            )}>
              <button 
                onClick={() => navigator.clipboard.writeText(message.content)} 
                className="text-[8px] text-neutral-600 hover:text-white uppercase font-bold tracking-tighter"
              >
                Copy
              </button>
              {isAssistant && (
                <button 
                  disabled
                  title="Coming soon"
                  className="text-[8px] text-neutral-800 uppercase font-bold tracking-tighter cursor-not-allowed opacity-50"
                >
                  Regen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <a 
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all min-w-[200px] shrink-0 group/card"
    >
      <div className="flex items-center gap-2">
        {source.favicon ? (
          <img src={source.favicon} alt="" className="w-3 h-3 rounded-sm" />
        ) : (
          <div className="w-3 h-3 rounded-sm bg-neutral-800" />
        )}
        <span className="text-[10px] text-neutral-500 font-bold uppercase truncate flex-1">{new URL(source.url).hostname}</span>
        <ExternalLink className="w-2.5 h-2.5 text-neutral-600 group-hover/card:text-neutral-400" />
      </div>
      <h4 className="text-[11px] font-medium text-neutral-300 line-clamp-1">{source.title}</h4>
      {source.snippet && <p className="text-[10px] text-neutral-500 line-clamp-2 leading-tight">{source.snippet}</p>}
    </a>
  );
}

function ResearchStepItem({ step }: { step: ResearchStep }) {
  const Icon = {
    search: Search,
    read: ChevronRight,
    extract: Info,
    summarize: CheckCircle2
  }[step.type] || Info;

  return (
    <div className="flex gap-3 relative last:pb-0 pb-3">
      <div className="absolute left-[7px] top-6 bottom-0 w-px bg-white/5 last:hidden" />
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10",
        step.type === 'search' ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-neutral-500'
      )}>
        <Icon className="w-2.5 h-2.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-neutral-400 capitalize">{step.title}</span>
          <span className="text-[9px] text-neutral-600 tabular-nums font-mono">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
        <p className="text-[10px] text-neutral-500 leading-normal">{step.description}</p>
        
        {step.sources && step.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {step.sources.map(s => (
              <div key={s.id} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-neutral-500 flex items-center gap-1">
                <Clock className="w-2 h-2" />
                {new URL(s.url).hostname}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, onClick }: { icon: any, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-1.5 rounded bg-natural-900 hover:bg-natural-600 border border-natural-700 text-natural-700 hover:text-sage-500 transition-all active:scale-95 shadow-sm"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
