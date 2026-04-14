import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const ROUNDS = [
  { tag: 'R1', name: 'Baseline', desc: 'email original', icon: '📧' },
  { tag: 'R2', name: 'Subject', desc: 'subject otimizado', icon: '✉️' },
  { tag: 'R3', name: 'Conteudo', desc: 'tom conversacional', icon: '💬' },
  { tag: 'R4', name: 'Links', desc: 'plain-text agressivo', icon: '🔗' },
  { tag: 'R5', name: 'Completo', desc: 'reescrita total IA', icon: '🧠' },
]

interface Props {
  selectedIndex?: number
  selectFrame?: number
}

export const RoundSelector: React.FC<Props> = ({ selectedIndex = 2, selectFrame = 80 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
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
        marginBottom: 6,
        opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        5 variantes em paralelo
      </div>

      {/* Round Cards */}
      {ROUNDS.map((round, i) => {
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
        const borderColor = isSelected ? '#22c55e' : COLORS.border
        const bgColor = isSelected ? 'rgba(34, 197, 94, 0.08)' : COLORS.surface

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
          ? interpolate(selectAge, [0, 10], [1, 0.4], { extrapolateRight: 'clamp' })
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
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'none',
            boxShadow: isSelected ? `0 0 20px rgba(34, 197, 94, 0.25)` : 'none',
            position: 'relative',
          }}>
            <span style={{ fontSize: 20 }}>{round.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                fontWeight: 'bold',
                color: isSelected ? '#22c55e' : COLORS.text,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{
                  fontSize: 9,
                  color: COLORS.textMuted,
                  backgroundColor: COLORS.surfaceLight,
                  padding: '1px 5px',
                  borderRadius: 3,
                  letterSpacing: 1,
                }}>{round.tag}</span>
                {round.name}
              </div>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 9,
                color: COLORS.textMuted,
              }}>
                {round.desc}
              </div>
            </div>
            {isSelected && checkOpacity > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transform: `scale(${checkScale})`,
                opacity: checkOpacity,
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: FONTS.mono,
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  INBOX
                </span>
                <span style={{
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#22c55e',
                  textShadow: `0 0 8px rgba(34, 197, 94, 0.5)`,
                }}>
                  {'\u2713'}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Monitoring indicator after selection */}
      {frame >= selectFrame + 15 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          opacity: interpolate(frame, [selectFrame + 15, selectFrame + 25], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: '#22c55e',
            opacity: 0.4 + Math.sin(frame * 0.2) * 0.4,
          }} />
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 10,
            color: COLORS.textMuted,
            letterSpacing: 1,
          }}>
            primeiro na inbox ganha...
          </span>
        </div>
      )}
    </div>
  )
}
