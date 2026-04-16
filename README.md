# emailhacker-viral

Máquina de conteúdo 24/7: transforma lives YouTube em Shorts/Reels com motion design gerado por IA. Roda na VPS 76 em produção.

## Como funciona

```
Live YouTube (3h) → Pipeline analisa → 8 melhores momentos → DIRECTOR gera motion design
→ Remotion renderiza → ffmpeg compõe vertical → Publica YouTube + Instagram
```

**2 processos independentes** comunicando via BullMQ (Redis):

| Processo | Porta | Responsabilidade |
|----------|-------|-----------------|
| **Pipeline** | 3200 | Orquestra: download, análise, corte, silence removal, webcam crop, publicação |
| **Renderer** | — | Consome fila: DIRECTOR gera componente, Remotion renderiza, ffmpeg compõe |

## Arquitetura

```
pipeline/                    → Orquestrador
  src/
    index.ts                 HTTP server (/health, /webhook/deploy, /tmp/upload)
    pipeline.ts              Orquestrador master (conecta todos os passos)
    cli.ts                   CLI: npx tsx src/cli.ts <video-id> [transcript]
    processors/
      download.ts            yt-dlp → source.mp4
      analyze.ts             Claude Haiku → seleciona trechos virais (score 0-100)
      cut.ts                 ffmpeg → corta clip
      silence.ts             ffmpeg silencedetect → remove silêncios >2s
      webcam.ts              ffmpeg crop fixo → face.mp4 (1080x960)
    publishers/
      youtube.ts             googleapis OAuth → YouTube Short
      instagram.ts           Meta Graph API v21.0 → Instagram Reel
      r2-upload.ts           Cloudflare R2 (AWS Sig V4)
    queue/
      producer.ts            BullMQ: enfileira render jobs

renderer/                    → Remotion + DIRECTOR
  src/
    index.ts                 BullMQ consumer (1 job por vez, concurrency=1)
    director.ts              DIRECTOR v7: gera JSON de cenas (Haiku) ou TSX custom (Claude Code)
    render.ts                npx remotion render → overlay.mp4
    compose.ts               ffmpeg vstack overlay + face → final.mp4 (1080x1920)
    ClipTemplate.tsx         Composição Remotion com biblioteca de componentes
    components/
      AppWindow.tsx          Janela estilo IDE (barra de título, tabs)
      PromptInput.tsx        Input de prompt com cursor animado
      ToolCalls.tsx          Tool calls estilo Claude Code (Write, Edit, Bash)
      DiffView.tsx           Diff de código (add/remove com line numbers)
      Terminal.tsx            Terminal com output colorido
      DataTable.tsx          Tabela de dados animada
      Captions.tsx           Legendas TikTok-style (word highlight)
      SceneBackground.tsx    Background com grid/scanlines
      StatusBar.tsx          Barra de status (modelo, branch, items)
      tokens.ts              Design tokens (cores, fonts, springs)
      SceneData.ts           Tipos TypeScript (Scene, ClipData, etc)

shared/                      → Código compartilhado
  types/job.ts               Segment, JobData, RenderJob, PublishResult
  config.ts                  Env vars + ~/.secrets/emailhacker
  queue.ts                   BullMQ fila 'render-jobs'
  lib/ffmpeg.ts              Wrapper ffmpeg/ffprobe
```

## Pipeline (11 passos)

```
Pipeline                                Renderer
────────                                ────────
1. Download (yt-dlp)
2. Analyze (Haiku → trechos virais)
3. Cut (ffmpeg)
4. Silence removal (ffmpeg)
5. Webcam crop (ffmpeg)
6. Whisper (OpenAI → timestamps)

   ──── enfileira BullMQ ────►          7. DIRECTOR v7 (Haiku JSON ou Claude Code TSX)
                                        8. Remotion render (overlay.mp4)
   ◄──── recebe final.mp4 ────          9. Compose (ffmpeg vstack → 1080x1920)

10. Scout (Haiku → copy)
11. Publish (YouTube + Instagram)
```

## DIRECTOR v7 — Híbrido

Dois modos de operação:

| Modo | Uso | Como funciona | Tempo |
|------|-----|---------------|-------|
| **Template** (80%) | Contextos padrão (código, terminal, dados) | Haiku gera JSON de cenas → ClipTemplate renderiza | ~45s |
| **Custom** (20%) | Visuais únicos | Claude Code gera .tsx completo | ~90-150s |

O modo Template usa uma biblioteca de componentes pré-prontos (AppWindow, Terminal, DiffView, etc) que simulam a tela do Claude Code durante coding sessions.

## Performance (VPS 76, testado)

| Etapa | Tempo |
|-------|-------|
| DIRECTOR (Haiku) | ~45s |
| Remotion render | ~35-42s |
| ffmpeg compose | ~30-56s |
| **Total por clip** | **~2 min** |

Custo estimado: ~$0.40/live (8 clips).

## Deploy

```bash
# VPS 76 — PM2
pm2 start ecosystem.config.cjs
pm2 list    # pipeline + renderer

# Deploy manual
bash scripts/deploy.sh

# Auto-deploy via GitHub webhook
POST /webhook/deploy (HMAC-SHA256)
```

## Desenvolvimento

```bash
# Pipeline
cd pipeline && npx tsx watch src/index.ts

# Renderer
cd renderer && npx tsx watch src/index.ts

# Build
cd pipeline && npx tsc && cd ../renderer && npx tsc

# Teste manual
cd pipeline && npx tsx src/cli.ts <video-id> [transcript.txt]

# Teste publicação
cd pipeline && npx tsx src/test-publish.ts <youtube|instagram|all> <video.mp4>
```

## Infra

- **VPS 76:** Hostinger KVM1 (1 vCPU, 4GB RAM, 50GB NVMe, Ubuntu 24.04)
- **HTTPS:** publisher.emailhacker.ai (Caddy reverse proxy)
- **Redis:** local, noeviction, 256MB
- **Chromium:** headless pra Remotion render
- **Claude Code:** v2.1.97, OAuth na VPS (custo zero pra DIRECTOR custom)
- **Secrets:** `~/.secrets/emailhacker`

## Dependências externas

| Serviço | Pra quê |
|---------|---------|
| `vsl.emailhacker.ai` (VPS 72) | Transcrição YouTube (quando disponível) |
| YouTube Data API | Upload de Shorts |
| Meta Graph API v21.0 | Upload de Reels |
| Cloudflare R2 | Storage de vídeos (pra Instagram) |
| Claude API (Haiku) | Análise de transcript + DIRECTOR template |
| Claude Code CLI | DIRECTOR custom (TSX sob medida) |

## Bloqueios conhecidos

- yt-dlp na VPS precisa de cookies/proxy pra YouTube (bot detection)
- Solução: usar emailhacker-transcriptor (VPS 72) como proxy de download
- Lives sem legendas automáticas precisam de Whisper (não implementado ainda)
