import { useStore } from '../store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function Portfolio() {
  const { positions, cashOut } = useStore();

  const totalValue = positions.reduce((acc, p) => acc + p.value, 0);
  const totalCost = positions.reduce((acc, p) => acc + (p.shares * p.avgPrice), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="h-full flex flex-col p-6 bg-[#050505] overflow-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-sans tracking-tight font-bold mb-2 text-white">Portfolio</h2>
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="font-mono text-xs uppercase text-muted-foreground">Portfolio Value</span>
            <span className="text-4xl font-mono">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs uppercase text-muted-foreground">Total P&L</span>
            <span className={`text-2xl font-mono ${totalPnl >= 0 ? 'text-[#00FF55]' : 'text-destructive'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="border border-[#1F1F1F] rounded-md bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#121212]">
            <TableRow className="border-[#1F1F1F] hover:bg-transparent">
              <TableHead className="font-mono text-xs text-muted-foreground">Market</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-center">Outcome</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">Shares</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">Avg Price</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">Value</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F]">P&L</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right border-l border-[#1F1F1F] w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow className="border-[#1F1F1F] hover:bg-transparent">
                <TableCell colSpan={7} className="text-center font-mono text-muted-foreground p-8">
                  No active positions
                </TableCell>
              </TableRow>
            ) : positions.map((p, i) => (
              <TableRow key={`${p.marketId}-${p.outcome}`} className="border-[#1F1F1F] hover:bg-[#121212] transition-colors">
                <TableCell className="font-medium text-white max-w-[200px] truncate" title={p.marketTitle}>
                  {p.marketTitle}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`font-mono text-xs border-none uppercase ${p.outcome === 'YES' ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10'}`}>
                    {p.outcome}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs border-l border-[#1F1F1F]">
                  {p.shares.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono text-xs border-l border-[#1F1F1F]">
                  ${p.avgPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs border-l border-[#1F1F1F]">
                  ${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className={`text-right font-mono text-xs border-l border-[#1F1F1F] ${p.pnl >= 0 ? 'text-[#00FF55]' : 'text-destructive'}`}>
                  {p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
                  <span className="text-[10px] opacity-70">({p.pnlPercent.toFixed(2)}%)</span>
                </TableCell>
                <TableCell className="text-right border-l border-[#1F1F1F]">
                  <button 
                    onClick={() => cashOut(p.marketId, p.outcome)} 
                    className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded font-mono uppercase tracking-wider transition-colors"
                  >
                    REDEEM
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
