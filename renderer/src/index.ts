import { createRenderWorker } from '../../shared/queue.js'
import { generateOverlayWithRetry } from './director.js'
import { renderOverlay } from './render.js'
import { composeVideo } from './compose.js'
import { join } from 'node:path'
import { mkdirSync, existsSync } from 'node:fs'

console.log('[renderer] Iniciando consumer de render jobs...')

const worker = createRenderWorker(async (job) => {
  const { clipId, transcript, context, facePath, outputDir } = job.data
  console.log(`[renderer] Processando clip ${clipId}...`)

  // Diretório temporário para renders intermediários
  const workDir = join(outputDir, '..', 'renders', clipId)
  if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true })

  // 1. DIRECTOR — gerar overlay.tsx via Claude Code CLI
  console.log(`[renderer] Clip ${clipId}: gerando overlay...`)
  const componentPath = await generateOverlayWithRetry({
    clipId,
    transcript,
    context,
    outputDir: workDir,
  })

  if (!componentPath) {
    console.error(`[renderer] Clip ${clipId}: DIRECTOR falhou — sem overlay gerado`)
    throw new Error(`Director falhou para clip ${clipId} — componente não gerado`)
  }

  // 2. RENDER — Remotion render overlay.tsx → overlay.mp4
  console.log(`[renderer] Clip ${clipId}: renderizando overlay...`)
  const overlayPath = join(workDir, `${clipId}_overlay.mp4`)
  await renderOverlay({
    componentPath,
    outputPath: overlayPath,
  })

  // 3. COMPOSE — ffmpeg vstack overlay + face → final.mp4
  console.log(`[renderer] Clip ${clipId}: compondo vídeo final...`)
  const finalPath = join(outputDir, `${clipId}_final.mp4`)
  await composeVideo({
    overlayPath,
    facePath,
    outputPath: finalPath,
  })

  console.log(`[renderer] Clip ${clipId} concluído: ${finalPath}`)
  return { finalPath }
})

worker.on('completed', (job, result) => {
  console.log(`[renderer] Job ${job.id} concluído: ${result.finalPath}`)
})

worker.on('failed', (job, err) => {
  console.error(`[renderer] Job ${job?.id} falhou: ${err.message}`)
})

worker.on('error', (err) => {
  console.error(`[renderer] Erro no worker: ${err.message}`)
})

console.log('[renderer] Consumer ativo. Aguardando jobs...')
