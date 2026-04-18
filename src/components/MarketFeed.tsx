import { useStore } from '../store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function MarketFeed() {
  const { markets, selectedMarketId, selectMarket, selectedCategory, setSelectedCategory, positions, cashOut } = useStore();

  const categories = ['All', 'Politics', 'Crypto', 'Economics', 'Sports'];

  const filteredMarkets = selectedCategory === 'All' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  return (
    <div className="h-full flex flex-col glass-panel border-r border-[#1F1F1F] overflow-hidden">
      <div className="p-3 border-b border-[#1F1F1F]">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Markets</h2>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2">
            {categories.map((cat) => (
              <Badge 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                variant="outline" 
                className={`cursor-pointer text-[10px] uppercase font-mono px-2 py-0.5 border-none transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-primary text-black' 
                    : 'bg-[#1A1A1A] text-muted-foreground hover:bg-[#262626] hover:text-white'
                }`}
              >
                {cat}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
      
      <div className="flex-1 overflow-auto bg-[#050505]">
        {filteredMarkets.map((market) => (
          <div
            key={market.id}
            onClick={() => selectMarket(market.id)}
            className={`p-3 border-b border-[#1F1F1F] cursor-pointer transition-colors hover:bg-[#121212] flex flex-col gap-2 ${
              selectedMarketId === market.id ? 'bg-[#121212] border-l-2 border-l-primary' : 'bg-transparent border-l-2 border-l-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-snug line-clamp-2 text-white">{market.title}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex gap-2 font-mono text-xs">
                <span className="text-[#00FF55]">{market.chance}% YES</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Vol: ${(market.volume / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        ))}
      </div>

      {positions.length > 0 && (
        <div className="flex-shrink-0 max-h-[35%] flex flex-col border-t border-[#1F1F1F] bg-[#0A0A0A]">
           <div className="p-3 border-b border-[#1F1F1F] flex items-center justify-between shadow-sm z-10 bg-[#050505]">
             <h3 className="font-mono text-[10px] uppercase text-muted-foreground">Active Positions</h3>
             <span className={`font-mono text-[10px] font-bold ${totalUnrealizedPnl >= 0 ? 'text-[#00FF55]' : 'text-[#FF3333]'}`}>
               {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
             </span>
           </div>
           <div className="flex-1 overflow-auto p-2 space-y-2">
             {positions.map(p => (
               <div key={`${p.marketId}-${p.outcome}`} className="p-2 border border-[#1F1F1F] bg-[#050505] rounded-sm flex flex-col gap-2 hover:border-[#333333] transition-colors cursor-pointer" onClick={() => selectMarket(p.marketId)}>
                  <div className="flex justify-between items-start gap-2">
                     <span className="text-[11px] text-white/90 leading-tight line-clamp-2" title={p.marketTitle}>{p.marketTitle}</span>
                     <span className={`text-[9px] font-mono px-1 rounded-sm flex-shrink-0 font-bold ${p.outcome === 'YES' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                       {p.outcome}
                     </span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                     <div className="flex flex-col">
                       <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider mb-0.5">P&L</span>
                       <span className={`font-mono text-[11px] ${p.pnl >= 0 ? 'text-[#00FF55]' : 'text-[#FF3333]'}`}>
                         {p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toFixed(2)}
                       </span>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); cashOut(p.marketId, p.outcome); }} 
                       className="text-[9px] font-mono border border-[#1F1F1F] text-muted-foreground hover:bg-primary hover:text-black hover:border-primary px-2 py-1 rounded transition-colors uppercase font-bold"
                     >
                       Cash Out
                     </button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
