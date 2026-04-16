import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const exec = promisify(execFile)

/**
 * Renderiza um overlay usando Remotion CLI.
 *
 * Dois modos:
 * 1. Template + props: ClipTemplate.tsx + clip-props.json (DIRECTOR v7 padrão)
 * 2. Standalone: .tsx auto-contido (DIRECTOR v7 custom fallback)
 */
export async function renderOverlay(opts: {
  componentPath: string
  outputPath: string
  propsPath?: string
  compositionId?: string
}): Promise<string> {
  const { componentPath, outputPath, propsPath, compositionId = 'Overlay' } = opts

  if (!existsSync(componentPath)) {
    throw new Error(`Componente não encontrado: ${componentPath}`)
  }

  const outDir = dirname(outputPath)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  console.log(`[render] Renderizando ${componentPath} → ${outputPath}`)
  if (propsPath) console.log(`[render] Props: ${propsPath}`)
  const startTime = Date.now()

  // Resolver binário do Remotion
  const localBin = resolve(process.cwd(), 'node_modules', '.bin', 'remotion')
  const useNpx = !existsSync(localBin)
  const bin = useNpx ? 'npx' : localBin

  const remotionArgs = [
    'render',
    componentPath,
    compositionId,
    outputPath,
    '--codec', 'h264',
    '--concurrency', '1',
    '--gl', 'angle-egl',
    '--log', 'warn',
  ]

  // Se tem props JSON, passar via --props
  if (propsPath && existsSync(propsPath)) {
    remotionArgs.push('--props', propsPath)
  }

  const args = useNpx ? ['remotion', ...remotionArgs] : remotionArgs

  // Chromium da VPS
  const env = { ...process.env }
  if (existsSync('/usr/bin/chromium-browser')) {
    env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium-browser'
  } else if (existsSync('/usr/bin/chromium')) {
    env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium'
  }

  try {
    const { stderr } = await exec(bin, args, {
      timeout: 300_000,
      maxBuffer: 50 * 1024 * 1024,
      env,
      cwd: process.cwd(),
    })

    if (stderr) console.log(`[render] ${stderr.trim().substring(0, 200)}`)

    if (!existsSync(outputPath)) {
      throw new Error('Remotion não gerou o arquivo de saída')
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[render] Concluído em ${elapsed}s: ${outputPath}`)
    return outputPath
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const msg = (err as Error).message
    console.error(`[render] Falhou após ${elapsed}s: ${msg.substring(0, 300)}`)
    throw err
  }
}
