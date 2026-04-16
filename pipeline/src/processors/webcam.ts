import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { ffmpeg } from '../../../shared/lib/ffmpeg.js'

/**
 * Crop fixo calibrado pro setup do streamer.
 * Webcam no canto inferior esquerdo do frame 1920x1080:
 *   crop=300:267:70:760 → recorta a região do rosto
 *   scale=1080:960      → escala pra metade inferior do vertical (1080x1920)
 */
const WEBCAM_CROP = 'crop=300:267:70:760,scale=1080:960:flags=lanczos'

/**
 * Extrai e escala a região da webcam do clip.
 * Output: 1080x960 (metade inferior do layout vertical).
 */
export async function cropWebcam(
  inputPath: string,
  outputPath: string
): Promise<string> {
  mkdirSync(dirname(outputPath), { recursive: true })

  await ffmpeg([
    '-i', inputPath,
    '-vf', WEBCAM_CROP,
    '-c:a', 'copy',
    '-y', outputPath,
  ])

  console.log(`[webcam] Crop concluído → ${outputPath}`)
  return outputPath
}
