import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Zap } from 'lucide-react';

const SPEED_MARKETS = [
  { id: 'sm1', title: 'BTC hits $68.5k in next 5m?', timer: 298, chance: 42, yesPrice: 42, noPrice: 58 },
  { id: 'sm2', title: 'ETH goes below $3.4k in next 15m?', timer: 840, chance: 68, yesPrice: 68, noPrice: 32 },
  { id: 'sm3', title: 'Fed speaks dovish in first 5m of FOMC?', timer: 145, chance: 50, yesPrice: 50, noPrice: 50 },
  { id: 'sm4', title: 'SOL touches $180 before hour close?', timer: 1240, chance: 15, yesPrice: 15, noPrice: 85 },
];

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

import { useEthersSigner } from '../lib/ethersAdapter';

export function SpeedBets() {
  const { executeTrade, addTerminalLog } = useStore();
  const signer = useEthersSigner();
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial = SPEED_MARKETS.reduce((acc, m) => ({ ...acc, [m.id]: m.timer }), {});
    setTimers(initial);

    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] -= 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBet = (marketId: string, title: string, outcome: 'YES' | 'NO', price: number) => {
    // Quick bet fixed amount 100 USDC
    addTerminalLog(`ZAP Processing: $100 on ${outcome} [${title}] at ${price}¢`, 'info');
    // Using fake id mapped locally but simulates the real flow
    executeTrade(marketId, outcome, 100, signer);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#050505] overflow-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-sans tracking-tight font-bold mb-2 text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#FF3333]" />
            Speed Bets (1m-15m)
          </h2>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Warning: Highly volatile micro-markets. Fixed $100 execution size via ZAP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SPEED_MARKETS.map((m) => (
          <div key={m.id} className="border border-[#1F1F1F] p-5 rounded-lg bg-[#0A0A0A] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#1F1F1F]">
              <div 
                className={`h-full ${timers[m.id] < 60 ? 'bg-[#FF3333]' : 'bg-[#00FF55]'}`} 
                style={{ width: `${(timers[m.id] / m.timer) * 100}%`, transition: 'width 1s linear' }}
              />
            </div>
            
            <div className="flex justify-between items-start mb-4 mt-2">
              <h3 className="font-sans text-lg font-bold text-white max-w-[70%]">{m.title}</h3>
              <div className="font-mono text-xl font-bold p-2 bg-[#121212] border border-[#1F1F1F] rounded">
                <span className={timers[m.id] < 60 ? 'text-[#FF3333] animate-pulse' : 'text-white'}>
                  {formatTimer(timers[m.id] || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="font-mono text-xs text-muted-foreground uppercase">Implied Chance</span>
              <span className="font-mono text-lg text-[#00FF55]">{m.chance}%</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button 
                onClick={() => handleBet(m.id, m.title, 'YES', m.yesPrice)}
                className="flex justify-between items-center bg-[#121212] border border-[#1F1F1F] hover:bg-[#00FF55] hover:text-black hover:border-[#00FF55] text-white p-3 rounded transition-colors group/btn"
              >
                <span className="font-sans font-bold text-lg text-[#00FF55] group-hover/btn:text-black">YES</span>
                <span className="font-mono">{m.yesPrice}¢</span>
              </button>
              <button 
                onClick={() => handleBet(m.id, m.title, 'NO', m.noPrice)}
                className="flex justify-between items-center bg-[#121212] border border-[#1F1F1F] hover:bg-[#FF3333] hover:text-white hover:border-[#FF3333] text-white p-3 rounded transition-colors group/btn2"
              >
                <span className="font-sans font-bold text-lg text-[#FF3333] group-hover/btn2:text-white">NO</span>
                <span className="font-mono">{m.noPrice}¢</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
