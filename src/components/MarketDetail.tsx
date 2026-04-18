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
      <span className="tracking-widest uppercase text-xs">Market Seçimi Bekleniyor...</span>
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
                <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[10px] font-mono text-primary uppercase tracking-tighter">Canlı Market</span>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 uppercase">
                  <Clock className="w-3 h-3" /> Bitiş: {new Date(market.endDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-7 max-w-2xl">{market.title}</h1>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">İhtimal</div>
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
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">Fiyat Akışı</span>
          </div>
          <div className="font-mono text-muted-foreground text-[10px] uppercase flex gap-4">
            <span>Hacim: <span className="text-white">${(market.volume / 1000000).toFixed(2)}M</span></span>
            <span>Likidite: <span className="text-white">${(market.liquidity / 1000).toFixed(0)}K</span></span>
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
                        <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Kazanma İhtimali</p>
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
            <span className={`text-[10px] font-mono mb-2 tracking-[0.2em] font-bold ${tradeOutcome === 'YES' ? 'text-[#00FF55]' : 'text-muted-foreground'}`}>TAHMİN</span>
            <span className={`text-4xl font-black ${tradeOutcome === 'YES' ? 'text-[#00FF55]' : 'text-white/20'}`}>EVET</span>
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
            <span className={`text-[10px] font-mono mb-2 tracking-[0.2em] font-bold ${tradeOutcome === 'NO' ? 'text-[#FF3333]' : 'text-muted-foreground'}`}>TAHMİN</span>
            <span className={`text-4xl font-black ${tradeOutcome === 'NO' ? 'text-[#FF3333]' : 'text-white/20'}`}>HAYIR</span>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className={`w-3 h-3 ${tradeOutcome === 'NO' ? 'text-[#FF3333]' : 'text-muted-foreground'}`} />
              <span className="font-mono text-xs text-muted-foreground">{market.noPrice}¢</span>
            </div>
          </div>
        </div>

        {/* Order Execution */}
        <div className="col-span-4 bg-[#0A0A0A] p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Yatırım Tutarı</span>
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
{/* Top Header - Sniper Status */}
      <div className="p-8 border-b border-[#111] bg-gradient-to-b from-[#050505] to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-2 w-2 rounded-full bg-[#00FF55] animate-ping" />
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.3em]">AI SNIPER MOTORU v4.2 // ANA AĞ</span>
            </div>
            <h2 className="text-5xl font-black italic tracking-tighter text-white flex items-center gap-4">
              <Zap className="w-12 h-12 text-primary fill-primary/20" />
              ULTRA<span className="text-primary">SNIPE</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-1 rounded-2xl border border-[#111]">
            {(['SAFE', 'AGGRESSIVE', 'DEGEN'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-mono text-[10px] font-bold uppercase tracking-widest ${
                  mode === m 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                    : 'text-muted-foreground hover:text-white hover:bg-[#0A0A0A]'
                }`}
              >
                {m === 'SAFE' && <ShieldAlert className="w-3 h-3" />}
                {m === 'AGGRESSIVE' && <Target className="w-3 h-3" />}
                {m === 'DEGEN' && <Flame className="w-3 h-3" />}
                {m === 'SAFE' ? 'GÜVENLİ' : m === 'AGGRESSIVE' ? 'AGRESİF' : 'RİSKLİ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-px bg-[#111]">
        {/* Left Column: Asset & Window Monitor */}
        <div className="col-span-12 lg:col-span-4 bg-[#020202] p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em] font-bold">Takip Edilen Varlıklar</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['BTC', 'ETH', 'SOL', 'XRP'] as Asset[]).map(a => (
                <button 
                  key={a}
                  onClick={() => setSelectedAsset(a)}
                  className={`p-4 rounded-xl border font-mono font-bold transition-all flex items-center justify-between ${
                    selectedAsset === a 
                      ? 'bg-primary/5 border-primary text-primary' 
                      : 'bg-[#050505] border-[#111] text-muted-foreground hover:border-[#222]'
                  }`}
                >
                  {a}
                  <span className="text-[9px] opacity-40">0.02% Δ</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#050505] border border-[#111] flex flex-col gap-6 shadow-2xl">
             <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Aktif Pencere</span>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded cursor-help">UNIX DIV/300</span>
             </div>
             
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                   <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums">5 DK</span>
                   <span className={`font-mono text-xl ${window5m.timeLeft < 30 ? 'text-[#FF3333]' : 'text-primary'}`}>{formatTimer(window5m.timeLeft)}</span>
                </div>
                <Progress value={(window5m.timeLeft / 300) * 100} className="h-1 bg-[#0A0A0A]" />
                <span className="font-mono text-[9px] text-muted-foreground truncate uppercase tracking-tighter">Slug: {window5m.slug}</span>
             </div>

             <div className="flex flex-col gap-2 mt-4 opacity-50">
                <div className="flex justify-between items-end">
                   <span className="text-2xl font-black text-white/50 italic tracking-tighter tabular-nums">15 DK</span>
                   <span className="font-mono text-lg text-white/50">{formatTimer(window15m.timeLeft)}</span>
                </div>
                <Progress value={(window15m.timeLeft / 900) * 100} className="h-1 bg-[#0A0A0A]" />
             </div>
          </div>
          
          <div className="mt-auto p-4 rounded-xl border border-[#FF3333]/10 bg-[#FF3333]/5">
             <p className="font-mono text-[9px] text-[#FF3333]/60 leading-relaxed uppercase">
                <span className="font-black">SNIPER_MODU_{mode}:</span> T-10s Otomatik tetikleme devrede. İşlem boyutu: {getSizing()}. Hızlı gönderim için MATIC &gt; 0.5 olmalı.
             </p>
          </div>
        </div>

        {/* Middle Column: Visual Strategy Engine (7 Indicators) */}
        <div className="col-span-12 lg:col-span-5 bg-[#050505] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em] font-bold">Kompozit Sinyal Motoru</h3>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-0.5">Canlı Fiyat</div>
                <div className="text-xl font-mono text-white tracking-tighter">${simulatedPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
             {/* Main Signal Display */}
             <div className="p-8 rounded-3xl bg-black border border-[#111] flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 z-10">Sinyal Güven Skoru</div>
                <div className={`text-7xl font-black italic tracking-tighter z-10 transition-colors ${signal?.direction === 'UP' ? 'text-primary' : signal?.direction === 'DOWN' ? 'text-[#FF3333]' : 'text-white'}`}>
                  {((signal?.confidence || 0) * 100).toFixed(0)}%
                </div>
                <div className="mt-6 flex items-center gap-3 z-10">
                   <span className={`px-4 py-1.5 rounded-full font-mono text-xs font-black uppercase tracking-widest bg-white text-black active:scale-95 transition-transform`}>
                     {signal?.direction === 'UP' ? 'YÜKSELİŞ' : signal?.direction === 'DOWN' ? 'DÜŞÜŞ' : 'NÖTR'} SİNYALİ
                   </span>
                </div>
             </div>

             {/* Indicator Grid (7 indicators) */}
             <div className="grid grid-cols-2 gap-4 mt-4">
                <IndicatorRow label="1. Pencere Deltası" value={signal?.indicators.delta || 0} weight="7.0" />
                <IndicatorRow label="2. Mikro Momentum" value={signal?.indicators.momentum || 0} weight="2.0" />
                <IndicatorRow label="3. İvmelenme" value={signal?.indicators.acceleration || 0} weight="1.5" />
                <IndicatorRow label="4. Tick Trendi (2sn)" value={signal?.indicators.tick || 0} weight="2.0" />
                <IndicatorRow label="5. EMA 9/21" value={Math.random() > 0.5 ? 1 : -1} weight="1.0" />
                <IndicatorRow label="6. RSI (14p)" value={0} weight="1.5" />
                <IndicatorRow label="7. Hacim Patlaması" value={0} weight="1.0" />
             </div>
          </div>
        </div>

        {/* Right Column: Execution & Logs */}
        <div className="col-span-12 lg:col-span-3 bg-[#020202] p-8 flex flex-col gap-6">
          <h3 className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em] font-bold">Snipe İşlemi</h3>
          
          <div className="flex flex-col gap-4">
             <Button 
                onClick={() => handleManualSnipe('UP')}
                className="h-24 bg-primary text-black hover:bg-[#00E64D] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-2xl active:scale-95 transition-all"
             >
                <ArrowUpRight className="w-8 h-8" />
                <span className="font-black italic text-lg tracking-tighter">YUKARI SNIPE [YES]</span>
             </Button>
             
             <Button 
                onClick={() => handleManualSnipe('DOWN')}
                className="h-24 bg-[#FF3333] text-white hover:bg-[#E62E2E] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-2xl active:scale-95 transition-all"
             >
                <ArrowDownRight className="w-8 h-8" />
                <span className="font-black italic text-lg tracking-tighter">AŞAĞI SNIPE [NO]</span>
             </Button>
          </div>

          <div className="flex-1 bg-black/40 border border-[#111] rounded-2xl overflow-hidden flex flex-col">
             <div className="p-3 bg-[#0A0A0A] border-b border-[#111] flex items-center justify-between">
                <span className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-2"><TerminalIcon className="w-3 h-3"/> Yerel Strateji Günlüğü</span>
                <span className="text-[7px] font-mono opacity-20">RT-512</span>
             </div>
             <div className="flex-1 p-4 font-mono text-[9px] text-[#00FF55]/80 overflow-auto flex flex-col gap-1">
                <div>[04:21:44] Motor Bağlantısı: Chainlink Oracle bağlandı.</div>
                <div>[04:22:10] Pencere Senkronu: Geçerli.</div>
                <div>[04:22:15] Takip: {selectedAsset} izleniyor...</div>
                <div className="text-white/40">[...] T-10s Snipe penceresi bekleniyor</div>
             </div>
          </div>
        </div>
      </div>
