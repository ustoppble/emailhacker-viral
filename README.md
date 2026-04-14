# emailhacker-videos

Remotion video factory do [EmailHacker.ai](https://emailhacker.ai).

Gera Shorts e demos automaticamente: cenas animadas, legendas, componentes de email marketing.

## Requisitos

- Node.js 18+
- `npm install` (instala Remotion e dependências)

## Comandos

```bash
# Abrir o Remotion Studio (preview interativo)
npx remotion studio

# Renderizar um vídeo
npx remotion render <composição> <arquivo-saída.mp4>
```

## Estrutura

```
src/
  index.ts              — registro de composições
  VideoFactory.tsx      — fábrica principal
  features/             — vídeos por feature (funnels, send, email-azul...)
  scenes/               — cenas reutilizáveis
  components/           — componentes visuais (CodeRain, Particles, etc.)
  narratives/           — vídeos narrativos (horizontal + vertical)
public/
  clips/                — clipes de webcam
  sfx/                  — efeitos sonoros
```
