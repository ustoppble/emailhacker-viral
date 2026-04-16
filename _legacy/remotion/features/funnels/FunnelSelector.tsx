import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const FUNNELS = [
  { icon: '🛒', name: 'Carrinho Abandonado', desc: 'recuperar compras' },
  { icon: '💰', name: 'PIX Pendente', desc: 'cobrar pagamento' },
  { icon: '💳', name: 'Cartão Recusado', desc: 'retentar compra' },
  { icon: '⏰', name: 'Compra Expirada', desc: 'reengajar lead' },
]

interface Props {
  selectedIndex?: number
  selectFrame?: number
}

export const FunnelSelector: React.FC<Props> = ({ selectedIndex = 0, selectFrame = 60 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '48px 16px 16px',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 13,
        color: COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
        opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        selecione o funil
      </div>

      {/* Cards */}
      {FUNNELS.map((funnel, i) => {
        const delay = 10 + i * MOTION.stagger * 2
        const cardSpring = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: MOTION.snappy,
        })
        const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1])
        const cardOpacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateRight: 'clamp' })
        const cardX = interpolate(cardSpring, [0, 1], [30, 0])

        // Selection highlight
        const isSelected = i === selectedIndex && frame >= selectFrame
        const anySelected = frame >= selectFrame
        const selectAge = Math.max(0, frame - selectFrame)
        const selectSpring = spring({
          frame: selectAge,
          fps,
          config: MOTION.bouncy,
        })
        const borderColor = isSelected
          ? COLORS.accent
          : COLORS.border
        const bgColor = isSelected
          ? 'rgba(239, 68, 68, 0.08)'
          : COLORS.surface

        // Press animation: scale down (anticipation) then overshoot up then settle
        let pressScale = 1
        if (isSelected) {
          if (selectAge <= 3) {
            // Anticipation: scale down to 0.97
            pressScale = interpolate(selectAge, [0, 3], [1, 0.97], { extrapolateRight: 'clamp' })
          } else {
            // Overshoot then settle via spring
            const overSpring = spring({
              frame: selectAge - 3,
              fps,
              config: MOTION.bouncy,
            })
            pressScale = interpolate(overSpring, [0, 1], [0.97, 1.02])
          }
        }

        // Non-selected cards fade when one is selected
        const fadedOpacity = anySelected && !isSelected
          ? interpolate(selectAge, [0, 10], [1, 0.5], { extrapolateRight: 'clamp' })
          : 1

        // Checkmark pop animation
        const checkScale = isSelected
          ? spring({ frame: Math.max(0, selectAge - 8), fps, config: MOTION.impact })
          : 0
        const checkOpacity = isSelected
          ? interpolate(selectAge, [8, 12], [0, 1], { extrapolateRight: 'clamp' })
          : 0

        return (
          <div key={i} style={{
            transform: `scale(${cardScale * pressScale}) translateX(${cardX}px)`,
            opacity: cardOpacity * fadedOpacity,
            backgroundColor: bgColor,
            border: `1.5px solid ${borderColor}`,
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'none',
            boxShadow: isSelected ? `0 0 20px ${COLORS.accentGlowSoft}` : 'none',
            position: 'relative',
          }}>
            <span style={{ fontSize: 22 }}>{funnel.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 'bold',
                color: isSelected ? COLORS.accent : COLORS.text,
              }}>
                {funnel.name}
              </div>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 10,
                color: COLORS.textMuted,
              }}>
                {funnel.desc}
              </div>
            </div>
            {/* Checkmark pop */}
            {isSelected && checkOpacity > 0 && (
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                fontWeight: 'bold',
                color: COLORS.accent,
                transform: `scale(${checkScale})`,
                opacity: checkOpacity,
                flexShrink: 0,
                textShadow: `0 0 8px ${COLORS.accentGlow}`,
              }}>
                {'\u2713'}
              </div>
            )}
          </div>
        )
      })}

      {/* Cursor indicator */}
      {frame >= selectFrame && (
        <div style={{
          position: 'absolute',
          right: 20,
          top: 48 + 8 + selectedIndex * (62 + 10) + 31,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: COLORS.accent,
          boxShadow: `0 0 10px ${COLORS.accentGlow}`,
          opacity: interpolate(
            spring({ frame: Math.max(0, frame - selectFrame), fps, config: MOTION.snappy }),
            [0, 1], [0, 1]
          ),
        }} />
      )}
    </div>
  )
}
