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
  const { transcript, context } = opts

  return `Gere um componente Remotion .tsx completo e auto-contido. Apenas código, sem explicação.

CONTEXTO: ${context}
TRANSCRIPT: ${transcript}

Regras:
- Canvas 1080x960, 30fps. Calcule TOTAL_FRAMES (~3 palavras/segundo do transcript).
- Imports de 'remotion' e 'react'. Componente ClipOverlay: React.FC.
- useCurrentFrame() + interpolate(frame, [...], [...], {extrapolateRight:'clamp'}) pra tudo.
- spring({frame, fps, config:{damping:12}}) pra entradas.
- <Sequence from={f} durationInFrames={d}> pra organizar fases.
- Motion design que MOSTRA visualmente o contexto (editor, terminal, gráficos) — NÃO é legenda.
- Captions no bottom 120px: palavras do transcript, ativa em #facc15, rest #e5e5e5, monospace 44px bold.
- Cores: accent #ef4444, text #e5e5e5, success #22c55e, bg #0a0a0a.
- Textos mínimo 48px. Preencher 90%+ da tela.
- PROIBIDO: CSS transitions, useState, useEffect, assets externos.
- Última linha: registerRoot com Composition id="Overlay" width=1080 height=960 fps=30.

Retorne APENAS código TSX. Comece com import, termine com registerRoot.`
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
        '--model', 'haiku',
      ],
      {
        timeout: 300_000,
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
