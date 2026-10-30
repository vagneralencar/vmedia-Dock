import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Settings, 
  Sparkles, 
  Calculator, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useDockStore } from '../../stores/dockStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'Apps' | 'Ações' | 'Cálculo' | 'Links';
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { workspaces, activeWorkspaceId, launchApp } = useDockStore();

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculadora rápida no input
  let mathResult: string | null = null;
  if (/^[0-9+\-*/().\s^%]+$/.test(query.trim()) && query.trim().length > 1) {
    try {
      // Avaliação segura de operações aritméticas simples
      // eslint-disable-next-line no-eval
      const evaluated = Function(`'use strict'; return (${query})`)();
      if (typeof evaluated === 'number' && !isNaN(evaluated) && isFinite(evaluated)) {
        mathResult = String(evaluated);
      }
    } catch {
      mathResult = null;
    }
  }

  const appActions: PaletteAction[] = (currentWorkspace?.pinned_apps || []).map(app => ({
    id: `app-${app.id}`,
    title: app.name,
    subtitle: `Executar ${app.exec_path}`,
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
    category: 'Apps',
    run: () => {
      launchApp(app.exec_path);
      onClose();
    }
  }));

  const systemActions: PaletteAction[] = [
    {
      id: 'settings-open',
      title: 'Abrir Ajustes do Dock',
      subtitle: 'Configurações de layout, temas, widgets e atualizações',
      icon: <Settings className="w-4 h-4 text-sky-400" />,
      category: 'Ações',
      run: () => {
        onOpenSettings();
        onClose();
      }
    },
    {
      id: 'open-github-repo',
      title: 'Repositório GitHub do VMedia Dock',
      subtitle: 'Ver código-fonte, issues e novas versões',
      icon: <ExternalLink className="w-4 h-4 text-purple-400" />,
      category: 'Links',
      run: () => {
        window.open('https://github.com/vagneralencar/vmedia-Dock', '_blank');
        onClose();
      }
    }
  ];

  let allActions = [...systemActions, ...appActions];

  if (mathResult !== null) {
    allActions.unshift({
      id: 'calc-result',
      title: `= ${mathResult}`,
      subtitle: `Resultado do cálculo: ${query} (clique ou Enter para copiar)`,
      icon: <Calculator className="w-4 h-4 text-amber-400" />,
      category: 'Cálculo',
      run: () => {
        navigator.clipboard.writeText(mathResult || '');
        onClose();
      }
    });
  }

  const filtered = allActions.filter(action => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      action.title.toLowerCase().includes(q) ||
      action.subtitle.toLowerCase().includes(q) ||
      action.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].run();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra de Busca */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
          <Search className="w-5 h-5 text-white/40" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite para buscar apps, comandos ou faça contas (ex: 120 * 4)..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/50 font-mono">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              Nenhum comando ou aplicativo encontrado para "{query}"
            </div>
          ) : (
            filtered.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={action.run}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                    isSelected ? 'bg-white/15 text-white pl-4' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                      {action.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{action.title}</div>
                      <div className="text-[11px] text-white/40 line-clamp-1">{action.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/40">
                      {action.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-white/60" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-3">
            <span>Navegue com <kbd className="font-mono text-white/70">↑</kbd> <kbd className="font-mono text-white/70">↓</kbd></span>
            <span>Execute com <kbd className="font-mono text-white/70">↵</kbd></span>
          </div>
          <div className="flex items-center gap-1 text-white/50">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>VMedia Quick Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
