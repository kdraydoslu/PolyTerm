import { useState, useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { MarketFeed } from './components/MarketFeed';
import { MarketDetail } from './components/MarketDetail';
import { RightPanel } from './components/RightPanel';
import { Portfolio } from './components/Portfolio';
import { CopyTrade } from './components/CopyTrade';
import { SpeedBets } from './components/SpeedBets';
import { LayoutDashboard, Wallet, Target, Zap } from 'lucide-react';
import { useStore } from './store/useStore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trade' | 'portfolio' | 'copy' | 'speed'>('trade');

  const { fetchMarkets } = useStore();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchMarkets();
  }, [fetchMarkets]);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <Topbar />
      
      {/* Primary Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Extreme Left Vertical Nav */}
        <div className="w-14 border-r border-[#1F1F1F] bg-[#0A0A0A] flex flex-col items-center py-4 gap-6">
          <button 
            onClick={() => setActiveTab('trade')} 
            className={`p-3 rounded-xl transition-all ${activeTab === 'trade' ? 'bg-[#1F1F1F] text-white outline outline-1 outline-[#1F1F1F]' : 'text-muted-foreground hover:text-white hover:bg-[#1A1A1A]'}`}
            title="Markets"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('speed')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'speed' ? 'bg-[#1F1F1F] text-white outline outline-1 outline-[#1F1F1F]' : 'text-muted-foreground hover:text-white hover:bg-[#1A1A1A]'}`}
            title="Speed Bets (1m-15m)"
          >
            <Zap className="w-5 h-5 text-[#FF3333]" />
          </button>
          <button 
            onClick={() => setActiveTab('copy')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'copy' ? 'bg-[#1F1F1F] text-white outline outline-1 outline-[#1F1F1F]' : 'text-muted-foreground hover:text-white hover:bg-[#1A1A1A]'}`}
            title="Smart Money / Copy Trade"
          >
            <Target className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#1F1F1F] text-white outline outline-1 outline-[#1F1F1F]' : 'text-muted-foreground hover:text-white hover:bg-[#1A1A1A]'}`}
            title="Portfolio"
          >
            <Wallet className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'trade' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Feed */}
            <div className="w-[300px] xl:w-[350px] border-r border-[#1F1F1F] flex-shrink-0">
              <MarketFeed />
            </div>
            
            {/* Center Area (Chart & Details) */}
            <div className="flex-1 min-w-0">
              <MarketDetail />
            </div>
            
            {/* Right Panel Area */}
            <RightPanel />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="flex-1 flex overflow-hidden">
             <div className="flex-1 min-w-0">
               <Portfolio />
             </div>
             <RightPanel />
          </div>
        )}

        {activeTab === 'copy' && (
          <div className="flex-1 flex overflow-hidden">
             <div className="flex-1 min-w-0">
               <CopyTrade />
             </div>
             <RightPanel />
          </div>
        )}

        {activeTab === 'speed' && (
          <div className="flex-1 flex overflow-hidden">
             <div className="flex-1 min-w-0">
               <SpeedBets />
             </div>
             <RightPanel />
          </div>
        )}
      </div>
    </div>
  );
}

