
import React from 'react';
import { SignalBreakdown } from '../types';

interface ExplainabilityWaterfallProps {
  signals: SignalBreakdown[];
}

const ExplainabilityWaterfall: React.FC<ExplainabilityWaterfallProps> = ({ signals }) => {
  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <div key={signal.name} className="group cursor-help">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium text-slate-300">{signal.name}</span>
            <span className={`font-mono ${signal.contribution >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {signal.contribution > 0 ? '+' : ''}{signal.contribution}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
            {signal.contribution > 0 ? (
              <>
                <div className="w-1/2" />
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000" 
                  style={{ width: `${Math.min(50, Math.abs(signal.contribution))}%` }} 
                />
              </>
            ) : (
              <>
                <div className="flex-1 flex justify-end">
                   <div 
                    className="bg-rose-500 h-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, Math.abs(signal.contribution) * 2)}%` }} 
                   />
                </div>
                <div className="w-1/2" />
              </>
            )}
          </div>
          <p className="hidden group-hover:block text-[10px] text-slate-500 mt-1 transition-all">
            {signal.description} (Weight: {signal.weight}%)
          </p>
        </div>
      ))}
    </div>
  );
};

export default ExplainabilityWaterfall;
