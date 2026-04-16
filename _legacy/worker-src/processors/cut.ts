import { join } from 'node:path'
import { ffmpeg } from '../lib/ffmpeg.js'
import type { Segment } from '../types/job.js'

/**
 * Corta um trecho do vídeo fonte e faz crop da região do rosto
 */
export async function cutSegment(
  sourcePath: string,
  segment: Segment,
  jobDir: string
): Promise<{ rawPath: string; facePath: string }> {
  const rawPath = join(jobDir, 'clips', `${segment.index}_raw.mp4`)
  const facePath = join(jobDir, 'clips', `${segment.index}_face.mp4`)

  const duration = segment.endTime - segment.startTime

  // Corte do trecho completo
  await ffmpeg([
    '-ss', String(segment.startTime),
    '-i', sourcePath,
    '-t', String(duration),
    '-c', 'copy',
    '-y', rawPath,
  ])

  // Crop da região do rosto (centro-superior, 1080x960 de um 1920x1080)
  // Assume câmera fixa no canto inferior direito ou centro
  await ffmpeg([
    '-i', rawPath,
    '-vf', 'crop=ih*9/16:ih:iw/2-oh/2:0,scale=1080:960',
    '-c:a', 'copy',
    '-y', facePath,
  ])

  console.log(`[cut] Segmento ${segment.index}: ${duration}s → ${rawPath}`)
  return { rawPath, facePath }
}
