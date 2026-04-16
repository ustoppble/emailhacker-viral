# DIRECTOR v5 — Componentes sob medida

## Decisão (2026-04-09)

O DIRECTOR NÃO escolhe de uma lista fixa de componentes.
Ele CRIA um componente React/Remotion NOVO pra cada clip.

## Por quê

- Lista fixa = todos os clips ficam iguais (CodeEditor → NodeGraph → Terminal)
- Texto representando a fala (HookText "JOHN WICK WINS") não é motion design
- O motion design precisa MOSTRAR o que está acontecendo, não DESCREVER

## Pipeline

```
PRODUTOR (Sonnet)
├─ Recebe: transcript Whisper + contexto da live
├─ Output: descrição VISUAL detalhada de cada cena
│   "0-10s: personagem 2D pixelado estilo arcade atirando pra direita,
│    3 inimigos caem sequencialmente, contador de kills no topo"
└─ Não menciona componentes — descreve a CENA

DIRECTOR v5 (Sonnet)
├─ Recebe: briefing visual do PRODUTOR + regras Remotion
├─ Output: código .tsx completo do componente
│   - useCurrentFrame() + interpolate() + spring()
│   - SVG animado, divs posicionados, canvas, etc
│   - NUNCA CSS transitions (regra Remotion)
│   - Deve compilar e renderizar sem erros
└─ Cada clip = 1 arquivo .tsx NOVO

VALIDADOR
├─ Tenta compilar o .tsx
├─ Renderiza 1 frame de teste
├─ Se falhar: retry com o erro (max 2 tentativas)
└─ Se falhar 2x: fallback pra componente genérico
```

## Custo estimado

- PRODUTOR: ~$0.03/clip (Sonnet, ~500 tokens output)
- DIRECTOR v5: ~$0.15/clip (Sonnet, ~2000 tokens de código)
- Total: ~$0.18/clip (vs $0.07 do v3)
- 8 clips: ~$1.44/live

## Regras pro DIRECTOR v5

O código gerado DEVE:
1. Exportar um React.FC que recebe zero props
2. Usar useCurrentFrame() + useVideoConfig() do remotion
3. Usar interpolate() com extrapolateRight: 'clamp'
4. Usar spring() de remotion pra animações suaves
5. Retornar JSX com div/svg posicionados (1080x960)
6. NUNCA usar CSS transitions/animations
7. NUNCA importar assets externos (tudo inline)
8. Funcionar em 30fps
