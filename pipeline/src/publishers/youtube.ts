import { readFileSync, writeFileSync, createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { google } from 'googleapis'
import { config } from '../config.js'
import type { PublishResult } from '../../../shared/types/job.js'

/**
 * Publica um vídeo como YouTube Short.
 * Requer: googleapis instalado, token OAuth salvo em disco.
 */
export async function publishToYouTube(opts: {
  videoPath: string
  title: string
  description: string
  tags?: string[]
}): Promise<PublishResult> {
  const { clientId, clientSecret, tokenFile } = config.youtube

  if (!clientId || !clientSecret) {
    throw new Error('YOUTUBE_CLIENT_ID ou YOUTUBE_CLIENT_SECRET não configurados')
  }

  const tokenPath = resolve(process.cwd(), tokenFile)
  if (!existsSync(tokenPath)) {
    throw new Error(`Token não encontrado: ${tokenPath}`)
  }

  if (!existsSync(opts.videoPath)) {
    throw new Error(`Vídeo não encontrado: ${opts.videoPath}`)
  }

  const token = JSON.parse(readFileSync(tokenPath, 'utf-8'))
  const oauth = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3456')
  oauth.setCredentials(token)

  // Salvar token renovado automaticamente
  oauth.on('tokens', (newTokens) => {
    console.log('[youtube] Token renovado')
    writeFileSync(tokenPath, JSON.stringify({ ...token, ...newTokens }, null, 2))
  })

  // Garantir #shorts no título
  let title = opts.title
  if (!title.toLowerCase().includes('#shorts')) {
    title = `${title} #shorts`
  }

  const yt = google.youtube({ version: 'v3', auth: oauth })

  console.log(`[youtube] Enviando "${title.substring(0, 50)}..."`)

  const res = await yt.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description: opts.description,
        tags: opts.tags || ['shorts'],
        categoryId: '28', // Ciência & Tecnologia
        defaultLanguage: 'pt',
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: createReadStream(opts.videoPath),
    },
  })

  const videoId = res.data.id!
  const url = `https://youtube.com/shorts/${videoId}`

  console.log(`[youtube] Publicado: ${url}`)

  return {
    platform: 'youtube',
    url,
    publishedAt: new Date().toISOString(),
  }
}
