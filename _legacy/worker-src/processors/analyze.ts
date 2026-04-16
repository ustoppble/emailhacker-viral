import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config.js'
import type { Segment } from '../types/job.js'

const client = new Anthropic({ apiKey: config.anthropicApiKey })

/**
 * Analisa transcrição e seleciona melhores trechos pra Shorts
 */
export async function analyzeTranscript(
  transcript: string,
  maxSegments: number = config.maxShortsPerLive
): Promise<Segment[]> {
  console.log(`[analyze] Enviando transcrição pro Haiku (${transcript.length} chars)...`)

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Você é um editor de vídeo especialista em conteúdo viral para YouTube Shorts.

Analise esta transcrição de uma live de programação/vibe coding e selecione os ${maxSegments} melhores trechos para transformar em Shorts (30-90 segundos cada).

PRIORIZE:
- Momentos com energia alta ou reação expressiva
- Insights claros e práticos sobre programação/negócios
- Humor natural ou situações engraçadas
- Demonstrações visuais de código funcionando
- Opiniões fortes ou controversas

EVITE:
- Momentos de silêncio ou leitura de código
- Conversas técnicas muito específicas sem contexto
- Trechos que dependem de contexto anterior pra fazer sentido

Retorne APENAS um JSON array com este formato:
[
  {
    "index": 1,
    "startTime": 1234,
    "endTime": 1294,
    "title": "Título curto e chamativo pro Short",
    "hook": "Frase de abertura dos primeiros 3 segundos",
    "category": "insight|humor|viral|tecnico|reacao",
    "score": 8
  }
]

TRANSCRIÇÃO:
${transcript}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Haiku não retornou JSON válido')

  const segments: Segment[] = JSON.parse(jsonMatch[0])
  console.log(`[analyze] ${segments.length} trechos selecionados`)
  return segments
}
