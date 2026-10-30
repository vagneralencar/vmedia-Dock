import React, { useState, useEffect } from 'react';
import { useDockStore } from '../../stores/dockStore';
import { tauriService } from '../../services/tauri';
import { MonitorInfo } from '../../types/dock';
import { 
  X, 
  Palette, 
  Layout, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  Check,
  Monitor,
  RefreshCw,
  Download,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandaloneWindow?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose,
  isStandaloneWindow = false,
}) => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspace, 
    theme, 
    setTheme,
    barPosition,
    setBarPosition,
    autoHide,
    toggleAutoHide,
    iconSize,
    setIconSize,
    autostart,
    toggleAutostart,
    updateRepo,
    setUpdateRepo,
    updateInfo,
    isCheckingUpdate,
    checkForUpdates,
    githubUsername,
    setGithubUsername,
    weatherCity,
    setWeatherCity,
    pomodoroMinutes,
    setPomodoroMinutes,
    toggleWidget
  } = useDockStore();

  const [activeTab, setActiveTab] = useState<'appearance' | 'workspaces' | 'widgets' | 'security' | 'updates'>('appearance');
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  const [selectedMonitorIdx, setSelectedMonitorIdx] = useState<number>(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [tempRepo, setTempRepo] = useState(updateRepo);
  const [tempUser, setTempUser] = useState(githubUsername);
  const [tempCity, setTempCity] = useState(weatherCity);
  const [tempPomodoro, setTempPomodoro] = useState(pomodoroMinutes);

  useEffect(() => {
    if (isOpen) {
      tauriService.listMonitors().then((list) => {
        setMonitors(list);
        const current = list.find((m) => m.is_current);
        if (current) {
          setSelectedMonitorIdx(current.index);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const themes = [
    { id: 'glass', name: 'Vidro Translúcido (Glassmorphism)', desc: 'Desfoque profundo e borda suave estilo Windows 11 Acrylic' },
    { id: 'dark', name: 'Escuro Fosco (OLED Dark)', desc: 'Preto puro com bordas sutis e alto contraste' },
    { id: 'neon', name: 'Cyber Neon', desc: 'Bordas luminosas com brilho vibrante e gradientes' },
  ] as const;

  const outerClass = isStandaloneWindow
    ? 'w-screen h-screen bg-neutral-900 flex flex-col overflow-hidden text-white select-none'
    : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in';

  const innerClass = isStandaloneWindow
    ? 'flex flex-col w-full h-full bg-neutral-900 overflow-hidden text-white select-none'
    : 'flex flex-col w-full h-full max-w-4xl max-h-[600px] rounded-2xl bg-neutral-900 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl text-white select-none';

  return (
    <div className={outerClass}>
      <div 
        className={innerClass}
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
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'updates' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Atualizações</span>
              </div>
              {updateInfo?.has_update && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
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

                <div className="pt-4 border-t border-white/10 space-y-4">
                  {/* Tamanho dos Ícones e Altura do Dock */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold">Tamanho dos Ícones & Altura do Dock</h3>
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {iconSize}px
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mb-3">Ajuste a escala da barra, ícones e widgets</p>

                    {/* Predefinições de Tamanho */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'Mini', size: 24 },
                        { label: 'Pequeno', size: 36 },
                        { label: 'Médio', size: 48 },
                        { label: 'Grande', size: 56 },
                      ].map((preset) => (
                        <button
                          key={preset.size}
                          onClick={() => setIconSize(preset.size)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                            iconSize === preset.size
                              ? 'bg-blue-500/20 border border-blue-400/40 text-blue-300'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {preset.label} ({preset.size}px)
                        </button>
                      ))}
                    </div>

                    {/* Slider Contínuo de 20px a 64px */}
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] text-white/40">20px</span>
                      <input
                        type="range"
                        min="20"
                        max="64"
                        step="2"
                        value={iconSize}
                        onChange={(e) => setIconSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-[10px] text-white/40">64px</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-1">Posição na Tela</h3>
                    <p className="text-xs text-white/50 mb-3">Onde você prefere ancorar a barra (sempre acima da barra de tarefas do Windows)</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setBarPosition('bottom');
                          tauriService.positionDockWindow('bottom', selectedMonitorIdx);
                        }}
                        className={`flex-grow py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                          barPosition === 'bottom'
                            ? 'bg-blue-500/20 border border-blue-400/40 text-blue-300'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Inferior (Padrão)
                      </button>
                      <button 
                        onClick={() => {
                          setBarPosition('top');
                          tauriService.positionDockWindow('top', selectedMonitorIdx);
                        }}
                        className={`flex-grow py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                          barPosition === 'top'
                            ? 'bg-blue-500/20 border border-blue-400/40 text-blue-300'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Superior
                      </button>
                    </div>
                  </div>

                  {/* Seletor de Monitor / Tela */}
                  {monitors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Monitor / Tela do Dock</h3>
                      <p className="text-xs text-white/50 mb-3">
                        Mova o Dock para outro monitor com 1 clique ou arraste pela alça lateral na barra
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {monitors.map((m) => (
                          <button
                            key={m.index}
                            onClick={() => {
                              setSelectedMonitorIdx(m.index);
                              tauriService.positionDockWindow(barPosition, m.index);
                            }}
                            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                              selectedMonitorIdx === m.index
                                ? 'bg-blue-500/20 border border-blue-400/40 text-blue-300'
                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            <Monitor className="w-4 h-4 shrink-0" />
                            <div className="text-left truncate">
                              <div>{m.name}</div>
                              <div className="text-[10px] opacity-60">{m.width}x{m.height}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle de Auto-Hide */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-xs font-semibold text-white">Ocultar Automaticamente (Auto-Hide)</div>
                      <div className="text-[11px] text-white/50">Recolhe a barra e reaparece ao encostar na borda</div>
                    </div>
                    <button
                      onClick={toggleAutoHide}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        autoHide ? 'bg-blue-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          autoHide ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle de Iniciar com o Windows (AutoStart) */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-xs font-semibold text-white">Iniciar com o Windows</div>
                      <div className="text-[11px] text-white/50">Inicia automaticamente junto com o sistema operacional</div>
                    </div>
                    <button
                      onClick={toggleAutostart}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        autostart ? 'bg-emerald-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          autostart ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Catálogo de Widgets</h3>
                    <p className="text-xs text-white/50">Ative ou desative widgets no seu ambiente atual</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {[
                    { name: 'Mini Terminal', type: 'terminal', desc: 'Tela retrô com fluxo de código quando ocupado' },
                    { name: 'Relógio & Calendário', type: 'clock', desc: 'Horário e dia da semana vivo' },
                    { name: 'Monitor de Sistema', type: 'system-stats', desc: 'Uso de CPU e Memória RAM' },
                    { name: 'Tocando Agora', type: 'media-player', desc: 'Controle multimídia com capa' },
                    { name: 'Pomodoro', type: 'pomodoro', desc: 'Timer para ciclos de foco' },
                    { name: 'Prateleira de Arquivos', type: 'drop-zone', desc: 'Drop zone temporária' },
                    { name: 'Clima ao Vivo', type: 'weather', desc: 'Previsão e temperatura atual' },
                    { name: 'GitHub Contribuições', type: 'github', desc: 'Grade de commits e PRs ao vivo do seu perfil' },
                    { name: 'Área de Transferência', type: 'clipboard', desc: 'Histórico recente e seguro de textos copiados' },
                    { name: 'Cotas de IA (CodexBar)', type: 'ai-quota', desc: 'Monitor de limites e resets de Claude, OpenAI, Cursor e Gemini' },
                  ].map((w, idx) => {
                    const currentWs = workspaces.find((ws) => ws.id === activeWorkspaceId);
                    const isEnabled = currentWs?.widgets.some((item) => item.widget_type === w.type);

                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleWidget(w.type, w.name)}
                        className={`flex flex-col justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          isEnabled
                            ? 'bg-blue-500/15 border-blue-400/40 shadow-sm'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{w.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isEnabled ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'
                          }`}>
                            {isEnabled ? 'Ativo' : 'Adicionar'}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/50 leading-tight">{w.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Configurações Avançadas dos Widgets Ativos */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Configurações dos Widgets
                  </h4>

                  {/* Configuração do GitHub */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">GitHub Contribuições</div>
                      <span className="text-[10px] text-white/40 font-mono">github.com/{githubUsername}</span>
                    </div>
                    <div className="text-[11px] text-white/50">
                      Informe o seu usuário para exibir seus commits e quadradinhos reais
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempUser}
                        onChange={(e) => setTempUser(e.target.value)}
                        placeholder="ex: vagneralencar"
                        className="flex-grow px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-400/50"
                      />
                      <button
                        onClick={() => setGithubUsername(tempUser.trim())}
                        className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-medium text-white transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                  {/* Configuração de Clima */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">Clima ao Vivo</div>
                      <span className="text-[10px] text-white/40">{weatherCity}</span>
                    </div>
                    <div className="text-[11px] text-white/50">
                      Cidade padrão para previsão do tempo e temperatura
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempCity}
                        onChange={(e) => setTempCity(e.target.value)}
                        placeholder="ex: São Paulo, Rio de Janeiro"
                        className="flex-grow px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400/50"
                      />
                      <button
                        onClick={() => setWeatherCity(tempCity.trim())}
                        className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-medium text-white transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                  {/* Configuração do Pomodoro */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">Timer Pomodoro</div>
                      <span className="text-[10px] text-white/40">{pomodoroMinutes} minutos</span>
                    </div>
                    <div className="text-[11px] text-white/50">
                      Duração do ciclo de foco em minutos
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="5"
                        max="90"
                        value={tempPomodoro}
                        onChange={(e) => setTempPomodoro(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-400/50"
                      />
                      <span className="text-xs text-white/50">minutos</span>
                      <button
                        onClick={() => setPomodoroMinutes(tempPomodoro || 25)}
                        className="ml-auto px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-medium text-white transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
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

            {activeTab === 'updates' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Atualizações do VMedia Dock</h3>
                  <p className="text-xs text-white/50 mb-4">
                    Verifique novas versões publicadas no GitHub Releases oficial
                  </p>

                  {/* Card de Status da Versão */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/50">Versão Instalada</div>
                        <div className="text-base font-bold font-mono text-white">
                          v{updateInfo?.current_version || '0.1.0'}
                        </div>
                      </div>

                      {updateInfo?.has_update ? (
                        <div className="text-right">
                          <div className="text-xs text-cyan-400 font-semibold">Nova versão disponível!</div>
                          <div className="text-base font-bold font-mono text-cyan-300">
                            v{updateInfo.latest_version}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Atualizado</span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                      <button
                        onClick={async () => {
                          setUpdateError(null);
                          const res = await checkForUpdates();
                          if (!res) {
                            setUpdateError('Não foi possível verificar atualizações no momento.');
                          }
                        }}
                        disabled={isCheckingUpdate || isInstalling}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                        <span>{isCheckingUpdate ? 'Verificando...' : 'Buscar Atualizações'}</span>
                      </button>

                      {updateInfo?.has_update && updateInfo.download_url && (
                        <button
                          onClick={async () => {
                            if (!updateInfo?.download_url) return;
                            setIsInstalling(true);
                            setUpdateError(null);
                            try {
                              await tauriService.installUpdate(updateInfo.download_url, updateRepo);
                            } catch (err: any) {
                              setUpdateError(err?.message || 'Falha ao baixar/iniciar o instalador.');
                              setIsInstalling(false);
                            }
                          }}
                          disabled={isInstalling}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                        >
                          <Download className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
                          <span>{isInstalling ? 'Baixando e Instalando...' : 'Atualizar e Reiniciar Agora'}</span>
                        </button>
                      )}
                    </div>

                    {updateError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{updateError}</span>
                      </div>
                    )}
                  </div>

                  {/* Notas de Atualização se houver */}
                  {updateInfo?.has_update && updateInfo.release_notes && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-xs font-bold text-white/80 mb-2">Novidades da versão v{updateInfo.latest_version}:</h4>
                      <div className="text-xs text-white/60 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                        {updateInfo.release_notes}
                      </div>
                    </div>
                  )}

                  {/* Configuração do Repositório GitHub */}
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <label className="block text-xs font-semibold mb-1">Repositório do GitHub (Releases)</label>
                    <p className="text-[11px] text-white/50 mb-2">
                      Origem onde os instaladores e tags do VMedia Dock são publicados
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempRepo}
                        onChange={(e) => setTempRepo(e.target.value)}
                        placeholder="usuario/repositorio"
                        className="flex-grow px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                      />
                      <button
                        onClick={() => {
                          setUpdateRepo(tempRepo.trim());
                          checkForUpdates();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
                      >
                        Salvar
                      </button>
                      <a
                        href={`https://github.com/${updateRepo}/releases`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        title="Ver releases no GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
