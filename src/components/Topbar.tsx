import { useState, useEffect } from 'react';
import { Wallet, LogOut, Activity, Key, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { setWalletState, setClobApi, clobApi } = useStore();

  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [apiPassphrase, setApiPassphrase] = useState('');

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

  useEffect(() => {
    setWalletState(isConnected, address || null, balanceUSDC);
  }, [isConnected, address, balanceUSDC, setWalletState]);

  const handleConnect = () => connect({ connector: injected() });
  const handleDisconnect = () => disconnect();

  const handleSaveApi = () => {
    if (apiKey && apiSecret && apiPassphrase) {
      setClobApi({ apiKey, apiSecret, apiPassphrase });
      setShowApiModal(false);
    }
  };

  return (
    <header className="h-14 bg-[#050505] border-b border-[#111] flex items-center justify-between px-4 z-40 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <span className="font-mono font-bold tracking-tight text-lg text-white">
          POLY<span className="text-primary italic">TERM</span>
          <span className="ml-2 text-[10px] text-muted-foreground font-normal tracking-widest opacity-50 uppercase">v4.5</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isConnected && (
          <div className="hidden lg:flex items-center gap-6 text-sm font-mono mr-6">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[8px] uppercase tracking-widest">MATIC Bakiye</span>
              <span className="text-white text-xs">Aktif</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[8px] uppercase tracking-widest">USDC Bakiye</span>
              <span className="text-primary text-xs font-bold font-mono tracking-tighter">
                ${balanceUSDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-[#0A0A0A] p-1 rounded-xl border border-[#111]">
          {/* Polymarket API Toggle Button */}
          <button
            onClick={() => setShowApiModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[10px] uppercase font-bold ${
              clobApi 
                ? 'bg-[#00FF55]/10 text-[#00FF55] border border-[#00FF55]/20' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            {clobApi ? <Check className="w-3 h-3" /> : <Key className="w-3 h-3" />}
            POLY API
          </button>

          {!isConnected ? (
            <button onClick={handleConnect} className="flex items-center gap-2 px-4 py-1.5 bg-primary text-black hover:bg-[#00E64D] font-mono text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-primary/10">
              <Wallet className="w-3 h-3" />
              CÜZDAN BAĞLA
            </button>
          ) : (
            <button onClick={handleDisconnect} className="flex items-center gap-2 px-4 py-1.5 bg-[#111] text-muted-foreground hover:text-white font-mono text-[10px] font-bold rounded-lg border border-[#222] transition-all">
              {address?.slice(0, 4)}...{address?.slice(-4)}
              <LogOut className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Poly API Credentials Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 fill-mode-forwards">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <Key className="w-6 h-6 text-primary" />
                   <h3 className="text-xl font-bold text-white tracking-tight">Polymarket API Bağla</h3>
                </div>
                <button onClick={() => setShowApiModal(false)} className="text-muted-foreground hover:text-white p-2">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-1">API Key</label>
                   <Input 
                      placeholder="e.g. 123-abc..." 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-black/50 border-[#222] focus:border-primary rounded-xl font-mono text-xs h-12"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-1">API Secret</label>
                   <Input 
                      type="password"
                      placeholder="e.g. key-secret..." 
                      value={apiSecret} 
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="bg-black/50 border-[#222] focus:border-primary rounded-xl font-mono text-xs h-12"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-1">API Passphrase</label>
                   <Input 
                      placeholder="e.g. my-pass..." 
                      value={apiPassphrase} 
                      onChange={(e) => setApiPassphrase(e.target.value)}
                      className="bg-black/50 border-[#222] focus:border-primary rounded-xl font-mono text-xs h-12"
                   />
                </div>
                
                <div className="pt-4 flex flex-col gap-3">
                   <Button onClick={handleSaveApi} className="w-full bg-primary text-black font-black italic rounded-xl h-14 hover:bg-[#00E64D] shadow-xl shadow-primary/10">
                      ANAHTARLARI AKTİFLEŞTİR
                   </Button>
                   <p className="text-[9px] text-center text-muted-foreground font-mono leading-relaxed px-4">
                      NOT: API anahtarlarınız yerel olarak saklanır. Güvenliğiniz için sadece gerekli izinlere sahip bir API Key kullanın.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </header>
  );
}
