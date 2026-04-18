import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AutoBet() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedMarketId, markets, addTerminalLog } = useStore();
  const [targetPct, setTargetPct] = useState('80');
  const [amount, setAmount] = useState('100');
  const [outcome, setOutcome] = useState<'YES'|'NO'>('YES');

  const handleSet = () => {
     const market = markets.find(m => m.id === selectedMarketId);
     if (!market) {
       addTerminalLog('Error: No market selected for Auto-Bet.', 'error');
       return;
     }

     const amtStr = parseFloat(amount);
     if (isNaN(amtStr) || amtStr <= 0) return;

     addTerminalLog(`[BOT] Limit Order Sent: Buy $${amtStr} ${outcome} on [${market.title}] if chance crosses ${targetPct}%.`, 'warning');
     setIsOpen(false);
  }

  return (
     <div className="border-t border-[#1F1F1F] bg-[#050505] flex-shrink-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
       <div 
         className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#0A0A0A] transition-colors"
         onClick={() => setIsOpen(!isOpen)}
       >
          <div className="flex items-center gap-2">
             <Bot className={`w-4 h-4 transition-colors ${isOpen ? 'text-[#00FF55]' : 'text-muted-foreground'}`} />
             <span className={`font-mono text-xs uppercase font-bold transition-colors ${isOpen ? 'text-[#00FF55]' : 'text-muted-foreground'}`}>
               Auto-Bet / Limit
             </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
       </div>
       
       {isOpen && (
          <div className="p-4 bg-[#0A0A0A] border-t border-[#1F1F1F] font-mono text-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
               {/* Outcome Selector */}
               <div className="flex bg-[#050505] border border-[#1F1F1F] p-1 rounded-sm w-1/2">
                  <button 
                    onClick={() => setOutcome('YES')}
                    className={`flex-1 py-1 text-center rounded-sm transition-colors ${outcome === 'YES' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:text-white'}`}
                  >
                    YES
                  </button>
                  <button 
                    onClick={() => setOutcome('NO')}
                    className={`flex-1 py-1 text-center rounded-sm transition-colors ${outcome === 'NO' ? 'bg-[#FF3333] text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
                  >
                    NO
                  </button>
               </div>
               
               {/* Percentage Target */}
               <div className="w-1/2 relative">
                  <Input
                    type="number"
                    value={targetPct}
                    onChange={e => setTargetPct(e.target.value)}
                    placeholder="80"
                    className="h-8 bg-[#050505] border-[#1F1F1F] font-mono text-right pr-6 focus-visible:ring-primary shadow-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
               </div>
            </div>
            
            {/* Amount Input */}
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
               <Input 
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="h-8 pl-8 bg-[#050505] border-[#1F1F1F] font-mono focus-visible:ring-primary shadow-none"
                  placeholder="Amount"
               />
            </div>

            <Button 
              onClick={handleSet}
              className="w-full h-8 font-mono text-[10px] uppercase font-bold bg-[#121212] border border-[#1F1F1F] text-[#00FF55] hover:bg-[#00FF55] hover:text-black transition-all rounded-sm"
            >
              Activate Protocol
            </Button>
          </div>
       )}
     </div>
  );
}
