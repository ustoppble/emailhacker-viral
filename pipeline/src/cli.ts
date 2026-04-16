import { readFileSync } from 'node:fs'
import { processLive } from './pipeline.js'

/**
 * CLI para rodar a pipeline manualmente.
 *
 * Uso:
 *   npx tsx src/cli.ts <video-id> [transcript-file]
 *
 * Exemplos:
 *   npx tsx src/cli.ts dQw4w9WgXcQ transcript.txt
 *   npx tsx src/cli.ts dQw4w9WgXcQ                  # sem transcript — usa placeholder
 */

const videoId = process.argv[2]
const transcriptFile = process.argv[3]

if (!videoId) {
  console.error('Uso: npx tsx src/cli.ts <video-id> [transcript-file]')
  console.error('')
  console.error('  video-id         ID do vídeo YouTube (ex: dQw4w9WgXcQ)')
  console.error('  transcript-file  Arquivo .txt com a transcrição (opcional)')
  process.exit(1)
}

let transcript: string

if (transcriptFile) {
  try {
    transcript = readFileSync(transcriptFile, 'utf-8')
    console.log(`[cli] Transcript carregado de ${transcriptFile} (${transcript.length} chars)`)
  } catch (err) {
    console.error(`[cli] Erro ao ler arquivo de transcript: ${(err as Error).message}`)
    process.exit(1)
  }
} else {
  transcript = '[Transcript não fornecido — a análise usará o conteúdo do vídeo como contexto genérico]'
  console.log('[cli] Nenhum transcript fornecido — usando placeholder')
}

console.log(`[cli] Iniciando pipeline para vídeo ${videoId}...`)

processLive(videoId, transcript)
  .then(() => {
    console.log('[cli] Pipeline concluída com sucesso!')
    process.exit(0)
  })
  .catch((err) => {
    console.error(`[cli] Pipeline falhou: ${(err as Error).message}`)
    process.exit(1)
  })
