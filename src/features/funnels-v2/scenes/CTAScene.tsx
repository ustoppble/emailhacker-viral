import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { COLORS, FONTS } from '../../../styles'
import { InsectLogo } from '../../../components/InsectLogo'
import { PulseDot } from '../motion/PulseDot'

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Logo spring with bounce (Remotion bouncy config)
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 8 }, // bouncy
  })

  // Brand text letter-spacing animation (0.5s to 1.5s)
  const spacing = interpolate(
    frame,
    [Math.round(0.5 * fps), Math.round(1.5 * fps)],
    [30, 2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Speed lines converge (0 to 0.4s)
  const lineOpacity = interpolate(
    frame,
    [0, Math.round(0.27 * fps), Math.round(0.67 * fps)],
    [0.6, 0.3, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Red flashes at 2.3s and 2.5s
  const flash1Start = Math.round(2.3 * fps)
  const flash2Start = Math.round(2.5 * fps)
  const flash1 = frame >= flash1Start && frame < flash1Start + 2 ? 0.3 : 0
  const flash2 = frame >= flash2Start && frame < flash2Start + 2 ? 0.2 : 0

  return (
    <AbsoluteFill style={{ background: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* Speed lines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = i * 45
        const rad = (angle * Math.PI) / 180
        const dist = interpolate(frame, [0, Math.round(0.4 * fps)], [800, 0], { extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 200,
            height: 2,
            background: `linear-gradient(90deg, transparent, rgba(239, 68, 68, ${lineOpacity}))`,
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${dist}px)`,
          }} />
        )
      })}

      {/* Logo + brand text */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        transform: `scale(${logoSpring})`,
        zIndex: 10,
      }}>
        <InsectLogo size={60} />
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.text,
          letterSpacing: spacing,
        }}>
          EMAILHACKER.AI
        </div>
        <PulseDot size={10} />
      </div>

      {/* Flash overlays */}
      {(flash1 > 0 || flash2 > 0) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#ef4444',
          opacity: flash1 || flash2,
          zIndex: 20,
        }} />
      )}
    </AbsoluteFill>
  )
}
