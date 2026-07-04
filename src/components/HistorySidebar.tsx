import React from 'react';
import { History, User, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface HistorySidebarProps {
  history: SearchHistoryItem[];
  onSelectItem: (item: SearchHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  activeId: string | null;
}

export default function HistorySidebar({ 
  history, 
  onSelectItem, 
  onDeleteItem, 
  onClearAll,
  activeId 
}: HistorySidebarProps) {

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('bn-BD', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="history-sidebar-root" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <History className="w-4.5 h-4.5 text-indigo-400" />
          রিসেন্ট সার্চ হিস্টোরি (Search History)
        </h3>
        {history.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={onClearAll}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition hover:underline"
          >
            সব মুছুন
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-850 rounded-xl">
          <History className="w-8 h-8 text-slate-700 mb-2" />
          <p className="text-xs font-semibold text-slate-400">কোনো ইতিহাস নেই</p>
          <p className="text-[10px] text-slate-500 mt-1">
            আপনি যখন বায়ারদের প্রোফাইল সার্চ করবেন, তখন তা এখানে সংরক্ষিত হবে
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-none flex flex-col gap-2 pr-1 custom-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              className={`group relative p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                activeId === item.id
                  ? 'bg-indigo-600/10 border-indigo-500/40 shadow-inner'
                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/80'
              }`}
              onClick={() => onSelectItem(item)}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-6">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  activeId === item.id 
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    @{item.username}
                  </span>
                  <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </span>
                  {item.country && (
                    <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                      📍 {item.country}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                  {item.results.length} matched
                </span>
                <button
                  id={`delete-history-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="হিস্টোরি মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
