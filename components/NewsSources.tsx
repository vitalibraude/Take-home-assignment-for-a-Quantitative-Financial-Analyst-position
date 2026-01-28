
import React from 'react';
import { NewsSourceItem } from '../types';

interface NewsSourcesProps {
  sources: NewsSourceItem[];
}

const NewsSources: React.FC<NewsSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 italic">
        No specific outlet breakdown available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sources.map((source, index) => (
        <div key={index} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-blue-500/20 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/10 transition-all">
                <i className={`fas ${source.icon}`}></i>
              </div>
              <h4 className="font-bold text-sm text-white">{source.name}</h4>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              source.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
              source.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' :
              'bg-slate-500/10 text-slate-400'
            }`}>
              {source.sentiment}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed italic">
            "{source.summary}"
          </p>
        </div>
      ))}
    </div>
  );
};

export default NewsSources;
