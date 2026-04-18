import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, TrendingUp, Users, Shield, Zap, ArrowRight, Eye, Globe } from 'lucide-react';

const STATIC_TRADERS = [
  { rank: 1, address: '0x89A...1C4', pnl: '+450.2K', winRate: '78%', followers: 1240 },
  { rank: 2, address: '0x3F2...9C1', pnl: '+120.4K', winRate: '64%', followers: 890 },
  { rank: 3, address: '0x1A4...B77', pnl: '+89.1K', winRate: '71%', followers: 650 },
  { rank: 4, address: '0x99B...3D2', pnl: '+76.5K', winRate: '59%', followers: 420 },
  { rank: 5, address: '0x2C1...8F9', pnl: '+54.3K', winRate: '82%', followers: 310 },
];

export function CopyTrade() {
  const { markets, addTerminalLog } = useStore();
  const [liveFeed, setLiveFeed] = useState<{id: string, text: string, time: string}[]>([]);

  // Simulate real-time whale tracking
  useEffect(() => {
    if (markets.length === 0) return;

    const generateEvent = () => {
      const market = markets[Math.floor(Math.random() * markets.length)];
      const whale = `0x${Math.random().toString(16).slice(2, 5)}...${Math.random().toString(16).slice(2, 5)}`;
      const amount = (Math.random() * 5000 + 1000).toFixed(0);
      const outcome = Math.random() > 0.5 ? 'EVET' : 'HAYIR';
      
      const newEvent = {
        id: Math.random().toString(),
        text: `🐳 BALİNA ALARMI: ${whale} adresi ${amount} USDC tutarında ${outcome} [${market.title.slice(0, 30)}...] emri girdi.`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setLiveFeed(prev => [newEvent, ...prev].slice(0, 5));
    };

    const interval = setInterval(generateEvent, 4000);
    generateEvent(); // Initial
    return () => clearInterval(interval);
  }, [markets]);

  const handleCopy = (address: string) => {
    addTerminalLog(`AKILLI RADAR: ${address} cüzdanı ile senkronize olunuyor. İşlemler 1:1 oranında kopyalanacak.`, 'success');
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#020202] overflow-auto">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.2em]">Sinyal Motoru v4.0</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 italic">
            <Target className="w-10 h-10 text-primary" />
            AKILLI <span className="text-primary italic">PARA</span> RADARI
          </h2>
          <p className="font-mono text-[10px] text-muted-foreground max-w-lg mt-3 leading-relaxed uppercase tracking-wider">
            Polymarket emir defterlerini derinlemesine tarayarak en yüksek kâr oranına sahip cüzdanları takip edin. 
            Doğrulanmış balina adresleri için gerçek zamanlı işlem kopyalama devrede.
          </p>
        </div>
        
        <div className="bg-[#050505] border border-[#111] p-4 rounded-2xl min-w-[300px] flex flex-col gap-3 shadow-2xl">
           <div className="flex items-center justify-between border-b border-[#111] pb-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2"><Globe className="w-3 h-3"/> Küresel İşlem Akışı</span>
              <span className="text-[9px] font-mono text-[#00FF55] px-1 bg-[#00FF55]/10 rounded">CANLI</span>
           </div>
           <div className="flex flex-col gap-2">
              {liveFeed.map(item => (
                <div key={item.id} className="flex gap-3 items-start animate-in slide-in-from-right-4 fade-in duration-500">
                   <Zap className="w-3 h-3 text-primary mt-1 shrink-0" />
                   <p className="text-[10px] font-mono text-white/50 leading-tight">
                      <span className="text-muted-foreground italic mr-2">[{item.time}]</span>
                      {item.text}
                   </p>
                </div>
              ))}
              {liveFeed.length === 0 && <span className="text-[10px] font-mono text-muted-foreground italic">Chain taranıyor...</span>}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="relative group overflow-hidden bg-[#080808] border border-[#111] p-6 rounded-2xl transition-all hover:border-primary/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <TrendingUp className="w-12 h-12 text-[#00FF55]" />
          </div>
          <h4 className="font-mono text-[10px] uppercase text-muted-foreground mb-4 flex items-center gap-2">
             Yönetilen Hacim
          </h4>
          <span className="text-3xl font-black italic text-white tracking-tighter tabular-nums">$142.5M</span>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-[#00FF55] font-mono">
             <ArrowRight className="w-3 h-3"/> +12.4% BUGÜN
          </div>
        </div>
        
        <div className="relative group overflow-hidden bg-[#080808] border border-[#111] p-6 rounded-2xl transition-all hover:border-primary/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <Users className="w-12 h-12 text-[#00FF55]" />
          </div>
          <h4 className="font-mono text-[10px] uppercase text-muted-foreground mb-4 flex items-center gap-2">
             Aktif Takipçiler
          </h4>
          <span className="text-3xl font-black italic text-white tracking-tighter tabular-nums">4,205</span>
          <div className="mt-4 flex items-center gap-1 text-primary font-mono text-[10px]">
             <Eye className="w-3 h-3"/> ŞU AN İZLEYEN
          </div>
        </div>

        <div className="relative group overflow-hidden bg-[#080808] border border-[#111] p-6 rounded-2xl transition-all hover:border-primary/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <Shield className="w-12 h-12 text-[#00FF55]" />
          </div>
          <h4 className="font-mono text-[10px] uppercase text-muted-foreground mb-4 flex items-center gap-2">
             Kopyalanan Cüzdanlar
          </h4>
          <span className="text-3xl font-black italic text-white tracking-tighter tabular-nums">0 <span className="text-sm text-muted-foreground not-italic font-mono uppercase">CÜZDAN</span></span>
          <div className="mt-4 flex items-center gap-1 text-muted-foreground font-mono text-[10px]">
             SENKRONİZASYONA HAZIR
          </div>
        </div>
      </div>

      <div className="border border-[#111] rounded-2xl bg-[#050505] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#0A0A0A]">
            <TableRow className="border-[#111] hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase text-muted-foreground w-16 text-center h-12 font-bold tracking-widest">Sıra</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-muted-foreground border-l border-[#111] h-12 font-bold tracking-widest">Hedef Cüzdan Adresi</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-muted-foreground text-right border-l border-[#111] h-12 font-bold tracking-widest">30G Gerçekleşen Kâr</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-muted-foreground text-right border-l border-[#111] h-12 font-bold tracking-widest">Başarı Oranı</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-muted-foreground text-right border-l border-[#111] h-12 font-bold tracking-widest">Son İşlem</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-muted-foreground text-right border-l border-[#111] w-[180px] h-12 font-bold tracking-widest">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STATIC_TRADERS.map((t, i) => {
              const recentMarket = markets[i % markets.length]?.title || 'Analiz ediliyor...';
              return (
                <TableRow key={t.rank} className="border-[#111] hover:bg-[#0A0A0A] transition-colors cursor-pointer group h-16">
                  <TableCell className="text-center font-mono font-black text-white/20 group-hover:text-primary transition-colors italic">
                    #{t.rank}
                  </TableCell>
                  <TableCell className="font-mono text-white border-l border-[#111] group-hover:text-primary transition-colors">
                    {t.address}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[#00FF55] border-l border-[#111] font-bold">
                    {t.pnl}
                  </TableCell>
                  <TableCell className="text-right font-mono text-white/80 border-l border-[#111]">
                    {t.winRate}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] text-muted-foreground border-l border-[#111] max-w-[200px] truncate">
                    {recentMarket}
                  </TableCell>
                  <TableCell className="text-right border-l border-[#111]">
                    <button 
                      onClick={() => handleCopy(t.address)}
                      className="w-full text-[10px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black hover:shadow-[0_0_15px_rgba(0,255,100,0.3)] px-3 py-2 rounded-lg font-mono uppercase font-black transition-all"
                    >
                      KOPYALAMAYI BAŞLAT
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

