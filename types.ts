
export interface StockProbability {
  ticker: string;
  prob_up: number;
  conf_int: [number, number];
  as_of: string;
  signals: SignalBreakdown[];
}

export interface SignalBreakdown {
  name: string;
  contribution: number;
  weight: number;
  description: string;
}

export interface ForecastPoint {
  date: string;
  pred_for: string;
  prob_up: number;
  actual_return: number;
  hit: boolean;
}

export interface NewsSourceItem {
  name: string;
  icon: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SituationalMetric {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  subtitle: string;
  impact: string; // New: Explain why it matters
  value: string | number;
  status: 'Normal' | 'Marginal' | 'Critical' | 'Live';
  trend: number[];
  percentage?: string;
  color: string;
}

export interface IntelFeedItem {
  id: string;
  category: string;
  time: string;
  text: string;
  type: 'AVIATION' | 'WEATHER' | 'GEO' | 'MARKET' | 'INTEL';
  shortTermProb?: number; // 7D
  mediumTermProb?: number; // 30D
  longTermProb?: number;  // 1Y
  currentPrice?: string;
  targetPrice?: string;
}

export interface MissAnalysisData {
  overweighted: {
    signal: string;
    impact: string;
    reason: string;
  };
  underweighted: {
    signal: string;
    impact: string;
    reason: string;
  };
  future_adjustment: string;
  learning_status: string;
}
