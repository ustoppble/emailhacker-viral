# ROADMAP — EmailHacker Viral

**Leia este arquivo ANTES de começar qualquer trabalho.**
Pegue uma tarefa `pendente`, marque como `em andamento`, trabalhe, marque como `concluída`.

---

## Fase 1 — Estrutura + Pipeline + Renderer [CONCLUÍDA]

10 microvitórias executadas via swarm de agentes em paralelo.

| MV | Descrição | Status |
|----|-----------|--------|
| MV1 | Estrutura pipeline/ + renderer/ + shared/ | concluída |
| MV2 | Pipeline: server HTTP + health + config | concluída |
| MV3 | Pipeline: download + analyze (yt-dlp + Haiku) | concluída |
| MV4 | Pipeline: cut + silence cutter + webcam crop | concluída |
| MV5 | Fila BullMQ: pipeline enfileira, renderer consome | concluída |
| MV6 | Renderer: DIRECTOR v5 gera overlay.tsx | concluída |
| MV7 | Renderer: Remotion render puro | concluída |
| MV8 | Renderer: compose (ffmpeg vstack → final.mp4) | concluída |
| MV9 | Pipeline: publishers (YouTube + Instagram + R2) | concluída |
| MV10 | End-to-end: video ID → Shorts publicados | concluída |

### Testes validados na VPS 76

| Teste | Resultado |
|-------|-----------|
| T1: Health check (porta 3200) | PASSOU |
| T2: BullMQ (pipeline → renderer) | PASSOU |
| T3: ffmpeg compose (overlay + face → vertical) | PASSOU |
| T4: DIRECTOR + Remotion render | PASSOU |
| T5: End-to-end com vídeo real | PASSOU (2min 15s/clip) |

### Fixes de produção (PRs #2-#7)

| PR | Fix |
|----|-----|
| #2 | ecosystem.config.cjs — dist paths (rootDir: "..") |
| #3 | director timeout 120→180s, remover --allowedTools |
| #4 | director remover instrução de ler rules (--print não tem tools) |
| #5 | remotion --log warn (não warning) |
| #6 | director prompt compacto + timeout 240s |
| #7 | director usa Haiku (rápido e confiável na VPS) |

---

## Fase 2 — DIRECTOR v7 + Componentes [EM ANDAMENTO]

Evolução do DIRECTOR de v5 (TSX puro) pra v7 (híbrido JSON template + TSX custom).

| Tarefa | Status |
|--------|--------|
| Biblioteca de componentes (AppWindow, Terminal, DiffView, etc) | concluída |
| ClipTemplate.tsx (composição com componentes) | concluída |
| DIRECTOR v7 (Haiku gera JSON, fallback TSX custom) | concluída |
| Design tokens (cores, fonts, springs) | concluída |
| Integrar v7 no consumer do renderer | pendente |
| Testar template mode E2E na VPS | pendente |

---

## Fase 3 — Piloto Automático [PENDENTE]

| Tarefa | Status | Descrição |
|--------|--------|-----------|
| Integrar emailhacker-transcriptor (VPS 72) | pendente | Transcrição via API em vez de yt-dlp local |
| Resolver download na VPS (proxy/cookies) | pendente | yt-dlp bloqueado por bot detection |
| Whisper fallback | pendente | Pra lives sem legendas automáticas |
| Cron: detectar live nova → disparar pipeline | pendente | Polling YouTube API do canal |
| Scout: gerar copy pra cada plataforma | pendente | Haiku gera título + descrição + hashtags |
| Publicação automática pós-render | pendente | Pipeline recebe final.mp4 → publica |
| Scheduling: espaçar posts ao longo do dia | pendente | Não postar 8 de uma vez |
| Analytics: tracking de views/engagement | pendente | Medir performance por clip |

---

## Mapa de dependências

```
FASE 1 (concluída)
  MV1 → MV2 → MV3, MV4, MV9
  MV1 → MV5 → MV6 → MV7 → MV8
  MV3 + MV4 + MV8 + MV9 → MV10

FASE 2 (em andamento)
  Componentes → ClipTemplate → DIRECTOR v7 → Teste E2E

FASE 3 (pendente)
  Transcriptor + Download → Cron → Scout → Publish auto → Scheduling
```
