import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { ffmpeg } from '../../shared/lib/ffmpeg.js'

/**
 * Compõe o vídeo final: overlay Remotion em cima + face crop embaixo.
 * Layout: 1080x1920 (9:16 vertical) — metade superior overlay, metade inferior rosto.
 */
export async function composeVideo(opts: {
  overlayPath: string   // overlay.mp4 (1080x960) — motion design do DIRECTOR
  facePath: string      // face.mp4 (1080x960) — webcam cropada
  outputPath: string    // final.mp4 (1080x1920)
}): Promise<string> {
  const { overlayPath, facePath, outputPath } = opts

  if (!existsSync(overlayPath)) {
    throw new Error(`Overlay não encontrado: ${overlayPath}`)
  }
  if (!existsSync(facePath)) {
    throw new Error(`Face não encontrado: ${facePath}`)
  }

  // Garantir diretório de output
  const dir = dirname(outputPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  console.log(`[compose] ${overlayPath} + ${facePath} → ${outputPath}`)

  await ffmpeg([
    '-i', overlayPath,
    '-i', facePath,
    '-filter_complex', [
      '[0:v]scale=1080:960[top]',
      '[1:v]scale=1080:960[bottom]',
      '[top][bottom]vstack=inputs=2[v]',
    ].join(';'),
    '-map', '[v]',
    '-map', '1:a?',                    // áudio do face (voz do streamer)
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-r', '30',
    '-y', outputPath,
  ])

  if (!existsSync(outputPath)) {
    throw new Error('ffmpeg não gerou o arquivo final')
  }

  console.log(`[compose] Final pronto: ${outputPath}`)
  return outputPath
}
