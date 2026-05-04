import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types.ts';
import { MessageBubble } from './MessageBubble.tsx';
import { Composer } from './Composer.tsx';
import { useWorkspace } from '../WorkspaceContext.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { Search, Sparkles, MessageSquare } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const EMPTY_MESSAGES: Message[] = [];

export function ChatWorkspace() {
  const { activeConversationId, activeModelId, conversations, addMessage, trackInteraction, logResearch, setView, createConversation } = useWorkspace();
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || EMPTY_MESSAGES;

  // Auto-scroll when messages change or while generating
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSend = async (content: string) => {
    if (!activeConversationId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    addMessage(activeConversationId, userMsg);
    trackInteraction('chat-send');
    setIsGenerating(true);

    // Mock research links if keywords present (simulating local research)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    if (urls) {
      urls.forEach(url => logResearch(url));
    }

    try {
      // Map history correctly for Gemini
      const geminiHistory = (messages || []).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Call Gemini API
      const result = await ai.models.generateContent({
        model: activeModelId,
        contents: [
          ...geminiHistory,
          { role: 'user', parts: [{ text: content }] }
        ]
      });

      const text = result.text || "I'm sorry, I couldn't generate a response.";
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString(),
        confidence: 0.98,
        reasoningSummary: "Local synthesis complete. Context preserved within project workspace.",
      };

      // Extract URLs from response and log them too
      const responseUrls = text.match(urlRegex);
      if (responseUrls) {
        responseUrls.forEach(url => logResearch(url));
      }

      addMessage(activeConversationId, assistantMsg);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `**Engine Error**: ${error.message || 'Failed to connect. Ensure your local environment is configured.'}`,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
      addMessage(activeConversationId, errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeConversationId) {
    return (
      <div className="flex flex-col h-full bg-neutral-950 items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-neutral-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">No Active Workspace</h2>
            <p className="text-sm text-neutral-500">
              Select a conversation from the history or start a new synthesis to begin working with grounding data.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => createConversation()}
              className="px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
            >
              Start New Synthesis
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className="px-6 py-3 bg-white/5 text-neutral-400 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
            >
              Back to Workspaces
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 relative overflow-hidden @container">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth flex flex-col px-[var(--spacing-density-4)] md:px-[var(--spacing-density-8)] py-[var(--spacing-density-2)]"
      >
        <div className="flex-1" /> {/* Spacer */}
        <div className="w-full max-w-[800px] mx-auto space-y-1.5">
          {messages.length === 0 && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neutral-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">New Synthesis</h3>
                <p className="text-[11px] text-neutral-500 max-w-[240px]">Context from your local files and grounding configuration is active.</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isLast={idx === messages.length - 1} 
              />
            ))}
             {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex gap-3 py-4 items-start w-full"
                >
                  <div className="w-5 h-5 rounded bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-neutral-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                      <Search className="w-2.5 h-2.5" />
                      <span className="text-[8px] font-bold uppercase tracking-tight">Processing</span>
                    </div>
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1 bg-white/10 rounded-full w-8" />
                      <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1 bg-white/10 rounded-full w-12" />
                      <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1 bg-white/10 rounded-full w-6" />
                    </div>
                  </div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer Area */}
      <Composer 
        onSend={handleSend} 
        isGenerating={isGenerating} 
        onStop={() => setIsGenerating(false)}
      />
    </div>
  );
}
