import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { downloadVideo } from './processors/download.js'
import { analyzeTranscript } from './processors/analyze.js'
import { cutSegment } from './processors/cut.js'
import { removeSilence } from './processors/silence.js'
import { cropWebcam } from './processors/webcam.js'
import { enqueueRender } from './queue/producer.js'
import type { Segment } from '../../shared/types/job.js'

/**
 * Orquestrador master da pipeline.
 * Recebe um video ID + transcript e executa todos os passos:
 * download -> analyze -> (cut -> silence -> webcam -> enqueue) por segmento
 */
export async function processLive(videoId: string, transcript: string): Promise<void> {
  const jobId = randomUUID().slice(0, 8)
  const jobDir = resolve(config.dataDir, 'jobs', jobId)

  // Criar diretórios de trabalho
  for (const sub of ['clips', 'renders', 'output']) {
    mkdirSync(join(jobDir, sub), { recursive: true })
  }

  console.log(`[pipeline] Job ${jobId} — processando live ${videoId}`)

  // 1. Download do vídeo completo
  console.log('[pipeline] Passo 1/6: Download...')
  const sourcePath = await downloadVideo(videoId, jobDir)

  // 2. Análise com Claude Haiku — selecionar melhores trechos
  console.log('[pipeline] Passo 2/6: Análise de transcript...')
  const segments: Segment[] = await analyzeTranscript(transcript, config.maxShortsPerLive)
  console.log(`[pipeline] ${segments.length} trechos selecionados`)

  // 3-6. Para cada segmento: cut -> silence -> webcam -> enqueue render
  console.log('[pipeline] Passos 3-6: Corte + Silence + Webcam + Enfileirar...')

  for (const segment of segments) {
    const idx = String(segment.index).padStart(2, '0')

    // 3. Cortar trecho do source
    const rawPath = await cutSegment(sourcePath, segment, jobDir)

    // 4. Remover silêncios longos
    const cleanPath = join(jobDir, 'clips', `${idx}_clean.mp4`)
    const silenceResult = await removeSilence(rawPath, cleanPath)
    console.log(`[pipeline] Clip ${idx}: ${silenceResult.silenceRemoved.toFixed(0)}% silêncio removido`)

    // 5. Crop da webcam (rosto do streamer)
    const facePath = join(jobDir, 'clips', `${idx}_face.mp4`)
    await cropWebcam(cleanPath, facePath)

    // 6. Enfileirar job de render (renderer consome via BullMQ)
    await enqueueRender({
      jobId,
      clipId: idx,
      transcript: `[Clip ${idx}] ${segment.hook}\n${segment.title}`,
      context: `Categoria: ${segment.category}, Score: ${segment.score}/10, Duração: ${segment.endTime - segment.startTime}s`,
      facePath,
      outputDir: join(jobDir, 'output'),
    })
  }

  console.log(`[pipeline] ${segments.length} render jobs enfileirados. Aguardando renderer...`)

  // NOTA: A publicação acontece quando o renderer devolve o final.mp4.
  // Por enquanto, o pipeline enfileira e o renderer processa assincronamente.
  // A integração completa com polling e publicação automática é um próximo passo.
  // Para publicar manualmente: npx tsx src/test-publish.ts youtube <final.mp4>
}
