import { AbsoluteFill, Sequence } from 'remotion'
import { GridBackground } from './components/GridBackground'
import { CodeRain } from './components/CodeRain'
import { Particles } from './components/Particles'
import { Vignette } from './components/Vignette'
import { CameraRig } from './components/CameraRig'
import { CornerElements } from './components/CornerElements'
import { ImpactTexts } from './components/ImpactTexts'
import { BrandScene } from './scenes/BrandScene'
import { PainScene } from './scenes/PainScene'
import { FeatureScene } from './scenes/FeatureScene'
import { VisualScene } from './scenes/VisualScene'
import { BenefitScene } from './scenes/BenefitScene'
import { CTAScene } from './scenes/CTAScene'
import { SCENES, TOTAL_FRAMES, VIDEO, MOTION, COLORS } from './styles'
import type { VideoData } from './data/videos'

type ImpactWord = {
  text: string; frame: number; x: number; y: number; size: number; duration: number; color?: string
}
type Offsets = { pain: number; feature: number; visual: number; benefit: number; cta: number }

const IMPACT_TEXTS: Record<string, (o: Offsets) => ImpactWord[]> = {
  'EMAIL AZUL': (o) => [
    { text: 'PROMOCOES', frame: o.pain + 20, x: 50, y: 70, size: 32, duration: 25, color: COLORS.accent },
    { text: 'VENDAS PERDIDAS', frame: o.pain + 80, x: 50, y: 75, size: 24, duration: 22, color: '#ff6b6b' },
    { text: '5 VARIANTES', frame: o.feature + 10, x: 50, y: 15, size: 24, duration: 30, color: COLORS.text },
    { text: '70+ PADROES', frame: o.feature + 50, x: 18, y: 50, size: 22, duration: 20, color: COLORS.accent },
    { text: 'GMAIL MONITOR', frame: o.feature + 100, x: 82, y: 45, size: 26, duration: 20 },
    { text: 'TESTANDO INBOX', frame: o.visual + 5, x: 50, y: 12, size: 24, duration: 28, color: COLORS.text },
    { text: 'R1 PROMO', frame: o.visual + 40, x: 82, y: 30, size: 18, duration: 18, color: '#f59e0b' },
    { text: 'MONITORANDO', frame: o.visual + 60, x: 82, y: 40, size: 16, duration: 15, color: COLORS.textMuted },
    { text: 'R3 INBOX', frame: o.visual + 80, x: 82, y: 35, size: 18, duration: 18, color: COLORS.success },
    { text: 'VENCEDOR', frame: o.visual + 140, x: 50, y: 92, size: 28, duration: 30, color: COLORS.success },
    { text: 'INBOX', frame: o.benefit + 40, x: 75, y: 25, size: 28, duration: 20, color: COLORS.accent },
    { text: 'GARANTIDA', frame: o.benefit + 80, x: 25, y: 70, size: 48, duration: 22, color: COLORS.accent },
  ],
  FUNNELS: (o) => [
    { text: 'CARRINHO', frame: o.pain + 20, x: 50, y: 70, size: 32, duration: 25, color: COLORS.accent },
    { text: 'VENDAS PERDIDAS', frame: o.pain + 80, x: 50, y: 75, size: 24, duration: 22, color: '#ff6b6b' },
    { text: 'AUTOMACAO', frame: o.feature + 10, x: 50, y: 15, size: 24, duration: 30, color: COLORS.text },
    { text: 'IA', frame: o.feature + 50, x: 18, y: 50, size: 28, duration: 20, color: COLORS.accent },
    { text: '1 CLIQUE', frame: o.feature + 100, x: 82, y: 45, size: 26, duration: 20 },
    { text: 'CONSTRUINDO', frame: o.visual + 5, x: 50, y: 12, size: 24, duration: 28, color: COLORS.text },
    { text: 'TRIGGER', frame: o.visual + 30, x: 82, y: 30, size: 18, duration: 18, color: COLORS.accent },
    { text: 'EMAIL', frame: o.visual + 50, x: 82, y: 40, size: 16, duration: 15, color: COLORS.textMuted },
    { text: 'WAIT', frame: o.visual + 70, x: 82, y: 35, size: 18, duration: 18, color: '#f59e0b' },
    { text: 'VENDA', frame: o.visual + 140, x: 50, y: 92, size: 28, duration: 30, color: COLORS.success },
    { text: '24/7', frame: o.benefit + 40, x: 75, y: 25, size: 28, duration: 20, color: COLORS.accent },
    { text: 'VENDENDO', frame: o.benefit + 80, x: 25, y: 70, size: 48, duration: 22, color: COLORS.accent },
  ],
  GHOSTWRITER: (o) => [
    { text: 'NA MAO', frame: o.pain + 20, x: 50, y: 70, size: 32, duration: 25, color: COLORS.accent },
    { text: 'TEMPO PERDIDO', frame: o.pain + 80, x: 50, y: 75, size: 24, duration: 22, color: '#ff6b6b' },
    { text: 'BRAND DNA', frame: o.feature + 10, x: 50, y: 15, size: 24, duration: 30, color: COLORS.text },
    { text: 'TOM DE VOZ', frame: o.feature + 50, x: 18, y: 50, size: 22, duration: 20, color: COLORS.accent },
    { text: 'COPY IA', frame: o.feature + 100, x: 82, y: 45, size: 26, duration: 20 },
    { text: 'ESCREVENDO', frame: o.visual + 5, x: 50, y: 12, size: 24, duration: 28, color: COLORS.text },
    { text: 'SUBJECT', frame: o.visual + 40, x: 82, y: 30, size: 18, duration: 18, color: COLORS.accent },
    { text: 'CORPO', frame: o.visual + 60, x: 82, y: 40, size: 16, duration: 15, color: COLORS.textMuted },
    { text: 'REVISAO', frame: o.visual + 80, x: 82, y: 35, size: 18, duration: 18, color: COLORS.success },
    { text: 'PRONTO', frame: o.visual + 140, x: 50, y: 92, size: 28, duration: 30, color: COLORS.success },
    { text: 'COPY', frame: o.benefit + 40, x: 75, y: 25, size: 28, duration: 20, color: COLORS.accent },
    { text: 'QUE CONVERTE', frame: o.benefit + 80, x: 25, y: 70, size: 42, duration: 22, color: COLORS.accent },
  ],
  SEND: (o) => [
    { text: 'ACTIVECAMPAIGN', frame: o.pain + 20, x: 50, y: 70, size: 28, duration: 25, color: COLORS.accent },
    { text: 'TEMPO PERDIDO', frame: o.pain + 80, x: 50, y: 75, size: 24, duration: 22, color: '#ff6b6b' },
    { text: '5 STEPS', frame: o.feature + 10, x: 50, y: 15, size: 24, duration: 30, color: COLORS.text },
    { text: 'WIZARD', frame: o.feature + 50, x: 18, y: 50, size: 22, duration: 20, color: COLORS.accent },
    { text: 'IA MULTI-AGENTE', frame: o.feature + 100, x: 82, y: 45, size: 22, duration: 20 },
    { text: 'ESCREVENDO', frame: o.visual + 5, x: 50, y: 12, size: 24, duration: 28, color: COLORS.text },
    { text: 'ANALISANDO', frame: o.visual + 40, x: 82, y: 30, size: 18, duration: 18, color: COLORS.accent },
    { text: 'REVISANDO', frame: o.visual + 60, x: 82, y: 40, size: 16, duration: 15, color: COLORS.textMuted },
    { text: 'DISPARANDO', frame: o.visual + 80, x: 82, y: 35, size: 18, duration: 18, color: '#f59e0b' },
    { text: 'ENVIADO', frame: o.visual + 140, x: 50, y: 92, size: 28, duration: 30, color: COLORS.success },
    { text: 'SEM AC', frame: o.benefit + 40, x: 75, y: 25, size: 28, duration: 20, color: COLORS.accent },
    { text: 'AUTOMATICO', frame: o.benefit + 80, x: 25, y: 70, size: 48, duration: 22, color: COLORS.accent },
  ],
  'VIDEO FACTORY': (o) => [
    { text: 'NA MAO', frame: o.pain + 20, x: 50, y: 70, size: 32, duration: 25, color: COLORS.accent },
    { text: 'UM POR UM', frame: o.pain + 80, x: 50, y: 75, size: 24, duration: 22, color: '#ff6b6b' },
    { text: 'REMOTION', frame: o.feature + 10, x: 50, y: 15, size: 24, duration: 30, color: COLORS.text },
    { text: 'REACT', frame: o.feature + 50, x: 18, y: 50, size: 22, duration: 20, color: COLORS.accent },
    { text: 'BATCH', frame: o.feature + 100, x: 82, y: 45, size: 26, duration: 20 },
    { text: 'RENDERIZANDO', frame: o.visual + 5, x: 50, y: 12, size: 24, duration: 28, color: COLORS.text },
    { text: 'MP4', frame: o.visual + 40, x: 82, y: 30, size: 18, duration: 18, color: COLORS.accent },
    { text: 'BATCH', frame: o.visual + 60, x: 82, y: 40, size: 16, duration: 15, color: COLORS.textMuted },
    { text: '100+', frame: o.visual + 80, x: 82, y: 35, size: 18, duration: 18, color: COLORS.success },
    { text: 'PRONTO', frame: o.visual + 140, x: 50, y: 92, size: 28, duration: 30, color: COLORS.success },
    { text: 'ZERO', frame: o.benefit + 40, x: 75, y: 25, size: 28, duration: 20, color: COLORS.accent },
    { text: 'ESFORCO', frame: o.benefit + 80, x: 25, y: 70, size: 48, duration: 22, color: COLORS.accent },
  ],
}

interface Props {
  data: VideoData
}

const CROSSFADE = MOTION.crossfade

export const VideoFactory: React.FC<Props> = ({ data }) => {
  // Brand scene removed — video starts with Pain
  const offsets = {
    pain: 0,
    feature: SCENES.pain - CROSSFADE,
    visual: SCENES.pain + SCENES.feature - CROSSFADE * 2,
    benefit: SCENES.pain + SCENES.feature + SCENES.visual - CROSSFADE * 3,
    cta: SCENES.pain + SCENES.feature + SCENES.visual + SCENES.benefit - CROSSFADE * 4,
  }

  return (
    <AbsoluteFill>
      {/* Background layers — code rain + grid + particles */}
      <CameraRig
        zoom={[1.05, 1.1]}
        panX={[-5, 5]}
        panY={[-10, 10]}
        shake={0}
        breathe={0.8}
        durationFrames={TOTAL_FRAMES}
      >
        <GridBackground />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CodeRain />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          <Particles />
        </div>
      </CameraRig>

      {/* Scene 1 (Brand) REMOVIDA — video começa direto na dor */}

      {/* Scene 2 — Pain: closing in + drift down */}
      <Sequence from={offsets.pain} durationInFrames={SCENES.pain}>
        <CameraRig
          zoom={[1.1, 1.25]}
          panX={[8, -10]}
          panY={[-15, 20]}
          rotate={[0.2, -0.2]}
          shake={0}
          breathe={1.0}
          durationFrames={SCENES.pain}
        >
          <PainScene text={data.pain} keyword={data.painKeyword} />
        </CameraRig>
      </Sequence>

      {/* Scene 3 — Feature: gentle zoom only, NO pan (title must stay visible) */}
      <Sequence from={offsets.feature} durationInFrames={SCENES.feature}>
        <CameraRig
          zoom={[1.0, 1.08]}
          panX={[0, 0]}
          panY={[0, 0]}
          shake={0}
          breathe={0.2}
          durationFrames={SCENES.feature}
        >
          <FeatureScene feature={data.feature} />
        </CameraRig>
      </Sequence>

      {/* Scene 4 — Visual: gentle zoom only, NO pan (title must stay visible) */}
      <Sequence from={offsets.visual} durationInFrames={SCENES.visual}>
        <CameraRig
          zoom={[1.0, 1.1]}
          panX={[0, 0]}
          panY={[0, 0]}
          shake={0}
          breathe={0.2}
          durationFrames={SCENES.visual}
        >
          <VisualScene
            feature={data.feature}
            counterValue={data.visualCounter}
            counterLabel={data.visualCounterLabel}
          />
        </CameraRig>
      </Sequence>

      {/* Scene 5 — Benefit: dramatic zoom on text */}
      <Sequence from={offsets.benefit} durationInFrames={SCENES.benefit}>
        <CameraRig
          zoom={[1.1, 1.3]}
          panX={[-5, 5]}
          panY={[10, -15]}
          shake={0}
          breathe={1.2}
          durationFrames={SCENES.benefit}
        >
          <BenefitScene text={data.benefit} />
        </CameraRig>
      </Sequence>

      {/* Scene 6 — CTA: stabilize */}
      <Sequence from={offsets.cta} durationInFrames={SCENES.cta}>
        <CameraRig
          zoom={[1.15, 1.05]}
          panX={[3, 0]}
          panY={[-3, 0]}
          shake={0}
          breathe={0.3}
          durationFrames={SCENES.cta}
        >
          <CTAScene />
        </CameraRig>
      </Sequence>

      {/* Impact texts — explanatory words at key moments */}
      <ImpactTexts words={IMPACT_TEXTS[data.feature]?.(offsets) ?? IMPACT_TEXTS['EMAIL AZUL']!(offsets)} />

      {/* Corner UI elements */}
      <CornerElements />

      {/* Vignette — always on top */}
      <Vignette />
    </AbsoluteFill>
  )
}

