import { execFile } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

/**
 * DIRECTOR v5 — MV6
 *
 * Gera componente Remotion .tsx AUTO-CONTIDO pra cada clip via Claude Code CLI.
 * O arquivo gerado inclui registerRoot + Composition e pode ser renderizado
 * diretamente pelo Remotion sem projeto externo.
 *
 * Claude Code roda localmente (VPS com OAuth) — custo zero de API key.
 * A skill remotion-best-practices é injetada via prompt (Read das rules).
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detecta path das skills Remotion conforme ambiente (local dev vs VPS).
 */
function getSkillsPath(): string {
  const paths = [
    resolve(process.cwd(), '..', '.agents/skills/remotion-best-practices'),
    '/root/.claude/skills/remotion-best-practices',
  ]
  for (const p of paths) {
    if (existsSync(p)) return p
  }
  return paths[0]
}

/**
 * Monta o prompt completo pro DIRECTOR.
 *
 * Instrui o Claude Code a:
 * 1. Ler as rules essenciais de Remotion
 * 2. Gerar um .tsx AUTO-CONTIDO com registerRoot + Composition
 * 3. Incluir captions sincronizadas no bottom edge
 */
function buildPrompt(opts: {
  transcript: string
  context: string
  outputPath: string
  skillsPath: string
}): string {
  const { transcript, context, outputPath, skillsPath } = opts
  const rulesDir = `${skillsPath}/rules`

  return `Voce é um SENIOR MOTION DESIGNER especializado em Remotion.

PASSO 1 — Leia OBRIGATORIAMENTE estas rules antes de escrever qualquer código:
- ${rulesDir}/animations.md
- ${rulesDir}/timing.md
- ${rulesDir}/text-animations.md
- ${rulesDir}/transitions.md
- ${rulesDir}/sequencing.md

PASSO 2 — Gere um arquivo .tsx COMPLETO e AUTO-CONTIDO no path: ${outputPath}

O arquivo DEVE conter:
- Imports de 'remotion': registerRoot, Composition, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, AbsoluteFill
- Imports de 'react': React
- Um componente ClipOverlay: React.FC que renderiza o overlay animado
- Um componente CaptionsBar: React.FC que renderiza as legendas sincronizadas
- No FINAL do arquivo: registerRoot(() => { return React.createElement(Composition, { id: "Overlay", component: ClipOverlay, width: 1080, height: 960, fps: 30, durationInFrames: TOTAL_FRAMES }); });

CONTEXTO DO CLIP (o que está acontecendo na tela):
${context}

TRANSCRIPT (fala do streamer — usar pra sincronizar animações e captions):
${transcript}

REGRAS OBRIGATÓRIAS:

1. CANVAS: 1080x960px, 30fps. Calcule TOTAL_FRAMES baseado na duração do transcript (estimativa: ~3 palavras/segundo).

2. MOTION DESIGN — o overlay MOSTRA visualmente o que acontece na tela. NÃO é legenda da fala. Exemplos:
   - Se fala de email: mostrar envelope animado, inbox, notificação
   - Se fala de código: mostrar editor estilizado, cursor digitando, syntax highlight
   - Se fala de números: mostrar contadores animando, gráficos subindo
   - Preencher 90%+ da tela. Textos mínimo 48px. Impacto mínimo 72px.

3. ANIMAÇÕES:
   - useCurrentFrame() + interpolate() com extrapolateRight: 'clamp' pra TODA interpolação
   - spring() de remotion pra TODAS as entradas de elementos
   - <Sequence> com premountFor pra organizar fases temporais
   - Tempos em segundos multiplicados por fps do useVideoConfig()

4. CORES:
   - accent: #ef4444 (vermelho)
   - texto: #e5e5e5 (branco suave)
   - sucesso: #22c55e (verde)
   - destaque caption: #facc15 (amarelo)
   - bg: transparente (o overlay vai por cima do vídeo)

5. CAPTIONS (últimos 120px do canvas):
   - Dividir o transcript em palavras
   - Distribuir as palavras uniformemente ao longo dos frames
   - Mostrar grupo de 3-5 palavras por vez
   - Palavra ativa em #facc15 (amarelo), restante em #e5e5e5
   - Font: monospace, 44px, fontWeight bold
   - textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)'
   - Posição: bottom 20px, centralizado horizontalmente

6. PROIBIDO:
   - CSS transitions, CSS animations, classes animate-* do Tailwind
   - Assets externos (imagens, fontes, áudio) — tudo inline
   - useState, useEffect, useRef ou qualquer hook de React além de useCurrentFrame/useVideoConfig
   - Código fora do arquivo (imports de arquivos locais)
   - <img>, <video>, <audio> tags HTML

7. ESTRUTURA DO ARQUIVO:
   - Todas as constantes (TOTAL_FRAMES, COLORS, etc) no topo
   - Componentes auxiliares antes do ClipOverlay
   - ClipOverlay como componente principal
   - registerRoot na última linha

IMPORTANTE: Retorne APENAS o código .tsx completo. Nenhuma explicação, nenhum markdown fence, nenhum texto fora do código. Comece com import e termine com registerRoot.`
}

// ---------------------------------------------------------------------------
// Core: gera overlay
// ---------------------------------------------------------------------------

export async function generateOverlay(opts: {
  clipId: string
  transcript: string
  context: string
  outputPath: string
}): Promise<{ success: boolean; componentPath: string; error?: string }> {
  const skillsPath = getSkillsPath()
  const prompt = buildPrompt({
    transcript: opts.transcript,
    context: opts.context,
    outputPath: opts.outputPath,
    skillsPath,
  })

  // Garantir que o diretório de destino existe
  const dir = dirname(opts.outputPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  return new Promise((resolvePromise) => {
    console.log(`[director] Chamando Claude Code pra clip ${opts.clipId}...`)

    const child = execFile(
      'claude',
      [
        '--print',
        '--model', 'sonnet',
      ],
      {
        timeout: 180_000,
        maxBuffer: 2 * 1024 * 1024,
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error(`[director] Erro na execução: ${err.message}`)
          resolvePromise({
            success: false,
            componentPath: opts.outputPath,
            error: err.message,
          })
          return
        }

        // Verificar se o arquivo foi criado pelo Claude via Write tool
        if (existsSync(opts.outputPath)) {
          const code = readFileSync(opts.outputPath, 'utf-8')
          if (validateComponent(code)) {
            console.log(
              `[director] Componente gerado: ${opts.outputPath} (${code.split('\n').length} linhas)`
            )
            resolvePromise({ success: true, componentPath: opts.outputPath })
          } else {
            resolvePromise({
              success: false,
              componentPath: opts.outputPath,
              error: 'Componente gerado mas falhou na validação básica',
            })
          }
          return
        }

        // Fallback: Claude pode ter retornado o código no stdout
        const code = extractTsxFromOutput(stdout)
        if (code) {
          writeFileSync(opts.outputPath, code)
          console.log(
            `[director] Componente extraído do stdout: ${opts.outputPath} (${code.split('\n').length} linhas)`
          )
          resolvePromise({ success: true, componentPath: opts.outputPath })
        } else {
          console.error('[director] Componente não gerado — nem arquivo nem stdout válido')
          resolvePromise({
            success: false,
            componentPath: opts.outputPath,
            error: 'Componente não gerado',
          })
        }
      }
    )

    // Enviar prompt via stdin
    child.stdin?.write(prompt)
    child.stdin?.end()
  })
}

// ---------------------------------------------------------------------------
// Validação básica do componente gerado
// ---------------------------------------------------------------------------

/**
 * Validação rápida: verifica que o código tem as peças fundamentais.
 * Não substitui compilação, mas filtra lixo óbvio.
 */
function validateComponent(code: string): boolean {
  const requiredPatterns = [
    'useCurrentFrame',
    'interpolate',
    'registerRoot',
    'Composition',
    'ClipOverlay',
  ]

  for (const pattern of requiredPatterns) {
    if (!code.includes(pattern)) {
      console.warn(`[director] Validação falhou: falta '${pattern}'`)
      return false
    }
  }

  // Verificar padrões proibidos
  const forbiddenPatterns = [
    { pattern: 'css-transition', label: 'CSS transition' },
    { pattern: 'animation-name', label: 'CSS animation-name' },
    { pattern: 'animate-', label: 'Tailwind animate class' },
    { pattern: 'useState', label: 'useState hook' },
    { pattern: 'useEffect', label: 'useEffect hook' },
  ]

  for (const { pattern, label } of forbiddenPatterns) {
    if (code.includes(pattern)) {
      console.warn(`[director] Validação falhou: encontrou padrão proibido '${label}'`)
      return false
    }
  }

  return true
}

/**
 * Tenta extrair código .tsx do stdout do Claude Code.
 * O Claude pode retornar o código envolvido em markdown fences ou direto.
 */
function extractTsxFromOutput(stdout: string): string | null {
  const trimmed = stdout.trim()

  // Se o stdout inteiro parece código TSX válido
  if (trimmed.includes('useCurrentFrame') && trimmed.includes('registerRoot')) {
    // Remover fences de markdown se presentes
    const withoutFences = trimmed
      .replace(/^```(?:tsx|typescript|ts)?\n?/m, '')
      .replace(/\n?```\s*$/m, '')
      .trim()

    if (validateComponent(withoutFences)) {
      return withoutFences
    }
  }

  // Tentar extrair bloco de código de dentro de markdown
  const codeBlockMatch = trimmed.match(/```(?:tsx|typescript|ts)?\n([\s\S]+?)```/)
  if (codeBlockMatch) {
    const extracted = codeBlockMatch[1].trim()
    if (validateComponent(extracted)) {
      return extracted
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Retry wrapper
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 2

/**
 * Gera overlay com retry (máximo 2 tentativas).
 * Retorna o path do componente gerado ou null se falhar.
 * Pipeline pode usar fallback genérico quando retorna null.
 */
export async function generateOverlayWithRetry(opts: {
  clipId: string
  transcript: string
  context: string
  outputDir: string
}): Promise<string | null> {
  const outputPath = resolve(opts.outputDir, `Clip${opts.clipId}Overlay.tsx`)

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(
      `[director] Gerando componente clip ${opts.clipId} (tentativa ${attempt}/${MAX_ATTEMPTS})...`
    )

    const result = await generateOverlay({
      clipId: opts.clipId,
      transcript: opts.transcript,
      context: opts.context,
      outputPath,
    })

    if (result.success) {
      console.log(`[director] Clip ${opts.clipId} — componente pronto: ${result.componentPath}`)
      return result.componentPath
    }

    console.warn(`[director] Tentativa ${attempt} falhou: ${result.error}`)
  }

  console.error(`[director] Clip ${opts.clipId} — esgotou tentativas, retornando null (fallback)`)
  return null
}
