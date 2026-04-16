import { statSync } from 'node:fs'
import { config } from '../config.js'
import { uploadToR2 } from './r2-upload.js'
import type { PublishResult } from '../../../shared/types/job.js'

const GRAPH_API = 'https://graph.facebook.com/v21.0'
const POLL_INTERVAL_MS = 5_000
const POLL_TIMEOUT_MS = 5 * 60_000

/**
 * Publica um vídeo como Instagram Reel via Meta Graph API.
 * Fluxo: upload R2 → criar container → poll status → publicar → confirmar.
 *
 * O token de acesso NUNCA é logado completo — apenas preview truncado se necessário.
 */
export async function publishToInstagram(opts: {
  videoPath: string
  caption: string
  coverUrl?: string
  videoUrl?: string  // URL pública direta (pula R2 upload)
}): Promise<PublishResult> {
  const { accessToken, igAccountId } = config.meta

  if (!accessToken || !igAccountId) {
    throw new Error('META_ACCESS_TOKEN ou META_IG_ACCOUNT_ID não configurados')
  }

  // Validar tamanho do arquivo
  const stat = statSync(opts.videoPath)
  if (stat.size > 1_000_000_000) {
    throw new Error(`Vídeo muito grande: ${(stat.size / 1e6).toFixed(0)}MB (máx 1GB)`)
  }

  console.log(`[instagram] Preparando publicação...`)

  // 1. Obter URL pública do vídeo (direta ou via R2)
  let videoUrl: string
  if (opts.videoUrl) {
    videoUrl = opts.videoUrl
    console.log(`[instagram] URL direta fornecida`)
  } else {
    console.log('[instagram] Fazendo upload pro R2...')
    videoUrl = await uploadToR2(opts.videoPath)
    console.log(`[instagram] Upload R2 concluído`)
  }

  // 2. Criar container de mídia
  console.log('[instagram] Criando container...')
  const createRes = await fetch(`${GRAPH_API}/${igAccountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: videoUrl,
      caption: opts.caption,
      share_to_feed: true,
      access_token: accessToken,
      ...(opts.coverUrl ? { cover_url: opts.coverUrl } : {}),
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}))
    throw new Error(`Criar container falhou (${createRes.status}): ${JSON.stringify(err).substring(0, 300)}`)
  }

  const { id: containerId } = await createRes.json() as { id: string }
  console.log(`[instagram] Container criado: ${containerId}`)

  // 3. Poll status com backoff exponencial
  const startTime = Date.now()
  let status = 'IN_PROGRESS'
  let pollInterval = POLL_INTERVAL_MS

  while (status === 'IN_PROGRESS') {
    if (Date.now() - startTime > POLL_TIMEOUT_MS) {
      throw new Error(`Timeout: container ${containerId} não ficou pronto em 5 min`)
    }

    await new Promise(r => setTimeout(r, pollInterval))
    pollInterval = Math.min(pollInterval * 1.5, 30_000) // backoff exponencial

    const pollRes = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`
    )

    // Rate limit handling — aguardar 30s e tentar novamente
    if (pollRes.status === 429) {
      console.log('[instagram] Rate limited (429), aguardando 30s...')
      await new Promise(r => setTimeout(r, 30_000))
      continue
    }

    const pollData = await pollRes.json() as { status_code: string; status?: string; error_message?: string }
    status = pollData.status_code
    console.log(`[instagram] Status: ${status} (${Math.round((Date.now() - startTime) / 1000)}s)`)
  }

  if (status === 'ERROR') {
    const errRes = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code,status,error_message&access_token=${accessToken}`
    )
    const errData = await errRes.json()
    throw new Error(`Container ${containerId} retornou ERROR: ${JSON.stringify(errData).substring(0, 300)}`)
  }

  // 4. Publicar o container
  console.log('[instagram] Publicando...')
  const publishRes = await fetch(`${GRAPH_API}/${igAccountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  })

  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({}))
    throw new Error(`Publicar falhou (${publishRes.status}): ${JSON.stringify(err).substring(0, 300)}`)
  }

  const { id: mediaId } = await publishRes.json() as { id: string }

  // 5. Confirmar publicação e obter permalink
  const confirmRes = await fetch(
    `${GRAPH_API}/${mediaId}?fields=id,permalink,timestamp&access_token=${accessToken}`
  )
  const confirmData = await confirmRes.json() as { id: string; permalink: string; timestamp: string }

  console.log(`[instagram] Publicado: ${confirmData.permalink}`)

  return {
    platform: 'instagram',
    url: confirmData.permalink,
    publishedAt: confirmData.timestamp || new Date().toISOString(),
  }
}
