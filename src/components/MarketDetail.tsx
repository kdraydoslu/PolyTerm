import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

const TIMEFRAMES = ['1M', '5M', '15M', '1H', '1D', 'ALL'];

// Function to generate initial chart data based on market price
const generateInitialData = (basePrice: number) => {
  return Array.from({ length: 50 }).map((_, i) => ({
    time: i,
    price: Math.max(0, Math.min(100, basePrice - 10 + Math.random() * 20))
  }));
};

import { useEthersSigner } from '../lib/ethersAdapter';

export function MarketDetail() {
  const { markets, selectedMarketId, executeTrade } = useStore();
  const signer = useEthersSigner();
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeOutcome, setTradeOutcome] = useState<'YES' | 'NO'>('YES');
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  
  const market = markets.find(m => String(m.id) === String(selectedMarketId));
  const [chartData, setChartData] = useState<{time: number, price: number}[]>([]);
  const lastPriceRef = useRef<number>(market?.chance || 50);

  // Initialize and simulate live data
  useEffect(() => {
    if (market) {
      setChartData(generateInitialData(market.chance));
      lastPriceRef.current = market.chance;
    }
  }, [market?.id]);

  useEffect(() => {
    if (!market) return;

    const interval = setInterval(() => {
      setChartData(prev => {
        const lastPoint = prev[prev.length - 1];
        const walk = (Math.random() - 0.5) * 1.5; // Random walk
        const newPrice = Math.max(1, Math.min(99, lastPoint.price + walk));
        
        const newData = [...prev.slice(1), { 
          time: lastPoint.time + 1, 
          price: newPrice 
        }];
        lastPriceRef.current = newPrice;
        return newData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [market?.id]);

  if (!market) return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground font-mono bg-[#050505]">
      <Activity className="w-8 h-8 mb-4 animate-pulse text-primary/40" />
      <span className="tracking-widest uppercase text-xs">Waiting for Market Selection...</span>
    </div>
  );

  const handleTrade = () => {
    const amt = parseFloat(tradeAmount);
    if (isNaN(amt) || amt <= 0) return;
    executeTrade(market.id, tradeOutcome, amt, signer);
    setTradeAmount('');
  };

  const isPositive = chartData.length > 1 && chartData[chartData.length - 1].price >= chartData[0].price;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#020202]">
      {/* Premium Header */}
      <div className="p-6 border-b border-[#111] bg-[#050505]/50 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src={market.image} alt={market.title} className="w-16 h-16 rounded-xl object-cover border border-[#222] shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-black">
                <Activity className="w-3 h-3 text-black" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[10px] font-mono text-primary uppercase tracking-tighter">Live Market</span>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 uppercase">
                  <Clock className="w-3 h-3" /> Ends: {new Date(market.endDate).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-7 max-w-2xl">{market.title}</h1>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Chance</div>
            <div className={`text-4xl font-bold font-mono tracking-tighter ${isPositive ? 'text-[#00FF55]' : 'text-[#FF3333]'}`}>
              {lastPriceRef.current.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Modern Trading Chart Section */}
      <div className="flex-1 flex flex-col min-h-0 relative group">
        {/* Chart Overlays */}
        <div className="absolute top-6 left-8 z-10 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full animate-ping ${isPositive ? 'bg-[#00FF55]' : 'bg-[#FF3333]'}`} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Price Stream</span>
          </div>
          <div className="font-mono text-muted-foreground text-[10px] uppercase flex gap-4">
            <span>VOL: <span className="text-white">${(market.volume / 1000000).toFixed(2)}M</span></span>
            <span>LIQ: <span className="text-white">${(market.liquidity / 1000).toFixed(0)}K</span></span>
          </div>
        </div>
        
        {/* Timeframe selector UI */}
        <div className="absolute top-6 right-8 z-10 flex p-1 bg-black/40 border border-[#111] rounded-lg">
          {TIMEFRAMES.map((tf) => (
             <button
               key={tf}
               onClick={() => setActiveTimeframe(tf)}
               className={`font-mono text-[9px] px-3 py-1.5 rounded-md transition-all uppercase font-bold ${
                 activeTimeframe === tf 
                   ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                   : 'text-muted-foreground hover:text-white'
               }`}
             >
               {tf}
             </button>
          ))}
        </div>

        {/* The Actual Chart */}
        <div className="flex-1 w-full bg-[#020202]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 80, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#00FF55' : '#FF3333'} stopOpacity={0.2}/>
                  <stop offset="100%" stopColor={isPositive ? '#00FF55' : '#FF3333'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#111" strokeDasharray="3 3" />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                cursor={{ stroke: '#333', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0A0A0A] border border-[#222] p-3 shadow-2xl">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Price Chance</p>
                        <p className={`text-xl font-mono font-bold ${isPositive ? 'text-[#00FF55]' : 'text-[#FF3333]'}`}>
                          {parseFloat(payload[0].value as string).toFixed(2)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? '#00FF55' : '#FF3333'} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#chartGradient)" 
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sophisticated Trade Input Area */}
      <div className="h-64 grid grid-cols-12 gap-px bg-[#111] border-t border-[#111]">
        {/* Outcome Selectors */}
        <div 
          onClick={() => setTradeOutcome('YES')}
          className={`col-span-4 cursor-pointer relative group overflow-hidden transition-all ${tradeOutcome === 'YES' ? 'bg-[#00FF55]/5' : 'bg-[#050505] hover:bg-[#080808]'}`}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 ${tradeOutcome === 'YES' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-t from-[#00FF55]/10 to-transparent`} />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#00FF55] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          <div className={`h-full flex flex-col justify-center items-center relative z-10 transition-transform ${tradeOutcome === 'YES' ? 'scale-110' : ''}`}>
            <span className={`text-[10px] font-mono mb-2 tracking-[0.2em] font-bold ${tradeOutcome === 'YES' ? 'text-[#00FF55]' : 'text-muted-foreground'}`}>PREDICT</span>
            <span className={`text-4xl font-black ${tradeOutcome === 'YES' ? 'text-[#00FF55]' : 'text-white/20'}`}>YES</span>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`w-3 h-3 ${tradeOutcome === 'YES' ? 'text-[#00FF55]' : 'text-muted-foreground'}`} />
              <span className="font-mono text-xs text-muted-foreground">{market.yesPrice}¢</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setTradeOutcome('NO')}
          className={`col-span-4 cursor-pointer relative group overflow-hidden transition-all ${tradeOutcome === 'NO' ? 'bg-[#FF3333]/5' : 'bg-[#050505] hover:bg-[#080808]'}`}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 ${tradeOutcome === 'NO' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-t from-[#FF3333]/10 to-transparent`} />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF3333] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          <div className={`h-full flex flex-col justify-center items-center relative z-10 transition-transform ${tradeOutcome === 'NO' ? 'scale-110' : ''}`}>
            <span className={`text-[10px] font-mono mb-2 tracking-[0.2em] font-bold ${tradeOutcome === 'NO' ? 'text-[#FF3333]' : 'text-muted-foreground'}`}>PREDICT</span>
            <span className={`text-4xl font-black ${tradeOutcome === 'NO' ? 'text-[#FF3333]' : 'text-white/20'}`}>NO</span>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className={`w-3 h-3 ${tradeOutcome === 'NO' ? 'text-[#FF3333]' : 'text-muted-foreground'}`} />
              <span className="font-mono text-xs text-muted-foreground">{market.noPrice}¢</span>
            </div>
          </div>
        </div>

        {/* Order Execution */}
        <div className="col-span-4 bg-[#0A0A0A] p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Investment</span>
            <span className="text-[10px] font-mono text-primary uppercase font-bold">Max: $421.00</span>
          </div>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-primary/60 text-lg">$</span>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="pl-10 font-mono bg-black/50 border-[#222] rounded-xl text-2xl focus-visible:ring-primary h-14"
            />
          </div>
          <Button 
            onClick={handleTrade}
            disabled={!tradeAmount}
            className={`w-full font-mono font-black italic rounded-xl h-14 text-sm tracking-tighter shadow-2xl transition-all active:scale-95 ${
              tradeOutcome === 'YES' 
                ? 'bg-primary text-black hover:bg-[#00E64D] hover:shadow-primary/20' 
                : 'bg-[#FF3333] text-white hover:bg-[#E62E2E] hover:shadow-[#FF3333]/20'
            }`}
          >
            EXECUTE {tradeOutcome} ORDER
          </Button>
        </div>
      </div>
    </div>
  );
}

