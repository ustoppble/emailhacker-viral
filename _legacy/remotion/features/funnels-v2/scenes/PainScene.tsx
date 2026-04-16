import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing, Sequence } from 'remotion'
import { COLORS, FONTS, SIZES } from '../../../styles'
import { AmberGlow } from '../assets/Glows'
import { DecliningGraph } from '../assets/DecliningGraph'
import { ShoppingCartIcon } from '../assets/Icons'

// Word highlight component (Remotion best practice: spring wipe)
const WordHighlight: React.FC<{
  word: string
  color: string
  delay: number
  durationInFrames: number
}> = ({ word, color, delay, durationInFrames }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({
    fps,
    frame,
    config: { damping: 200 },
    delay,
    durationInFrames,
  })

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{
        position: 'absolute',
        left: -4,
        right: -4,
        top: '50%',
        height: '1.1em',
        transform: `translateY(-50%) scaleX(${progress})`,
        transformOrigin: 'left center',
        backgroundColor: color,
        borderRadius: '0.15em',
        zIndex: 0,
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{word}</span>
    </span>
  )
}

export const PainScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance: fade + slide (in seconds * fps)
  const entrance = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 0.4 * fps })
  const entranceY = interpolate(entrance, [0, 1], [20, 0])
  const entranceOpacity = entrance

  // Cart icon fade in (seconds-based)
  const cartOpacity = interpolate(frame, [0, 1 * fps], [0, 0.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Subliminal R$0 flash at 3s and 3.7s
  const flash1Start = 3 * fps
  const flash2Start = 3.7 * fps
  const showFlash = (frame >= flash1Start && frame < flash1Start + 3) ||
                    (frame >= flash2Start && frame < flash2Start + 3)

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <AmberGlow delay={Math.round(0.3 * fps)} />

      {/* Giant cart icon background */}
      <div style={{ position: 'absolute', opacity: cartOpacity }}>
        <ShoppingCartIcon size={400} color="#f59e0b" strokeWidth={0.5} />
      </div>

      {/* Declining graph — delayed 0.5s */}
      <Sequence from={Math.round(0.5 * fps)} layout="none" premountFor={fps}>
        <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)' }}>
          <DecliningGraph width={600} height={200} delay={0} />
        </div>
      </Sequence>

      {/* Pain text with word highlight */}
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: SIZES.title,
        color: COLORS.text,
        textAlign: 'center',
        maxWidth: 900,
        lineHeight: 1.3,
        zIndex: 10,
        position: 'relative',
        opacity: entranceOpacity,
        transform: `translateY(${entranceY}px)`,
      }}>
        {'quanto tu '}
        <WordHighlight
          word="perde"
          color="rgba(239, 68, 68, 0.3)"
          delay={Math.round(0.8 * fps)}
          durationInFrames={Math.round(0.6 * fps)}
        />
        {' por nao ter funil de recuperacao?'}
      </div>

      {/* Subliminal R$0 flash */}
      {showFlash && (
        <div style={{
          position: 'absolute',
          fontFamily: FONTS.mono,
          fontSize: 120,
          fontWeight: 700,
          color: 'rgba(239, 68, 68, 0.15)',
          zIndex: 5,
        }}>
          R$ 0
        </div>
      )}
    </AbsoluteFill>
  )
}
