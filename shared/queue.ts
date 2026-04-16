// Definição da fila BullMQ compartilhada entre pipeline e renderer
import { Queue, Worker, type ConnectionOptions } from 'bullmq'
import type { RenderJob } from './types/job.js'

export const QUEUE_NAME = 'render-jobs'

export const REDIS_CONNECTION: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
}

// Helper: criar queue (usado pelo pipeline/producer)
export function createRenderQueue(): Queue<RenderJob> {
  return new Queue<RenderJob>(QUEUE_NAME, {
    connection: REDIS_CONNECTION,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
    },
  })
}

// Helper: criar worker (usado pelo renderer/consumer)
export function createRenderWorker(
  processor: (job: { data: RenderJob }) => Promise<{ finalPath: string }>
): Worker<RenderJob, { finalPath: string }> {
  return new Worker<RenderJob, { finalPath: string }>(
    QUEUE_NAME,
    processor,
    {
      connection: REDIS_CONNECTION,
      concurrency: 1, // 1 por vez — VPS tem 4GB RAM, Remotion é pesado
    },
  )
}
