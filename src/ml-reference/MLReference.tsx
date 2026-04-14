import { AbsoluteFill, Sequence } from 'remotion'
import { StatsScene } from './scenes/StatsScene'
import { OrderGridScene } from './scenes/OrderGridScene'
import { PackagesScene } from './scenes/PackagesScene'
import { SocialProofScene } from './scenes/SocialProofScene'
import { FeaturesScene } from './scenes/FeaturesScene'
import { MetricsScene } from './scenes/MetricsScene'
import { CTAScene } from './scenes/CTAScene'
import { BrandCloseScene } from './scenes/BrandCloseScene'
import { POVOverlay } from './scenes/POVOverlay'
import { DeskSetup } from './scenes/DeskSetup'

// Resolution: 1080x1920 (vertical/portrait — phone recording of monitor)
const SCENES = {
  stats: 90,        // 3s
  orderGrid: 30,    // 1s
  flash: 12,        // 0.4s
  packages: 70,     // 2.3s
  socialProof: 105, // 3.5s
  features: 105,    // 3.5s
  metrics: 90,      // 3s
  cta: 60,          // 2s
  brandClose: 90,   // 3s
} as const

export const ML_REFERENCE_TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0)

const WhiteFlash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }} />
)

export const MLReference: React.FC = () => {
  // Sequential offsets — hard cuts, no crossfade
  const offsets = {
    stats: 0,
    orderGrid: SCENES.stats,
    flash: SCENES.stats + SCENES.orderGrid,
    packages: SCENES.stats + SCENES.orderGrid + SCENES.flash,
    socialProof: SCENES.stats + SCENES.orderGrid + SCENES.flash + SCENES.packages,
    features: SCENES.stats + SCENES.orderGrid + SCENES.flash + SCENES.packages + SCENES.socialProof,
    metrics: SCENES.stats + SCENES.orderGrid + SCENES.flash + SCENES.packages + SCENES.socialProof + SCENES.features,
    cta: SCENES.stats + SCENES.orderGrid + SCENES.flash + SCENES.packages + SCENES.socialProof + SCENES.features + SCENES.metrics,
    brandClose: SCENES.stats + SCENES.orderGrid + SCENES.flash + SCENES.packages + SCENES.socialProof + SCENES.features + SCENES.metrics + SCENES.cta,
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0D0D' }}>
      <Sequence from={offsets.stats} durationInFrames={SCENES.stats}>
        <DeskSetup><StatsScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.orderGrid} durationInFrames={SCENES.orderGrid}>
        <DeskSetup><OrderGridScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.flash} durationInFrames={SCENES.flash}>
        <DeskSetup><WhiteFlash /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.packages} durationInFrames={SCENES.packages}>
        <DeskSetup><PackagesScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.socialProof} durationInFrames={SCENES.socialProof}>
        <DeskSetup><SocialProofScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.features} durationInFrames={SCENES.features}>
        <DeskSetup><FeaturesScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.metrics} durationInFrames={SCENES.metrics}>
        <DeskSetup><MetricsScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.cta} durationInFrames={SCENES.cta}>
        <DeskSetup><CTAScene /></DeskSetup>
      </Sequence>
      <Sequence from={offsets.brandClose} durationInFrames={SCENES.brandClose}>
        <DeskSetup><BrandCloseScene /></DeskSetup>
      </Sequence>

      {/* POV overlay — persistent on top of all scenes, OUTSIDE DeskSetup */}
      <Sequence from={0} durationInFrames={ML_REFERENCE_TOTAL}>
        <POVOverlay />
      </Sequence>
    </AbsoluteFill>
  )
}
