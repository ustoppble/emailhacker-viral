import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion'
import { COLORS, FONTS, SIZES } from '../../../styles'
import { GreenGlow } from '../assets/Glows'
import { CountUp } from '../motion/CountUp'

const LINES = [
  { text: '1 clique.', delaySec: 0.3 },
  { text: 'funil pronto.', delaySec: 0.9 },
  { text: 'vendendo 24/7.', delaySec: 1.5 },
]

export const BenefitScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Micro shake on first impact (0.3s - 0.5s)
  const shakeStart = Math.round(0.3 * fps)
  const shakeEnd = Math.round(0.5 * fps)
  const shakeX = frame > shakeStart && frame < shakeEnd ? Math.sin(frame * 8) * 3 : 0
  const shakeY = frame > shakeStart && frame < shakeEnd ? Math.cos(frame * 6) * 2 : 0

  // Light streaks with easing (Remotion Easing.inOut)
  const streakOpacity = interpolate(frame, [shakeStart, Math.round(0.5 * fps), Math.round(1.3 * fps), Math.round(2 * fps)], [0, 0.3, 0.15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  })

  return (
    <AbsoluteFill style={{
      background: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <GreenGlow delay={Math.round(0.2 * fps)} />

      {/* Light streaks */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, transparent 30%, rgba(22, 163, 74, 0.15) 50%, transparent 70%)',
        opacity: streakOpacity,
        zIndex: 1,
      }} />

      {/* Slam text — each line with spring impact + native delay */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        zIndex: 10,
      }}>
        {LINES.map((line, i) => {
          // Impact spring: starts big (scale 2) and slams to 1
          const s = spring({
            frame,
            fps,
            config: { damping: 6, stiffness: 250, mass: 0.5 }, // impact config
            delay: Math.round(line.delaySec * fps),
          })
          const scale = 2 - s
          const opacity = Math.min(1, s * 3)

          return (
            <div key={i} style={{
              fontFamily: FONTS.mono,
              fontSize: SIZES.title,
              fontWeight: 700,
              color: i === 2 ? '#16a34a' : COLORS.text,
              textShadow: i === 2 ? '0 0 30px rgba(22, 163, 74, 0.4)' : 'none',
              transform: `scale(${scale})`,
              opacity,
            }}>
              {line.text}
            </div>
          )
        })}
      </div>

      {/* Counter — starts at 2s */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        zIndex: 10,
      }}>
        <CountUp
          to={30}
          delay={Math.round(2 * fps)}
          duration={Math.round(1.7 * fps)}
          style={{ fontFamily: FONTS.mono, fontSize: 64, fontWeight: 700, color: '#16a34a' }}
        />
        <span style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.textSecondary }}>
          vendas recuperadas
        </span>
      </div>
    </AbsoluteFill>
  )
}
