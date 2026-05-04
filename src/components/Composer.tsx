import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Mic, 
  Send, 
  Globe, 
  BrainCircuit, 
  CircleStop,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

export function Composer({ onSend, isGenerating, onStop }: { 
  onSend: (text: string) => void, 
  isGenerating?: boolean,
  onStop?: () => void
}) {
  const [input, setInput] = useState('');
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [isThinking, setIsThinking] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isGenerating) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-2 py-2 bg-neutral-950 border-t border-white/5 w-full">
      <div className="max-w-[800px] mx-auto w-full">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-1 bg-white/[0.02] border border-white/5 rounded-lg p-1 focus-within:border-white/10 transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Prompt..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-neutral-300 py-1.5 px-2 resize-none max-h-[120px] text-[13px] placeholder:text-neutral-700 font-normal"
          />

          <div className="flex items-center gap-1 shrink-0">
            {isGenerating ? (
              <button 
                type="button"
                onClick={onStop}
                className="p-1.5 text-neutral-500 hover:text-white"
              >
                <CircleStop className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                disabled={!input.trim()}
                className={cn(
                  "p-1.5 rounded transition-all",
                  input.trim() 
                    ? "text-white" 
                    : "text-neutral-800"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
        
        <div className="flex items-center justify-center gap-4 mt-1.5 grayscale opacity-50 cursor-not-allowed" title="Advanced reasoning coming soon">
           <MinimalToggle icon={Globe} label="Search" active={isWebSearch} onClick={() => {}} />
           <MinimalToggle icon={BrainCircuit} label="Think" active={isThinking} onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}

function MinimalToggle({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest transition-colors",
        active ? "text-neutral-400" : "text-neutral-700 hover:text-neutral-500"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}
