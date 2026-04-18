import { create } from 'zustand';
import { Market, Position, TerminalLog } from '../types';

// Mock Data
export const MOCK_MARKETS: Market[] = [
  {
    id: 'm1',
    title: 'Trump wins 2024 Presidential Election?',
    category: 'Politics',
    image: 'https://picsum.photos/seed/trump/200/200',
    volume: 145000000,
    liquidity: 5200000,
    endDate: '2024-11-05T00:00:00Z',
    yesPrice: 0.52,
    noPrice: 0.48,
    chance: 52,
  },
  {
    id: 'm2',
    title: 'Ethereum ETF approved by SEC in May?',
    category: 'Crypto',
    image: 'https://picsum.photos/seed/eth/200/200',
    volume: 85000000,
    liquidity: 2100000,
    endDate: '2024-05-23T00:00:00Z',
    yesPrice: 0.35,
    noPrice: 0.65,
    chance: 35,
  },
  {
    id: 'm3',
    title: 'Federal Reserve cuts rates in June?',
    category: 'Economics',
    image: 'https://picsum.photos/seed/fed/200/200',
    volume: 22000000,
    liquidity: 850000,
    endDate: '2024-06-12T00:00:00Z',
    yesPrice: 0.12,
    noPrice: 0.88,
    chance: 12,
  },
  {
    id: 'm4',
    title: 'Bitcoin hits $100k in 2024?',
    category: 'Crypto',
    image: 'https://picsum.photos/seed/btc/200/200',
    volume: 53000000,
    liquidity: 3400000,
    endDate: '2024-12-31T00:00:00Z',
    yesPrice: 0.61,
    noPrice: 0.39,
    chance: 61,
  },
  {
    id: 'm5',
    title: 'Real Madrid wins Champions League 2024?',
    category: 'Sports',
    image: 'https://picsum.photos/seed/rm/200/200',
    volume: 12000000,
    liquidity: 600000,
    endDate: '2024-06-01T00:00:00Z',
    yesPrice: 0.45,
    noPrice: 0.55,
    chance: 45,
  }
];

interface AppState {
  walletConnected: boolean;
  address: string | null;
  balanceUSDC: number;
  markets: Market[];
  selectedCategory: string;
  selectedMarketId: string | null;
  positions: Position[];
  terminalLogs: TerminalLog[];
  
  connectWallet: () => void;
  disconnectWallet: () => void;
  setSelectedCategory: (category: string) => void;
  selectMarket: (id: string) => void;
  addTerminalLog: (text: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  executeTrade: (marketId: string, outcome: 'YES'|'NO', amount: number, signer?: any) => Promise<void>;
  setMarkets: (markets: Market[]) => void;
  fetchMarkets: () => Promise<void>;
  cashOut: (marketId: string, outcome: 'YES'|'NO') => void;
  setWalletState: (walletConnected: boolean, address: string | null, balanceUSDC: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  walletConnected: false,
  address: null,
  balanceUSDC: 0,
  markets: [],
  selectedCategory: 'All',
  selectedMarketId: null,
  positions: [],
  terminalLogs: [
    { id: '1', timestamp: new Date(), text: 'System initialized. Connected to Polygon Mainnet RPC.', type: 'info' },
    { id: '2', timestamp: new Date(), text: 'Polymarket contract loaded: 0x4b...3f9a. Listening for events.', type: 'info' }
  ],
  
  connectWallet: () => set({ 
    walletConnected: true, 
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' 
  }),
  
  disconnectWallet: () => set({ 
    walletConnected: false, 
    address: null 
  }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  selectMarket: (id) => set({ selectedMarketId: id }),
  
  addTerminalLog: (text, type = 'info') => set((state) => ({
    terminalLogs: [...state.terminalLogs, { id: Math.random().toString(), timestamp: new Date(), text, type }]
  })),

  setMarkets: (markets) => set({ markets }),
  
  setWalletState: (walletConnected, address, balanceUSDC) => set({ walletConnected, address, balanceUSDC }),

  fetchMarkets: async () => {
    try {
      get().addTerminalLog('Fetching live markets from Polymarket Gamma API...', 'info');
      const res = await fetch('/api/gamma/data?closed=false&active=true&limit=50');
      const data = await res.json();

      // Ensure we only process events that have valid active markets
      const activeEvents = data.filter((event: any) => event.active && !event.closed);

      const liveMarkets: Market[] = activeEvents.map((event: any) => {
        // Find a sub-market that is actually active and not closed
        const primaryMarket = event.markets?.find((m: any) => m.active && !m.closed) || event.markets?.[0];
        
        let yesToken = 0;
        let noToken = 0;
        if (primaryMarket?.outcomePrices) {
          try {
            const parsedPrices = typeof primaryMarket.outcomePrices === 'string' 
              ? JSON.parse(primaryMarket.outcomePrices) 
              : primaryMarket.outcomePrices;
              
            if (Array.isArray(parsedPrices)) {
              yesToken = parseFloat(parsedPrices[0]) || 0;
              noToken = parseFloat(parsedPrices[1]) || 0;
            }
          } catch (e) {
            console.error('Failed to parse outcome prices', primaryMarket.outcomePrices);
          }
        }
        
        return {
          id: event.id,
          title: event.title,
          category: event.tags?.[0]?.label || event.tags?.[0] || 'General',
          image: event.image || 'https://polymarket.com/favicon.ico',
          volume: event.volume ? parseFloat(event.volume) : 0,
          liquidity: event.liquidity ? parseFloat(event.liquidity) : 0,
          endDate: event.endDate || new Date().toISOString(),
          yesPrice: yesToken,
          noPrice: noToken,
          chance: yesToken * 100, // naive display logic
          _rawMarketIds: event.markets?.map((m: any) => m.id) // save actual market IDs for CLOB
        };
      }).filter((m: Market) => m.yesPrice > 0 && m.yesPrice < 1).slice(0, 20);

      set({ markets: liveMarkets });
      if (liveMarkets.length > 0) {
        set({ selectedMarketId: liveMarkets[0].id });
      }
      get().addTerminalLog(`Successfully loaded ${liveMarkets.length} live markets.`, 'success');
    } catch (err: any) {
      console.error(err);
      get().addTerminalLog(`Gamma API Error: ${err.message}`, 'error');
    }
  },

  cashOut: (marketId, outcome) => set((state) => {
    const posIdx = state.positions.findIndex(p => p.marketId === marketId && p.outcome === outcome);
    if (posIdx === -1) return state;

    const pos = state.positions[posIdx];
    const cashValue = pos.shares * pos.currentPrice;

    get().addTerminalLog(`Cashed out [${pos.marketId}] ${pos.outcome} Position -> Received $${cashValue.toFixed(2)} USDC`, 'success');

    return {
      balanceUSDC: state.balanceUSDC + cashValue,
      positions: state.positions.filter((_, i) => i !== posIdx)
    };
  }),

  executeTrade: async (marketId, outcome, amount, signer) => {
    const market = get().markets.find(m => m.id === marketId);
    if (!market) return;

    if (!signer) {
      get().addTerminalLog(`Error: Please connect your wallet first.`, 'error');
      return;
    }

    try {
      get().addTerminalLog(`Initiating CLOB order for ${outcome} on [${market.id}] with ${amount} USDC...`, 'info');
      
      const funderAddress = await signer.getAddress();
      
      // We dynamically import ClobClient to avoid SSR issues if any, but since we are vite it's fine.
      const { ClobClient } = await import('@polymarket/clob-client');
      
      const clobClient = new ClobClient(
        "https://clob.polymarket.com",
        137,
        signer,
        funderAddress
      );

      get().addTerminalLog(`Requesting L1 Signature to create API Keys...`, 'warning');
      
      // Creating API key will trigger Metamask signature request.
      const creds = await clobClient.createApiKey();
      
      get().addTerminalLog(`Successfully created CLOB Api Key. KeyID: ${(creds as any).key || '...' }`, 'success');
      
      // Simulate order placement
      const price = outcome === 'YES' ? market.yesPrice : market.noPrice;
      const shares = amount / price;

      get().addTerminalLog(`Order Placed: BUY ${shares.toFixed(2)} ${outcome} shares. (Simulation)`, 'success');

      // Update positions mock to reflect the action in the UI
      set((state) => {
        const newPositions = [...state.positions];
        const existingIdx = newPositions.findIndex(p => p.marketId === marketId && p.outcome === outcome);
        
        if (existingIdx >= 0) {
          const existing = newPositions[existingIdx];
          const totalCost = (existing.shares * existing.avgPrice) + amount;
          const totalShares = existing.shares + shares;
          newPositions[existingIdx] = {
            ...existing,
            shares: totalShares,
            avgPrice: totalCost / totalShares,
            value: totalShares * price,
            pnl: (totalShares * price) - totalCost,
            pnlPercent: (((totalShares * price) - totalCost) / totalCost) * 100
          };
        } else {
          newPositions.push({
            marketId,
            marketTitle: market.title,
            outcome,
            shares,
            avgPrice: price,
            currentPrice: price,
            value: amount, // initially value = cost
            pnl: 0,
            pnlPercent: 0
          });
        }
        return { positions: newPositions };
      });

    } catch (error: any) {
      console.error(error);
      get().addTerminalLog(`CLOB Error: ${error.message || error}`, 'error');
    }
  }
}));
