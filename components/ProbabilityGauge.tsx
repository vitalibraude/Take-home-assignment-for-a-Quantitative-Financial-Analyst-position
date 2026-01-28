
import React, { useEffect, useState } from 'react';

interface ProbabilityGaugeProps {
  value: number; // 0 - 100
}

const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({ value }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  // Speedometer logic: Arc from -210 to 30 degrees (240 degree span)
  const rotation = (animatedValue / 100) * 180 - 90; // -90 to 90 degrees for a semi-circle

  const getColor = (v: number) => {
    if (v < 40) return '#ef4444'; // Red
    if (v < 60) return '#f97316'; // Orange
    if (v < 80) return '#a3e635'; // Lime
    return '#10b981'; // Green
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-64 h-40 overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        {/* Background Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor(animatedValue)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="251.3" // Half circumference of radius 80
          style={{
            strokeDashoffset: 251.3 - (animatedValue / 100) * 251.3,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 1s ease'
          }}
        />
        
        {/* Needle */}
        <g 
          transform={`rotate(${rotation}, 100, 100)`}
          style={{ transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <line
            x1="100" y1="100"
            x2="100" y2="30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill="white" />
        </g>

        {/* Labels */}
        <text x="25" y="115" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold">0%</text>
        <text x="175" y="115" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold">100%</text>
      </svg>
      
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-4xl font-black tracking-tighter" style={{ color: getColor(animatedValue) }}>
          {Math.round(animatedValue)}%
        </span>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Market Pulse</span>
      </div>
    </div>
  );
};

export default ProbabilityGauge;
