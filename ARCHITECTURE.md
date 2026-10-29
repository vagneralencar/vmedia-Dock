# VMedia Dock - Especificação & Arquitetura do Sistema

## 1. Visão Geral
O **VMedia Dock** é um Dock de produtividade moderno para Windows 11 (fase 1) e macOS (fase 2), inspirado nos melhores recursos do PrimoDock, com foco em:
- **Alto Desempenho**: Baixo consumo de CPU/RAM (< 45MB de RAM ocioso), 60fps constantes nas animações de ampliação (magnification).
- **Segurança Rigorosa**: Princípio do menor privilégio, IPC estritamente tipado (Serde/Zod), sem injeção de comandos, validação estrita de paths e arquivos.
- **Clean Architecture & DRY**: Código modular, desacoplamento entre camada de apresentação e serviços nativos de SO através de traits em Rust e hooks reutilizáveis no frontend.

---

## 2. Pilha Tecnológica (Tech Stack)

| Camada | Tecnologia | Motivo da Escolha |
|---|---|---|
| **Core & Backend Nativo** | **Tauri v2 + Rust** | Performance nativa, segurança de memória sem garbage collector, tamanho mínimo de binário. |
| **Integração SO (Windows)** | `windows` / `windows-sys` crate | Win32 API direta: AppBar (reserva de espaço na tela), DWM Mica/Acrylic blur, Hooks de janelas (`SetWinEventHook`). |
| **Integração SO (macOS - fase 2)** | `cocoa`, `objc` / Apple APIs | NSPanel, CGSSetWindowBackgroundBlur, monitoramento de apps e spaces. |
| **Frontend UI** | **React 18 + TypeScript + Vite** | Tipagem estrita, ecossistema maduro, performance com virtualização e renderizadores leves. |
| **Estilização & Efeitos** | **Tailwind CSS + CSS Modules** | Estilização orientada a utilitários, blur nativo via backdrop-filter, animações aceleradas por GPU. |
| **Gerenciamento de Estado** | **Zustand** | Leve (< 2KB), atômico, sem re-renders indesejados nos widgets. |

---

## 3. Arquitetura Modular

```
vmedia-dock/
├── src-tauri/                       # Camada Nativa (Rust)
│   ├── src/
│   │   ├── main.rs                  # Ponto de entrada Tauri
│   │   ├── lib.rs                   # Inicialização de plugins e comandos
│   │   ├── os/                      # Abstração de Sistema Operacional (DRY)
│   │   │   ├── mod.rs               # Trait OSManager (interface unificada)
│   │   │   ├── windows/             # Implementação Win32 (AppBar, DWM, Tasks)
│   │   │   └── macos/               # Implementação macOS (NSPanel, etc.)
│   │   ├── monitors/                # Coleta de métricas (CPU, RAM, Bateria)
│   │   │   └── sysinfo_collector.rs # Worker assíncrono em background
│   │   ├── workspaces/              # Gerenciador de Ambientes (configs persistidas)
│   │   └── security/                # Validação de inputs, sanitização e whitelist
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                             # Camada de Apresentação (Frontend)
│   ├── app/                         # App root e layout
│   ├── components/
│   │   ├── dock/                    # DockBar, DockItem, Separator, Magnifier
│   │   ├── widgets/                 # Sistema modular de widgets
│   │   │   ├── clock/               # Widget Relógio
│   │   │   ├── system-stats/        # Widget CPU/RAM/Bateria
│   │   │   ├── media-player/        # Widget Tocando Agora
│   │   │   ├── pomodoro/            # Widget Pomodoro
│   │   │   └── drop-zone/           # Widget Prateleira de arquivos (Shelf)
│   │   └── shared/                  # Botões, tooltips, modais, popovers
│   ├── stores/                      # Zustand Stores (workspaces, settings, metrics)
│   ├── services/                    # Clientes IPC para invocar comandos do Tauri
│   ├── types/                       # Tipagens compartilhadas TypeScript
│   └── styles/                      # Variáveis de temas (Glass, Neon, etc.)
```

---

## 4. Recursos do MVP (Fase 1 - Windows 11)

1. **Barra de Dock Flutuante / AppBar**:
   - Integração com a borda inferior (ou posição configurável) com suporte a *AutoHide* e *Always on Top*.
   - Efeito visual de vidro acrílico / Mica translúcido com gradientes e sombras sutis.
   - Efeito de ampliação física (*magnification zoom*) com física suave via CSS transform/GPU.

2. **Gerenciador de Ambientes (Workspaces)**:
   - Ambientes padrão pré-configurados (*Default*, *Desenvolvimento*, *Mídia*, *Foco*).
   - Atalhos dedicados por ambiente (`Ctrl + Alt + 1..9`).
   - Cada ambiente possui sua lista de itens fixados e widgets ativos.

3. **Painel de Widgets Vivos**:
   - **Sistema**: CPU, RAM e status de bateria com atualizações eficientes em background.
   - **Relógio & Calendário**: Data e hora local com popover ao clicar.
   - **Mídia**: Status de reprodução com controles (Play/Pause, Próxima/Anterior).
   - **Drop Zone**: Coletor temporário para soltar arquivos e acessá-los rapidamente.

4. **Launcher de Aplicativos**:
   - Fixar executáveis e apps do Windows.
   - Indicador de status (ponto luminoso indicando processos em execução).
