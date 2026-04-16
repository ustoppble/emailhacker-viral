import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { ffmpeg } from '../../../shared/lib/ffmpeg.js'
import type { Segment } from '../../../shared/types/job.js'

/**
 * Extrai trecho do source.mp4 usando timestamps do Segment.
 * Usa -c copy (sem re-encode) para máxima velocidade.
 */
export async function cutSegment(
  sourcePath: string,
  segment: Segment,
  jobDir: string
): Promise<string> {
  const clipsDir = join(jobDir, 'clips')
  mkdirSync(clipsDir, { recursive: true })

  const outputPath = join(clipsDir, `${segment.index}_raw.mp4`)
  const duration = segment.endTime - segment.startTime

  await ffmpeg([
    '-ss', String(segment.startTime),
    '-i', sourcePath,
    '-t', String(duration),
    '-c', 'copy',
    '-y', outputPath,
  ])

  console.log(`[cut] Segmento ${segment.index}: ${duration.toFixed(1)}s → ${outputPath}`)
  return outputPath
}
