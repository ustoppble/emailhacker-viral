#!/usr/bin/env npx tsx
/**
 * Teste manual de publicação.
 *
 * Uso:
 *   npx tsx src/test-publish.ts youtube /path/to/video.mp4
 *   npx tsx src/test-publish.ts instagram /path/to/video.mp4
 *   npx tsx src/test-publish.ts all /path/to/video.mp4
 */

import { publishToYouTube } from './publishers/youtube.js'
import { publishToInstagram } from './publishers/instagram.js'

const [platform, videoPath] = process.argv.slice(2)

if (!platform || !videoPath) {
  console.error('Uso: npx tsx src/test-publish.ts <youtube|instagram|all> <video.mp4>')
  process.exit(1)
}

const title = 'IA Virou Motion Designer — Claude Gera Vídeo Pronto em 2 Min'
const description = `Dia 8 do build-in-public: Claude Code + Remotion gerando um vídeo promocional COMPLETO automaticamente.

5 cenas, 774 frames renderizados em ~2 minutos. O futuro do design já chegou.

https://emailhacker.ai

#shorts #EmailHacker #IA #Remotion #BuildInPublic #Coding`

const caption = `Claude Code acaba de virar motion designer. Vídeo promo inteiro em 2 minutos.

Remotion + IA = future proof

#BuildInPublic #IA #Remotion #EmailMarketing #Coding #MotionDesign #AI #DevTools #Automação`

const tags = ['shorts', 'EmailHacker', 'IA', 'Remotion', 'BuildInPublic', 'Coding', 'MotionDesign']

async function run() {
  const results = []

  if (platform === 'youtube' || platform === 'all') {
    console.log('\n=== YouTube Shorts ===')
    try {
      const r = await publishToYouTube({ videoPath, title, description, tags })
      console.log('Resultado:', r)
      results.push(r)
    } catch (e) {
      console.error('YouTube falhou:', (e as Error).message)
    }
  }

  if (platform === 'instagram' || platform === 'all') {
    console.log('\n=== Instagram Reels ===')
    // Se tiver --video-url, usa direto (pula R2)
    const videoUrlArg = process.argv.find(a => a.startsWith('--video-url='))?.split('=')[1]
    try {
      const r = await publishToInstagram({ videoPath, caption, videoUrl: videoUrlArg })
      console.log('Resultado:', r)
      results.push(r)
    } catch (e) {
      console.error('Instagram falhou:', (e as Error).message)
    }
  }

  console.log('\n=== Resumo ===')
  for (const r of results) {
    console.log(`  ${r.platform}: ${r.url}`)
  }
}

run().catch(console.error)
