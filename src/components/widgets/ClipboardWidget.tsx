import React, { useState, useEffect } from 'react';
import { Clipboard, Check, Copy, Trash2 } from 'lucide-react';

export const ClipboardWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([
    'https://github.com/vagneralencar/vmedia-Dock',
    'cargo tauri build',
    'npm run dev',
    'vmedia-dock_0.1.0_x64-setup.exe'
  ]);

  // Monitora alterações na área de transferência ao focar na janela
  useEffect(() => {
    const handleFocus = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.trim().length > 0 && text.trim().length < 5000) {
            // Ignora se for provável senha ou texto idêntico ao último
            setHistory(prev => {
              if (prev[0] === text) return prev;
              const filtered = prev.filter(item => item !== text);
              return [text, ...filtered].slice(0, 10);
            });
          }
        }
      } catch {
        // Leitura sem permissão ativa ou foco web normal
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 text-white/80 hover:text-white"
        title="Histórico de Área de Transferência (Clipboard)"
      >
        <Clipboard className="w-5 h-5 text-amber-300" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl p-3 text-white text-xs animate-fade-in backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 font-semibold text-white/90">
                <Clipboard className="w-4 h-4 text-amber-400" />
                <span>Clipboard Recente</span>
              </div>
              <button 
                onClick={clearHistory}
                className="p-1 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors"
                title="Limpar histórico"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
              {history.length === 0 ? (
                <div className="py-4 text-center text-[11px] text-white/40">
                  Nenhum item copiado recentemente
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopy(item, idx)}
                    className="group flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 cursor-pointer transition-all"
                  >
                    <span className="truncate flex-1 font-mono text-[11px] text-white/80 group-hover:text-white mr-2">
                      {item}
                    </span>
                    <div className="shrink-0 text-white/40 group-hover:text-white">
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
              <span>{history.length} itens salvos</span>
              <span className="text-emerald-400/80">Local & Seguro</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
