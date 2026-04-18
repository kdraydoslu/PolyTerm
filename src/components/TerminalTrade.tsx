import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TerminalSquare } from 'lucide-react';
import { useEthersSigner } from '../lib/ethersAdapter';

export function TerminalTrade() {
  const { terminalLogs, addTerminalLog, executeTrade, markets, selectedMarketId } = useStore();
  const signer = useEthersSigner();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);


  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim();
      setInput('');
      
      // Parse command: format "buy yes 100" or just echo
      const parts = cmd.toLowerCase().split(' ');
      addTerminalLog(`> ${cmd}`, 'info');

      if (parts[0] === 'buy') {
        const outcome = parts[1]?.toUpperCase() as 'YES' | 'NO';
        const amount = parseFloat(parts[2]);
        
        if ((outcome === 'YES' || outcome === 'NO') && !isNaN(amount) && amount > 0) {
          if (selectedMarketId) {
            executeTrade(selectedMarketId, outcome, amount, signer);
          } else {
            addTerminalLog('Error: No market selected', 'error');
          }
        } else {
          addTerminalLog('Syntax Error: buy [yes|no] [amount]', 'error');
        }
      } else if (parts[0] === 'help') {
        addTerminalLog('Available commands: buy [yes|no] [amount], clear, help', 'info');
      } else if (parts[0] === 'clear') {
        useStore.setState({ terminalLogs: [] });
      } else {
        addTerminalLog(`Command not found: ${parts[0]}`, 'error');
      }
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-xs bg-[#050505] border-t border-[#1F1F1F]">
      <div className="p-2 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center gap-2">
        <TerminalSquare className="w-4 h-4 text-muted-foreground" />
        <span className="uppercase text-muted-foreground">Terminal_Mode</span>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-1">
        {terminalLogs.map((log) => (
          <div key={log.id} className="flex gap-2">
             <span className="text-muted-foreground opacity-50 select-none">
              [{log.timestamp.toLocaleTimeString([], { hour12: false })}]
            </span>
            <span className={
              log.type === 'error' ? 'text-destructive' :
              log.type === 'success' ? 'text-primary' :
              log.type === 'warning' ? 'text-yellow-500' : 'text-gray-300'
            }>
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-[#1F1F1F] bg-[#050505] flex items-center gap-2">
        <span className="text-primary font-bold">{'>'}</span>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="terminal-input"
          placeholder="Type 'help' or 'buy yes 100'..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
