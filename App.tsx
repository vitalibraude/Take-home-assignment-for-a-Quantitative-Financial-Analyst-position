
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import ProbabilityGauge from './components/ProbabilityGauge';
import ExplainabilityWaterfall from './components/ExplainabilityWaterfall';
import ForecastAccuracyChart from './components/ForecastAccuracyChart';
import MissAnalysis from './components/MissAnalysis';
import NewsSources from './components/NewsSources';
import SituationalDashboard from './components/SituationalDashboard';
import { 
  getMockProbability, getMockHistory, getMissAnalysis, 
  TICKER_DETAILS, SITUATIONAL_METRICS 
} from './constants';
import { NewsSourceItem, IntelFeedItem } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SourceBadge: React.FC<{ type: 'live' | 'demo' }> = ({ type }) => (
  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 uppercase tracking-tighter ${
    type === 'live' 
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${type === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
    {type === 'live' ? 'Live Data' : 'Simulated'}
  </span>
);

const App: React.FC = () => {
  const [ticker, setTicker] = useState('NVDA');
  const [activeTab, setActiveTab] = useState<'intel' | 'sources' | 'pulse' | 'accuracy' | 'miss'>('intel');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiIntel, setAiIntel] = useState<string>('');
  const [aiProbability, setAiProbability] = useState<number>(50);
  const [newsSources, setNewsSources] = useState<NewsSourceItem[]>([]);
  const [tacticalFeed, setTacticalFeed] = useState<IntelFeedItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);

  const currentProb = useMemo(() => getMockProbability(ticker), [ticker]);
  const currentHistory = useMemo(() => getMockHistory(ticker), [ticker]);
  const currentMissAnalysis = useMemo(() => getMissAnalysis(ticker), [ticker]);

  const fetchRealTimeIntel = async (currentTicker: string) => {
    setAiLoading(true);
    setAiIntel('');
    setGroundingLinks([]);
    setNewsSources([]);
    setTacticalFeed([]);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze ${currentTicker}. 
        STRUCTURE YOUR RESPONSE AS FOLLOWS:
        1. PROBABILITY: [0-100]
        2. SUMMARY: [Overall outlook]
        3. SOURCE_BREAKDOWN:
           Bloomberg: [one-sentence summary] | [sentiment: positive/neutral/negative]
           CNBC: [one-sentence summary] | [sentiment: positive/neutral/negative]
           Reuters: [one-sentence summary] | [sentiment: positive/neutral/negative]
           Google News: [one-sentence summary] | [sentiment: positive/neutral/negative]
        4. TACTICAL_FEED:
           List 3 specific news articles or recent events for ${currentTicker}.
           Format each line: SOURCE_NAME | NEWS_TEXT | ST_7D: [number] | MT_30D: [number] | LT_1Y: [number] | CURR_PRICE: [price] | TGT_PRICE: [price]
           ST_7D: Likelihood of increase in 7 days.
           MT_30D: Likelihood of increase in 30 days.
           LT_1Y: Likelihood of increase in 1 year.
           CURR_PRICE: Current stock price.
           TGT_PRICE: Expected target price for that horizon.`,
        config: { tools: [{ googleSearch: {} }] },
      });
      
      const fullText = response.text || "";
      
      const probMatch = fullText.match(/PROBABILITY:\s*(\d+)/i);
      if (probMatch && probMatch[1]) {
        setAiProbability(parseInt(probMatch[1]));
      }

      const summaryMatch = fullText.match(/SUMMARY:([\s\S]*?)SOURCE_BREAKDOWN:/i);
      const cleanSummary = summaryMatch ? summaryMatch[1].trim() : fullText.split('SOURCE_BREAKDOWN:')[0].replace(/PROBABILITY:\s*\d+/i, '').trim();
      setAiIntel(cleanSummary || "Analysis complete.");

      const breakdownPart = fullText.split('SOURCE_BREAKDOWN:')[1]?.split('TACTICAL_FEED:')[0];
      if (breakdownPart) {
        const lines = breakdownPart.split('\n').filter(l => l.includes(':'));
        const parsedSources: NewsSourceItem[] = lines.map(line => {
          const [namePart, detailPart] = line.split(':');
          const [summary, sentimentRaw] = detailPart?.split('|') || ["No details.", "neutral"];
          const name = namePart.replace(/[*-]/g, '').trim();
          const sentiment: 'positive' | 'neutral' | 'negative' = 
            sentimentRaw?.toLowerCase().includes('positive') ? 'positive' :
            sentimentRaw?.toLowerCase().includes('negative') ? 'negative' : 'neutral';
          
          let icon = 'fa-newspaper';
          if (name.toLowerCase().includes('bloomberg')) icon = 'fa-terminal';
          if (name.toLowerCase().includes('cnbc')) icon = 'fa-tv';
          if (name.toLowerCase().includes('reuters')) icon = 'fa-globe';
          if (name.toLowerCase().includes('google')) icon = 'fa-google';

          return { name, summary: summary.trim(), sentiment, icon };
        }).filter(s => s.name.length > 2);
        setNewsSources(parsedSources);
      }

      const feedPart = fullText.split('TACTICAL_FEED:')[1];
      if (feedPart) {
        const lines = feedPart.split('\n').filter(l => l.includes('|'));
        const feed: IntelFeedItem[] = lines.map((line, idx) => {
          const parts = line.split('|').map(p => p.trim());
          const stMatch = parts[2]?.match(/ST_7D:\s*(\d+)/i);
          const mtMatch = parts[3]?.match(/MT_30D:\s*(\d+)/i);
          const ltMatch = parts[4]?.match(/LT_1Y:\s*(\d+)/i);
          const currPriceMatch = parts[5]?.match(/CURR_PRICE:\s*(.*)/i);
          const tgtPriceMatch = parts[6]?.match(/TGT_PRICE:\s*(.*)/i);
          
          return {
            id: `tactical-${idx}`,
            category: parts[0]?.replace(/[*-]/g, '').trim() || 'INTEL',
            text: parts[1]?.trim() || 'No data.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'INTEL',
            shortTermProb: stMatch ? parseInt(stMatch[1]) : 50,
            mediumTermProb: mtMatch ? parseInt(mtMatch[1]) : 50,
            longTermProb: ltMatch ? parseInt(ltMatch[1]) : 50,
            currentPrice: currPriceMatch ? currPriceMatch[1] : undefined,
            targetPrice: tgtPriceMatch ? tgtPriceMatch[1] : undefined
          };
        });
        setTacticalFeed(feed);
      }

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
      setGroundingLinks(links);
    } catch (error) {
      setAiIntel("Awaiting live connection...");
      setAiProbability(50);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { fetchRealTimeIntel(ticker); }, [ticker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchVal.trim().toUpperCase();
    if (query) {
      setLoading(true);
      setTimeout(() => { setTicker(query); setLoading(false); setSearchVal(''); }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fas fa-brain text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none">WorldAware</h1>
            <p className="text-[10px] uppercase tracking-tighter text-slate-500 font-semibold">Intelligence Room</p>
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-12">
          <input 
            type="text" 
            placeholder="Analyze Ticker (e.g. NVDA, TSLA)..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-full py-2.5 px-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm transition-all"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
        <div className="flex gap-4">
           <SourceBadge type="live" />
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dashboard Left */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`glass-panel rounded-3xl p-8 flex flex-col items-center relative transition-all duration-500 ${loading || aiLoading ? 'opacity-50 blur-[2px]' : 'opacity-100'}`}>
              <div className="absolute top-4 right-4"><SourceBadge type="live" /></div>
              <div className="text-center mb-4">
                <h2 className="text-4xl font-black tracking-tighter">{ticker}</h2>
                <p className="text-slate-400 text-sm font-medium">{TICKER_DETAILS[ticker]?.name || 'Global Market Asset'}</p>
              </div>
              <ProbabilityGauge value={aiProbability} />
              <div className="w-full mt-4 pt-4 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Live Sentiment Score</p>
                <p className="text-[9px] text-slate-600 mt-1 italic">Synthesized via real-time global news streams.</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 relative">
              <div className="absolute top-4 right-4"><SourceBadge type="demo" /></div>
              <h3 className="font-bold text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-500">
                <i className="fas fa-layer-group text-blue-400"></i>
                Signal Components
              </h3>
              <ExplainabilityWaterfall signals={currentProb.signals} />
            </div>
          </div>

          {/* Dashboard Right */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="flex gap-1 p-1 bg-slate-900/50 rounded-2xl w-fit overflow-x-auto">
              <button onClick={() => setActiveTab('intel')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'intel' ? 'bg-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <i className="fas fa-bolt mr-2 text-xs"></i> AI Intel
              </button>
              <button onClick={() => setActiveTab('pulse')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'pulse' ? 'bg-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <i className="fas fa-satellite mr-2 text-xs"></i> Situation Room
              </button>
              <button onClick={() => setActiveTab('sources')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'sources' ? 'bg-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <i className="fas fa-stream mr-2 text-xs"></i> Perspectives
              </button>
              <button onClick={() => setActiveTab('accuracy')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'accuracy' ? 'bg-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <i className="fas fa-bullseye mr-2 text-xs"></i> Accuracy
              </button>
              <button onClick={() => setActiveTab('miss')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === 'miss' ? 'bg-rose-600 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <i className="fas fa-search-minus mr-2 text-xs"></i> Analysis
              </button>
            </div>

            <div className="glass-panel rounded-3xl p-8 min-h-[520px] relative overflow-hidden">
              
              {activeTab === 'intel' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="absolute top-6 right-8 flex items-center gap-2"><SourceBadge type="live" /></div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">Market Intelligence Summary</h3>
                  {aiLoading ? (
                     <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Scanning financial nodes...</p>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {aiIntel}
                        </div>
                        {groundingLinks.length > 0 && (
                          <div className="pt-6 border-t border-white/5">
                             <p className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Grounding Citations</p>
                             <div className="flex flex-wrap gap-2">
                               {groundingLinks.slice(0, 3).map((link, idx) => (
                                 <a key={idx} href={link.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all text-slate-400 hover:text-white">
                                   {link.title}
                                 </a>
                               ))}
                             </div>
                          </div>
                        )}
                     </div>
                  )}
                </div>
              )}

              {activeTab === 'pulse' && (
                aiLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Synthesizing Tactical Intelligence for {ticker}...</p>
                  </div>
                ) : (
                  <SituationalDashboard metrics={SITUATIONAL_METRICS} feed={tacticalFeed} ticker={ticker} />
                )
              )}

              {activeTab === 'sources' && (
                <div className="animate-in fade-in duration-500">
                  <div className="absolute top-6 right-8"><SourceBadge type="live" /></div>
                  <h3 className="text-xl font-bold mb-6 text-left">Outlet Perspective Breakdown</h3>
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                       <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                       <p className="text-slate-500">Parsing global headlines...</p>
                    </div>
                  ) : (
                    <NewsSources sources={newsSources} />
                  )}
                </div>
              )}

              {activeTab === 'accuracy' && (
                <div className="animate-in fade-in duration-500 h-full flex flex-col">
                  <div className="absolute top-6 right-8"><SourceBadge type="demo" /></div>
                  <h3 className="text-xl font-bold mb-6">Performance Accuracy (30D)</h3>
                  <div className="flex-1 min-h-[400px]">
                    <ForecastAccuracyChart data={currentHistory} />
                  </div>
                </div>
              )}

              {activeTab === 'miss' && (
                <div className="animate-in fade-in duration-500">
                  <div className="absolute top-6 right-8"><SourceBadge type="demo" /></div>
                  <h3 className="text-xl font-bold mb-6">Retrospective Miss Post-Mortem</h3>
                  <MissAnalysis data={currentMissAnalysis} ticker={ticker} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
