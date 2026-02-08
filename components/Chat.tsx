
import React, { useState, useRef, useEffect } from 'react';
import { Message, Attachment, Artifact } from '../types';
import { geminiService } from '../services/gemini';

interface ChatProps {
  onArtifactCreated: (artifact: Artifact) => void;
  onLogAction: (action: string, details: string) => void;
  isDarkMode: boolean;
}

const LISA_AVATAR_URL = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop";

const Chat: React.FC<ChatProps> = ({ onArtifactCreated, onLogAction, isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello, I'm Lisa. How can I help you today? I'm here to support your growth, your family, and your big ideas. Let's make life better together.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Fix: Explicitly type 'file' as 'File' to resolve 'unknown' type issues in some TS environments
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setPendingAttachments(prev => [...prev, { name: file.name, type: file.type, data: base64 }]);
        onLogAction('RESOURCE', `Imported ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const parseArtifactFromResponse = (text: string) => {
    const regex = /<artifact type="([^"]+)" title="([^"]+)">([\s\S]*?)<\/artifact>/;
    const match = text.match(regex);
    if (match) {
      return {
        type: match[1] as any,
        title: match[2],
        content: match[3],
        id: Math.random().toString(36).substr(2, 9),
        language: 'en' as const
      };
    }
    return null;
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && pendingAttachments.length === 0) || isLoading) return;

    const currentAttachments = [...pendingAttachments];
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      attachments: currentAttachments
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      let fullResponse = "";
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "", timestamp: new Date() }]);

      await geminiService.streamResponse(textToSend, currentAttachments, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m));
      });

      const artifact = parseArtifactFromResponse(fullResponse);
      if (artifact) {
        onArtifactCreated(artifact);
        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: fullResponse.replace(/<artifact[\s\S]*?<\/artifact>/, "_(I've prepared a detailed resource for you in the side panel.)_") } : m
        ));
      }
    } catch (e) {
      onLogAction('ERROR', 'Processing failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <div className={`px-10 py-5 border-b border-slate-200 dark:border-white/5 glass ${isDarkMode ? 'glass-dark' : 'glass-light'} flex justify-between items-center z-20 sticky top-0 transition-all duration-300`}>
        <div className="flex items-center space-x-4">
          <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-400/20 shadow-lg ${isLoading ? 'lisa-glow-active ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-space-900' : 'lisa-glow'}`}>
             <img src={LISA_AVATAR_URL} alt="Lisa" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">Lisa Companion</h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Growth & Family Mode</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 rounded-full transition-all">
             <i className="fa-solid fa-heart text-sm"></i>
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all">
             <i className="fa-solid fa-gear text-sm"></i>
           </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-12 space-y-10 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {msg.role === 'assistant' && (
              <div className={`w-9 h-9 rounded-full overflow-hidden border border-blue-100 dark:border-white/10 shadow-md shrink-0 mb-1 ${isDarkMode ? 'lisa-glow' : ''}`}>
                <img src={LISA_AVATAR_URL} alt="Lisa" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-3xl-plus rounded-tr-none shadow-xl shadow-blue-600/20' 
                : `glass ${isDarkMode ? 'glass-dark text-slate-100' : 'glass-light text-slate-800'} rounded-3xl-plus rounded-tl-none border-slate-200 shadow-sm`
            } px-7 py-5 relative group`}>
              <div className="text-[16px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">{msg.content}</div>
              <div className={`text-[8px] mt-3 font-bold uppercase tracking-widest opacity-40`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && !messages[messages.length-1].content && (
          <div className="flex justify-start items-end gap-4">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-400/30 shadow-md lisa-glow-active shrink-0">
               <img src={LISA_AVATAR_URL} alt="Lisa" className="w-full h-full object-cover" />
            </div>
            <div className={`glass ${isDarkMode ? 'glass-dark' : 'glass-light'} text-slate-400 rounded-3xl-plus rounded-tl-none px-8 py-5 border-blue-500/20`}>
              <div className="flex space-x-3 items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-xs font-bold tracking-widest uppercase opacity-60">Lisa is with you...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className={`p-8 pt-4 glass ${isDarkMode ? 'glass-dark border-t border-white/5' : 'glass-light border-t border-slate-100'} z-20 transition-all duration-300`}>
        <div className="max-w-4xl mx-auto">
          {pendingAttachments.length > 0 && (
            <div className="flex gap-3 mb-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
              {pendingAttachments.map((a, i) => (
                <div key={i} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl-plus text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 shrink-0">
                  <i className="fa-solid fa-file-circle-check"></i>
                  {a.name}
                </div>
              ))}
            </div>
          )}
          <div className={`relative flex items-end ${isDarkMode ? 'bg-space-800' : 'bg-white'} border-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'} rounded-3xl-plus p-2.5 pr-6 pl-4 focus-within:border-blue-500 focus-within:ring-8 focus-within:ring-blue-500/5 transition-all shadow-2xl`}>
            <input type="file" onChange={handleFileUpload} className="hidden" id="file-up" />
            <label htmlFor="file-up" className="w-14 h-14 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer transition-all mb-0.5">
              <i className="fa-solid fa-plus text-xl"></i>
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="What's on your mind? Grow with Lisa..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-5 px-4 text-[16px] resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-medium"
              rows={1}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && pendingAttachments.length === 0)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl mb-0.5 shrink-0 ${
                isLoading || (!input.trim() && pendingAttachments.length === 0)
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-600'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-blue-600/30'
              }`}
            >
              <i className="fa-solid fa-arrow-up text-xl"></i>
            </button>
          </div>
          
          <div className="flex justify-center flex-wrap gap-5 mt-5 text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em]">
             <button onClick={() => handleSend("🎓 Education Hub: Help me create a study plan for a new subject.")} className="hover:text-blue-600 transition-colors flex items-center gap-2">
               <i className="fa-solid fa-graduation-cap text-blue-500"></i> Education Hub
             </button>
             <button onClick={() => handleSend("❤️ Family Care: How can I better care for my aging parents today?")} className="hover:text-emerald-600 transition-colors flex items-center gap-2">
               <i className="fa-solid fa-heart text-emerald-500"></i> Family Care
             </button>
             <button onClick={() => handleSend("💼 Management Pro: Help me prioritize my tasks using a professional framework.")} className="hover:text-purple-600 transition-colors flex items-center gap-2">
               <i className="fa-solid fa-briefcase text-purple-500"></i> Management Pro
             </button>
             <button onClick={() => handleSend("🛡️ Secure Brain: Tell me more about my data security and how to organize my vault.")} className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
               <i className="fa-solid fa-shield-halved text-slate-500"></i> Secure Brain
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
