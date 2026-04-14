import { useCurrentFrame, interpolate } from 'remotion'
import { COLORS, FONTS } from '../styles'

interface Props {
  from?: number
  to: number
  label: string
  prefix?: string
  suffix?: string
  startFrame?: number
  durationFrames?: number
}

export const AnimatedCounter: React.FC<Props> = ({
  from = 0,
  to,
  label,
  prefix = '+',
  suffix = '%',
  startFrame = 0,
  durationFrames = 45,
}) => {
  const frame = useCurrentFrame()
  const elapsed = Math.max(0, frame - startFrame)
  const progress = interpolate(elapsed, [0, durationFrames], [0, 1], {
    extrapolateRight: 'clamp',
    // Ease out cubic — desacelera no final
  })
  const eased = 1 - Math.pow(1 - progress, 3)
  const value = Math.round(from + (to - from) * eased)
  const opacity = interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity,
    }}>
      <span style={{
        fontFamily: FONTS.mono,
        fontSize: 56,
        fontWeight: 'bold',
        color: COLORS.success,
        textShadow: `0 0 30px ${COLORS.successGlow}`,
        letterSpacing: 2,
      }}>
        {prefix}{value}{suffix}
      </span>
      <span style={{
        fontFamily: FONTS.mono,
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 3,
      }}>
        {label}
      </span>
    </div>
  )
}
