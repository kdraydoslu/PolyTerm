import { useStore } from '../store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, TrendingUp, Users } from 'lucide-react';

const TOP_TRADERS = [
  { rank: 1, address: '0x89A...1C4', pnl: '+450.2K', winRate: '78%', followers: 1240, action: 'BUY YES [Trump]' },
  { rank: 2, address: '0x3F2...9C1', pnl: '+120.4K', winRate: '64%', followers: 890, action: 'BUY NO [ETH ETF]' },
  { rank: 3, address: '0x1A4...B77', pnl: '+89.1K', winRate: '71%', followers: 650, action: 'SELL YES [Fed]' },
  { rank: 4, address: '0x99B...3D2', pnl: '+76.5K', winRate: '59%', followers: 420, action: 'BUY YES [BTC 100k]' },
  { rank: 5, address: '0x2C1...8F9', pnl: '+54.3K', winRate: '82%', followers: 310, action: 'BUY NO [Madrid]' },
];

export function CopyTrade() {
  const { addTerminalLog } = useStore();

  const handleCopy = (address: string) => {
    addTerminalLog(`Initiated replication sequence for target address: ${address}. Allocating 5% portfolio...`, 'success');
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#050505] overflow-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-sans tracking-tight font-bold mb-2 text-white flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          Smart Money Radar
        </h2>
        <p className="font-mono text-xs text-muted-foreground max-w-lg mt-2 leading-relaxed">
          Monitor highest PNL wallets on Polygon and auto-copy their execution sequences. 
          P&L is 30-day realized network average.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-4 rounded-md">
          <h4 className="font-mono text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-[#00FF55]" /> Total Network Volume
          </h4>
          <span className="text-2xl font-mono text-white">$142.5M</span>
        </div>
        <div className="glass-panel p-4 rounded-md">
          <h4 className="font-mono text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-2">
             <Users className="w-3 h-3 text-[#00FF55]" /> Active Trackers
          </h4>
          <span className="text-2xl font-mono text-white">4,205</span>
        </div>
        <div className="glass-panel p-4 rounded-md">
          <h4 className="font-mono text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-2">
            <Target className="w-3 h-3 text-[#00FF55]" /> Your Auto-Copied
          </h4>
          <span className="text-2xl font-mono text-white">0 Wallets</span>
        </div>
      </div>

      <div className="border border-[#1F1F1F] rounded-md bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#121212]">
            <TableRow className="border-[#1F1F1F] hover:bg-transparent">
              <TableHead className="font-mono text-xs text-muted-foreground w-16 text-center">Rank</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground border-l border-[#1F1F1F]">Address (Hex)</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">30D P&L</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">Win Rate</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">Recent Activity</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F] w-[140px]">Sequence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOP_TRADERS.map((t) => (
              <TableRow key={t.rank} className="border-[#1F1F1F] hover:bg-[#121212] transition-colors cursor-pointer group">
                <TableCell className="text-center font-mono font-bold text-muted-foreground group-hover:text-white">
                  #{t.rank}
                </TableCell>
                <TableCell className="font-mono text-primary border-l border-[#1F1F1F]">
                  {t.address}
                </TableCell>
                <TableCell className="text-right font-mono text-[#00FF55] border-l border-[#1F1F1F]">
                  {t.pnl}
                </TableCell>
                <TableCell className="text-right font-mono text-white border-l border-[#1F1F1F]">
                  {t.winRate}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground border-l border-[#1F1F1F]">
                  {t.action}
                </TableCell>
                <TableCell className="text-right border-l border-[#1F1F1F]">
                  <button 
                    onClick={() => handleCopy(t.address)}
                    className="w-full text-[10px] bg-primary text-black hover:bg-white px-3 py-2 rounded font-mono uppercase font-bold transition-colors"
                  >
                    SYNC COPY
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
