import { createRenderQueue } from '../../../shared/queue.js'
import type { RenderJob } from '../../../shared/types/job.js'

const queue = createRenderQueue()

/**
 * Enfileira um job de render.
 * Pipeline chama isso depois de cortar o clip e gerar face.mp4.
 */
export async function enqueueRender(job: RenderJob): Promise<string> {
  const added = await queue.add(`render-${job.clipId}`, job, {
    priority: 10 - Number(job.clipId), // clips com index menor = prioridade maior
  })
  console.log(`[queue] Job enfileirado: ${added.id} (clip ${job.clipId})`)
  return added.id!
}

/**
 * Verifica quantos jobs estão na fila/processando.
 */
export async function getQueueStatus() {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ])
  return { waiting, active, completed, failed }
}

export { queue }
