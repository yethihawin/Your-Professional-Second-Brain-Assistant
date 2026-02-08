
import React from 'react';
import { ActionLog } from '../types';

interface ActionHistoryProps {
  logs: ActionLog[];
}

const ActionHistory: React.FC<ActionHistoryProps> = ({ logs }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] border-l border-slate-800/50 overflow-hidden">
      <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-[#1e293b]/30">
        <div className="flex items-center space-x-2 text-blue-400">
          <i className="fa-solid fa-timeline"></i>
          <h3 className="font-bold text-xs uppercase tracking-[0.2em]">Session Logs</h3>
        </div>
        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono">
          {logs.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <i className="fa-solid fa-ghost text-4xl mb-4"></i>
            <p className="text-xs italic">Awaiting cognitive activity...</p>
          </div>
        ) : (
          logs.slice().reverse().map((log) => (
            <div key={log.id} className="group border-l border-slate-700/50 hover:border-blue-500 pl-4 py-1 transition-all">
              <div className="flex items-center justify-between text-slate-500 group-hover:text-slate-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{log.action.replace('_', ' ')}</span>
                <span className="text-[9px] font-mono">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2 italic">{log.details}</p>
            </div>
          ))
        )}
      </div>
      <div className="p-6 bg-[#1e293b]/30 border-t border-slate-800/50 text-center">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">End of Session History</p>
      </div>
    </div>
  );
};

export default ActionHistory;
