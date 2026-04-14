import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, SIZES } from '../styles'

interface Props {
  feature: string
  proof: string
}

export const ProofScene: React.FC<Props> = ({ feature, proof }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Feature name - slide in from left
  const featureX = spring({ frame, fps, config: { damping: 14, stiffness: 100 } })
  const featureTranslate = interpolate(featureX, [0, 1], [-200, 0])
  const featureOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  // Proof text - fade in after feature
  const proofOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' })
  const proofY = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 15 } })
  const proofTranslate = interpolate(proofY, [0, 1], [20, 0])

  // Borda accent animada
  const borderProgress = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* Card container */}
      <div style={{
        padding: '40px 48px',
        margin: '0 40px',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderLeft: `4px solid ${COLORS.accent}`,
        opacity: borderProgress,
      }}>
        {/* Feature name */}
        <div style={{
          transform: `translateX(${featureTranslate}px)`,
          opacity: featureOpacity,
          marginBottom: 24,
        }}>
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: SIZES.label,
            color: COLORS.accent,
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}>
            {feature}
          </span>
        </div>

        {/* Proof text */}
        <div style={{
          transform: `translateY(${proofTranslate}px)`,
          opacity: proofOpacity,
        }}>
          <p style={{
            fontFamily: FONTS.mono,
            fontSize: SIZES.body,
            color: COLORS.text,
            lineHeight: 1.6,
            margin: 0,
          }}>
            {proof}
          </p>
        </div>
      </div>

      {/* Terminal command visual */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: 60,
        opacity: interpolate(frame, [80, 100], [0, 0.4], { extrapolateRight: 'clamp' }),
      }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.accent }}>{'>'}</span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textMuted }}> resultado confirmado</span>
      </div>
    </AbsoluteFill>
  )
}
