import { join } from 'node:path'
import { ffmpeg } from '../lib/ffmpeg.js'
import type { Segment } from '../types/job.js'

/**
 * Compõe o vídeo final: overlay Remotion em cima + face crop embaixo
 * Layout: 1080x1920 (9:16) — metade superior overlay, metade inferior rosto
 */
export async function composeVideo(
  segment: Segment,
  jobDir: string
): Promise<string> {
  const overlayPath = join(jobDir, 'renders', `${segment.index}_overlay.mp4`)
  const facePath = join(jobDir, 'clips', `${segment.index}_face.mp4`)
  const outputPath = join(jobDir, 'output', `${segment.index}_final.mp4`)

  await ffmpeg([
    '-i', overlayPath,
    '-i', facePath,
    '-filter_complex', [
      '[0:v]scale=1080:960[top]',
      '[1:v]scale=1080:960[bottom]',
      '[top][bottom]vstack=inputs=2[v]',
    ].join(';'),
    '-map', '[v]',
    '-map', '1:a?',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-r', '30',
    '-y', outputPath,
  ])

  console.log(`[compose] Final: ${outputPath}`)
  return outputPath
}
