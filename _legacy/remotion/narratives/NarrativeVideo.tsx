import { AbsoluteFill, Sequence, interpolate, staticFile } from 'remotion'
import { Audio } from '@remotion/media'
import { uiSwitch, ding, mouseClick, whoosh, whip, shutterModern } from '@remotion/sfx'
import { GridBackground } from '../components/GridBackground'
import { Vignette } from '../components/Vignette'
import { BrandIntro } from './scenes/BrandIntro'
import { ChatTrigger } from './scenes/ChatTrigger'
import { DataProof } from './scenes/DataProof'
import { DeepDive } from './scenes/DeepDive'
import { FinalDelivery } from './scenes/FinalDelivery'
import { VIDEO } from '../styles'

const SFX = {
  switch: uiSwitch,
  ding,
  click: mouseClick,
  whoosh,
  whip,
  shutter: shutterModern,
}

// 6-act narrative structure (~52s)
const ACTS = {
  brand: 4 * VIDEO.fps,      // 0-4s = 120 frames
  chat: 7 * VIDEO.fps,       // 5-12s = 210 frames
  data: 9 * VIDEO.fps,       // 13-22s = 270 frames
  dive: 11 * VIDEO.fps,      // 23-34s = 330 frames
  delivery: 9 * VIDEO.fps,   // 35-44s = 270 frames
  outro: 7 * VIDEO.fps,      // 45-52s = 210 frames
} as const

const CROSSFADE = 9 // frames overlap

export const NARRATIVE_TOTAL = Object.values(ACTS).reduce((a, b) => a + b, 0)

export const NarrativeVideo: React.FC = () => {
  const offsets = {
    brand: 0,
    chat: ACTS.brand - CROSSFADE,
    data: ACTS.brand + ACTS.chat - CROSSFADE * 2,
    dive: ACTS.brand + ACTS.chat + ACTS.data - CROSSFADE * 3,
    delivery: ACTS.brand + ACTS.chat + ACTS.data + ACTS.dive - CROSSFADE * 4,
    outro: ACTS.brand + ACTS.chat + ACTS.data + ACTS.dive + ACTS.delivery - CROSSFADE * 5,
  }

  return (
    <AbsoluteFill>
      {/* Background grid — always present */}
      <GridBackground />

      {/* Act 1 — Brand Intro (0-4s) */}
      <Sequence from={offsets.brand} durationInFrames={ACTS.brand}>
        <BrandIntro />
      </Sequence>

      {/* Act 2 — Chat Trigger (5-12s) */}
      <Sequence from={offsets.chat} durationInFrames={ACTS.chat}>
        <ChatTrigger />
      </Sequence>

      {/* Act 3 — Data Proof (13-22s) */}
      <Sequence from={offsets.data} durationInFrames={ACTS.data}>
        <DataProof />
      </Sequence>

      {/* Act 4 — Deep Dive (23-34s) */}
      <Sequence from={offsets.dive} durationInFrames={ACTS.dive}>
        <DeepDive />
      </Sequence>

      {/* Act 5 — Final Delivery (35-44s) */}
      <Sequence from={offsets.delivery} durationInFrames={ACTS.delivery}>
        <FinalDelivery />
      </Sequence>

      {/* Act 6 — Brand Outro (45-52s) */}
      <Sequence from={offsets.outro} durationInFrames={ACTS.outro}>
        <BrandIntro isOutro tagline="inbox garantida." />
      </Sequence>

      {/* === BACKGROUND MUSIC — fade in/out, low volume === */}
      <Audio
        src={staticFile('bg-music.mp3')}
        volume={(f) =>
          interpolate(f, [0, 45, NARRATIVE_TOTAL - 60, NARRATIVE_TOTAL], [0, 0.12, 0.12, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
        loop
      />

      {/* === SOUND EFFECTS === */}

      {/* Act 1 — Logo appear */}
      <Sequence from={offsets.brand + 15}>
        <Audio src={SFX.switch} volume={0.4} />
      </Sequence>

      {/* Act 2 — Notification ding */}
      <Sequence from={offsets.chat + 5}>
        <Audio src={SFX.ding} volume={0.3} />
      </Sequence>
      {/* Act 2 — Message 1 (user) */}
      <Sequence from={offsets.chat + 15}>
        <Audio src={SFX.click} volume={0.2} />
      </Sequence>
      {/* Act 2 — Message 2 (AI) */}
      <Sequence from={offsets.chat + 70}>
        <Audio src={SFX.click} volume={0.2} />
      </Sequence>
      {/* Act 2 — Message 3 (user) */}
      <Sequence from={offsets.chat + 120}>
        <Audio src={SFX.click} volume={0.2} />
      </Sequence>

      {/* Act 3 — Rounds appearing */}
      <Sequence from={offsets.data + 30}>
        <Audio src={SFX.switch} volume={0.2} />
      </Sequence>
      <Sequence from={offsets.data + 55}>
        <Audio src={SFX.switch} volume={0.2} />
      </Sequence>
      {/* Act 3 — R3 INBOX winner */}
      <Sequence from={offsets.data + 108}>
        <Audio src={SFX.shutter} volume={0.4} />
      </Sequence>

      {/* Act 4 — VS badge slam */}
      <Sequence from={offsets.dive + 60}>
        <Audio src={SFX.whip} volume={0.35} />
      </Sequence>
      {/* Act 4 — +250% callout */}
      <Sequence from={offsets.dive + 140}>
        <Audio src={SFX.whoosh} volume={0.3} />
      </Sequence>

      {/* Act 5 — Steps completing */}
      <Sequence from={offsets.delivery + 45}>
        <Audio src={SFX.click} volume={0.2} />
      </Sequence>
      <Sequence from={offsets.delivery + 70}>
        <Audio src={SFX.click} volume={0.2} />
      </Sequence>
      <Sequence from={offsets.delivery + 95}>
        <Audio src={SFX.click} volume={0.2} />
      </Sequence>
      {/* Act 5 — All done + stats */}
      <Sequence from={offsets.delivery + 120}>
        <Audio src={SFX.shutter} volume={0.3} />
      </Sequence>
      <Sequence from={offsets.delivery + 140}>
        <Audio src={SFX.ding} volume={0.35} />
      </Sequence>

      {/* Act 6 — Final logo */}
      <Sequence from={offsets.outro + 15}>
        <Audio src={SFX.switch} volume={0.4} />
      </Sequence>

      {/* Vignette — always on top */}
      <Vignette />
    </AbsoluteFill>
  )
}
