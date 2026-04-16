# CLAUDE.md — EmailHacker Viral (VPS 76)

## Segurança — REGRA ABSOLUTA (STREAMING AO VIVO)

**O criador faz streaming ao vivo. ZERO tolerância para vazamento de dados.**

**NUNCA exibir no output (texto, código, terminal, qualquer lugar visível):**
- API keys, tokens, senhas, secrets, bearer tokens, credentials
- URLs de API com tokens embutidos
- Dados de banco (connection strings, passwords)
- Qualquer dado que identifique contas de usuário

**Regras:**
- Mascarar TUDO com `***` — sem exceção
- Em comandos curl/fetch: usar placeholder (`$API_KEY`, `<api-key>`) — nunca valor real
- Em logs de debug: truncar (`929a...00b8`)
- Se um tool result retornar dados sensíveis, NÃO reproduzir no texto de resposta
- Se precisar de credencial, ler silenciosamente de `~/.secrets/emailhacker`
- NÃO imprimir o conteúdo de secrets no output

## Acentos — REGRA GLOBAL

**Usar acentos normais em tudo** — código, comentários, commits, respostas no chat, copy. Sem exceção.

## Multiagente — REGRA DE COORDENAÇÃO

**Múltiplos terminais Claude Code rodam em paralelo neste projeto.**

**ANTES de começar qualquer trabalho:**
1. Ler `ROADMAP.md` — ver qual tarefa está livre (status `pendente`)
2. Marcar como `em andamento` no ROADMAP.md
3. Trabalhar APENAS nos arquivos da sua tarefa
4. Ao terminar, marcar como `concluída` no ROADMAP.md

**Regras de conflito:**
- NUNCA editar arquivo que outro agente está trabalhando
- `shared/` pode ser editado por qualquer agente, mas com cuidado (ler antes de editar)
- Em caso de dúvida, pergunte ao usuário

## Visão

**Máquina de conteúdo 24/7.** Pega lives do YouTube, transforma em Shorts/Reels com motion design gerado por IA, publica automaticamente. Roda na VPS 76 em produção.

## Arquitetura — 2 Projetos + Shared

```
emailhacker-viral/
│
├── pipeline/                 ← PROJETO 1: Orquestrador
│   ├── src/
│   │   ├── index.ts          — HTTP server (porta 3200, /health, /webhook/deploy)
│   │   ├── pipeline.ts       — Orquestrador master (conecta todos os passos)
│   │   ├── cli.ts            — CLI: npx tsx src/cli.ts <video-id> [transcript]
│   │   ├── config.ts         — Re-export de shared/config
│   │   ├── processors/
│   │   │   ├── download.ts   — yt-dlp → source.mp4
│   │   │   ├── analyze.ts    — Claude Haiku → trechos virais (score 0-100)
│   │   │   ├── cut.ts        — ffmpeg → corta clip
│   │   │   ├── silence.ts    — ffmpeg silencedetect → remove silêncios >2s
│   │   │   └── webcam.ts     — ffmpeg crop fixo → face.mp4 (1080x960)
│   │   ├── publishers/
│   │   │   ├── youtube.ts    — googleapis OAuth → YouTube Short
│   │   │   ├── instagram.ts  — Meta Graph API v21.0 → Instagram Reel
│   │   │   └── r2-upload.ts  — Cloudflare R2 (AWS Sig V4)
│   │   └── queue/
│   │       └── producer.ts   — BullMQ: enfileira render jobs
│   ├── package.json
│   └── tsconfig.json
│
├── renderer/                 ← PROJETO 2: DIRECTOR + Remotion + Compose
│   ├── src/
│   │   ├── index.ts          — BullMQ consumer (1 job por vez)
│   │   ├── director.ts       — DIRECTOR v7: Haiku JSON (80%) ou Claude Code TSX (20%)
│   │   ├── render.ts         — npx remotion render → overlay.mp4
│   │   ├── compose.ts        — ffmpeg vstack overlay + face → final.mp4
│   │   ├── ClipTemplate.tsx  — Composição Remotion com componentes
│   │   └── components/       — Biblioteca visual (AppWindow, Terminal, DiffView, etc)
│   │       ├── tokens.ts     — Design tokens (cores, fonts, springs)
│   │       ├── SceneData.ts  — Tipos (Scene, ClipData)
│   │       ├── AppWindow.tsx
│   │       ├── PromptInput.tsx
│   │       ├── ToolCalls.tsx
│   │       ├── DiffView.tsx
│   │       ├── Terminal.tsx
│   │       ├── DataTable.tsx
│   │       ├── Captions.tsx
│   │       ├── SceneBackground.tsx
│   │       └── StatusBar.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                   ← Código compartilhado
│   ├── types/job.ts          — Segment, JobData, RenderJob, PublishResult
│   ├── config.ts             — Env vars + ~/.secrets/emailhacker
│   ├── queue.ts              — BullMQ fila 'render-jobs'
│   └── lib/ffmpeg.ts         — Wrapper ffmpeg/ffprobe
│
├── scripts/
│   ├── setup.sh              — Provisiona VPS (Node 22, ffmpeg, yt-dlp, Chromium, PM2)
│   └── deploy.sh             — git pull → build ambos → pm2 restart
│
├── docs/
│   ├── PIPELINE-V1.md        — Documentação do pipeline de 11 passos
│   └── DIRECTOR-V5-SPEC.md   — Spec histórica do DIRECTOR v5
│
├── ROADMAP.md                — Fases e tarefas (coordenação multiagente)
├── ecosystem.config.cjs      — PM2: pipeline + renderer
└── .gitignore
```

## Fluxo do Pipeline

```
Pipeline                              Renderer
────────                              ────────
1. Download (yt-dlp)
2. Analyze (Haiku → trechos virais)
3. Cut (ffmpeg)
4. Silence removal (ffmpeg)
5. Webcam crop (ffmpeg)
6. Whisper (OpenAI → timestamps)

   ──── enfileira BullMQ ────►        7. DIRECTOR v7 (Haiku JSON ou Claude Code TSX)
                                      8. Remotion render (overlay.mp4)
   ◄──── recebe final.mp4 ────       9. Compose (ffmpeg vstack → 1080x1920)

10. Scout (Haiku → copy)
11. Publish (YouTube + Instagram)
```

## DIRECTOR v7 — Híbrido

| Modo | Uso | Ferramenta | Tempo |
|------|-----|-----------|-------|
| **Template** (80%) | Contextos padrão | Haiku → JSON de cenas → ClipTemplate | ~45s |
| **Custom** (20%) | Visuais únicos | Claude Code CLI → TSX completo | ~90-150s |

Template mode gera JSON com cenas tipadas (prompt, response, diff, terminal, table, text).
ClipTemplate.tsx renderiza usando a biblioteca de componentes.

## Regras Remotion (NUNCA violar)

- **PROIBIDO** CSS transitions, CSS animations, classes Tailwind (`animate-*`)
- **OBRIGATÓRIO** `useCurrentFrame()` + `interpolate()` ou `spring()` para TODA animação
- **OBRIGATÓRIO** `extrapolateRight: 'clamp'` em interpolações
- **OBRIGATÓRIO** audio via `<Audio>` de `@remotion/media`
- Skill: `.agents/skills/remotion-best-practices/rules/`

## Infra

- **VPS 76:** Hostinger KVM1 (1 vCPU, 4GB RAM, 50GB NVMe, Ubuntu 24.04)
- **PM2:** pipeline (porta 3200, max 1.5GB) + renderer (consumer, max 2GB)
- **HTTPS:** publisher.emailhacker.ai (Caddy reverse proxy)
- **Redis:** local, noeviction, 256MB
- **Remotion:** v4, --concurrency=1 --gl=angle-egl
- **Secrets:** `~/.secrets/emailhacker` (local/VPS) ou env vars (Docker/Coolify)
- **Transcriptor:** `vsl.emailhacker.ai` (VPS 72) — transcrição YouTube via proxy

## Comandos

```bash
# Dev
cd pipeline && npx tsx watch src/index.ts
cd renderer && npx tsx watch src/index.ts

# Build
cd pipeline && npx tsc && cd ../renderer && npx tsc

# CLI
cd pipeline && npx tsx src/cli.ts <video-id> [transcript.txt]

# Teste publicação
cd pipeline && npx tsx src/test-publish.ts <youtube|instagram|all> <video.mp4>

# Deploy VPS
bash scripts/deploy.sh
```
