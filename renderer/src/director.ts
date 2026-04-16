import { execFile } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import type { ClipData } from './components/SceneData'

/**
 * DIRECTOR v7 — Híbrido
 *
 * Abordagem: gerar JSON de cenas (80% dos casos) ou .tsx custom (20%).
 *
 * Fluxo padrão (template):
 *   1. Claude Haiku analisa transcript + contexto
 *   2. Retorna JSON com cenas (prompt, response, diff, terminal, etc)
 *   3. ClipTemplate.tsx renderiza usando biblioteca de componentes
 *
 * Fluxo custom (fallback):
 *   1. Claude Code CLI gera .tsx completo (comportamento antigo)
 *   2. Usado quando o contexto pede algo visual único
 *
 * Ambos usam o design system EmailHacker (tokens.ts).
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSkillsPath(): string {
  const paths = [
    resolve(process.cwd(), '..', '.agents/skills/remotion-best-practices'),
    resolve(process.cwd(), '..', '.claude/skills/remotion-best-practices'),
    '/root/.claude/skills/remotion-best-practices',
  ]
  for (const p of paths) {
    if (existsSync(p)) return p
  }
  return paths[0]
}

/** Path do ClipTemplate.tsx (composição fixa com componentes) */
function getTemplatePath(): string {
  const paths = [
    resolve(process.cwd(), 'src', 'ClipTemplate.tsx'),
    resolve(__dirname, 'ClipTemplate.tsx'),
  ]
  for (const p of paths) {
    if (existsSync(p)) return p
  }
  return paths[0]
}

// ---------------------------------------------------------------------------
// Prompt para geração de JSON de cenas
// ---------------------------------------------------------------------------

function buildScenePrompt(opts: { transcript: string; context: string }): string {
  return `Você é um DIRECTOR de motion design para YouTube Shorts. Analise o contexto e transcript abaixo e crie uma sequência de cenas que mostre visualmente o que está acontecendo.

CONTEXTO: ${opts.context}
TRANSCRIPT: ${opts.transcript}

Retorne APENAS um JSON válido com o formato abaixo. Sem explicação, sem markdown.

{
  "windowTitle": "nome do projeto",
  "branch": "claude/feature-name",
  "model": "Opus 4.6",
  "statusItems": ["Local", "main"],
  "scenes": [
    // CENA TIPO 1: Prompt (usuário digitando)
    { "type": "prompt", "text": "o que o usuário está fazendo/pedindo" },

    // CENA TIPO 2: Resposta com tool calls
    { "type": "response", "text": "resumo da resposta do Claude", "toolCalls": [
      { "type": "Write", "file": "arquivo.ts", "added": 127 },
      { "type": "Edit", "file": "outro.ts", "added": 5, "removed": 2 }
    ]},

    // CENA TIPO 3: Diff de código
    { "type": "diff", "file": "arquivo.ts", "branch": "claude/feature", "added": 85, "removed": 12, "lines": [
      { "type": "add", "text": "const result = await process()", "lineNumber": 42 },
      { "type": "remove", "text": "// TODO: implementar", "lineNumber": 41 }
    ]},

    // CENA TIPO 4: Terminal
    { "type": "terminal", "title": "Terminal", "lines": [
      { "type": "command", "text": "npm run build" },
      { "type": "success", "text": "Build completed in 2.3s" }
    ]},

    // CENA TIPO 5: Tabela de dados
    { "type": "table", "headers": ["campo", "valor"], "rows": [["status", "ativo"]] },

    // CENA TIPO 6: Texto hero (momentos de impacto)
    { "type": "text", "title": "Título impactante", "subtitle": "detalhe" }
  ]
}

REGRAS:
- Use 3-5 cenas por clip (nem mais, nem menos)
- Comece com prompt ou text (hook visual)
- Mostre o que está ACONTECENDO, não a fala
- Tool calls devem ser realistas (Write, Edit, Read, Bash, Agent)
- Código no diff deve ser plausível pro contexto
- Terminal mostra comandos reais sendo executados
- Termine com algo visual forte (diff, terminal com sucesso, ou text de impacto)
- windowTitle deve refletir o projeto sendo discutido
- branch deve ter formato claude/nome-descritivo`
}

// ---------------------------------------------------------------------------
// Prompt para geração de TSX custom (fallback 20%)
// ---------------------------------------------------------------------------

function buildCustomPrompt(opts: {
  transcript: string
  context: string
  outputPath: string
  skillsPath: string
}): string {
  return `Você é um SENIOR MOTION DESIGNER. Crie um componente Remotion único pra este clip.

ANTES DE ESCREVER CÓDIGO, leia estas rules obrigatórias:
- ${opts.skillsPath}/rules/animations.md
- ${opts.skillsPath}/rules/timing.md
- ${opts.skillsPath}/rules/text-animations.md
- ${opts.skillsPath}/rules/sequencing.md

CONTEXTO: ${opts.context}
TRANSCRIPT: ${opts.transcript}

REGRAS DO COMPONENTE:
- Canvas 1080x960, 30fps. Calcule TOTAL_FRAMES (~3 palavras/segundo).
- Imports de 'remotion' e 'react'. Componente ClipOverlay: React.FC.
- useCurrentFrame() + interpolate(frame, [...], [...], {extrapolateRight:'clamp'})
- spring({frame, fps, config:{damping:12}}) pra entradas
- <Sequence from={f} durationInFrames={d}> pra organizar fases
- Motion design que MOSTRA visualmente o contexto — NÃO é legenda
- Cores: accent #ef4444, text #e5e5e5, success #16a34a, bg #0a0a0a
- Font: monospace (SF Mono, Fira Code, JetBrains Mono)
- Textos mínimo 48px. Preencher 90%+ da tela.
- PROIBIDO: CSS transitions, useState, useEffect, assets externos
- Última linha: registerRoot com Composition id="Overlay" width=1080 height=960 fps=30

Escreva o arquivo completo em ${opts.outputPath}. APENAS código TSX.`
}

// ---------------------------------------------------------------------------
// Core: gera overlay via template (JSON) — 80% dos casos
// ---------------------------------------------------------------------------

export async function generateOverlayFromTemplate(opts: {
  clipId: string
  transcript: string
  context: string
  outputDir: string
}): Promise<{ success: boolean; templatePath: string; propsPath: string; error?: string }> {
  const propsPath = resolve(opts.outputDir, `clip-${opts.clipId}-props.json`)
  const templatePath = getTemplatePath()

  // Garantir diretório
  const dir = dirname(propsPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  console.log(`[director] Gerando cenas via Haiku pra clip ${opts.clipId}...`)

  const prompt = buildScenePrompt({
    transcript: opts.transcript,
    context: opts.context,
  })

  return new Promise((resolvePromise) => {
    const child = execFile(
      'claude',
      ['--print', '--model', 'sonnet'],
      { timeout: 120_000, maxBuffer: 1024 * 1024 },
      (err, stdout) => {
        if (err) {
          console.error(`[director] Erro Haiku: ${err.message}`)
          resolvePromise({ success: false, templatePath, propsPath, error: err.message })
          return
        }

        // Extrair JSON da resposta
        const clipData = extractJson(stdout)
        if (!clipData) {
          console.error('[director] Haiku não retornou JSON válido')
          resolvePromise({ success: false, templatePath, propsPath, error: 'JSON inválido' })
          return
        }

        // Validar estrutura mínima
        if (!clipData.scenes || !Array.isArray(clipData.scenes) || clipData.scenes.length === 0) {
          console.error('[director] JSON sem scenes válidas')
          resolvePromise({ success: false, templatePath, propsPath, error: 'Sem scenes' })
          return
        }

        // Salvar props JSON
        writeFileSync(propsPath, JSON.stringify(clipData, null, 2))
        console.log(`[director] ${clipData.scenes.length} cenas geradas → ${propsPath}`)

        resolvePromise({ success: true, templatePath, propsPath })
      }
    )

    child.stdin?.write(prompt)
    child.stdin?.end()
  })
}

// ---------------------------------------------------------------------------
// Core: gera overlay custom via Claude Code CLI — 20% dos casos
// ---------------------------------------------------------------------------

export async function generateOverlayCustom(opts: {
  clipId: string
  transcript: string
  context: string
  outputPath: string
}): Promise<{ success: boolean; componentPath: string; error?: string }> {
  const skillsPath = getSkillsPath()
  const prompt = buildCustomPrompt({
    transcript: opts.transcript,
    context: opts.context,
    outputPath: opts.outputPath,
    skillsPath,
  })

  const dir = dirname(opts.outputPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  return new Promise((resolvePromise) => {
    console.log(`[director] Gerando TSX custom clip ${opts.clipId} via Claude Code...`)

    const child = execFile(
      'claude',
      ['--print', '--model', 'sonnet', '--allowedTools', 'Read,Write'],
      { timeout: 300_000, maxBuffer: 2 * 1024 * 1024 },
      (err, stdout) => {
        if (err) {
          resolvePromise({ success: false, componentPath: opts.outputPath, error: err.message })
          return
        }

        if (existsSync(opts.outputPath)) {
          const code = readFileSync(opts.outputPath, 'utf-8')
          if (validateComponent(code)) {
            resolvePromise({ success: true, componentPath: opts.outputPath })
            return
          }
        }

        const code = extractTsxFromOutput(stdout)
        if (code) {
          writeFileSync(opts.outputPath, code)
          resolvePromise({ success: true, componentPath: opts.outputPath })
        } else {
          resolvePromise({ success: false, componentPath: opts.outputPath, error: 'TSX não gerado' })
        }
      }
    )

    child.stdin?.write(prompt)
    child.stdin?.end()
  })
}

// ---------------------------------------------------------------------------
// Orchestrator: tenta template primeiro, fallback pra custom
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 2

export async function generateOverlayWithRetry(opts: {
  clipId: string
  transcript: string
  context: string
  outputDir: string
}): Promise<{ componentPath: string; propsPath?: string } | null> {

  // Tentativa 1: Template (JSON + componentes prontos)
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[director] Template — tentativa ${attempt}/${MAX_ATTEMPTS} clip ${opts.clipId}`)

    const result = await generateOverlayFromTemplate(opts)

    if (result.success) {
      console.log(`[director] Clip ${opts.clipId} — template pronto`)
      return { componentPath: result.templatePath, propsPath: result.propsPath }
    }

    console.warn(`[director] Template tentativa ${attempt} falhou: ${result.error}`)
  }

  // Tentativa 2: Custom TSX (fallback)
  console.log(`[director] Clip ${opts.clipId} — tentando geração custom...`)
  const customPath = resolve(opts.outputDir, `Clip${opts.clipId}Overlay.tsx`)

  const customResult = await generateOverlayCustom({
    clipId: opts.clipId,
    transcript: opts.transcript,
    context: opts.context,
    outputPath: customPath,
  })

  if (customResult.success) {
    console.log(`[director] Clip ${opts.clipId} — custom TSX gerado`)
    return { componentPath: customResult.componentPath }
  }

  console.error(`[director] Clip ${opts.clipId} — todas as tentativas falharam`)
  return null
}

// ---------------------------------------------------------------------------
// Helpers de parsing e validação
// ---------------------------------------------------------------------------

function extractJson(text: string): ClipData | null {
  const trimmed = text.trim()

  // Tentar parse direto
  try {
    return JSON.parse(trimmed)
  } catch {}

  // Extrair JSON de markdown fences
  const fenceMatch = trimmed.match(/```(?:json)?\n?([\s\S]+?)```/)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {}
  }

  // Extrair primeiro objeto JSON do texto
  const objMatch = trimmed.match(/\{[\s\S]*\}/)
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0])
    } catch {}
  }

  return null
}

function validateComponent(code: string): boolean {
  const required = ['useCurrentFrame', 'interpolate', 'registerRoot', 'Composition', 'ClipOverlay']
  for (const r of required) {
    if (!code.includes(r)) return false
  }
  const forbidden = ['css-transition', 'animation-name', 'animate-', 'useState', 'useEffect']
  for (const f of forbidden) {
    if (code.includes(f)) return false
  }
  return true
}

function extractTsxFromOutput(stdout: string): string | null {
  const trimmed = stdout.trim()

  if (trimmed.includes('useCurrentFrame') && trimmed.includes('registerRoot')) {
    const clean = trimmed.replace(/^```(?:tsx|typescript|ts)?\n?/m, '').replace(/\n?```\s*$/m, '').trim()
    if (validateComponent(clean)) return clean
  }

  const match = trimmed.match(/```(?:tsx|typescript|ts)?\n([\s\S]+?)```/)
  if (match) {
    const extracted = match[1].trim()
    if (validateComponent(extracted)) return extracted
  }

  return null
}
