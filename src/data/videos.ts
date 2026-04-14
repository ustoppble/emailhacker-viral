export interface VideoData {
  id: string
  feature: string
  pain: string
  painKeyword: string
  proof: string
  visual: string
  visualCounter: number
  visualCounterLabel: string
  benefit: string
}

export const videos: VideoData[] = [
  {
    id: 'funnels-01',
    feature: 'FUNNELS',
    pain: 'quanto tu perde por não ter funil de recuperação?',
    painKeyword: 'perde',
    proof: 'a ia monta a automação inteira no teu ac.',
    visual: 'carrinho abandonado | email 1: lembrete | wait 24h | email 2: urgência | wait 48h | email 3: oferta | venda recuperada',
    visualCounter: 30,
    visualCounterLabel: 'vendas recuperadas',
    benefit: '1 clique. funil pronto. vendendo 24/7.',
  },
  {
    id: 'video-factory-01',
    feature: 'VIDEO FACTORY',
    pain: 'tu cria conteúdo na mão? um por um?',
    painKeyword: 'mão',
    proof: 'pipeline remotion gera 100+ vídeos animados. react + motion design.',
    visual: 'definir feature | gerar dados JSON | renderizar batch | 100 MP4s | postar no X',
    visualCounter: 100,
    visualCounterLabel: 'vídeos gerados',
    benefit: '1 comando. 100 vídeos. zero esforço.',
  },
  {
    id: 'ghostwriter-01',
    feature: 'GHOSTWRITER',
    pain: 'tu ainda escreve email na mão? palavra por palavra?',
    painKeyword: 'mão',
    proof: 'a ia analisa tua marca, teu produto e escreve o email inteiro.',
    visual: 'escolher produto | analisar brand DNA | gerar subject | escrever corpo | revisar | pronto pra enviar',
    visualCounter: 5,
    visualCounterLabel: 'emails gerados',
    benefit: '1 clique. email pronto. copy que converte.',
  },
  {
    id: 'email-azul-01',
    feature: 'EMAIL AZUL',
    pain: 'teus emails tao caindo em promocoes. quanto tu perde por mes?',
    painKeyword: 'promocoes',
    proof: '5 variantes. 70+ padroes. primeiro na inbox ganha.',
    visual: 'disparar 5 rounds | monitor gmail | R1 promo | R2 promo | R3 INBOX | vencedor aplicado',
    visualCounter: 5,
    visualCounterLabel: 'variantes testadas',
    benefit: '1 clique. 5 testes. inbox garantida.',
  },
  {
    id: 'send-01',
    feature: 'SEND',
    pain: 'tu ainda abre o ActiveCampaign pra disparar email?',
    painKeyword: 'ActiveCampaign',
    proof: '5 cerebros de IA analisam, escrevem e disparam. tu so confirma.',
    visual: 'segmento | produto | subject IA | corpo IA | revisao | disparado',
    visualCounter: 5,
    visualCounterLabel: 'cerebros de IA',
    benefit: 'sem abrir o AC. sem esforco. vendendo.',
  },
]
