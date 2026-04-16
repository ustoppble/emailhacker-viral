import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const exec = promisify(execFile)

/**
 * Renderiza um .tsx gerado pelo DIRECTOR usando Remotion CLI puro.
 * O .tsx é auto-contido (registerRoot + Composition + componente).
 * Remotion não tem código custom — é só o runtime.
 */
export async function renderOverlay(opts: {
  componentPath: string   // path do .tsx gerado pelo DIRECTOR
  outputPath: string      // onde salvar o overlay.mp4
  compositionId?: string  // default: 'Overlay' (o DIRECTOR gera com esse id)
}): Promise<string> {
  const { componentPath, outputPath, compositionId = 'Overlay' } = opts

  if (!existsSync(componentPath)) {
    throw new Error(`Componente não encontrado: ${componentPath}`)
  }

  // Garantir que o diretório de saída existe
  const outDir = dirname(outputPath)
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
  }

  console.log(`[render] Renderizando ${componentPath} → ${outputPath}`)
  const startTime = Date.now()

  // Resolver o binário do Remotion — preferir local, fallback pra npx
  const localBin = resolve(process.cwd(), 'node_modules', '.bin', 'remotion')
  const useNpx = !existsSync(localBin)
  const bin = useNpx ? 'npx' : localBin

  const remotionArgs = [
    'render',
    componentPath,
    compositionId,
    outputPath,
    '--codec', 'h264',
    '--concurrency', '1',          // VPS 4GB RAM — 1 thread
    '--gl', 'angle-egl',           // headless rendering
    '--log', 'warning',            // menos output
  ]

  // Se estiver usando npx, prefixar com 'remotion'
  const args = useNpx ? ['remotion', ...remotionArgs] : remotionArgs

  // Se estiver na VPS, usar o Chromium do sistema
  const env = { ...process.env }
  if (existsSync('/usr/bin/chromium-browser')) {
    env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium-browser'
  } else if (existsSync('/usr/bin/chromium')) {
    env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium'
  }

  try {
    const { stdout, stderr } = await exec(bin, args, {
      timeout: 300_000,           // 5 min timeout
      maxBuffer: 50 * 1024 * 1024,
      env,
      cwd: process.cwd(),        // renderer/ — onde node_modules está
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
