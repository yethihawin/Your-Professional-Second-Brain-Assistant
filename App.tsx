
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Chat from './components/Chat';
import ArtifactPanel from './components/ArtifactPanel';
import { TabType, ActionLog, Artifact, Attachment } from './types';
import { geminiService } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.KNOWLEDGE);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Study Tab State
  const [studyFile, setStudyFile] = useState<Attachment | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const logAction = useCallback((action: string, details: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36), action, details, timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    logAction('SESSION_START', 'Premium Synapse interface initialized.');
  }, [logAction]);

  const parseArtifact = (text: string): Artifact | null => {
    const regex = /<artifact type="([^"]+)" title="([^"]+)">([\s\S]*?)<\/artifact>/;
    const match = text.match(regex);
    if (match) {
      return {
        type: match[1] as any,
        title: match[2],
        content: match[3],
        id: Math.random().toString(36).substr(2, 9),
        language: 'en'
      };
    }
    return null;
  };

  const handleStudyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setStudyFile({ name: file.name, type: file.type, data: base64 });
      logAction('STUDY_LOAD', `Uploaded ${file.name} for deep analysis.`);
    };
    reader.readAsDataURL(file);
  };

  const runDeepStudy = async () => {
    if (!studyFile || isStudying) return;
    
    setIsStudying(true);
    logAction('STUDY_START', `Lisa is analyzing ${studyFile.name}...`);
    
    try {
      const result = await geminiService.analyzeStudyMaterial([studyFile], (chunk) => {
        // We could stream to a local UI if needed
      });
      
      const artifact = parseArtifact(result);
      if (artifact) {
        setActiveArtifact(artifact);
        logAction('STUDY_COMPLETE', `Deep analysis for ${studyFile.name} generated.`);
      }
    } catch (error) {
      logAction('ERROR', 'Deep study analysis failed.');
      console.error(error);
    } finally {
      setIsStudying(false);
      setStudyFile(null);
    }
  };

  const renderVault = () => {
    const vaultItems = [
      { id: 1, title: 'AI Ethics Research', type: 'guide', date: '2 hours ago', tags: ['study', 'ai'], color: 'blue' },
      { id: 2, title: 'Household Budget 2025', type: 'analysis', date: 'Yesterday', tags: ['family', 'finance'], color: 'emerald' },
      { id: 3, title: 'Meeting: Project X', type: 'summary', date: 'Mar 15', tags: ['work', 'mgmt'], color: 'purple' },
      { id: 4, title: 'Mom Health Tracker', type: 'analysis', date: 'Mar 12', tags: ['family', 'health'], color: 'emerald' },
      { id: 5, title: 'Machine Learning Basics', type: 'guide', date: 'Feb 28', tags: ['study'], color: 'blue' },
      { id: 6, title: 'Summer Trip Itinerary', type: 'summary', date: 'Jan 10', tags: ['travel'], color: 'amber' },
    ];

    return (
      <div className="flex-1 flex flex-col h-full bg-transparent p-8 md:p-12 overflow-y-auto animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">The Vault</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Your private archive of analyzed knowledge and secure documents.</p>
            </div>
            <div className={`relative flex items-center ${isDarkMode ? 'bg-space-800' : 'bg-white'} border border-slate-200 dark:border-white/5 rounded-2xl-plus px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all w-full md:w-80`}>
              <i className="fa-solid fa-magnifying-glass text-slate-400 mr-3"></i>
              <input type="text" placeholder="Search your brain..." className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white" />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultItems.map((item) => (
              <div key={item.id} className={`group relative p-6 glass ${isDarkMode ? 'glass-dark' : 'glass-light'} border border-slate-200 dark:border-white/5 rounded-3xl-plus hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl-plus bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 shadow-inner`}>
                    <i className={`fa-solid ${item.type === 'guide' ? 'fa-book-sparkles' : item.type === 'summary' ? 'fa-align-left' : 'fa-chart-pie'} text-xl`}></i>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.date}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"><i className="fa-solid fa-arrow-right text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBrainMap = () => {
    const nodes = [
      { id: 'center', label: 'Synapse', icon: 'fa-brain-circuit', x: 50, y: 50, size: 'w-24 h-24', color: 'blue' },
      { id: 'study', label: 'Education', icon: 'fa-graduation-cap', x: 25, y: 30, size: 'w-16 h-16', color: 'blue' },
      { id: 'family', label: 'Family Care', icon: 'fa-heart', x: 75, y: 35, size: 'w-16 h-16', color: 'emerald' },
      { id: 'work', label: 'Management', icon: 'fa-briefcase', x: 30, y: 75, size: 'w-16 h-16', color: 'purple' },
      { id: 'travel', label: 'Travel Hub', icon: 'fa-plane', x: 70, y: 70, size: 'w-16 h-16', color: 'amber' },
      { id: 'ai', label: 'AI Models', icon: 'fa-microchip', x: 50, y: 15, size: 'w-14 h-14', color: 'slate' },
    ];

    return (
      <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden animate-in fade-in duration-700 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <header className="absolute top-12 left-12 z-20">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Brain Map</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Neural visualization of your cognitive ecosystem.</p>
        </header>

        <div className="flex-1 relative">
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {nodes.slice(1).map(node => (
              <line 
                key={node.id}
                x1="50%" y1="50%" 
                x2={`${node.x}%`} y2={`${node.y}%`}
                stroke="url(#grad-blue)"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="animate-[pulse_4s_infinite]"
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div 
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              className={`absolute group cursor-pointer z-10 transition-all duration-500 hover:scale-110`}
            >
              <div className={`
                ${node.size} rounded-full border-2 
                ${node.id === 'center' ? 'bg-blue-600 border-blue-400 lisa-glow-active' : `bg-white dark:bg-space-800 border-slate-200 dark:border-white/10 shadow-xl`} 
                flex flex-col items-center justify-center transition-all
              `}>
                <i className={`fa-solid ${node.icon} ${node.id === 'center' ? 'text-white text-3xl' : `text-slate-600 dark:text-slate-400 text-xl`} mb-1`}></i>
              </div>
              <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${node.id === 'center' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {node.label}
                </span>
              </div>
            </div>
          ))}

          <div className="absolute bottom-12 right-12 glass glass-dark px-6 py-4 rounded-2xl-plus border border-white/5 flex items-center gap-6 animate-in slide-in-from-right-8">
            <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-space-900 bg-slate-700"></div>)}
            </div>
            <div className="text-xs">
              <p className="text-white font-bold">124 Semantic Connections</p>
              <p className="text-slate-500 font-medium">98% Mapping Confidence</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case TabType.KNOWLEDGE:
        return <Chat onArtifactCreated={setActiveArtifact} onLogAction={logAction} isDarkMode={isDarkMode} />;
      case TabType.STUDY:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-transparent animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
            <div className="max-w-2xl w-full text-center">
              <div className={`w-28 h-28 mx-auto bg-blue-500/10 dark:bg-blue-400/10 rounded-3xl-plus flex items-center justify-center mb-8 border border-blue-200/30 dark:border-blue-400/20 shadow-2xl transition-all duration-1000 ${isStudying ? 'lisa-glow-active rotate-180' : 'lisa-glow'}`}>
                <i className={`fa-solid ${isStudying ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-4xl text-blue-600 dark:text-blue-400`}></i>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Deep Study Hub</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed text-lg mb-12">
                Upload your research, PDFs, or notes. Lisa will synthesize the information into a color-coded intelligence guide instantly.
              </p>

              {!studyFile && !isStudying && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl-plus p-12 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all mb-8"
                >
                  <input type="file" ref={fileInputRef} onChange={handleStudyUpload} className="hidden" accept=".pdf,.txt,.doc,.docx" />
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-300 group-hover:text-blue-500 mb-4 transition-colors"></i>
                  <p className="text-sm font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">Select Study Material</p>
                  <p className="text-xs text-slate-400 mt-2">Support for PDF, TXT, and Documents</p>
                </div>
              )}

              {studyFile && !isStudying && (
                <div className="bg-white dark:bg-white/5 border border-blue-500/30 rounded-3xl-plus p-8 mb-8 animate-in slide-in-from-bottom-4 shadow-xl">
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600">
                      <i className="fa-solid fa-file-pdf text-xl"></i>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{studyFile.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ready for analysis</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStudyFile(null)}
                      className="flex-1 px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl-plus font-bold hover:bg-slate-200 transition-all"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={runDeepStudy}
                      className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl-plus font-extrabold hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/30"
                    >
                      Analyze with Lisa
                    </button>
                  </div>
                </div>
              )}

              {isStudying && (
                <div className="space-y-6 animate-pulse">
                  <div className="flex flex-col items-center">
                    <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.3em] text-xs mb-4">Lisa is synthesizing knowledge</p>
                    <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm italic">"Mapping connections and identifying core themes..."</p>
                </div>
              )}
            </div>
          </div>
        );
      case TabType.VAULT:
        return renderVault();
      case TabType.INSIGHTS:
        return renderBrainMap();
      default:
        return <div className="p-10 text-slate-400 text-sm">Modules are loading...</div>;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      >
        <div className="flex flex-1 h-full overflow-hidden bg-[#F8FAFC] dark:bg-space-900">
          <div className={`transition-all duration-700 ease-in-out h-full overflow-hidden flex flex-col ${activeArtifact ? 'w-1/2' : 'w-full'}`}>
            {renderContent()}
          </div>
          
          {activeArtifact && (
            <div className="w-1/2 h-full border-l border-slate-200 dark:border-slate-800">
              <ArtifactPanel 
                artifact={activeArtifact} 
                onClose={() => setActiveArtifact(null)} 
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </Layout>
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default App;
