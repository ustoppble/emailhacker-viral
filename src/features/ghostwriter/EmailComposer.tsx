import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const PRODUCTS = [
  { icon: '📦', name: 'Curso Email Pro', desc: 'infoproduto principal' },
  { icon: '📚', name: 'eBook Automacoes', desc: 'produto de entrada' },
  { icon: '🎯', name: 'Mentoria Premium', desc: 'high ticket' },
  { icon: '⚡', name: 'Template Pack', desc: 'produto digital' },
]

interface Props {
  selectedIndex?: number
  selectFrame?: number
}

export const EmailComposer: React.FC<Props> = ({ selectedIndex = 0, selectFrame = 80 }) => {
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
        escolha o produto
      </div>

      {/* Product Cards */}
      {PRODUCTS.map((product, i) => {
        const delay = 10 + i * MOTION.stagger * 2
        const cardSpring = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: MOTION.snappy,
        })
        const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1])
        const cardOpacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateRight: 'clamp' })
        const cardX = interpolate(cardSpring, [0, 1], [30, 0])

        const isSelected = i === selectedIndex && frame >= selectFrame
        const anySelected = frame >= selectFrame
        const selectAge = Math.max(0, frame - selectFrame)
        const selectSpring = spring({
          frame: selectAge,
          fps,
          config: MOTION.bouncy,
        })
        const borderColor = isSelected ? COLORS.accent : COLORS.border
        const bgColor = isSelected ? 'rgba(239, 68, 68, 0.08)' : COLORS.surface

        let pressScale = 1
        if (isSelected) {
          if (selectAge <= 3) {
            pressScale = interpolate(selectAge, [0, 3], [1, 0.97], { extrapolateRight: 'clamp' })
          } else {
            const overSpring = spring({
              frame: selectAge - 3,
              fps,
              config: MOTION.bouncy,
            })
            pressScale = interpolate(overSpring, [0, 1], [0.97, 1.02])
          }
        }

        const fadedOpacity = anySelected && !isSelected
          ? interpolate(selectAge, [0, 10], [1, 0.5], { extrapolateRight: 'clamp' })
          : 1

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
            <span style={{ fontSize: 22 }}>{product.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 'bold',
                color: isSelected ? COLORS.accent : COLORS.text,
              }}>
                {product.name}
              </div>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 10,
                color: COLORS.textMuted,
              }}>
                {product.desc}
              </div>
            </div>
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

      {/* AI Loading indicator after selection */}
      {frame >= selectFrame + 15 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          opacity: interpolate(frame, [selectFrame + 15, selectFrame + 25], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: COLORS.accent,
            opacity: 0.4 + Math.sin(frame * 0.2) * 0.4,
          }} />
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: COLORS.textMuted,
            letterSpacing: 1,
          }}>
            analisando produto...
          </span>
        </div>
      )}
    </div>
  )
}
