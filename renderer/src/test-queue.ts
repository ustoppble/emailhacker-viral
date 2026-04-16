import { createRenderQueue } from '../../shared/queue.js'

const queue = createRenderQueue()

async function test() {
  console.log('[test] Enfileirando job de teste...')
  const job = await queue.add('test-render', {
    jobId: 'test-001',
    clipId: '01',
    transcript: 'Teste de fila BullMQ',
    context: 'Clip de teste',
    facePath: '/tmp/face.mp4',
    outputDir: '/tmp/output',
  })
  console.log(`[test] Job criado: ${job.id}`)
  console.log('[test] Agora rode o renderer em outro terminal: cd renderer && npx tsx src/index.ts')

  // Aguardar resultado por 10 segundos
  const result = await job.waitUntilFinished(queue.events, 10_000).catch(() => null)
  if (result) {
    console.log(`[test] Resultado: ${JSON.stringify(result)}`)
  } else {
    console.log('[test] Timeout — rode o renderer pra consumir o job')
  }

  await queue.close()
  process.exit(0)
}

test()
