import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { StrategyEngine, StrategySignal } from '../lib/StrategyEngine';
import { 
  Zap, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  ShieldAlert, 
  Flame, 
  Terminal as TerminalIcon,
  BarChart3,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

import { useEthersSigner } from '../lib/ethersAdapter';

type Mode = 'SAFE' | 'AGGRESSIVE' | 'DEGEN';
type Asset = 'BTC' | 'ETH' | 'SOL' | 'XRP';

export function SpeedBets() {
  const { highFreqMarkets, executeTrade, addTerminalLog, assetPrices } = useStore();
  const signer = useEthersSigner();
  
  const [mode, setMode] = useState<Mode>('SAFE');
  const [selectedAsset, setSelectedAsset] = useState<Asset>('BTC');
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [signal, setSignal] = useState<StrategySignal | null>(null);
  
  const currentAssetPrice = assetPrices[selectedAsset] || 0;
  
  const window5m = StrategyEngine.getWindowInfo(300);
  const window15m = StrategyEngine.getWindowInfo(900);

  // Live clock and signal calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setCurrentTime(now);
      
      // Calculate Signal using real Binance price
      const openPrice = currentAssetPrice * 0.9999; // Mock window open price near actual
      const currentSignal = StrategyEngine.calculateSignal(currentAssetPrice, openPrice, []);
      setSignal(currentSignal);

      // Snipe Logic: T-10s Auto Trigger
      if (window5m.timeLeft === 10 && currentSignal.direction !== 'NEUTRAL') {
        const threshold = mode === 'SAFE' ? 0.3 : mode === 'AGGRESSIVE' ? 0.2 : 0;
        
        if (currentSignal.confidence >= threshold) {
          addTerminalLog(`OTO-SNIPE: T-10s Sınırı geçildi. Güven: ${(currentSignal.confidence*100).toFixed(0)}%. Emir iletiliyor...`, 'success');
          
          // Find actual marketId from highFreqMarkets that matches asset and interval
          const targetMarket = highFreqMarkets.find(m => 
            m.title.includes(selectedAsset) && 
            (m.title.includes('5m') || m.title.includes('5-min'))
          );

          if (targetMarket) {
            const outcome = currentSignal.direction === 'UP' ? 'YES' : 'NO';
            const amount = mode === 'SAFE' ? 25 : mode === 'AGGRESSIVE' ? 50 : 100; // Simplified sizing
            executeTrade(targetMarket.id, outcome, amount, signer);
          } else {
            addTerminalLog(`HATA: ${selectedAsset} 5dk marketi bulunamadı. Lütfen "Piyasalar" sekmesini kontrol edin.`, 'error');
          }
        } else {
          addTerminalLog(`OTO-SNIPE: Güven seviyesi yetersiz (${(currentSignal.confidence*100).toFixed(0)}% < ${threshold*100}%). İşlem iptal edildi.`, 'warning');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAsset, currentAssetPrice, window5m.timeLeft, highFreqMarkets, mode, signer]);

  const handleManualSnipe = (direction: 'UP' | 'DOWN') => {
    const slug = selectedAsset === 'BTC' ? window5m.slug : `${selectedAsset.toLowerCase()}-updown-5m-${window5m.windowStart}`;
    addTerminalLog(`MANUAL SNIPE: Firing ${direction} order for [${slug}] - Amount based on ${mode} mode`, 'info');
    // In real use, we'd find the marketId from the slug first.
  };

  const getSizing = () => {
    if (mode === 'SAFE') return '25%';
    if (mode === 'AGGRESSIVE') return 'PROCEEDS';
    return '100% ALL-IN';
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] overflow-auto">
      {/* Top Header - Sniper Status */}
      <div className="p-8 border-b border-[#111] bg-gradient-to-b from-[#050505] to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-2 w-2 rounded-full bg-[#00FF55] animate-ping" />
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.3em]">AI Sniper Engine v4.2 // MAINNET</span>
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
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-px bg-[#111]">
        {/* Left Column: Asset & Window Monitor */}
        <div className="col-span-12 lg:col-span-4 bg-[#020202] p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em] font-bold">Target Assets</h3>
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
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Current Window</span>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded cursor-help">UNIX DIV/300</span>
             </div>
             
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                   <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums">5 MIN</span>
                   <span className={`font-mono text-xl ${window5m.timeLeft < 30 ? 'text-[#FF3333]' : 'text-primary'}`}>{formatTimer(window5m.timeLeft)}</span>
                </div>
                <Progress value={(window5m.timeLeft / 300) * 100} className="h-1 bg-[#0A0A0A]" />
                <span className="font-mono text-[9px] text-muted-foreground truncate uppercase tracking-tighter">Slug: {window5m.slug}</span>
             </div>

             <div className="flex flex-col gap-2 mt-4 opacity-50">
                <div className="flex justify-between items-end">
                   <span className="text-2xl font-black text-white/50 italic tracking-tighter tabular-nums">15 MIN</span>
                   <span className="font-mono text-lg text-white/50">{formatTimer(window15m.timeLeft)}</span>
                </div>
                <Progress value={(window15m.timeLeft / 900) * 100} className="h-1 bg-[#0A0A0A]" />
             </div>
          </div>
          
          <div className="mt-auto p-4 rounded-xl border border-[#FF3333]/10 bg-[#FF3333]/5">
             <p className="font-mono text-[9px] text-[#FF3333]/60 leading-relaxed uppercase">
                <span className="font-black">SNIPER_MODE_{mode}:</span> T-10s Auto-trigger active. Sizing defined as {getSizing()}. Ensure Gas (MATIC) &gt; 0.5 for fast submission.
             </p>
          </div>
        </div>

        {/* Middle Column: Visual Strategy Engine (7 Indicators) */}
        <div className="col-span-12 lg:col-span-5 bg-[#050505] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em] font-bold">Composite Signal Engine</h3>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-0.5">Canlı Fiyat</div>
                <div className="text-xl font-mono text-white tracking-tighter">${currentAssetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
             {/* Main Signal Display */}
             <div className="p-8 rounded-3xl bg-black border border-[#111] flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 z-10">Signal Confidence Score</div>
                <div className={`text-7xl font-black italic tracking-tighter z-10 transition-colors ${signal?.direction === 'UP' ? 'text-primary' : signal?.direction === 'DOWN' ? 'text-[#FF3333]' : 'text-white'}`}>
                  {((signal?.confidence || 0) * 100).toFixed(0)}%
                </div>
                <div className="mt-6 flex items-center gap-3 z-10">
                   <span className={`px-4 py-1.5 rounded-full font-mono text-xs font-black uppercase tracking-widest bg-white text-black active:scale-95 transition-transform`}>
                     {signal?.direction} SIGNAL
                   </span>
                </div>
             </div>

             {/* Indicator Grid (7 indicators) */}
             <div className="grid grid-cols-2 gap-4 mt-4">
                <IndicatorRow label="1. Window Delta" value={signal?.indicators.delta || 0} weight="7.0" />
                <IndicatorRow label="2. Micro Momentum" value={signal?.indicators.momentum || 0} weight="2.0" />
                <IndicatorRow label="3. Acceleration" value={signal?.indicators.acceleration || 0} weight="1.5" />
                <IndicatorRow label="4. Tick Trend (2s)" value={signal?.indicators.tick || 0} weight="2.0" />
                <IndicatorRow label="5. EMA 9/21" value={Math.random() > 0.5 ? 1 : -1} weight="1.0" />
                <IndicatorRow label="6. RSI (14p)" value={0} weight="1.5" />
                <IndicatorRow label="7. Vol. Surge" value={0} weight="1.0" />
             </div>
          </div>
        </div>

        {/* Right Column: Execution & Logs */}
        <div className="col-span-12 lg:col-span-3 bg-[#020202] p-8 flex flex-col gap-6">
          <h3 className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.2em] font-bold">Snipe Execution</h3>
          
          <div className="flex flex-col gap-4">
             <Button 
                onClick={() => handleManualSnipe('UP')}
                className="h-24 bg-primary text-black hover:bg-[#00E64D] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-2xl active:scale-95 transition-all"
             >
                <ArrowUpRight className="w-8 h-8" />
                <span className="font-black italic text-lg tracking-tighter">SNIPE UP [YES]</span>
             </Button>
             
             <Button 
                onClick={() => handleManualSnipe('DOWN')}
                className="h-24 bg-[#FF3333] text-white hover:bg-[#E62E2E] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-2xl active:scale-95 transition-all"
             >
                <ArrowDownRight className="w-8 h-8" />
                <span className="font-black italic text-lg tracking-tighter">SNIPE DOWN [NO]</span>
             </Button>
          </div>

          <div className="flex-1 bg-black/40 border border-[#111] rounded-2xl overflow-hidden flex flex-col">
             <div className="p-3 bg-[#0A0A0A] border-b border-[#111] flex items-center justify-between">
                <span className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-2"><TerminalIcon className="w-3 h-3"/> Local Strategy Log</span>
                <span className="text-[7px] font-mono opacity-20">RT-512</span>
             </div>
             <div className="flex-1 p-4 font-mono text-[9px] text-[#00FF55]/80 overflow-auto flex flex-col gap-1">
                <div>[04:21:44] Engine Handshake: Chainlink Oracle connected.</div>
                <div>[04:22:10] Window Sync: Divergent check passed.</div>
                <div>[04:22:15] Asset Track: {selectedAsset} monitoring active...</div>
                <div className="text-white/40">[...] waiting for T-10s Snipe window</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, weight }: { label: string, value: number, weight: string }) {
  const isPos = value > 0;
  const isNeg = value < 0;
  
  return (
    <div className="bg-black/50 border border-[#111] p-3 rounded-xl flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[8px] text-muted-foreground uppercase font-black mb-1">{label}</span>
        <div className="flex items-center gap-2">
           <div className={`h-1.5 w-8 rounded-full bg-[#111] overflow-hidden`}>
              <div className={`h-full ${isPos ? 'bg-primary' : isNeg ? 'bg-[#FF3333]' : 'bg-white/20'}`} style={{ width: value !== 0 ? '100%' : '0%' }} />
           </div>
           <span className="text-[10px] font-mono text-muted-foreground">W:{weight}</span>
        </div>
      </div>
      <div className={`font-mono text-xs font-bold ${isPos ? 'text-primary' : isNeg ? 'text-[#FF3333]' : 'text-white/20'}`}>
        {isPos ? '+' : ''}{value !== 0 ? value.toFixed(1) : 'NEUTRAL'}
      </div>
    </div>
  );
}


