import { useState } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MOCK_CHART_DATA = Array.from({ length: 48 }).map((_, i) => ({
  time: `${Math.floor(i/2)}:${i%2===0?'00':'30'}`,
  price: 30 + Math.random() * 40 + (i > 30 ? Math.random() * 20 : 0) // slight trend
}));

const TIMEFRAMES = ['1M', '5M', '15M', '1H', '1D', 'ALL'];

import { useEthersSigner } from '../lib/ethersAdapter';

export function MarketDetail() {
  const { markets, selectedMarketId, executeTrade } = useStore();
  const signer = useEthersSigner();
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeOutcome, setTradeOutcome] = useState<'YES' | 'NO'>('YES');
  const [activeTimeframe, setActiveTimeframe] = useState('1H');

  const market = markets.find(m => m.id === selectedMarketId);

  if (!market) return <div className="h-full flex items-center justify-center text-muted-foreground font-mono">Select a market</div>;

  const handleTrade = () => {
    const amt = parseFloat(tradeAmount);
    if (isNaN(amt) || amt <= 0) return;
    executeTrade(market.id, tradeOutcome, amt, signer);
    setTradeAmount('');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050505]">
      {/* Header Info */}
      <div className="p-6 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-4 mb-4">
          <img src={market.image} alt={market.title} className="w-16 h-16 rounded-md border border-[#1F1F1F]" />
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight leading-tight">{market.title}</h1>
            <div className="flex items-center gap-4 mt-2 font-mono text-xs text-muted-foreground">
              <span>Vol: ${(market.volume / 1000000).toFixed(1)}M</span>
              <span>Liq: ${(market.liquidity / 1000000).toFixed(1)}M</span>
              <span>Ends: {new Date(market.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 p-6 flex flex-col min-h-0 border-b border-[#1F1F1F] relative">
        <div className="absolute top-4 left-6 z-10 flex flex-col gap-2">
          <h3 className="font-mono text-xs text-muted-foreground uppercase">Chance: <span className="text-[#00FF55] text-lg">{market.chance}%</span></h3>
        </div>
        
        {/* Timeframe selector */}
        <div className="absolute top-4 right-6 z-10 flex gap-1">
          {TIMEFRAMES.map((tf) => (
             <button
               key={tf}
               onClick={() => setActiveTimeframe(tf)}
               className={`font-mono text-[10px] px-2 py-1 rounded transition-colors ${
                 activeTimeframe === tf 
                   ? 'bg-[#262626] text-white' 
                   : 'text-muted-foreground hover:bg-[#1A1A1A] hover:text-white'
               }`}
             >
               {tf}
             </button>
          ))}
        </div>

        <div className="flex-1 -ml-6 w-[calc(100%+1.5rem)] mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART_DATA}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF55" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FF55" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F1F', borderRadius: '0', fontFamily: 'monospace' }}
                itemStyle={{ color: '#00FF55' }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="step" dataKey="price" stroke="#00FF55" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Manual Trading UI Footer (Fallback/Alternative to Terminal) */}
      <div className="h-48 grid grid-cols-3 divide-x divide-[#1F1F1F] bg-[#0A0A0A]">
        {/* Yes Button */}
        <div 
          onClick={() => setTradeOutcome('YES')}
          className={`p-4 cursor-pointer flex flex-col justify-center items-center transition-colors ${tradeOutcome === 'YES' ? 'bg-[#121212]' : 'hover:bg-[#121212]'}`}
        >
          <span className="font-sans text-xl font-bold text-[#00FF55]">YES</span>
          <span className="font-mono text-muted-foreground mt-1">{market.yesPrice}¢</span>
        </div>
        {/* No Button */}
        <div 
          onClick={() => setTradeOutcome('NO')}
          className={`p-4 cursor-pointer flex flex-col justify-center items-center transition-colors ${tradeOutcome === 'NO' ? 'bg-[#121212]' : 'hover:bg-[#121212]'}`}
        >
          <span className="font-sans text-xl font-bold text-[#FF3333]">NO</span>
          <span className="font-mono text-muted-foreground mt-1">{market.noPrice}¢</span>
        </div>
        {/* Input/Execute */}
        <div className="p-4 flex flex-col justify-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">$</span>
            <Input 
              type="number" 
              placeholder="Amount" 
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="pl-8 font-mono bg-black border-[#1F1F1F] rounded-sm text-lg focus-visible:ring-primary shadow-none h-12"
            />
          </div>
          <Button 
            onClick={handleTrade}
            className={`w-full font-mono font-bold rounded-sm h-12 text-sm ${tradeOutcome === 'YES' ? 'bg-primary text-black hover:bg-primary/80' : 'bg-destructive text-white hover:bg-destructive/80'}`}
          >
            ORDER {tradeOutcome}
          </Button>
        </div>
      </div>
    </div>
  );
}
