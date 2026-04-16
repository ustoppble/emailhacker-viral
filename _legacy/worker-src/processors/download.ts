import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'

const exec = promisify(execFile)

/**
 * Baixa vídeo do YouTube via yt-dlp
 */
export async function downloadVideo(videoId: string, jobDir: string): Promise<string> {
  const outputPath = join(jobDir, 'source.mp4')
  const url = `https://www.youtube.com/watch?v=${videoId}`

  console.log(`[download] Baixando ${videoId}...`)

  await exec('yt-dlp', [
    '-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]',
    '--merge-output-format', 'mp4',
    '-o', outputPath,
    url,
  ], { maxBuffer: 50 * 1024 * 1024, timeout: 30 * 60 * 1000 }) // 30 min timeout

  console.log(`[download] Salvo em ${outputPath}`)
  return outputPath
}
