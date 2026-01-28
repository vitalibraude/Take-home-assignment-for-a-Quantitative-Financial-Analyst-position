
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceArea, ReferenceDot, Legend, Area, ComposedChart 
} from 'recharts';
import { ForecastPoint } from '../types';

interface ForecastAccuracyChartProps {
  data: ForecastPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ForecastPoint;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="font-bold mb-1 text-slate-300">{data.date}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Predicted Prob: {data.prob_up.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Actual Return: {data.actual_return.toFixed(2)}%</span>
        </div>
        <div className={`mt-2 font-semibold ${data.hit ? 'text-emerald-400' : 'text-red-400'}`}>
          {data.hit ? '✓ HIT: Accurate Forecast' : '✗ MISS: Divergence'}
        </div>
      </div>
    );
  }
  return null;
};

const ForecastAccuracyChart: React.FC<ForecastAccuracyChartProps> = ({ data }) => {
  const [resolution, setResolution] = useState<'7D' | '30D' | '365D'>('30D');

  const filteredData = resolution === '7D' ? data.slice(-7) : data;
  const accuracy = (data.filter(d => d.hit).length / data.length) * 100;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex bg-slate-800 rounded-lg p-1">
          {(['7D', '30D', '365D'] as const).map((res) => (
            <button
              key={res}
              onClick={() => setResolution(res)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                resolution === res ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
           <div className="text-right">
             <div className="text-xs text-slate-400">Avg. Accuracy</div>
             <div className={`text-lg font-bold ${accuracy > 60 ? 'text-emerald-400' : 'text-orange-400'}`}>
               {accuracy.toFixed(1)}%
             </div>
           </div>
           <div className="w-10 h-10 rounded-full border-4 border-slate-800 flex items-center justify-center">
              <i className="fas fa-bullseye text-blue-400"></i>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val.split('-').slice(1).join('/')}
            />
            <YAxis 
              yAxisId="left"
              stroke="#3b82f6" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#10b981" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Background color zones */}
            <ReferenceArea y1={60} y2={100} yAxisId="left" fill="#059669" fillOpacity={0.05} />
            <ReferenceArea y1={40} y2={60} yAxisId="left" fill="#d97706" fillOpacity={0.05} />
            <ReferenceArea y1={0} y2={40} yAxisId="left" fill="#dc2626" fillOpacity={0.05} />

            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="prob_up" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={false}
              name="Probability Prediction"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="actual_return" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false}
              name="Actual Return"
            />

            {filteredData.map((entry, index) => (
              <ReferenceDot
                key={index}
                yAxisId="left"
                x={entry.date}
                y={entry.prob_up}
                r={4}
                fill={entry.hit ? '#10b981' : '#ef4444'}
                stroke="none"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastAccuracyChart;
