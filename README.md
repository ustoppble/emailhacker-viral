# emailhacker-viral

Fábrica de vídeos automatizados com Remotion — gera Shorts, demos e narrativas para o EmailHacker.ai.

## O que é

Projeto Remotion 4.x que renderiza vídeos programaticamente em React. Cenas pré-construídas pra diferentes tipos de conteúdo: feature demos, narrativas, Shorts verticais.

## Onde roda

- **Local** (dev e render)
- `npx remotion studio` pra preview
- `npx remotion render` pra gerar MP4

## Estrutura

```
src/
  index.ts              — registro de composições
  VideoFactory.tsx      — fábrica principal
  components/           — componentes visuais (CodeRain, Particles, PhoneMockup, etc)
  features/             — vídeos por feature (funnels, send, email-azul, ghostwriter)
  scenes/               — cenas reutilizáveis (Pain, Benefit, CTA, Proof)
  narratives/           — vídeos narrativos (horizontal + vertical)
  shorts/               — formatos curtos (EmailAzulShort)
  ml-reference/         — vídeos de referência ML
  styles.ts             — design tokens
  data/videos.ts        — configuração dos vídeos
public/
  clips/                — clipes de webcam
  bg-music.mp3          — música de fundo
```

## Variáveis de ambiente

Nenhuma obrigatória. Projeto puramente de renderização local.

## Design System

`VIDEO-DESIGN-SYSTEM.md` define a identidade visual. Ler antes de criar novas cenas.

## Pendências

- [ ] Falta `package.json` — recriar com dependências Remotion
- [ ] `src/Root.tsx` ausente — criar (importado pelo index.ts)

## Stack

Remotion 4.x, React, TypeScript.
