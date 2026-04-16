/**
 * CLI para processar uma live manualmente
 * Uso: npx tsx src/cli.ts <youtube-url-ou-id>
 */

const input = process.argv[2]

if (!input) {
  console.error('Uso: npx tsx src/cli.ts <youtube-url-ou-id>')
  process.exit(1)
}

// Extrair video ID
const videoId = input.includes('youtube.com') || input.includes('youtu.be')
  ? new URL(input).searchParams.get('v') || input.split('/').pop() || ''
  : input

console.log(`[video-worker] Processando live: ${videoId}`)
console.log('[video-worker] TODO: implementar pipeline completo')
