import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { InsectLogo } from '../../components/InsectLogo'
import { COLORS, FONTS, MOTION } from '../../styles'

interface Props {
  isOutro?: boolean
  tagline?: string
}

export const BrandIntro: React.FC<Props> = ({ isOutro = false, tagline }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Logo entry
  const logoSpring = spring({ frame, fps, config: MOTION.smooth })
  const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1])
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  // Text entry (delayed)
  const textDelay = 20
  const textSpring = spring({ frame: Math.max(0, frame - textDelay), fps, config: MOTION.snappy })
  const textOpacity = interpolate(frame, [textDelay, textDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
  const textSpacing = interpolate(textSpring, [0, 1], [30, 6])

  // Tagline (outro only)
  const tagDelay = 40
  const tagOpacity = isOutro
    ? interpolate(frame, [tagDelay, tagDelay + 15], [0, 1], { extrapolateRight: 'clamp' })
    : 0
  const tagY = isOutro
    ? interpolate(spring({ frame: Math.max(0, frame - tagDelay), fps, config: MOTION.bouncy }), [0, 1], [20, 0])
    : 0

  // Subtle pulse on logo
  const pulse = 1 + Math.sin(frame * 0.08) * 0.03

  // Fade out at end
  const totalFrames = isOutro ? 210 : 120
  const fadeOutStart = totalFrames - 20
  const exitOpacity = interpolate(frame, [fadeOutStart, totalFrames], [1, 0], { extrapolateRight: 'clamp' })

  // Red dot pulsing
  const dotOpacity = 0.4 + Math.sin(frame * 0.15) * 0.4

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      opacity: exitOpacity,
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accentGlowSoft} 0%, transparent 70%)`,
        opacity: 0.3 + Math.sin(frame * 0.05) * 0.1,
      }} />

      {/* Logo + Text inline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        transform: `scale(${logoScale * pulse})`,
        opacity: logoOpacity,
      }}>
        <InsectLogo width={80} height={80} glowIntensity={0.8} />
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 42,
          fontWeight: 'bold',
          color: COLORS.text,
          letterSpacing: textSpacing,
          opacity: textOpacity,
          textTransform: 'uppercase',
        }}>
          EMAILHACKER<span style={{ color: COLORS.accent }}>.AI</span>
        </div>
      </div>

      {/* Red dot */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(240px, -60px)',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: COLORS.accent,
        opacity: dotOpacity,
        boxShadow: `0 0 12px ${COLORS.accentGlow}`,
      }} />

      {/* Tagline (outro only) */}
      {isOutro && tagline && (
        <div style={{
          position: 'absolute',
          bottom: '32%',
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.textSecondary,
          letterSpacing: 4,
          textTransform: 'lowercase',
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
        }}>
          {tagline}
        </div>
      )}

      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  )
}
