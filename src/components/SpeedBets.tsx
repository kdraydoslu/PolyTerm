import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Zap, Clock, Activity, ArrowUpRight } from 'lucide-react';

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

import { useEthersSigner } from '../lib/ethersAdapter';

export function SpeedBets() {
  const { highFreqMarkets, executeTrade, addTerminalLog } = useStore();
  const signer = useEthersSigner();
  
  // High frequency markets (BTC 5m/15m etc)
  const speedMarkets = highFreqMarkets;
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [initialTimes, setInitialTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize timers for new markets arriving
    const newTimers: Record<string, number> = { ...timers };
    const newInit: Record<string, number> = { ...initialTimes };
    
    speedMarkets.forEach(m => {
      if (!newTimers[m.id]) {
        const time = Math.floor(Math.random() * 600) + 120; // 2-12 minutes
        newTimers[m.id] = time;
        newInit[m.id] = time;
      }
    });
    
    setTimers(newTimers);
    setInitialTimes(newInit);
  }, [markets]);

  // Global countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] -= 1;
          else next[k] = Math.floor(Math.random() * 600) + 200; // Reset for loop feel
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBet = (marketId: string, title: string, outcome: 'YES' | 'NO', price: number) => {
    addTerminalLog(`SPEED ZAP: Executing $100 ${outcome} position on [${title}]`, 'info');
    executeTrade(marketId, outcome, 100, signer);
  };

  if (speedMarkets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050505] text-muted-foreground font-mono">
        <Activity className="w-8 h-8 mb-4 animate-spin text-primary/20" />
        <span className="animate-pulse">Loading High-Frequency Markets...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 bg-[#020202] overflow-auto selection:bg-primary/30">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="relative">
          <div className="absolute -top-6 -left-2 bg-[#FF3333]/10 text-[#FF3333] px-2 py-0.5 rounded text-[10px] font-mono border border-[#FF3333]/20 animate-pulse uppercase">Alpha Phase</div>
          <h2 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 italic">
            <Zap className="w-10 h-10 text-primary fill-primary/20" />
            SPEED <span className="text-primary italic">ZAP</span>
          </h2>
          <p className="font-mono text-[10px] text-muted-foreground mt-3 uppercase tracking-widest bg-[#0A0A0A] p-2 border-l-2 border-primary inline-block">
            High-Frequency Prediction Engine. Automated $100 Sizing.
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-[#0A0A0A] border border-[#111] p-3 rounded-xl flex flex-col items-end">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">24H Volume</span>
              <span className="text-lg font-mono text-white">$4.2M</span>
           </div>
           <div className="bg-[#0A0A0A] border border-[#111] p-3 rounded-xl flex flex-col items-end">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Liquidity</span>
              <span className="text-lg font-mono text-white">$890K</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {speedMarkets.map((m) => {
          const timeLeft = timers[m.id] || 0;
          const progress = (timeLeft / (initialTimes[m.id] || 1)) * 100;
          const isExpiring = timeLeft < 60;

          return (
            <div key={m.id} className="relative group perspective-1000">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative border border-[#1A1A1A] p-6 rounded-2xl bg-[#080808] flex flex-col h-full transform transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 shadow-2xl overflow-hidden">
                
                {/* Progress Bar Background */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#111]">
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear ${isExpiring ? 'bg-[#FF3333] shadow-[0_0_10px_#FF3333]' : 'bg-primary shadow-[0_0_10px_rgba(0,255,85,0.5)]'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between items-start gap-4 mb-6">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] p-1 bg-[#121212] border border-[#222] rounded text-muted-foreground uppercase font-black tracking-tighter tabular-nums">ID: {m.id}</span>
                       <span className="flex items-center gap-1 text-[10px] text-[#00FF55] font-bold italic"><Activity className="w-3 h-3"/> ACTIVE</span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-2 h-14">{m.title}</h3>
                  </div>
                  
                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all min-w-[80px] ${isExpiring ? 'bg-[#FF3333]/10 border-[#FF3333]/30 shadow-[inset_0_0_15px_#FF3333/10]' : 'bg-black border-[#222]'}`}>
                    <Clock className={`w-4 h-4 mb-1 ${isExpiring ? 'text-[#FF3333]' : 'text-muted-foreground'}`}/>
                    <span className={`font-mono text-lg font-black tracking-tighter tabular-nums ${isExpiring ? 'text-[#FF3333] animate-pulse' : 'text-white'}`}>
                      {formatTimer(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Consensus Chance</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white italic">{m.chance}%</span>
                      <span className="text-[10px] text-[#00FF55] font-mono flex items-center"><ArrowUpRight className="w-3 h-3"/> +1.2%</span>
                    </div>
                  </div>
                  <div className="h-10 w-24 opacity-30 group-hover:opacity-100 transition-opacity">
                      {/* Sub-chart or sparkline here in future */}
                      <div className="flex items-end gap-0.5 h-full pt-4">
                        {[4,7,2,9,5,10,6,8,12,7].map((h, i) => (
                          <div key={i} className="flex-1 bg-primary rounded-t-[1px]" style={{ height: `${h*6}%` }} />
                        ))}
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleBet(m.id, m.title, 'YES', m.yesPrice)}
                    className="group/yes relative flex flex-col items-center justify-center py-4 bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden transition-all hover:bg-[#00FF55]/10 hover:border-[#00FF55]/50 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00FF55]/10 to-transparent opacity-0 group-hover/yes:opacity-100" />
                    <span className="font-black text-[10px] text-muted-foreground group-hover/yes:text-[#00FF55] uppercase tracking-[0.2em] mb-1">PROB: YES</span>
                    <span className="font-mono text-xl font-black text-white group-hover/yes:text-[#00FF55]">{m.yesPrice}¢</span>
                  </button>
                  
                  <button 
                    onClick={() => handleBet(m.id, m.title, 'NO', m.noPrice)}
                    className="group/no relative flex flex-col items-center justify-center py-4 bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden transition-all hover:bg-[#FF3333]/10 hover:border-[#FF3333]/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FF3333]/10 to-transparent opacity-0 group-hover/no:opacity-100" />
                    <span className="font-black text-[10px] text-muted-foreground group-hover/no:text-[#FF3333] uppercase tracking-[0.2em] mb-1">PROB: NO</span>
                    <span className="font-mono text-xl font-black text-white group-hover/no:text-[#FF3333]">{m.noPrice}¢</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

