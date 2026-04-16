# ROADMAP — 10 Microvitórias

**Leia este arquivo ANTES de começar qualquer trabalho.**
Pegue uma MV `pendente`, marque como `em andamento`, trabalhe, marque como `concluída`.

---

## MV1 — Estrutura limpa (pipeline/ + renderer/ + shared/) — [concluída]

**Objetivo:** Limpar repo e criar a estrutura de 2 projetos + shared.

**O que fazer:**
- Remover src/ e remotion/ atuais (código da migração anterior)
- Criar pipeline/ com package.json + tsconfig.json + src/ vazio
- Criar renderer/ com package.json + tsconfig.json + src/ vazio
- Criar shared/ com types/ + config.ts + queue.ts + lib/ffmpeg.ts
- ecosystem.config.cjs na raiz (2 apps PM2)
- .gitignore unificado

**Arquivos que cria:**
- `pipeline/package.json`, `pipeline/tsconfig.json`
- `renderer/package.json`, `renderer/tsconfig.json`
- `shared/types/job.ts`, `shared/config.ts`, `shared/queue.ts`, `shared/lib/ffmpeg.ts`
- `ecosystem.config.cjs`

**Base existente:** `src/types/job.ts`, `src/config.ts`, `src/lib/ffmpeg.ts`

**Teste:** `ls` confirma estrutura. Ambos `npx tsc --noEmit` passam.

**Desbloqueia:** MV2, MV5

---

## MV2 — Pipeline: server HTTP + health + config — [concluída]

**Objetivo:** Pipeline rodando com HTTP server funcional.

**O que fazer:**
- pipeline/src/index.ts — GET /health, POST /webhook/deploy
- pipeline/src/config.ts — importa shared/config
- ecosystem entry do pipeline

**Arquivos que cria/edita:**
- `pipeline/src/index.ts`
- `pipeline/src/config.ts`

**Base existente:** `src/index.ts` (server HTTP atual)

**Teste:** `cd pipeline && npx tsx src/index.ts` → `curl localhost:3200/health` retorna ok.

**Depende de:** MV1
**Desbloqueia:** MV3, MV4, MV9

---

## MV3 — Pipeline: download + analyze (yt-dlp + Haiku) — [concluída]

**Objetivo:** Pipeline baixa vídeo e seleciona 8 melhores trechos.

**O que fazer:**
- pipeline/src/processors/download.ts — yt-dlp → source.mp4
- pipeline/src/processors/analyze.ts — Claude Haiku analisa transcript → Segment[]

**Arquivos que cria:**
- `pipeline/src/processors/download.ts`
- `pipeline/src/processors/analyze.ts`

**Base existente:** `src/processors/download.ts`, `src/processors/analyze.ts`

**Teste:** rodar analyze com transcript fixo → retorna 8 Segment[] com scores.

**Depende de:** MV2

---

## MV4 — Pipeline: cut + silence + webcam crop (ffmpeg) — [concluída]

**Objetivo:** Pipeline corta clips, remove silêncio, cropa webcam.

**O que fazer:**
- pipeline/src/processors/cut.ts — corta trecho do source.mp4
- pipeline/src/processors/silence.ts — ffmpeg silencedetect, remove gaps >2s
- pipeline/src/processors/webcam.ts — crop fixo (300:267:70:760 → scale 1080:960)

**Arquivos que cria:**
- `pipeline/src/processors/cut.ts`
- `pipeline/src/processors/silence.ts`
- `pipeline/src/processors/webcam.ts`

**Base existente:** `src/processors/cut.ts` (cut + crop combinados, separar), `docs/PIPELINE-V1.md` (specs silence cutter)

**Teste:** gerar face crop usando public/clips/clip-03-webcam.mp4 como referência.

**Depende de:** MV2

---

## MV5 — Fila BullMQ: pipeline enfileira, renderer consome — [concluída]

**Objetivo:** Comunicação entre os 2 projetos via Redis.

**O que fazer:**
- shared/queue.ts — definição da fila 'render-jobs', interface RenderJob
- pipeline/src/queue/producer.ts — enfileira render job
- renderer/src/index.ts — BullMQ Worker, consome 1 por vez (concurrency=1)

**Arquivos que cria:**
- `shared/queue.ts`
- `pipeline/src/queue/producer.ts`
- `renderer/src/index.ts`

**Base existente:** nenhuma (feature nova). Referência: BullMQ docs.

**Teste:** pipeline enfileira 1 job fake → renderer consome e loga no console.

**Depende de:** MV1

---

## MV6 — Renderer: DIRECTOR v5 gera overlay.tsx — [concluída]

**Objetivo:** DIRECTOR gera componente Remotion sob medida via Claude Code CLI.

**O que fazer:**
- renderer/src/director.ts — monta prompt com skill remotion-best-practices
- Chama: `echo "prompt" | claude --print --model sonnet --allowedTools 'Read,Write'`
- Gera overlay.tsx (1080x960, motion design + captions no bottom edge)
- Retry 2x, fallback genérico se falhar

**Arquivos que cria:**
- `renderer/src/director.ts`

**Base existente:** `src/processors/director.ts`, `.agents/skills/remotion-best-practices/`

**Teste:** rodar com transcript fixo → gera .tsx com useCurrentFrame + registerRoot.

**Depende de:** MV5

---

## MV7 — Renderer: Remotion render puro (overlay.tsx → overlay.mp4) — [concluída]

**Objetivo:** Renderizar o .tsx gerado pelo DIRECTOR usando Remotion como runtime puro.

**O que fazer:**
- renderer/src/render.ts — executa `npx remotion render <generated>.tsx Overlay overlay.mp4`
- Remotion NÃO tem código custom — só pacotes npm instalados
- O .tsx gerado é auto-contido (registerRoot + Composition + componente)

**Arquivos que cria:**
- `renderer/src/render.ts`

**Teste:** render do .tsx da MV6 → produz overlay.mp4 (1080x960, 30fps).

**Depende de:** MV6

---

## MV8 — Renderer: compose (ffmpeg vstack → final.mp4) — [concluída]

**Objetivo:** Empilhar overlay + face num vídeo vertical 9:16.

**O que fazer:**
- renderer/src/compose.ts — ffmpeg vstack overlay.mp4 + face.mp4 → final.mp4 (1080x1920)
- libx264 CRF 23, AAC 128k, 30fps
- Devolve path do final.mp4 via fila

**Arquivos que cria:**
- `renderer/src/compose.ts`

**Base existente:** `src/processors/compose.ts` (já faz exatamente isso)

**Teste:** compor overlay da MV7 + public/clips/clip-03-webcam.mp4 → vídeo vertical.

**Depende de:** MV7

---

## MV9 — Pipeline: publishers (YouTube + Instagram + R2) — [concluída]

**Objetivo:** Pipeline publica vídeos nas plataformas.

**O que fazer:**
- pipeline/src/publishers/youtube.ts — googleapis OAuth → YouTube Short
- pipeline/src/publishers/instagram.ts — Meta Graph API → Instagram Reel
- pipeline/src/publishers/r2-upload.ts — Cloudflare R2 (AWS Sig V4)
- pipeline/src/publishers/index.ts — re-exports
- pipeline/src/test-publish.ts — teste manual

**Arquivos que cria:**
- `pipeline/src/publishers/youtube.ts`
- `pipeline/src/publishers/instagram.ts`
- `pipeline/src/publishers/r2-upload.ts`
- `pipeline/src/publishers/index.ts`
- `pipeline/src/test-publish.ts`

**Base existente:** `src/publishers/` (validados na live 8, já publicaram com sucesso)

**Teste:** `npx tsx src/test-publish.ts youtube <video>` → publica Short real.

**Depende de:** MV2

---

## MV10 — End-to-end: video ID entra, Shorts saem — [concluída]

**Objetivo:** Pipeline completo funcionando. 1 comando → 8 Shorts publicados.

**O que fazer:**
- pipeline/src/pipeline.ts — orquestrador master (conecta tudo)
- pipeline/src/cli.ts — CLI que aceita video ID
- ecosystem.config.cjs final (2 apps PM2)
- scripts/deploy.sh (build ambos + restart)

**Arquivos que cria:**
- `pipeline/src/pipeline.ts`
- `pipeline/src/cli.ts`

**Teste:** `npx tsx pipeline/src/cli.ts <video-id>` → 8 Shorts no YouTube + Instagram.

**Depende de:** MV3, MV4, MV8, MV9

---

## Mapa de dependências

```
MV1  Estrutura limpa
 ├──► MV2  Server HTTP + config
 │    ├──► MV3  Download + Analyze
 │    ├──► MV4  Cut + Silence + Webcam
 │    └──► MV9  Publishers
 │
 └──► MV5  Fila BullMQ
      └──► MV6  DIRECTOR v5
           └──► MV7  Remotion render
                └──► MV8  Compose

MV3 + MV4 + MV8 + MV9 ──► MV10  End-to-end
```

**Dois trilhos paralelos** após MV1:
- Trilho Pipeline: MV2 → MV3, MV4, MV9
- Trilho Renderer: MV5 → MV6 → MV7 → MV8
