
import React from 'react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const LISA_AVATAR_URL = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop";

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isDarkMode, toggleTheme }) => {
  const navItems = [
    { id: TabType.KNOWLEDGE, icon: 'fa-feather', label: 'Knowledge' },
    { id: TabType.STUDY, icon: 'fa-book-sparkles', label: 'Self-Study' },
    { id: TabType.VAULT, icon: 'fa-archive', label: 'The Vault' },
    { id: TabType.INSIGHTS, icon: 'fa-chart-network', label: 'Brain Map' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-space-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar with Glassmorphism */}
      <aside className={`w-64 glass ${isDarkMode ? 'glass-dark' : 'glass-light'} border-r border-slate-200 dark:border-white/5 flex flex-col hidden lg:flex z-30 relative transition-all duration-300`}>
        <div className="p-8 pb-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-full border-2 border-white dark:border-white/10 overflow-hidden shadow-2xl transition-all duration-500 ${isDarkMode ? 'lisa-glow' : 'shadow-blue-200'}`}>
              <img 
                src={LISA_AVATAR_URL} 
                alt="Lisa" 
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-space-900 rounded-full shadow-lg"></div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Lisa</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.25em] mt-1">Second Brain AI</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl-plus transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 translate-x-1'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-sm transition-transform duration-300 group-hover:scale-110`}></i>
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl-plus text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-widest">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            <i className={`fa-solid ${isDarkMode ? 'fa-moon text-blue-400' : 'fa-sun text-amber-500'} text-sm`}></i>
          </button>

          <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl-plus border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cognitive State</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 italic">Highly efficient</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
