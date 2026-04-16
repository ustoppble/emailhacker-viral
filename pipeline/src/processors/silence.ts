import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ffmpeg, getDuration } from '../../../shared/lib/ffmpeg.js'

const exec = promisify(execFile)

interface SilenceInterval {
  start: number
  end: number
}

interface SilenceResult {
  originalDuration: number
  cleanDuration: number
  silenceRemoved: number // porcentagem (0-100)
}

/**
 * Detecta intervalos de silêncio usando ffmpeg silencedetect.
 * Retorna array de { start, end } em segundos.
 */
async function detectSilence(
  inputPath: string,
  noiseThreshold: string,
  minDuration: number
): Promise<SilenceInterval[]> {
  // silencedetect escreve no stderr
  const { stderr } = await exec('ffmpeg', [
    '-i', inputPath,
    '-af', `silencedetect=noise=${noiseThreshold}:d=${minDuration}`,
    '-f', 'null',
    '-',
  ], { maxBuffer: 10 * 1024 * 1024 })

  const intervals: SilenceInterval[] = []
  const lines = stderr.split('\n')

  let currentStart: number | null = null

  for (const line of lines) {
    // [silencedetect @ 0x...] silence_start: 12.345
    const startMatch = line.match(/silence_start:\s*([\d.]+)/)
    if (startMatch) {
      currentStart = parseFloat(startMatch[1])
      continue
    }

    // [silencedetect @ 0x...] silence_end: 15.678 | silence_duration: 3.333
    const endMatch = line.match(/silence_end:\s*([\d.]+)/)
    if (endMatch && currentStart !== null) {
      intervals.push({
        start: currentStart,
        end: parseFloat(endMatch[1]),
      })
      currentStart = null
    }
  }

  return intervals
}

/**
 * Gera filtro complexo que mantém apenas os trechos com áudio.
 * Inverte os intervalos de silêncio para obter os trechos "com fala".
 */
function buildConcatFilter(
  silenceIntervals: SilenceInterval[],
  totalDuration: number
): { filter: string; segmentCount: number } {
  // Inverter: silêncios → trechos com fala
  const speechSegments: { start: number; end: number }[] = []
  let cursor = 0

  for (const silence of silenceIntervals) {
    if (silence.start > cursor) {
      speechSegments.push({ start: cursor, end: silence.start })
    }
    cursor = silence.end
  }

  // Trecho final (após último silêncio)
  if (cursor < totalDuration) {
    speechSegments.push({ start: cursor, end: totalDuration })
  }

  if (speechSegments.length === 0) {
    return { filter: '', segmentCount: 0 }
  }

  // Gerar filtro complexo:
  // [0:v]trim=start=X:end=Y,setpts=PTS-STARTPTS[v0]; ...
  // [0:a]atrim=start=X:end=Y,asetpts=PTS-STARTPTS[a0]; ...
  // [v0][a0][v1][a1]...concat=n=N:v=1:a=1
  const parts: string[] = []
  const concatInputs: string[] = []

  for (let i = 0; i < speechSegments.length; i++) {
    const seg = speechSegments[i]
    parts.push(
      `[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}]`
    )
    parts.push(
      `[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`
    )
    concatInputs.push(`[v${i}][a${i}]`)
  }

  const n = speechSegments.length
  parts.push(`${concatInputs.join('')}concat=n=${n}:v=1:a=1`)

  return { filter: parts.join(';'), segmentCount: n }
}

/**
 * Remove silêncios >minDuration do clip usando ffmpeg silencedetect + filter_complex.
 *
 * Fluxo:
 * 1. Mede duração original
 * 2. Detecta intervalos de silêncio (silencedetect)
 * 3. Gera filtro complexo que concatena apenas trechos com fala
 * 4. Re-encoda o vídeo sem os gaps
 * 5. Retorna estatísticas
 */
export async function removeSilence(
  inputPath: string,
  outputPath: string,
  opts?: {
    noiseThreshold?: string  // default: '-30dB'
    minDuration?: number     // default: 2 (segundos)
  }
): Promise<SilenceResult> {
  const noiseThreshold = opts?.noiseThreshold ?? '-30dB'
  const minDuration = opts?.minDuration ?? 2

  mkdirSync(dirname(outputPath), { recursive: true })

  // 1. Duração original
  const originalDuration = await getDuration(inputPath)
  console.log(`[silence] Duração original: ${originalDuration.toFixed(1)}s`)

  // 2. Detectar silêncios
  const silenceIntervals = await detectSilence(inputPath, noiseThreshold, minDuration)
  console.log(`[silence] ${silenceIntervals.length} intervalos de silêncio detectados`)

  // Se não há silêncio, copiar direto
  if (silenceIntervals.length === 0) {
    await ffmpeg(['-i', inputPath, '-c', 'copy', '-y', outputPath])
    return {
      originalDuration,
      cleanDuration: originalDuration,
      silenceRemoved: 0,
    }
  }

  // 3. Gerar filtro de concatenação
  const { filter, segmentCount } = buildConcatFilter(silenceIntervals, originalDuration)

  if (segmentCount === 0) {
    // Vídeo inteiro é silêncio — copiar como está (caller decide o que fazer)
    console.warn(`[silence] AVISO: vídeo inteiro parece ser silêncio!`)
    await ffmpeg(['-i', inputPath, '-c', 'copy', '-y', outputPath])
    return {
      originalDuration,
      cleanDuration: originalDuration,
      silenceRemoved: 100,
    }
  }

  console.log(`[silence] ${segmentCount} trechos com fala → concatenando`)

  // 4. Re-encodar sem os gaps
  await ffmpeg([
    '-i', inputPath,
    '-filter_complex', filter,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-y', outputPath,
  ])

  // 5. Medir duração final
  const cleanDuration = await getDuration(outputPath)
  const silenceRemoved = ((originalDuration - cleanDuration) / originalDuration) * 100

  console.log(
    `[silence] ${originalDuration.toFixed(1)}s → ${cleanDuration.toFixed(1)}s ` +
    `(${silenceRemoved.toFixed(0)}% silêncio removido)`
  )

  return {
    originalDuration,
    cleanDuration,
    silenceRemoved: Math.round(silenceRemoved),
  }
}
