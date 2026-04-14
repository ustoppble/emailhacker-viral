import { AbsoluteFill, Sequence, interpolate, staticFile } from 'remotion'
import { Audio } from '@remotion/media'
import { uiSwitch, ding, mouseClick, whoosh, whip, shutterModern } from '@remotion/sfx'
import { Vignette } from '../components/Vignette'
import { BrandIntroV } from './vertical/BrandIntroV'
import { ChatTriggerV } from './vertical/ChatTriggerV'
import { DataProofV } from './vertical/DataProofV'
import { DeepDiveV } from './vertical/DeepDiveV'
import { FinalDeliveryV } from './vertical/FinalDeliveryV'
import { COLORS, VIDEO } from '../styles'

const SFX = {
  switch: uiSwitch, ding, click: mouseClick,
  whoosh, whip, shutter: shutterModern,
}

const ACTS = {
  brand: 4 * VIDEO.fps,
  chat: 7 * VIDEO.fps,
  data: 9 * VIDEO.fps,
  dive: 11 * VIDEO.fps,
  delivery: 9 * VIDEO.fps,
  outro: 7 * VIDEO.fps,
} as const

const CROSSFADE = 9

export const NARRATIVE_VERTICAL_TOTAL = Object.values(ACTS).reduce((a, b) => a + b, 0)

export const NarrativeVertical: React.FC = () => {
  const offsets = {
    brand: 0,
    chat: ACTS.brand - CROSSFADE,
    data: ACTS.brand + ACTS.chat - CROSSFADE * 2,
    dive: ACTS.brand + ACTS.chat + ACTS.data - CROSSFADE * 3,
    delivery: ACTS.brand + ACTS.chat + ACTS.data + ACTS.dive - CROSSFADE * 4,
    outro: ACTS.brand + ACTS.chat + ACTS.data + ACTS.dive + ACTS.delivery - CROSSFADE * 5,
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={offsets.brand} durationInFrames={ACTS.brand}>
        <BrandIntroV />
      </Sequence>
      <Sequence from={offsets.chat} durationInFrames={ACTS.chat}>
        <ChatTriggerV />
      </Sequence>
      <Sequence from={offsets.data} durationInFrames={ACTS.data}>
        <DataProofV />
      </Sequence>
      <Sequence from={offsets.dive} durationInFrames={ACTS.dive}>
        <DeepDiveV />
      </Sequence>
      <Sequence from={offsets.delivery} durationInFrames={ACTS.delivery}>
        <FinalDeliveryV />
      </Sequence>
      <Sequence from={offsets.outro} durationInFrames={ACTS.outro}>
        <BrandIntroV isOutro tagline="inbox garantida." />
      </Sequence>

      {/* Music */}
      <Audio
        src={staticFile('bg-music.mp3')}
        volume={(f) =>
          interpolate(f, [0, 45, NARRATIVE_VERTICAL_TOTAL - 60, NARRATIVE_VERTICAL_TOTAL], [0, 0.12, 0.12, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          })
        }
        loop
      />

      {/* SFX */}
      <Sequence from={offsets.brand + 15}><Audio src={SFX.switch} volume={0.4} /></Sequence>
      <Sequence from={offsets.chat + 5}><Audio src={SFX.ding} volume={0.3} /></Sequence>
      <Sequence from={offsets.chat + 15}><Audio src={SFX.click} volume={0.2} /></Sequence>
      <Sequence from={offsets.chat + 70}><Audio src={SFX.click} volume={0.2} /></Sequence>
      <Sequence from={offsets.chat + 120}><Audio src={SFX.click} volume={0.2} /></Sequence>
      <Sequence from={offsets.data + 30}><Audio src={SFX.switch} volume={0.2} /></Sequence>
      <Sequence from={offsets.data + 55}><Audio src={SFX.switch} volume={0.2} /></Sequence>
      <Sequence from={offsets.data + 108}><Audio src={SFX.shutter} volume={0.4} /></Sequence>
      <Sequence from={offsets.dive + 60}><Audio src={SFX.whip} volume={0.35} /></Sequence>
      <Sequence from={offsets.dive + 140}><Audio src={SFX.whoosh} volume={0.3} /></Sequence>
      <Sequence from={offsets.delivery + 45}><Audio src={SFX.click} volume={0.2} /></Sequence>
      <Sequence from={offsets.delivery + 70}><Audio src={SFX.click} volume={0.2} /></Sequence>
      <Sequence from={offsets.delivery + 95}><Audio src={SFX.click} volume={0.2} /></Sequence>
      <Sequence from={offsets.delivery + 120}><Audio src={SFX.shutter} volume={0.3} /></Sequence>
      <Sequence from={offsets.delivery + 140}><Audio src={SFX.ding} volume={0.35} /></Sequence>
      <Sequence from={offsets.outro + 15}><Audio src={SFX.switch} volume={0.4} /></Sequence>

      <Vignette />
    </AbsoluteFill>
  )
}
