import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function MarketFeed() {
  const { markets, selectedMarketId, selectMarket, selectedCategory, setSelectedCategory, positions, cashOut, fetchMarkets } = useStore();

  const categories = [
    { id: 'All', tr: 'Hepsi' },
    { id: 'Politics', tr: 'Siyaset' },
    { id: 'Crypto', tr: 'Kripto' },
    { id: 'Economics', tr: 'Ekonomi' },
    { id: 'Sports', tr: 'Spor' }
  ];

  const filteredMarkets = selectedCategory === 'All' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  // Auto-refresh markets every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarkets();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  return (
    <div className="h-full flex flex-col glass-panel border-r border-[#1F1F1F] overflow-hidden">
      <div className="p-3 border-b border-[#1F1F1F]">
        <h2 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3 pl-1">CANLI PİYASALAR</h2>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2">
            {categories.map((cat) => (
              <Badge 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                variant="outline" 
                className={`cursor-pointer text-[9px] uppercase font-mono px-3 py-1 border-none transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                    : 'bg-[#121212] text-muted-foreground hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                {cat.tr}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
      
      <div className="flex-1 overflow-auto bg-[#020202]">
        {filteredMarkets.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-mono text-[10px] opacity-20 italic">
            Market taranıyor...
          </div>
        ) : filteredMarkets.map((market) => (
          <div
            key={market.id}
            onClick={() => selectMarket(market.id)}
            className={`p-4 border-b border-[#111] cursor-pointer transition-all hover:bg-[#080808] flex flex-col gap-2 relative group ${
              selectedMarketId === market.id ? 'bg-[#080808]' : 'bg-transparent'
            }`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-primary transition-transform duration-300 ${selectedMarketId === market.id ? 'scale-y-100' : 'scale-y-0'}`} />
            
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors ${selectedMarketId === market.id ? 'text-primary' : 'text-white/80'}`}>{market.title}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex gap-3 font-mono text-[10px]">
                <span className="text-primary font-bold">%{market.chance.toFixed(1)} EVET</span>
                <span className="text-white/20">|</span>
                <span className="text-muted-foreground">${(market.volume / 1000000).toFixed(1)}M VOL</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {positions.length > 0 && (
        <div className="flex-shrink-0 max-h-[35%] flex flex-col border-t border-[#1F1F1F] bg-[#0A0A0A]">
           <div className="p-3 border-b border-[#111] flex items-center justify-between shadow-sm z-10 bg-[#050505]">
             <h3 className="font-mono text-[10px] uppercase text-muted-foreground pl-1">Aktif Pozisyonlar</h3>
             <span className={`font-mono text-[10px] font-bold ${totalUnrealizedPnl >= 0 ? 'text-[#00FF55]' : 'text-[#FF3333]'}`}>
               {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
             </span>
           </div>
           <div className="flex-1 overflow-auto p-2 space-y-2">
              {positions.map(p => (
                <div key={`${p.marketId}-${p.outcome}`} className="p-2 border border-[#111] bg-[#050505] rounded-xl flex flex-col gap-2 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => selectMarket(p.marketId)}>
                   <div className="flex justify-between items-start gap-2 px-1">
                      <span className="text-[11px] text-white/90 font-medium leading-tight line-clamp-2" title={p.marketTitle}>{p.marketTitle}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full flex-shrink-0 font-black ${p.outcome === 'YES' ? 'bg-primary text-black' : 'bg-[#FF3333] text-white'}`}>
                        {p.outcome === 'YES' ? 'EVET' : 'HAYIR'}
                      </span>
                   </div>
                   <div className="flex justify-between items-end mt-1 px-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase font-mono tracking-widest mb-0.5">Kâr/Zarar</span>
                        <span className={`font-mono text-[12px] font-bold ${p.pnl >= 0 ? 'text-[#00FF55]' : 'text-[#FF3333]'}`}>
                          {p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); cashOut(p.marketId, p.outcome); }} 
                        className="text-[9px] font-mono bg-[#111] text-muted-foreground hover:bg-primary hover:text-black px-3 py-1.5 rounded-lg border border-[#222] transition-all uppercase font-black"
                      >
                        NAKİT ÇEK
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
