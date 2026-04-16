import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const STEPS = [
  { icon: '\u{1F465}', name: 'Segmento', desc: '3.418 contatos ativos' },
  { icon: '\u{1F4E6}', name: 'Oferta', desc: 'Curso Email Pro' },
  { icon: '\u{1F4DA}', name: 'Conteudo', desc: 'landing page + FAQ' },
  { icon: '\u{270F}\u{FE0F}', name: 'Escrever', desc: '5 cerebros de IA' },
  { icon: '\u{1F6E1}\u{FE0F}', name: 'Email Azul', desc: 'teste de inbox' },
]

interface Props {
  selectedIndex?: number
  selectFrame?: number
}

export const SendSelector: React.FC<Props> = ({ selectedIndex = 3, selectFrame = 80 }) => {
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
        wizard de envio
      </div>

      {/* Step cards */}
      {STEPS.map((step, i) => {
        const delay = 10 + i * MOTION.stagger * 2
        const cardSpring = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: MOTION.snappy,
        })
        const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1])
        const cardOpacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateRight: 'clamp' })
        const cardX = interpolate(cardSpring, [0, 1], [30, 0])

        // Selection
        const isSelected = i === selectedIndex && frame >= selectFrame
        const anySelected = frame >= selectFrame
        const selectAge = Math.max(0, frame - selectFrame)

        const borderColor = isSelected ? COLORS.accent : COLORS.border
        const bgColor = isSelected ? 'rgba(239, 68, 68, 0.08)' : COLORS.surface

        // Press animation
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

        // Completed steps (before selected) get check
        const isCompleted = i < selectedIndex && frame >= selectFrame
        const fadedOpacity = anySelected && !isSelected && !isCompleted
          ? interpolate(selectAge, [0, 10], [1, 0.4], { extrapolateRight: 'clamp' })
          : 1

        // Checkmark
        const showCheck = isSelected || isCompleted
        const checkScale = showCheck
          ? spring({ frame: Math.max(0, selectAge - 8), fps, config: MOTION.impact })
          : 0
        const checkOpacity = showCheck
          ? interpolate(selectAge, [8, 12], [0, 1], { extrapolateRight: 'clamp' })
          : 0

        // Step number indicator
        const stepNum = i + 1

        return (
          <div key={i} style={{
            transform: `scale(${cardScale * pressScale}) translateX(${cardX}px)`,
            opacity: cardOpacity * fadedOpacity,
            backgroundColor: isCompleted ? 'rgba(239, 68, 68, 0.04)' : bgColor,
            border: `1.5px solid ${isCompleted ? 'rgba(239, 68, 68, 0.3)' : borderColor}`,
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: isSelected ? `0 0 20px ${COLORS.accentGlowSoft}` : 'none',
            position: 'relative',
          }}>
            {/* Step number */}
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: isSelected || isCompleted ? COLORS.accent : COLORS.surfaceLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: 10,
                fontWeight: 'bold',
                color: isSelected || isCompleted ? '#000' : COLORS.textMuted,
              }}>
                {isCompleted && checkOpacity > 0 ? '\u2713' : stepNum}
              </span>
            </div>

            <span style={{ fontSize: 18 }}>{step.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                fontWeight: 'bold',
                color: isSelected ? COLORS.accent : isCompleted ? COLORS.textSecondary : COLORS.text,
              }}>
                {step.name}
              </div>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 9,
                color: COLORS.textMuted,
              }}>
                {step.desc}
              </div>
            </div>

            {/* Active indicator */}
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
                {'\u25B6'}
              </div>
            )}
          </div>
        )
      })}

      {/* Progress bar at bottom */}
      <div style={{
        marginTop: 'auto',
        opacity: interpolate(frame, [selectFrame, selectFrame + 10], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 9,
          color: COLORS.textMuted,
          marginBottom: 4,
        }}>
          passo {selectedIndex + 1} de {STEPS.length}
        </div>
        <div style={{
          width: '100%',
          height: 3,
          backgroundColor: COLORS.surfaceLight,
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${((selectedIndex + 1) / STEPS.length) * 100}%`,
            height: '100%',
            backgroundColor: COLORS.accent,
            boxShadow: `0 0 8px ${COLORS.accentGlow}`,
          }} />
        </div>
      </div>
    </div>
  )
}
