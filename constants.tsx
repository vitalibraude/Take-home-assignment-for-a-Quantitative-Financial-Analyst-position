
import { SignalBreakdown, StockProbability, ForecastPoint, MissAnalysisData, SituationalMetric, IntelFeedItem } from './types';

export const TICKER_DETAILS: Record<string, { name: string; sector: string }> = {
  'NVDA': { name: 'NVIDIA Corporation', sector: 'Semiconductors' },
  'AAPL': { name: 'Apple Inc.', sector: 'Consumer Electronics' },
  'GOOGL': { name: 'Alphabet Inc.', sector: 'Internet Services' },
  'TSLA': { name: 'Tesla, Inc.', sector: 'Automotive & Energy' },
  'MSFT': { name: 'Microsoft Corporation', sector: 'Software & Cloud' },
  'AMZN': { name: 'Amazon.com, Inc.', sector: 'E-commerce & Cloud' },
};

export const SITUATIONAL_METRICS: SituationalMetric[] = [
  {
    id: 'dark-pool',
    title: 'Dark Pool Flow',
    icon: 'fa-user-secret',
    iconColor: 'text-slate-400',
    subtitle: 'Institutional off-exchange volume',
    impact: 'Detects hidden large-scale whale movements not visible on public charts. High flow suggests major institutional entry.',
    value: '42%',
    percentage: '42%',
    status: 'Live',
    trend: [30, 35, 32, 45, 48, 42, 42],
    color: '#3b82f6'
  },
  {
    id: 'gamma',
    title: 'Gamma Exposure (GEX)',
    icon: 'fa-wave-square',
    iconColor: 'text-indigo-400',
    subtitle: 'Options dealer positioning delta',
    impact: 'Measures market maker hedging pressure. High positive GEX dampens volatility; negative GEX fuels explosive price swings.',
    value: 'High',
    percentage: '88%',
    status: 'Live',
    trend: [60, 65, 75, 80, 85, 90, 88],
    color: '#10b981'
  },
  {
    id: 'insider',
    title: 'Insider Velocity',
    icon: 'fa-user-tie',
    iconColor: 'text-emerald-400',
    subtitle: 'SEC Form 4 filing frequency',
    impact: 'Analyzes the rate of buy/sell filings by executives. A spike in buying velocity is a massive conviction signal.',
    value: 'Low',
    percentage: '12%',
    status: 'Live',
    trend: [10, 15, 12, 8, 10, 14, 12],
    color: '#ef4444'
  },
  {
    id: 'social-buzz',
    title: 'Sentiment Velocity',
    icon: 'fa-comments',
    iconColor: 'text-rose-400',
    subtitle: 'Reddit/X mention acceleration',
    impact: 'Tracks the viral spread of ticker mentions. Useful for spotting retail-driven momentum shifts before price action starts.',
    value: 'Extreme',
    percentage: '94%',
    status: 'Critical',
    trend: [20, 45, 60, 85, 95, 98, 94],
    color: '#f43f5e'
  },
  {
    id: 'whale-orders',
    title: 'Whale Alert',
    icon: 'fa-fish',
    iconColor: 'text-blue-400',
    subtitle: 'Block trades > $5M detected',
    impact: 'Single orders that shift supply/demand. Identifying repeated $5M+ orders indicates a large player is building a position.',
    value: '3 Items',
    percentage: '75%',
    status: 'Live',
    trend: [40, 30, 50, 60, 80, 70, 75],
    color: '#3b82f6'
  },
  {
    id: 'yield-curve',
    title: 'Yield Delta',
    icon: 'fa-chart-line',
    iconColor: 'text-amber-400',
    subtitle: '10Y-2Y Spread pressure',
    impact: 'The macro "Engine Room". Changes in the yield curve spread affect equity valuations and risk-on/risk-off cycles.',
    value: 'Stable',
    percentage: '24%',
    status: 'Normal',
    trend: [20, 22, 25, 23, 24, 25, 24],
    color: '#f59e0b'
  }
];

export const INTEL_FEED: IntelFeedItem[] = [
  {
    id: '1',
    category: 'INSTITUTIONAL',
    time: '11:53',
    text: 'Massive $12M Dark Pool block trade detected at current price level.',
    type: 'MARKET'
  },
  {
    id: '2',
    category: 'OPTIONS',
    time: '11:53',
    text: 'Zero Days to Expiration (0DTE) volume spikes for top-weighted tickers.',
    type: 'MARKET'
  },
  {
    id: '3',
    category: 'SENTIMENT',
    time: '11:51',
    text: 'Short-squeeze sentiment rising in retail-heavy sectors.',
    type: 'MARKET'
  }
];

const createSignals = (ticker: string): SignalBreakdown[] => {
  const seed = ticker.length;
  return [
    { name: 'Fundamentals', contribution: 10 + (seed % 5), weight: 25, description: 'Growth and margin metrics' },
    { name: 'Technical', contribution: 2 + (seed % 8), weight: 15, description: 'Momentum and trend indicators' },
    { name: 'Sentiment', contribution: -5 + (seed % 10), weight: 15, description: 'Social and news sentiment score' },
    { name: 'Macro', contribution: 5 + (seed % 4), weight: 15, description: 'Interest rate and inflation exposure' },
    { name: 'Commodity & Geo', contribution: 10 - (seed % 5), weight: 10, description: 'Geopolitical risk factor' },
    { name: 'Alt-Data', contribution: 4 + (seed % 3), weight: 10, description: 'Satellite and supply chain data' },
    { name: 'Risk', contribution: -2 - (seed % 2), weight: 10, description: 'Insider activity and compliance' },
  ];
};

export const getMockProbability = (ticker: string): StockProbability => {
  const signals = createSignals(ticker);
  const sum = signals.reduce((acc, s) => acc + s.contribution, 50);
  return {
    ticker,
    prob_up: Math.min(98, Math.max(2, sum)),
    conf_int: [sum - 15, sum + 12],
    as_of: new Date().toISOString(),
    signals,
  };
};

export const getMockHistory = (ticker: string): ForecastPoint[] => {
  const seed = ticker.charCodeAt(0);
  return Array.from({ length: 30 }).map((_, i) => {
    const prob = 30 + ((seed + i) % 50) + Math.random() * 10;
    const actual = Math.sin((seed + i) / 5) * 3 + (Math.random() - 0.5);
    return {
      date: `2024-05-${String(i + 1).padStart(2, '0')}`,
      pred_for: `2024-05-${String(i + 2).padStart(2, '0')}`,
      prob_up: prob,
      actual_return: actual,
      hit: (prob > 50 && actual > 0) || (prob <= 50 && actual <= 0),
    };
  });
};

export const getMissAnalysis = (ticker: string): MissAnalysisData => {
  const data: Record<string, MissAnalysisData> = {
    'NVDA': {
      overweighted: {
        signal: 'Geopolitical (China Exports)',
        impact: 'High Negative Bias',
        reason: 'I underestimated the company\'s ability to offset Chinese market loss with record-breaking demand for Data Centers in the US.'
      },
      underweighted: {
        signal: 'Alt-Data (Supply Chain Imagery)',
        impact: 'Low Positive Bias',
        reason: 'Satellite data showed increased output at TSMC facilities for Blackwell chips, but the model gave this too low a weight.'
      },
      future_adjustment: 'Increase Alt-Data weighting by 15% during new product launches and decrease short-term regulatory sensitivity.',
      learning_status: 'Model Patch v4.2.1 In-Progress'
    },
    'TSLA': {
      overweighted: {
        signal: 'Sentiment (Social Media Buzz)',
        impact: 'High Volatility Bias',
        reason: 'Social media noise regarding FSD was translated into a too-bullish forecast, while economic data showed a sales slowdown.'
      },
      underweighted: {
        signal: 'Macro (Rate Sensitivity)',
        impact: 'High Negative Exposure',
        reason: 'The model failed to correctly evaluate the intensity of high interest rates on luxury vehicle purchasing power.'
      },
      future_adjustment: 'Implement "Auto Loan Delinquency" variables into the automotive sector macro signals.',
      learning_status: 'Retraining Bayesian Layer'
    }
  };
  return data[ticker] || {
    overweighted: { signal: 'Technical Momentum', impact: 'Moderate', reason: 'Gave too much weight to technical trends while ignoring saturation signs.' },
    underweighted: { signal: 'Insider Trading', impact: 'High', reason: 'Insider selling was a better leading indicator that wasn\'t fully reflected.' },
    future_adjustment: 'Rebalancing technical vs fundamental weighting.',
    learning_status: 'Analyzing divergence patterns'
  };
};
