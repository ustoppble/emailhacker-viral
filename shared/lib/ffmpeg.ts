import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

/**
 * Wrapper tipado pro ffmpeg CLI
 */
export async function ffmpeg(args: string[]): Promise<string> {
  console.log(`[ffmpeg] ${args.join(' ').substring(0, 120)}...`)
  const { stdout, stderr } = await exec('ffmpeg', args, {
    maxBuffer: 10 * 1024 * 1024,
  })
  return stderr || stdout // ffmpeg escreve no stderr
}

/**
 * Pega duração de um vídeo em segundos
 */
export async function getDuration(filePath: string): Promise<number> {
  const { stdout } = await exec('ffprobe', [
    '-v', 'quiet',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    filePath,
  ])
  return parseFloat(stdout.trim())
}
