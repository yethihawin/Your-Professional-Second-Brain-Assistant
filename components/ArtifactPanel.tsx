
import React, { useState } from 'react';
import { Artifact } from '../types';

interface ArtifactPanelProps {
  artifact: Artifact | null;
  onClose: () => void;
  isDarkMode: boolean;
}

interface FlightAlert {
  id: string;
  route: string;
  targetPrice: string;
  isActive: boolean;
}

const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ artifact, onClose, isDarkMode }) => {
  const [alerts, setAlerts] = useState<FlightAlert[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newAlert, setNewAlert] = useState({ route: '', price: '' });

  if (!artifact) return null;

  const handleAddAlert = () => {
    if (!newAlert.route || !newAlert.price) return;
    const alert: FlightAlert = {
      id: Math.random().toString(36).substr(2, 9),
      route: newAlert.route,
      targetPrice: newAlert.price,
      isActive: true,
    };
    setAlerts([...alerts, alert]);
    setNewAlert({ route: '', price: '' });
    setShowAlertForm(false);
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Resource: ${artifact.title}`);
    const body = encodeURIComponent(`Lisa curated this for me:\n\n${artifact.content}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const shareViaX = () => {
    const text = encodeURIComponent(`Lisa just helped me organize my life: ${artifact.title}! #Growth #AI`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const copyLink = () => {
    const dummyUrl = `https://synapse-brain.ai/shared/${artifact.id}`;
    navigator.clipboard.writeText(dummyUrl);
    alert('Secure link copied to clipboard!');
    setShowShareMenu(false);
  };

  return (
    <div className={`h-full flex flex-col animate-in slide-in-from-right-full duration-700 ease-out transition-colors duration-300 ${
      isDarkMode ? 'bg-space-900 border-l border-white/5' : 'bg-white border-l border-slate-200'
    } shadow-2xl relative`}>
      {/* Panel Header */}
      <div className={`px-10 py-6 border-b ${isDarkMode ? 'border-white/5 bg-space-800/80' : 'border-slate-100 bg-white/80'} backdrop-blur-xl flex items-center justify-between sticky top-0 z-30`}>
        <div className="flex items-center space-x-5">
          <div className="w-11 h-11 rounded-2xl-plus bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <i className={`fa-solid ${
              artifact.type === 'summary' ? 'fa-align-left' : 
              artifact.type === 'guide' ? 'fa-book-sparkles' : 'fa-brain-circuit'
            } text-lg`}></i>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">{artifact.title}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Personal Intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 relative">
           <button 
             onClick={() => setShowAlertForm(true)}
             className="w-10 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all" 
             title="Set Insight Alert"
           >
            <i className="fa-solid fa-bell text-sm"></i>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={`w-10 h-10 flex items-center justify-center transition-all rounded-full ${showShareMenu ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
              title="Share Insight"
            >
              <i className="fa-solid fa-share-nodes text-sm"></i>
            </button>

            {showShareMenu && (
              <div className={`absolute right-0 mt-3 w-56 rounded-2xl-plus shadow-2xl border glass ${isDarkMode ? 'glass-dark border-white/10' : 'glass-light border-slate-200'} p-2 z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right`}>
                <button onClick={shareViaEmail} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-white/5 transition-all">
                  <i className="fa-solid fa-envelope text-blue-500"></i>
                  <span>Email</span>
                </button>
                <button onClick={shareViaX} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-white/5 transition-all">
                  <i className="fa-brands fa-x-twitter text-slate-900 dark:text-white"></i>
                  <span>X (Twitter)</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2"></div>
                <button onClick={copyLink} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-white/5 transition-all">
                  <i className="fa-solid fa-link text-slate-400"></i>
                  <span>Copy Secure Link</span>
                </button>
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-12 prose prose-slate dark:prose-invert max-w-none scroll-smooth">
        <style>{`
          .lisa-content table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
            border-radius: 12px;
            overflow: hidden;
            margin: 2rem 0;
          }
          .lisa-content th {
            background: ${isDarkMode ? '#1e293b' : '#f1f5f9'};
            padding: 12px 16px;
            text-align: left;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .lisa-content td {
            padding: 12px 16px;
            border-top: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
            font-size: 0.95rem;
          }
          
          .edu-text { color: #3b82f6; font-weight: 700; }
          .health-text { color: #10b981; font-weight: 700; }
          .mgmt-text { color: #a855f7; font-weight: 700; }
          .price-text { color: #ef4444; font-weight: 800; }
          .marker-blue { background: rgba(59, 130, 246, 0.1); padding: 2px 6px; border-radius: 4px; }
          .marker-green { background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; }
          .marker-purple { background: rgba(168, 85, 247, 0.1); padding: 2px 6px; border-radius: 4px; }
        `}</style>
        
        <div className={`lisa-content whitespace-pre-wrap text-[17px] leading-relaxed font-medium tracking-tight ${
          isDarkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {artifact.content
            .split('\n').map((line, i) => {
              let formattedLine = line.replace(/(\$\d+(?:\.\d+)?|[\d,]+\s*(?:USD|THB|MMK))/g, '<span class="price-text">$1</span>');
              // Domain markers
              formattedLine = formattedLine.replace(/(🔵|Education|Study|Learning|🎓)/gi, '<span class="edu-text">$1</span>');
              formattedLine = formattedLine.replace(/(🟢|Health|Family|Wellness|Care|Parents|❤️)/gi, '<span class="health-text">$1</span>');
              formattedLine = formattedLine.replace(/(🟣|Management|Project|Strategy|Professional|💼)/gi, '<span class="mgmt-text">$1</span>');
              // Bold markers
              formattedLine = formattedLine.replace(/\[(HEALTH|EDU|MGMT|PLAN): ([^\]]+)\]/g, (match, type, content) => {
                const colorClass = type === 'HEALTH' ? 'marker-green' : type === 'EDU' ? 'marker-blue' : 'marker-purple';
                return `<span class="${colorClass}">${content}</span>`;
              });
              
              return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
            })
          }
        </div>
      </div>

      {/* Flight Alert Overlay */}
      {showAlertForm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-sm p-8 rounded-3xl-plus shadow-2xl border ${
            isDarkMode ? 'bg-space-800 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Setup Alert</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Lisa will track this context and notify you of any changes or updates.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Context Key</label>
                <input 
                  type="text" 
                  placeholder="e.g. Study Deadline" 
                  value={newAlert.route}
                  onChange={(e) => setNewAlert({...newAlert, route: e.target.value})}
                  className={`w-full px-5 py-3 rounded-2xl-plus text-sm border focus:ring-4 focus:ring-blue-500/10 transition-all ${
                    isDarkMode ? 'bg-space-900 border-white/5 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Threshold / Goal</label>
                <input 
                  type="text" 
                  placeholder="e.g. 100% complete" 
                  value={newAlert.price}
                  onChange={(e) => setNewAlert({...newAlert, price: e.target.value})}
                  className={`w-full px-5 py-3 rounded-2xl-plus text-sm border focus:ring-4 focus:ring-blue-500/10 transition-all ${
                    isDarkMode ? 'bg-space-900 border-white/5 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAlertForm(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAlert}
                className="flex-[2] py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl-plus shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`px-10 py-8 border-t ${isDarkMode ? 'border-white/5 bg-space-800/50' : 'border-slate-100 bg-slate-50/50'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-600">
           <i className="fa-solid fa-sparkles text-xs"></i>
           <span className="text-[11px] font-bold uppercase tracking-widest italic">Curated with heart by Lisa</span>
        </div>
        <div className="flex space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-2xl-plus shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
            Secure Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtifactPanel;
