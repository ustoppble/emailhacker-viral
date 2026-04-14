# Video Design System: EmailHacker.ai Edition

Este documento detalha como reproduzir efeitos visuais usando o design system do emailhacker.ai em React/Remotion.

## Especificacoes de Design (Base)

| Elemento | Valor |
| :--- | :--- |
| **Fundo** | `#0a0a0a` |
| **Accent** | `#ef4444` |
| **Success** | `#16a34a` |
| **Texto** | `#e5e5e5` |
| **Texto Secundario** | `#9ca3af` |
| **Surface** | `#111111` |
| **Surface Light** | `#1a1a1a` |
| **Border** | `rgba(239, 68, 68, 0.2)` |
| **Fonte** | Monospace (SF Mono, Fira Code, JetBrains Mono) |

---

## Storyboard Tecnico (Template)

| Frame | Tempo | Evento Visual | Animacao | Easing | Camadas (Z-Index) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | 0.0s | Formas geometricas (triangulo, quadrado, circulo) aparecem no centro. | **Morph / Fade** | `ease-in-out` | 1: BG, 2: Shapes |
| **010** | 5.0s | Formas se alinham verticalmente para formar um "esqueleto" de interface. | **Slide / Grid** | `cubic-bezier(0.4, 0, 0.2, 1)` | 1: BG, 2: Shapes |
| **015** | 7.5s | Notificacao desliza do topo. Elemento animado aparece no centro. | **Slide Down / Scale** | `ease-out` | 3: Notification, 2: Element |
| **020** | 10.0s | Texto aparece caractere por caractere. | **Typewriter** | `linear` | 2: Text |
| **030** | 15.0s | Balao de chat sobe; logo e icone de loading aparecem. | **Slide Up / Rotate** | `spring` | 3: Chat Bubble, 2: Logo |
| **045** | 22.5s | Grafico de linha expande horizontalmente. | **SVG Draw / Scale X** | `ease-in-out` | 2: Chart Line, 1: Grid |
| **060** | 30.0s | Fluxograma aparece com zoom suave. Elemento em destaque. | **Zoom / Pan** | `ease-out` | 2: Diagram, 3: Highlight |
| **090** | 45.0s | Carrossel de slides desliza horizontalmente. | **Horizontal Scroll** | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 2: Slides |
| **105** | 52.5s | Logo final centralizado com fade out do conteudo anterior. | **Fade In / Scale** | `ease-out` | 4: Final Logo |

---

## Tipos de Animacao

### 1. Morphing (SVG)
Transicao entre formas geometricas. Requer `flubber` ou interpolacao manual de paths SVG.

### 2. Typewriter Effect
Revelacao progressiva de texto. Implementar com `frame * charSpeed` e `.slice(0, charsVisible)`.
```tsx
const charsVisible = Math.min(text.length, Math.floor((frame - startFrame) * 0.8))
```

### 3. Spring Physics
Bounce natural em cards, notificacoes, badges. Usar `spring()` do Remotion.
```tsx
const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 8, stiffness: 120, mass: 0.9 } })
```

### 4. SVG Path Animation
Graficos e diagramas usam `stroke-dasharray` / `stroke-dashoffset` pra "desenhar" na tela.

### 5. Parallax/Pan
Movimento de camera sobre diagramas. Usar `CameraRig` com zoom + panX/panY interpolados.

---

## Padroes de Movimento (OBRIGATORIO)

| Padrao | Implementacao | Quando usar |
| :--- | :--- | :--- |
| **Entrada de Texto** | Fade 8 frames + Slide Y (10px) com `ease-out` | Todo texto que aparece |
| **Cards/Modais** | Scale (0.8 -> 1.0) + Fade com `MOTION.snappy` | Cards, badges, blocos |
| **Loading** | Rotacao continua (`frame * 12deg`) | Spinners de progresso |
| **Press (selecao)** | Scale 1 -> 0.97 (3 frames) -> 1.02 (overshoot) | Click em cards |
| **Impact/Slam** | Scale 2 -> 1 com `MOTION.impact` (big overshoot) | Texto de beneficio, CTA |
| **Float** | `Math.sin(frame * 0.06) * 4` | Badges flutuantes |
| **Pulse** | `1 + Math.sin(frame * 0.12) * 0.06` | Badges IA, dots pulsantes |
| **Confetti** | Particulas com gravidade + seeded random | Momento de sucesso |
| **Shatter Exit** | Scale 1 -> 0 + opacity 1 -> 0 rapido | Saida de cena Pain |

---

## Presets de Spring (styles.ts)

| Nome | Config | Uso |
| :--- | :--- | :--- |
| **snappy** | `damping: 12, stiffness: 200, mass: 0.7` | Entrada rapida com leve overshoot |
| **bouncy** | `damping: 8, stiffness: 120, mass: 0.9` | Overshoot notavel (badges, counters) |
| **smooth** | `damping: 18, stiffness: 70, mass: 1.3` | Suave/organico (camera) |
| **heavy** | `damping: 22, stiffness: 50, mass: 1.6` | Peso cinematico (transicoes) |
| **impact** | `damping: 6, stiffness: 250, mass: 0.5` | Slam/pop (checkmarks, CTA) |

---

## Camadas e Z-Index

| Z-Index | Camada | Elementos |
| :--- | :--- | :--- |
| `0` | Background | `#0a0a0a` solido |
| `1` | Grid | GridBackground (3D rotateX 12deg) |
| `2` | Ambiente | CodeRain, Particles |
| `5` | Badges | Badges flutuantes, timestamps |
| `8` | Toasts | Notificacoes laterais |
| `10` | Scanlines | Overlay de scanlines |
| `15` | Content | Cenas (Pain, Feature, Visual, Benefit, CTA) |
| `19-22` | Effects | Camera flash, green flash, lens flare, particles |
| `25` | Progress | Progress bar topo |
| `30` | HUD | CornerElements |
| `40` | Vignette | Vignette overlay |

---

## Tipografia

| Nivel | Tamanho | Uso |
| :--- | :--- | :--- |
| Hero | 64px | Numero grande, destaque unico |
| Title | 48px | Pain text, Benefit text |
| Subtitle | 36px | Feature name |
| Body | 24px | Textos secundarios |
| Label | 16px | Subtitulos, labels de cena |
| Small | 13px | Terminal text, timestamps |
| Micro | 9-11px | Dentro do phone (cards, badges) |

**Regra:** Tudo monospace. Sem serif, sem sans-serif.

---

## Layout do Video (5 Cenas)

### Cena 1 — Dor (5s / 150 frames)
- Texto central 48px com keyword em vermelho + glow
- Heartbeat glow, word-by-word, keyword shake +-4px
- Declining graph fundo, danger icons, "R$ 0" flash subliminal
- Camera: zoom 1.1->1.25, pan drift, shake=0

### Cena 2 — Feature/Phone (6s / 180 frames)
- Titulo accent fixo TOPO (28px) + subtitle (16px)
- Phone centralizado scale 1.2x com Selector dentro
- Badges flutuantes (IA, 1-CLICK, AUTO) com arrows SVG
- Terminal scroll lateral (opacity 0.18)
- Camera: zoom 1.0->1.08, panX=0, panY=0

### Cena 3 — Visual/Build (8s / 240 frames)
- Titulo fixo TOPO + subtitle
- Phone com Builder (blocos sequenciais + connectors + confetti)
- Counter com ring SVG (esquerda)
- Toasts laterais (direita)
- Progress bar topo
- Lens flare + particle rain no sucesso
- Camera: zoom 1.0->1.1, panX=0, panY=0

### Cena 4 — Beneficio (5s / 150 frames)
- Background explosion glow
- Texto SLAM (scale 2->1 overshoot) line-by-line stagger
- Light streaks, particle burst, micro-shake 3 frames
- Energy bar underline, motion blur primeiros 6 frames
- Camera: zoom 1.1->1.3, pan drift

### Cena 5 — CTA (3s / 90 frames)
- Speed lines convergentes
- Inseto SVG + EMAILHACKER.AI inline (mesma linha)
- Double spring logo, red dot pulsante
- Tagline letter-spacing 30->2
- Flash duplo frame 78+84
- Camera: zoom 1.15->1.05

---

## Regras Criticas

1. **ZERO CSS animations** — tudo via `useCurrentFrame()` + `interpolate()` / `spring()`
2. **Phone content e UNICO por feature** — nunca reutilizar Selector/Builder de outra feature
3. **Titulos no TOPO via flexbox** — phone no flex:1 embaixo, titulo nunca sai da tela
4. **CameraRig externo: panX=0, panY=0 nas cenas 2-3** — zoom interno do phone separado
5. **shake=0 SEMPRE** no CameraRig
6. **breathe max 0.2** nas cenas com phone
7. **Crossfade 9 frames** entre cenas
8. **Film grain 800 dots** (via Particles)
9. **Vignette + CornerElements** sempre ativos
10. **Logo inseto so na cena CTA** — nunca na cena 1
