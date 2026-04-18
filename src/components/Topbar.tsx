import { useEffect } from 'react';
import { Wallet, LogOut, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatUnits } from 'viem';

// USDC.e on Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

const erc20Abi = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
] as const;

export function Topbar() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Temporary sync to store for other components, though we should transition them later
  const { setWalletState } = useStore();

  // Fetch actual USDC Balance
  const { data: balanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const balanceUSDC = balanceData ? parseFloat(formatUnits(balanceData as bigint, 6)) : 0;

  // Sync to store for other components 
  useEffect(() => {
    setWalletState(isConnected, address || null, balanceUSDC);
  }, [isConnected, address, balanceUSDC, setWalletState]);

  const handleConnect = () => connect({ connector: injected() });
  const handleDisconnect = () => disconnect();

  return (
    <header className="h-14 glass-panel border-b border-[#1F1F1F] flex items-center justify-between px-4 z-40 sticky top-0">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <span className="font-mono font-bold tracking-tight text-lg text-white">
          POLY<span className="text-primary">TERM</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {isConnected && (
          <div className="hidden md:flex items-center gap-4 text-sm font-mono mr-4">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[10px] uppercase">Cash Balance</span>
              <span className="text-white">${balanceUSDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        {!isConnected ? (
          <Button onClick={handleConnect} className="bg-primary text-black hover:bg-primary/80 font-mono text-xs rounded-sm">
            <Wallet className="w-3 h-3 mr-2" />
            CONNECT WALLET
          </Button>
        ) : (
          <Button onClick={handleDisconnect} variant="outline" className="border-[#1F1F1F] text-muted-foreground hover:text-white font-mono text-xs rounded-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
            <LogOut className="w-3 h-3 ml-2" />
          </Button>
        )}
      </div>
    </header>
  );
}
