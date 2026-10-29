import React, { useState } from 'react';
import { useDockStore } from '../../stores/dockStore';
import { 
  X, 
  Palette, 
  Layout, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  Check 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspace, 
    theme, 
    setTheme 
  } = useDockStore();

  const [activeTab, setActiveTab] = useState<'appearance' | 'workspaces' | 'widgets' | 'security'>('appearance');

  if (!isOpen) return null;

  const themes = [
    { id: 'glass', name: 'Vidro Translúcido (Glassmorphism)', desc: 'Desfoque profundo e borda suave estilo Windows 11 Acrylic' },
    { id: 'dark', name: 'Escuro Fosco (OLED Dark)', desc: 'Preto puro com bordas sutis e alto contraste' },
    { id: 'neon', name: 'Cyber Neon', desc: 'Bordas luminosas com brilho vibrante e gradientes' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="flex flex-col w-full max-w-2xl h-[520px] rounded-3xl bg-neutral-900/90 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl text-white select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Ajustes do VMedia Dock</h2>
              <p className="text-xs text-white/50 leading-tight">Personalize temas, ambientes e preferências</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Sidebar e Conteúdo */}
        <div className="flex flex-grow overflow-hidden">
          {/* Navegação Lateral */}
          <div className="flex flex-col w-48 p-3 border-r border-white/10 gap-1 bg-black/20">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'appearance' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4 text-pink-400" />
              <span>Aparência</span>
            </button>
            <button
              onClick={() => setActiveTab('workspaces')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'workspaces' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Ambientes</span>
            </button>
            <button
              onClick={() => setActiveTab('widgets')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'widgets' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4 text-amber-400" />
              <span>Widgets</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'security' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Segurança</span>
            </button>
          </div>

          {/* Área de Conteúdo da Aba */}
          <div className="flex-grow p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Tema Visual</h3>
                  <p className="text-xs text-white/50 mb-3">Escolha o acabamento visual da barra do Dock</p>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {themes.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          theme === t.id
                            ? 'bg-blue-500/15 border-blue-400/50 shadow-md ring-1 ring-blue-400/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{t.name}</div>
                          <div className="text-[11px] text-white/50">{t.desc}</div>
                        </div>
                        {theme === t.id && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold mb-1">Posição na Tela</h3>
                  <p className="text-xs text-white/50 mb-3">Onde você prefere ancorar a barra</p>
                  <div className="flex gap-2">
                    <button className="flex-grow py-2 px-3 rounded-xl bg-blue-500/20 border border-blue-400/40 text-xs font-semibold text-blue-300">
                      Inferior (Padrão)
                    </button>
                    <button className="flex-grow py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:bg-white/10">
                      Superior
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workspaces' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Ambientes Configurados</h3>
                    <p className="text-xs text-white/50">Cada ambiente possui seu próprio dock isolado</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-semibold transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                    Novo Ambiente
                  </button>
                </div>

                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <div 
                      key={ws.id}
                      onClick={() => setActiveWorkspace(ws.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        ws.id === activeWorkspaceId
                          ? 'bg-white/10 border-white/30 shadow-md'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-inner" 
                          style={{ backgroundColor: ws.color }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{ws.name}</div>
                          <div className="text-[10px] text-white/50">
                            {ws.pinned_apps.length} apps fixados · {ws.widgets.length} widgets
                          </div>
                        </div>
                      </div>
                      {ws.id === activeWorkspaceId && (
                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                          Ativo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'widgets' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Catálogo de Widgets</h3>
                <p className="text-xs text-white/50">Widgets vivos disponíveis para o seu ambiente</p>
                
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {[
                    { name: 'Relógio & Calendário', type: 'clock', desc: 'Horário e dia da semana vivo' },
                    { name: 'Monitor de Sistema', type: 'system-stats', desc: 'Uso de CPU e Memória RAM' },
                    { name: 'Tocando Agora', type: 'media-player', desc: 'Controle multimídia com capa' },
                    { name: 'Pomodoro', type: 'pomodoro', desc: 'Timer para ciclos de foco' },
                    { name: 'Prateleira de Arquivos', type: 'drop-zone', desc: 'Drop zone temporária' },
                    { name: 'Clima ao Vivo', type: 'weather', desc: 'Previsão e temperatura atual' },
                    { name: 'GitHub Contribuições', type: 'github', desc: 'Grade de commits e PRs' },
                  ].map((w, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="text-xs font-bold text-white mb-0.5">{w.name}</div>
                      <div className="text-[10px] text-white/50 leading-tight">{w.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Garantias de Segurança</h3>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    Proteção Nativa Ativa
                  </div>
                  <p>
                    O VMedia Dock utiliza o validador nativo em Rust que impede a execução de scripts maliciosos, injeções via caracteres especiais e acessa apenas executáveis autorizados.
                  </p>
                  <p className="text-emerald-400 font-medium">
                    Zero telemetria, zero rastreamento de dados ou envio de estatísticas para servidores externos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
