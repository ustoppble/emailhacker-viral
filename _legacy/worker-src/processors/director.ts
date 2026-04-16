import { execFile } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Caminho das skills Remotion — ajustar conforme ambiente.
 * Local: .agents/skills/remotion-best-practices (relativo ao repo raiz)
 * VPS: /root/.claude/skills/remotion-best-practices
 */
function getSkillsPath(): string {
  const local = resolve(process.cwd(), '..', '.agents/skills/remotion-best-practices')
  const vps = '/root/.claude/skills/remotion-best-practices'
  if (existsSync(local)) return local
  if (existsSync(vps)) return vps
  return local // fallback
}

/**
 * DIRECTOR v5 — Gera componente Remotion sob medida via Claude Code + skills.
 *
 * O Claude Code roda localmente na VPS com OAuth (custo zero de API).
 * A skill remotion-best-practices é invocada automaticamente.
 */
export async function generateOverlayComponent(opts: {
  clipId: string
  transcript: string
  context: string
  outputPath: string
}): Promise<{ success: boolean; componentPath: string; error?: string }> {

  const SKILLS_PATH = getSkillsPath()

  const prompt = `Você é um SENIOR MOTION DESIGNER. Invoque a skill remotion-best-practices lendo as rules em ${SKILLS_PATH}/rules/.

Leia OBRIGATORIAMENTE antes de escrever código:
- ${SKILLS_PATH}/rules/animations.md
- ${SKILLS_PATH}/rules/timing.md
- ${SKILLS_PATH}/rules/text-animations.md
- ${SKILLS_PATH}/rules/transitions.md
- ${SKILLS_PATH}/rules/sequencing.md

Depois, CRIE um componente React/Remotion ÚNICO pra este clip.

O componente deve MOSTRAR visualmente o que está acontecendo na tela do programador — NÃO é legenda da fala.

CONTEXTO DO CLIP:
${opts.context}

TRANSCRIPT (pra sincronizar animações):
${opts.transcript}

REGRAS:
- export const ClipOverlay: React.FC = () => { ... }
- Área: 1080x960px, fps=30, 60 segundos (1800 frames)
- useCurrentFrame() + interpolate() com extrapolateRight: 'clamp'
- spring() pra TODAS as entradas
- <Sequence> pra organizar fases temporais
- PREENCHER 90%+ da tela. Textos mínimo 48px. Impacto mínimo 72px.
- Cores: #ef4444 (accent), #e5e5e5 (texto), #22c55e (sucesso)
- PROIBIDO: CSS transitions, assets externos, useState
- Seguir TODAS as rules do remotion-best-practices

Escreva o arquivo .tsx completo em ${opts.outputPath}. APENAS o arquivo, sem explicação.`

  return new Promise((resolve_p) => {
    const child = execFile('claude', [
      '--print',
      '--model', 'sonnet',
      '--allowedTools', 'Read,Write',
    ], {
      timeout: 120_000,
      maxBuffer: 1024 * 1024,
    }, (err, stdout, stderr) => {
      if (err) {
        console.error(`[director] Erro: ${err.message}`)
        resolve_p({ success: false, componentPath: opts.outputPath, error: err.message })
        return
      }

      // Verificar se o arquivo foi criado
      if (existsSync(opts.outputPath)) {
        const code = readFileSync(opts.outputPath, 'utf-8')
        console.log(`[director] Componente gerado: ${opts.outputPath} (${code.split('\n').length} linhas)`)
        resolve_p({ success: true, componentPath: opts.outputPath })
      } else {
        // Claude pode ter retornado o código no stdout em vez de escrever
        const code = stdout.trim()
        if (code.includes('useCurrentFrame') && code.includes('export')) {
          writeFileSync(opts.outputPath, code)
          console.log(`[director] Componente extraído do stdout: ${opts.outputPath}`)
          resolve_p({ success: true, componentPath: opts.outputPath })
        } else {
          resolve_p({ success: false, componentPath: opts.outputPath, error: 'Componente não gerado' })
        }
      }
    })

    // Enviar prompt via stdin
    child.stdin?.write(prompt)
    child.stdin?.end()
  })
}

/**
 * Gera componente com retry (max 2 tentativas).
 * Se falhar, retorna null (o pipeline usa fallback genérico).
 */
export async function generateOverlayWithRetry(opts: {
  clipId: string
  transcript: string
  context: string
  outputDir: string
}): Promise<string | null> {
  const outputPath = resolve(opts.outputDir, `Clip${opts.clipId}Overlay.tsx`)

  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`[director] Gerando componente clip ${opts.clipId} (tentativa ${attempt})...`)
    const result = await generateOverlayComponent({
      ...opts,
      outputPath,
    })

    if (result.success) return result.componentPath

    console.warn(`[director] Tentativa ${attempt} falhou: ${result.error}`)
  }

  console.error(`[director] Clip ${opts.clipId} — fallback genérico`)
  return null
}
