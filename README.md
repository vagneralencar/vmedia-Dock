# VMedia Dock

> Um Dock moderno, ultra-leve e seguro para **Windows 11** e **macOS**, construído com **Tauri v2 + Rust** e **React + TypeScript + Tailwind CSS**.

Inspirado pelo PrimoDock, o **VMedia Dock** foi projetado seguindo princípios estritos de **Clean Code**, **DRY**, **Desempenho Extremo** e **Segurança por Design**.

---

## ✨ Recursos

- 🚀 **Performance & Baixo Consumo**:
  - Backend nativo em **Rust** (< 45MB de RAM em repouso).
  - Animações a 60fps constantes aceleradas por hardware GPU.
- 🛡️ **Segurança Rigorosa**:
  - Sandboxing com Tauri IPC tipado.
  - Sanitização e validação de paths para evitar injeções ou execuções indevidas.
  - CSP (Content Security Policy) estrito.
- 🎨 **Efeito Glassmorphism & Temas**:
  - Suporte a transparência, desfoque de fundo (Blur/Acrylic/Mica) e sombras dinâmicas.
  - Animações físicas de hover nos ícones (*magnification zoom*).
  - Indicadores luminosos sutis para aplicativos em execução com a cor do ambiente.
- 🗂️ **Ambientes (Workspaces)**:
  - Separação por contextos (*Trabalho*, *Pessoal*, *Foco*).
  - Cada ambiente possui seus próprios aplicativos fixados e widgets ativos.
  - Alternador visual com atalhos de teclado (`Ctrl + Alt + 1..9`).
- 🧩 **Widgets Vivos**:
  - **Relógio & Calendário**: Horário e data com dia da semana.
  - **Monitor de Sistema**: Uso de CPU e Memória RAM em tempo real com indicador de estresse.
  - **Tocando Agora**: Widget multimídia com faixa, artista, barra de progresso e controles.
  - **Pomodoro**: Contador de foco e pausas configurável.
  - **Prateleira (Drop Zone)**: Área temporária para soltar e segurar arquivos entre arrastos.

---

## 🛠️ Estrutura do Projeto

```
vmedia-dock/
├── src-tauri/                 # Backend Rust (Nativo)
│   ├── src/
│   │   ├── main.rs            # Entry point desktop
│   │   ├── lib.rs             # Comandos Tauri IPC e inicialização
│   │   ├── system.rs          # Coletor de métricas (CPU/RAM) de alta eficiência
│   │   ├── security.rs        # Validador de caminhos e executáveis
│   │   └── workspaces.rs      # Gerenciador de Ambientes e Widgets
│   ├── Cargo.toml             # Dependências Rust (sysinfo, windows-rs, tauri)
│   └── tauri.conf.json        # Configurações da janela Desktop transparente
├── src/                       # Frontend Web UI (React + TypeScript)
│   ├── components/
│   │   ├── dock/              # DockBar, DockIcon, WorkspaceSwitcher
│   │   └── widgets/           # Clock, SystemStats, MediaPlayer, Pomodoro, DropZone
│   ├── stores/                # Zustand Store (Estado reativo e atômico)
│   ├── services/              # Cliente IPC Tauri com mock para dev
│   └── types/                 # Tipos TypeScript compartilhados
├── package.json
└── ARCHITECTURE.md            # Documentação técnica de arquitetura
```

---

## 🚀 Como Executar

### 1. Desenvolvimento do Frontend (Navegador)
Para prototipagem e desenvolvimento rápido da interface:
```bash
npm run dev
```
Acesse `http://localhost:1420`.

### 2. Desenvolvimento com Tauri (Aplicativo Desktop Nativo)
Para rodar a janela desktop nativa:
```bash
npm run tauri dev
```

### 3. Build de Produção
```bash
npm run tauri build
```
O instalador e executável serão gerados em `src-tauri/target/release/bundle/`.
