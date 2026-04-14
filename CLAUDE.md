# CLAUDE.md — Video Factory (Remotion)

## Projeto

Gera videos animados 1920x1080 30fps para o EmailHacker.ai usando Remotion.
Cada feature tem componentes proprios dentro de `src/features/{feature-name}/`.

## Regra: Remotion Best Practices (OBRIGATORIO)

Skills oficiais do Remotion instaladas em `.claude/skills/remotion-best-practices/`.

**ANTES de escrever qualquer codigo Remotion, consultar a rule relevante:**

| Tarefa | Rule a ler |
|--------|-----------|
| Animacoes (spring, interpolate, useCurrentFrame) | `rules/animations.md` + `rules/timing.md` |
| Sequenciar cenas, delays, trim | `rules/sequencing.md` + `rules/trimming.md` |
| Transicoes entre cenas | `rules/transitions.md` |
| Texto animado (typewriter, stagger, word-by-word) | `rules/text-animations.md` |
| Audio, SFX, volume | `rules/audio.md` + `rules/sfx.md` |
| Voiceover com ElevenLabs | `rules/voiceover.md` |
| Legendas/captions | `rules/subtitles.md` + `rules/display-captions.md` |
| Imagens e assets | `rules/assets.md` + `rules/images.md` |
| Videos embutidos | `rules/videos.md` |
| Fontes (Google Fonts, local) | `rules/fonts.md` |
| TailwindCSS | `rules/tailwind.md` |
| 3D (Three.js) | `rules/3d.md` |
| Light leaks / overlays | `rules/light-leaks.md` |
| Compositions e metadata dinamica | `rules/compositions.md` + `rules/calculate-metadata.md` |
| Parametros (Zod schema) | `rules/parameters.md` |
| Medir DOM / texto | `rules/measuring-dom-nodes.md` + `rules/measuring-text.md` |
| FFmpeg (trim, silence detect) | `rules/ffmpeg.md` |
| GIFs | `rules/gifs.md` |
| Lottie | `rules/lottie.md` |
| Mapas (Mapbox) | `rules/maps.md` |
| Video transparente | `rules/transparent-videos.md` |
| Audio visualization (spectrum, waveform) | `rules/audio-visualization.md` |
| Duracao de audio/video | `rules/get-audio-duration.md` + `rules/get-video-duration.md` |

**Caminho das rules:** `.claude/skills/remotion-best-practices/rules/{nome}.md`

### Regras criticas (NUNCA violar)

- **PROIBIDO** CSS transitions, CSS animations, ou classes Tailwind de animacao (`animate-*`) — nao renderizam corretamente no Remotion
- **OBRIGATORIO** usar `useCurrentFrame()` + `interpolate()` ou `spring()` para TODA animacao
- **OBRIGATORIO** usar `extrapolateRight: 'clamp'` em interpolacoes que nao devem ultrapassar o range
- **OBRIGATORIO** importar audio via `<Audio>` de `@remotion/media` (nao `<audio>` HTML)
- Tempos em segundos multiplicados por `fps` do `useVideoConfig()`

## Estrutura do Projeto

```
src/
  VideoFactory.tsx          — composicao principal + defaultData
  styles.ts                 — tokens: COLORS, FONTS, SCENES, MOTION
  index.ts                  — RemotionRoot
  data/videos.ts            — array VideoData
  components/               — compartilhados (GridBackground, PhoneMockup, etc)
  scenes/                   — 5 cenas genericas (Pain, Feature, Visual, Benefit, CTA)
  features/{nome}/          — componentes especificos por feature (Selector + Builder)
```

## Criar video de feature nova

1. Criar `features/{nome}/` com Selector (cena 2) + Builder (cena 3)
2. Registrar em `FeatureScene.tsx` → `FEATURE_CONFIG` + condicional
3. Registrar em `VisualScene.tsx` → config + condicional
4. Atualizar `ImpactTexts` em `VideoFactory.tsx`
5. Adicionar `VideoData` em `data/videos.ts`
6. Apontar `defaultData` em `VideoFactory.tsx`

## Comandos

```bash
# Dev (preview no browser)
npx remotion studio

# Render MP4
npx remotion render src/index.ts VideoFactory out/{id}.mp4 --codec h264

# Comprimir pra <10MB
ffmpeg -i out/{id}.mp4 -c:v libx264 -crf 28 -preset slow -an out/{id}-compressed.mp4
```

## Video Design System (OBRIGATORIO)

**Ler `VIDEO-DESIGN-SYSTEM.md` antes de criar/editar qualquer video.**

Contem: paleta completa, presets de spring, padroes de movimento, storyboard tecnico,
layout das 5 cenas, camadas z-index, tipografia, e regras criticas.

## Design Tokens (styles.ts)

- bg: #0a0a0a | accent: #ef4444 | success: #16a34a | text: #e5e5e5
- Font: monospace (SF Mono, Fira Code, JetBrains Mono)
- Springs: snappy, bouncy, smooth, heavy, impact (ver styles.ts)
- Cenas: pain 5s, feature 6s, visual 8s, benefit 5s, cta 3s
