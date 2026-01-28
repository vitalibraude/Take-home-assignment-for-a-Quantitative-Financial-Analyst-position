
import React from 'react';
import { SituationalMetric, IntelFeedItem } from '../types';

interface SituationalDashboardProps {
  metrics: SituationalMetric[];
  feed: IntelFeedItem[];
  ticker: string;
}

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-50">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const SituationalDashboard: React.FC<SituationalDashboardProps> = ({ metrics, feed, ticker }) => {
  const getProbColor = (p: number) => {
    if (p >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (p >= 50) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (p >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getProbText = (p: number) => {
    if (p >= 70) return 'Bullish';
    if (p >= 50) return 'Neutral+';
    if (p >= 40) return 'Neutral-';
    return 'Bearish';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-left">
      {/* Visual Header Section */}
      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <i className="fas fa-satellite-dish text-blue-400 text-xl animate-pulse"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              SITUATION ROOM: {ticker}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Live Tactical Stream Active</p>
            </div>
          </div>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
          The Situation Room fuses high-frequency institutional data with live news flows to create a 
          <span className="text-white font-bold mx-1">Single Pane of Truth</span> 
          for {ticker}. Below are the primary technical catalysts and tactical event impact scores.
        </p>
      </div>

      {/* Grid of Core Technical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:bg-slate-900/60 transition-all border-l-4 group" style={{ borderLeftColor: m.color }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-xl shadow-inner ${m.iconColor}`}>
                  <i className={`fas ${m.icon}`}></i>
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">{m.title}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{m.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tracking-tighter" style={{ color: m.color }}>
                  {m.percentage || m.value}
                </div>
                <Sparkline data={m.trend} color={m.color} />
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                <span className="text-white/40 font-black uppercase text-[9px] mr-2 tracking-widest">Impact:</span>
                {m.impact}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tactical Horizon Feed */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-end px-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <i className="fas fa-stream text-blue-500"></i>
              Tactical Event Ledger
            </h3>
            <p className="text-[10px] text-slate-500 font-medium italic">Decomposition of likelihood of increase across ST/MT/LT horizons.</p>
          </div>
          <div className="hidden lg:flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">
             <span className="w-20 text-center">Short-Term</span>
             <span className="w-20 text-center">Mid-Term</span>
             <span className="w-20 text-center">Long-Term</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {feed.length === 0 ? (
             <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Decrypting signals...</span>
             </div>
          ) : feed.map((item) => (
            <div key={item.id} className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 hover:border-blue-500/40 transition-all group relative">
              <div className="flex-1 flex flex-col gap-3 w-full">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-full border border-white/10 ${
                      item.type === 'INTEL' ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-400 bg-slate-800/50'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                      <i className="far fa-clock"></i>
                      {item.time}
                    </span>
                  </div>
                  {item.currentPrice && (
                    <div className="flex items-center gap-4 py-1 px-4 bg-slate-950/50 rounded-full border border-white/5 shadow-inner">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black">Current</span>
                        <span className="text-xs font-bold text-slate-300">{item.currentPrice}</span>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-slate-700"></i>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-blue-600 uppercase font-black">Target</span>
                        <span className="text-xs font-bold text-blue-400">{item.targetPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-base text-slate-200 font-semibold group-hover:text-white transition-colors leading-relaxed">
                  {item.text}
                </p>
              </div>

              {/* Three Horizon Probabilities */}
              <div className="flex gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                 <div className="flex-1 lg:w-20 flex flex-col items-center gap-1 group/prob">
                    <div className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center transition-all ${getProbColor(item.shortTermProb || 50)} group-hover/prob:scale-110`}>
                      <span className="text-xl font-black tracking-tighter">{item.shortTermProb}%</span>
                      <span className="text-[8px] font-black uppercase opacity-70 tracking-widest">{getProbText(item.shortTermProb || 50)}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest mt-1">7 Days</span>
                 </div>
                 
                 <div className="flex-1 lg:w-20 flex flex-col items-center gap-1 group/prob">
                    <div className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center transition-all ${getProbColor(item.mediumTermProb || 50)} group-hover/prob:scale-110`}>
                      <span className="text-xl font-black tracking-tighter">{item.mediumTermProb}%</span>
                      <span className="text-[8px] font-black uppercase opacity-70 tracking-widest">{getProbText(item.mediumTermProb || 50)}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest mt-1">30 Days</span>
                 </div>
                 
                 <div className="flex-1 lg:w-20 flex flex-col items-center gap-1 group/prob">
                    <div className={`w-full py-2 px-1 rounded-xl border flex flex-col items-center transition-all ${getProbColor(item.longTermProb || 50)} group-hover/prob:scale-110`}>
                      <span className="text-xl font-black tracking-tighter">{item.longTermProb}%</span>
                      <span className="text-[8px] font-black uppercase opacity-70 tracking-widest">{getProbText(item.longTermProb || 50)}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest mt-1">1 Year</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SituationalDashboard;
