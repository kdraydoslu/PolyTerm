import { TerminalTrade } from './TerminalTrade';
import { AutoBet } from './AutoBet';

export function RightPanel() {
  return (
    <div className="hidden lg:flex flex-col h-full w-[350px] xl:w-[400px] border-l border-[#1F1F1F] flex-shrink-0 bg-[#050505]">
      {/* Terminal fills the upper available space */}
      <div className="flex-1 min-h-0 relative">
        <TerminalTrade />
      </div>
      
      {/* AutoBet stays locked at the bottom */}
      <AutoBet />
    </div>
  );
}
