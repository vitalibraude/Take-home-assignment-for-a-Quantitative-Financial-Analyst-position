
import React from 'react';
import { MissAnalysisData } from '../types';

interface MissAnalysisProps {
  data: MissAnalysisData;
  ticker: string;
}

const MissAnalysis: React.FC<MissAnalysisProps> = ({ data, ticker }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mb-2">
        <i className="fas fa-exclamation-triangle"></i>
        <span>THE FOLLOWING TEXTS ARE SIMULATED TO DEMONSTRATE THE ANALYSIS CHARACTERISTICS</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5">
          <h4 className="font-bold text-xs uppercase text-rose-400 mb-2">Overweighted Factors</h4>
          <p className="text-lg font-bold text-white mb-2">{data.overweighted.signal}</p>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">{data.overweighted.reason}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
          <h4 className="font-bold text-xs uppercase text-blue-400 mb-2">Underweighted Factors</h4>
          <p className="text-lg font-bold text-white mb-2">{data.underweighted.signal}</p>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">{data.underweighted.reason}</p>
        </div>
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-left">
         <h4 className="font-bold text-lg mb-2">Optimization Roadmap (Next Steps)</h4>
         <p className="text-slate-200 text-lg leading-relaxed italic font-medium">"Moving forward, {data.future_adjustment}"</p>
      </div>
    </div>
  );
};

export default MissAnalysis;
