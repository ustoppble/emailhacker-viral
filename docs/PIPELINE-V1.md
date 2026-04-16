# Video Worker — Pipeline V1 (Validado 2026-04-09)

## Resultado

**1 live de 3h54m → 8 clips → 2 plataformas publicadas automaticamente**

- Custo IA: ~$0.05/clip, ~$0.40/live (8 clips)
- Tempo de processamento: ~3 min por clip (análise + corte + render + publish)

---

## Pipeline (11 passos)

### 1. SEGMENTER (Haiku) — $0.01
**Input:** Transcript completo da live (Tactiq/yt-transcriber, ~80KB)
**Output:** 20-40 blocos temáticos com timestamps

### 2. ANALYST (Sonnet) — $0.13
**Input:** Blocos do SEGMENTER + transcript completo
**Output:** 8 clips rankeados (start/end/hook/tipo/score)

### 3. EDITOR (yt-dlp + ffmpeg)
**Input:** YouTube video ID + timestamps do ANALYST
**Output:** Clip bruto cortado (.mp4)

### 4. SILENCE_CUTTER (ffmpeg)
**Input:** Clip bruto
**Output:** Clip limpo (sem silêncios >2s)

### 5. WEBCAM CROP (ffmpeg)
**Input:** Clip limpo (1920x1080)
**Output:** Webcam escalada (1080x960, metade inferior do vertical)

Crop fixo (webcam no canto inferior esquerdo):
```bash
ffmpeg -vf "crop=300:267:70:760,scale=1080:960:flags=lanczos"
```

### 6. WHISPER (OpenAI API) — $0.01/clip
**Input:** Clip limpo (.mp4)
**Output:** Timestamps por PALAVRA (~100ms precisão)

CRÍTICO: Whisper roda DEPOIS do silence cutter. Timestamps já são do clip final.

### 7. DIRECTOR v5 (Sonnet via Claude Code) — $0.15/clip
**Input:** Timestamps Whisper + contexto visual
**Output:** Componente .tsx Remotion sob medida

REGRA: A metade superior NÃO é legenda. É a TELA DO COMPUTADOR estilizada em motion design.

### 8. RENDERER (Remotion headless)
**Input:** Componente do DIRECTOR + webcam clip + captions
**Output:** Vídeo final 1080x1920 30fps

Layout:
```
┌──────────────────┐
│  MOTION DESIGN   │ ← Cenas do DIRECTOR (1080x960)
│  (tela do PC)    │
├──────────────────┤
│ LEGENDAS TIKTOK  │ ← Centralizado na divisa (amarelo)
├──────────────────┤
│    WEBCAM        │ ← Rosto do streamer (1080x960)
│  (talking head)  │
└──────────────────┘
```

### 9. CAPTIONER (@remotion/captions)
**Input:** Whisper words → formato Caption do Remotion
**Output:** Legendas TikTok-style com word highlighting

Estilo: amarelo (#facc15), SF Mono 52px bold, switch a cada 800ms

### 10. SCOUT (Haiku) — $0.01
**Input:** Título + contexto do clip
**Output:** Copy pra cada plataforma + hashtags

### 11. PUBLISHER
- **YouTube Shorts:** Upload direto via googleapis OAuth
- **Instagram Reels:** Meta Graph API v21.0 (container → poll → publish)
- Quota YouTube: ~6 uploads/dia

---

## O que falta pra 100% automático

### P0 — Automação do pipeline
1. Worker recebe video_id → executa todos os 11 passos → publica
2. BullMQ queue: 1 job = 1 live → 8 sub-jobs (1 por clip)
3. Cron: verificar se tem live nova → disparar pipeline

### P1 — Qualidade da curadoria
1. ANALYST precisa de critérios mais rigorosos
2. DIRECTOR precisa de mais componentes visuais
3. Validação pós-WHISPER: rejeitar clips com <30% fala

### P2 — Distribuição
1. TikTok API (pendente)
2. Scheduling (espaçar ao longo do dia)
3. Analytics de performance por clip
