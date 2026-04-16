export interface Segment {
  index: number
  startTime: number    // segundos
  endTime: number      // segundos
  title: string        // título pro Short
  hook: string         // frase de abertura (primeiros 3 seg)
  category: 'insight' | 'humor' | 'viral' | 'tecnico' | 'reacao'
  score: number        // 1-10
}

export interface JobData {
  videoId: string
  videoUrl: string
  jobDir: string       // /data/video-worker/jobs/{jobId}
}

export interface AnalyzeResult {
  segments: Segment[]
  totalDuration: number
}

export interface PublishResult {
  platform: 'youtube' | 'instagram' | 'tiktok'
  url: string
  publishedAt: string
}
