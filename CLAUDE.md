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
1. Ler `ROADMAP.md` — ver qual MV está livre (status `pendente`)
2. Marcar a MV que vai trabalhar como `em andamento` no ROADMAP.md
3. Trabalhar APENAS nos arquivos da sua MV (paths listados no ROADMAP)
4. Ao terminar, marcar como `concluída` no ROADMAP.md

**Regras de conflito:**
- NUNCA editar arquivo que pertence a outra MV em andamento
- Se precisar de algo que outra MV ainda não entregou, espere ou peça ao usuário
- `shared/` pode ser editado por qualquer agente, mas com cuidado (ler antes de editar)
- Em caso de dúvida, pergunte ao usuário em vez de adivinhar

**Formato de marcação no ROADMAP.md:**
```
## MV1 — [concluída]        ← já terminada
## MV2 — [em andamento]     ← alguém está trabalhando
## MV3 — [pendente]         ← livre pra pegar
```

## Visão

**Máquina de conteúdo 24/7.** Pega lives do YouTube, transforma em Shorts/Reels com motion design gerado por IA, publica automaticamente. Roda na VPS de produção 24h.

## Arquitetura — 2 Projetos + Shared

```
emailhacker-viral/
│
├── pipeline/                 ← PROJETO 1: Orquestrador
│   ├── src/
│   │   ├── index.ts          — HTTP server (porta 3200, /health, /webhook/deploy)
│   │   ├── config.ts         — importa de shared/config
│   │   ├── cli.ts            — invocação manual: npx tsx src/cli.ts <video-id>
│   │   ├── processors/
│   │   │   ├── download.ts   — yt-dlp → source.mp4
│   │   │   ├── analyze.ts    — Claude Haiku → seleciona 8 melhores trechos
│   │   │   ├── cut.ts        — ffmpeg → corta clip do source
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
├── renderer/                 ← PROJETO 2: Remotion puro + DIRECTOR
│   ├── src/
│   │   ├── index.ts          — BullMQ consumer (consome 1 job por vez)
│   │   ├── director.ts       — Claude Code CLI + skill remotion-best-practices → gera overlay.tsx
│   │   ├── render.ts         — npx remotion render overlay.tsx → overlay.mp4
│   │   └── compose.ts        — ffmpeg vstack overlay.mp4 + face.mp4 → final.mp4
│   ├── package.json          — remotion, @remotion/cli (Remotion = só dependência npm)
│   └── tsconfig.json
│
├── shared/                   ← Código compartilhado entre os 2 projetos
│   ├── types/
│   │   └── job.ts            — Segment, JobData, RenderJob, PublishResult
│   ├── config.ts             — env vars + leitura ~/.secrets/emailhacker
│   ├── queue.ts              — definição da fila BullMQ 'render-jobs'
│   └── lib/
│       └── ffmpeg.ts         — wrapper ffmpeg/ffprobe
│
├── scripts/
│   ├── setup.sh              — provisiona VPS (Node 22, ffmpeg, yt-dlp, Chromium, PM2)
│   └── deploy.sh             — git pull → build ambos → pm2 restart
│
├── docs/
│   ├── PIPELINE-V1.md        — documentação do pipeline de 11 passos
│   └── DIRECTOR-V5-SPEC.md   — spec do DIRECTOR v5 (componentes sob medida)
│
├── ROADMAP.md                — 10 microvitórias com status (coordenação multiagente)
├── ecosystem.config.cjs      — PM2: pipeline (porta 3200) + renderer (consumer)
└── .gitignore
```

## Fluxo do Pipeline

```
Pipeline                              Renderer
────────                              ────────
1. Download (yt-dlp)
2. Analyze (Haiku → 8 clips)
3. Cut (ffmpeg)
4. Silence cut (ffmpeg)
5. Webcam crop (ffmpeg)
6. Whisper (OpenAI → timestamps)
                                      
   ──── enfileira job BullMQ ────►    7. DIRECTOR v5 (Claude Code + skill)
                                      8. Remotion render (puro, overlay.tsx → overlay.mp4)
   ◄──── recebe final.mp4 ────       9. Compose (ffmpeg vstack → final.mp4)

10. Scout (Haiku → copy)
11. Publish (YouTube + Instagram)
```

**Remotion é PURO.** Zero código custom commitado. Só pacotes npm.
O DIRECTOR gera o .tsx completo (auto-contido, com registerRoot).
O Renderer renderiza e compõe. Pipeline só orquestra e publica.

## DIRECTOR v5 — Regra Crítica

O DIRECTOR NÃO usa componentes fixos. Ele CRIA um .tsx NOVO pra cada clip.
Usa a skill `remotion-best-practices` (.agents/skills/remotion-best-practices/rules/).
O motion design MOSTRA o que acontece na tela, NÃO é legenda da fala.
Spec completa: `docs/DIRECTOR-V5-SPEC.md`

## Regras Remotion (NUNCA violar)

- **PROIBIDO** CSS transitions, CSS animations, classes Tailwind de animação (`animate-*`)
- **OBRIGATÓRIO** `useCurrentFrame()` + `interpolate()` ou `spring()` para TODA animação
- **OBRIGATÓRIO** `extrapolateRight: 'clamp'` em interpolações
- **OBRIGATÓRIO** audio via `<Audio>` de `@remotion/media`
- Skill completa: `.agents/skills/remotion-best-practices/rules/`

## Infra

- **VPS:** Hostinger KVM1 (1 vCPU, 4GB RAM, 50GB NVMe, Ubuntu 24.04)
- **PM2:** pipeline (porta 3200, max 1.5GB) + renderer (consumer, max 2GB)
- **HTTPS:** publisher.emailhacker.ai (Caddy reverse proxy)
- **Remotion:** v4, --concurrency=1 --gl=angle-egl
- **Redis:** local, maxmemory 256MB (BullMQ)
- **Secrets:** `~/.secrets/emailhacker` (local/VPS) ou env vars (Docker/Coolify)

## Comandos

```bash
# Dev pipeline
cd pipeline && npx tsx watch src/index.ts

# Dev renderer
cd renderer && npx tsx watch src/index.ts

# Build ambos
cd pipeline && npx tsc && cd ../renderer && npx tsc

# Processar live manualmente
cd pipeline && npx tsx src/cli.ts <youtube-url-ou-id>

# Testar publicação
cd pipeline && npx tsx src/test-publish.ts <youtube|instagram|all> <video.mp4>
```
