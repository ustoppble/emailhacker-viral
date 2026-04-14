import React from 'react'
import { AbsoluteFill, useVideoConfig, Sequence } from 'remotion'
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { Audio } from '@remotion/media'
import { GridBackground } from '../../components/GridBackground'
import { CodeRain } from '../../components/CodeRain'
import { Particles } from '../../components/Particles'
import { Vignette } from '../../components/Vignette'
import { CornerElements } from '../../components/CornerElements'
import { CameraRig } from '../../components/CameraRig'
import { PainScene } from './scenes/PainScene'
import { FeatureScene } from './scenes/FeatureScene'
import { BuildScene } from './scenes/BuildScene'
import { BenefitScene } from './scenes/BenefitScene'
import { CTAScene } from './scenes/CTAScene'
import { VIDEO } from '../../styles'

// All durations in seconds — converted to frames via fps
const SCENE_SECONDS = {
  pain: 5,
  feature: 6,
  visual: 8,
  benefit: 5,
  cta: 3,
}

const TRANSITION_FRAMES = 9

// Calculate total: sum of scenes minus overlaps from transitions
const totalSeconds = Object.values(SCENE_SECONDS).reduce((a, b) => a + b, 0)
export const FUNNELS_TOTAL = totalSeconds * VIDEO.fps - TRANSITION_FRAMES * 4

export const FunnelsVideo: React.FC = () => {
  const { fps } = useVideoConfig()

  const D = {
    pain: SCENE_SECONDS.pain * fps,
    feature: SCENE_SECONDS.feature * fps,
    visual: SCENE_SECONDS.visual * fps,
    benefit: SCENE_SECONDS.benefit * fps,
    cta: SCENE_SECONDS.cta * fps,
  }

  return (
    <AbsoluteFill>
      {/* Background layers — persistent across all scenes */}
      <CameraRig
        zoom={[1.05, 1.1]}
        panX={[-3, 3]}
        panY={[-5, 5]}
        shake={0}
        breathe={0.5}
        durationFrames={FUNNELS_TOTAL}
      >
        <GridBackground />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CodeRain />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          <Particles />
        </div>
      </CameraRig>

      {/* SFX at key moments */}
      <Sequence from={0} layout="none" premountFor={fps}>
        <Audio src="https://remotion.media/whoosh.wav" volume={0.3} />
      </Sequence>
      <Sequence from={D.pain - TRANSITION_FRAMES} layout="none" premountFor={fps}>
        <Audio src="https://remotion.media/switch.wav" volume={0.4} />
      </Sequence>
      <Sequence from={D.pain + D.feature - TRANSITION_FRAMES * 2} layout="none" premountFor={fps}>
        <Audio src="https://remotion.media/mouse-click.wav" volume={0.3} />
      </Sequence>
      <Sequence from={D.pain + D.feature + D.visual - TRANSITION_FRAMES * 3} layout="none" premountFor={fps}>
        <Audio src="https://remotion.media/ding.wav" volume={0.5} />
      </Sequence>
      <Sequence from={D.pain + D.feature + D.visual + D.benefit - TRANSITION_FRAMES * 4} layout="none" premountFor={fps}>
        <Audio src="https://remotion.media/whip.wav" volume={0.4} />
      </Sequence>

      {/* Scenes with proper fade transitions (Remotion best practice) */}
      <TransitionSeries>
        {/* Scene 1 — Pain */}
        <TransitionSeries.Sequence durationInFrames={D.pain}>
          <CameraRig zoom={[1.1, 1.25]} panX={[5, -5]} panY={[0, 10]} shake={0} breathe={0.3} durationFrames={D.pain}>
            <PainScene />
          </CameraRig>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 2 — Feature */}
        <TransitionSeries.Sequence durationInFrames={D.feature}>
          <CameraRig zoom={[1.0, 1.08]} panX={[0, 0]} panY={[0, 0]} shake={0} breathe={0.2} durationFrames={D.feature}>
            <FeatureScene />
          </CameraRig>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 3 — Build */}
        <TransitionSeries.Sequence durationInFrames={D.visual}>
          <CameraRig zoom={[1.0, 1.1]} panX={[0, 0]} panY={[0, 0]} shake={0} breathe={0.2} durationFrames={D.visual}>
            <BuildScene />
          </CameraRig>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 4 — Benefit */}
        <TransitionSeries.Sequence durationInFrames={D.benefit}>
          <CameraRig zoom={[1.1, 1.3]} panX={[-3, 3]} panY={[0, 0]} shake={0} breathe={0.3} durationFrames={D.benefit}>
            <BenefitScene />
          </CameraRig>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 5 — CTA */}
        <TransitionSeries.Sequence durationInFrames={D.cta}>
          <CameraRig zoom={[1.15, 1.05]} panX={[0, 0]} panY={[0, 0]} shake={0} breathe={0.1} durationFrames={D.cta}>
            <CTAScene />
          </CameraRig>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* HUD + Overlays — always on top */}
      <CornerElements />
      <Vignette />
    </AbsoluteFill>
  )
}
