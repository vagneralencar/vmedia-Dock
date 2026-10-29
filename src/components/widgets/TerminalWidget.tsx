import React, { useState, useEffect } from 'react';
import { useDockStore } from '../../stores/dockStore';
import { Terminal as TerminalIcon } from 'lucide-react';

export const TerminalWidget: React.FC = () => {
  const { metrics, launchApp } = useDockStore();
  const [logLines, setLogLines] = useState<string[]>(['> sys:ok', '> ready']);
  const [blink, setBlink] = useState(true);

  const cpu = metrics?.cpu_usage || 12;
  const isBusy = cpu > 30;

  // Efeito de cursor piscante
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Efeito de fluxo de caracteres quando ocupado
  useEffect(() => {
    if (!isBusy) {
      setLogLines(['> idle', '> 0.00%']);
      return;
    }

    // Caracteres e comandos simulados de processamento
    const codeSnippets = [
      `> 0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}`,
      `> run:${Math.round(cpu)}%`,
      `> comp:ok`,
      `> io:${Math.floor(Math.random() * 99)}m`,
      `> thrd:${Math.floor(Math.random() * 16)}`,
      `> eval()`,
      `> sys:busy`,
      `> alloc`,
    ];

    const streamInterval = setInterval(() => {
      setLogLines((prev) => {
        const nextSnippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)] || '> proc';
        return [prev[1] || '> proc', nextSnippet];
      });
    }, Math.max(100, 400 - Math.round(cpu * 3))); // Fica mais rápido quanto maior a CPU

    return () => clearInterval(streamInterval);
  }, [isBusy, cpu]);

  const handleClick = () => {
    // Ao clicar, pode abrir o terminal do sistema
    launchApp('wt.exe');
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col justify-between p-1.5 w-12 h-12 rounded-2xl bg-black/85 backdrop-blur-md border transition-all duration-200 cursor-pointer shadow-sm select-none font-mono overflow-hidden group ${
        isBusy 
          ? 'border-emerald-400/50 shadow-[0_0_12px_rgba(34,197,94,0.3)]' 
          : 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-black/90'
      }`}
      title={`Mini Terminal | CPU: ${Math.round(cpu)}% (${isBusy ? 'Processando...' : 'Ocioso'}). Clique para abrir o terminal.`}
    >
      {/* Barra superior de mini janela */}
      <div className="flex items-center justify-between w-full border-b border-emerald-500/20 pb-0.5">
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500/80" />
          <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
        </div>
        <TerminalIcon className={`w-2.5 h-2.5 text-emerald-400/70 ${isBusy ? 'animate-pulse' : ''}`} />
      </div>

      {/* Tela do Terminal com fósforo verde */}
      <div className="flex flex-col justify-center flex-grow py-0.5 leading-none">
        {isBusy ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[7.5px] font-bold text-emerald-400/80 truncate">
              {logLines[0]}
            </span>
            <span className="text-[8px] font-bold text-emerald-300 truncate tracking-tight">
              {logLines[1]}
            </span>
          </div>
        ) : (
          <div className="flex items-center text-emerald-400 text-[9px] font-bold">
            <span className="text-emerald-500 mr-0.5">&gt;</span>
            <span className="text-emerald-300">sh</span>
            <span className={`inline-block w-1.5 h-2.5 bg-emerald-400 ml-0.5 ${blink ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        )}
      </div>

      {/* Rodapé: status da CPU */}
      <div className="flex items-center justify-between text-[7px] text-emerald-400/60 leading-none pt-0.5 border-t border-emerald-500/10">
        <span>{Math.round(cpu)}%</span>
        <span className={isBusy ? 'text-amber-300 font-bold' : 'text-emerald-400/50'}>
          {isBusy ? 'BUSY' : 'IDLE'}
        </span>
      </div>
    </div>
  );
};
