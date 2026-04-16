import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { InsectLogo } from '../../components/InsectLogo'
import { COLORS, FONTS, MOTION } from '../../styles'

interface Props {
  isOutro?: boolean
  tagline?: string
}

export const BrandIntroV: React.FC<Props> = ({ isOutro = false, tagline }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoSpring = spring({ frame, fps, config: MOTION.smooth })
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1])
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  const textDelay = 20
  const textSpring = spring({ frame: Math.max(0, frame - textDelay), fps, config: MOTION.snappy })
  const textOpacity = interpolate(frame, [textDelay, textDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
  const textSpacing = interpolate(textSpring, [0, 1], [20, 4])

  const tagDelay = 45
  const tagOpacity = isOutro ? interpolate(frame, [tagDelay, tagDelay + 15], [0, 1], { extrapolateRight: 'clamp' }) : 0
  const tagY = isOutro ? interpolate(spring({ frame: Math.max(0, frame - tagDelay), fps, config: MOTION.bouncy }), [0, 1], [20, 0]) : 0

  const pulse = 1 + Math.sin(frame * 0.08) * 0.03
  const totalFrames = isOutro ? 210 : 120
  const exitOpacity = interpolate(frame, [totalFrames - 20, totalFrames], [1, 0], { extrapolateRight: 'clamp' })
  const dotOpacity = 0.4 + Math.sin(frame * 0.15) * 0.4

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      opacity: exitOpacity,
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accentGlowSoft} 0%, transparent 70%)`,
        opacity: 0.3 + Math.sin(frame * 0.05) * 0.1,
      }} />

      {/* Logo + Text stacked vertically for mobile */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        transform: `scale(${logoScale * pulse})`,
        opacity: logoOpacity,
      }}>
        <InsectLogo width={120} height={120} glowIntensity={0.9} />
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 38,
          fontWeight: 'bold',
          color: COLORS.text,
          letterSpacing: textSpacing,
          opacity: textOpacity,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          EMAILHACKER<span style={{ color: COLORS.accent }}>.AI</span>
        </div>
      </div>

      {/* Red dot */}
      <div style={{
        position: 'absolute',
        top: '42%',
        right: '35%',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: COLORS.accent,
        opacity: dotOpacity,
        boxShadow: `0 0 12px ${COLORS.accentGlow}`,
      }} />

      {/* Tagline */}
      {isOutro && tagline && (
        <div style={{
          position: 'absolute',
          top: '60%',
          fontFamily: FONTS.mono,
          fontSize: 28,
          color: COLORS.textSecondary,
          letterSpacing: 4,
          textTransform: 'lowercase',
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
        }}>
          {tagline}
        </div>
      )}
    </AbsoluteFill>
  )
}
