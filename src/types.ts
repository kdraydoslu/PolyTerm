export interface Market {
  id: string;
  title: string;
  category: string;
  image: string;
  volume: number;
  liquidity: number;
  endDate: string;
  yesPrice: number;
  noPrice: number;
  chance: number;
  _rawMarketIds?: string[];
}

export interface Position {
  marketId: string;
  marketTitle: string;
  outcome: 'YES' | 'NO';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface TerminalLog {
  id: string;
  timestamp: Date;
  text: string;
  type: 'info' | 'success' | 'error' | 'warning';
}
