import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const STEPS = [
  { label: 'Analisando Brand DNA', type: 'analyze', icon: '🧬' },
  { label: 'Gerando Subject Line', type: 'generate', icon: '✉️' },
  { label: 'Escrevendo Corpo', type: 'write', icon: '✍️' },
  { label: 'Aplicando Tom de Voz', type: 'tone', icon: '🎯' },
  { label: 'Revisando Copy', type: 'review', icon: '🔍' },
  { label: 'Email Pronto', type: 'success', icon: '✅' },
]

const SUBJECT_LINES = [
  'tu ta perdendo vendas agora',
  'o erro que custa R$3.000/mes',
  'abra antes que expire',
]

// Seeded random for confetti
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const CONFETTI_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  x: seededRandom(i * 3 + 1) * 200 - 100,
  vy: -(seededRandom(i * 3 + 2) * 4 + 3),
  size: seededRandom(i * 3 + 3) * 3 + 2,
  hue: 130 + seededRandom(i * 7) * 40,
}))

const LEFT_BORDER_COLORS: Record<string, string> = {
  analyze: '#8b5cf6',
  generate: '#ef4444',
  write: '#3b82f6',
  tone: '#f59e0b',
  review: '#6b7ea8',
  success: '#22c55e',
}

export const EmailBuilder: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const totalSteps = STEPS.length
  const lastStepDelay = (totalSteps - 1) * 18
  const progressRaw = interpolate(frame, [0, lastStepDelay + 18], [0, 100], { extrapolateRight: 'clamp' })
  const progressPct = Math.round(progressRaw)

  // Subject line typewriter (appears after step 1, frame ~36)
  const subjectFrame = 40
  const subjectText = SUBJECT_LINES[0]
  const subjectCharsVisible = frame >= subjectFrame
    ? Math.min(subjectText.length, Math.floor((frame - subjectFrame) * 0.8))
    : 0

  // Body text typing (appears after step 2, frame ~72)
  const bodyFrame = 76
  const bodyLines = [
    'Oi {nome},',
    '',
    'Eu sei que tu ja pensou em',
    'usar email pra vender mais.',
    '',
    'Mas sempre para na hora de',
    'escrever, ne?',
  ]
  const bodyCharsTotal = bodyLines.join('\n').length
  const bodyCharsVisible = frame >= bodyFrame
    ? Math.min(bodyCharsTotal, Math.floor((frame - bodyFrame) * 1.2))
    : 0

  return (
    <div style={{
      position: 'relative',
      padding: '36px 18px 16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Title with progress */}
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <span>ghostwriter escrevendo...</span>
        <span style={{
          color: COLORS.textMuted,
          fontSize: 10,
          fontWeight: 'normal',
          letterSpacing: 0,
        }}>
          {progressPct}%
        </span>
      </div>

      {/* Steps list — compact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        {STEPS.map((step, i) => {
          const delay = i * 18
          const stepSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: MOTION.snappy,
          })
          const stepScale = interpolate(stepSpring, [0, 1], [0.6, 1])
          const stepOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' })
          const stepY = interpolate(stepSpring, [0, 1], [10, 0])

          const isSuccess = step.type === 'success'
          const borderCol = LEFT_BORDER_COLORS[step.type] || COLORS.border
          const bgColor = isSuccess ? 'rgba(34, 197, 94, 0.1)' : COLORS.surface
          const textCol = isSuccess ? COLORS.success : COLORS.text

          // Completed checkmark
          const doneFrame = delay + 16
          const isDone = frame >= doneFrame
          const checkSpring = isDone
            ? spring({ frame: Math.max(0, frame - doneFrame), fps, config: MOTION.impact })
            : 0

          // Spinner for active step
          const isActive = frame >= delay && !isDone
          const spinAngle = isActive ? (frame - delay) * 12 : 0

          // Success confetti
          const confettiAge = isSuccess ? Math.max(0, frame - delay - 6) : 0

          return (
            <div key={i} style={{ position: 'relative', overflow: 'visible' }}>
              <div style={{
                transform: `scale(${stepScale}) translateY(${stepY}px)`,
                opacity: stepOpacity,
                backgroundColor: bgColor,
                border: `1px solid ${isSuccess ? COLORS.success : COLORS.border}`,
                borderLeft: `3px solid ${borderCol}`,
                borderRadius: 6,
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isSuccess ? `0 0 15px ${COLORS.successGlow}` : 'none',
              }}>
                {/* Status indicator */}
                {isDone ? (
                  <span style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: isSuccess ? COLORS.success : COLORS.textMuted,
                    transform: `scale(${checkSpring})`,
                    flexShrink: 0,
                    width: 16,
                    textAlign: 'center',
                  }}>
                    {'\u2713'}
                  </span>
                ) : isActive ? (
                  <div style={{
                    width: 12, height: 12, flexShrink: 0,
                    border: `2px solid ${borderCol}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    transform: `rotate(${spinAngle}deg)`,
                    marginLeft: 2,
                  }} />
                ) : (
                  <div style={{ width: 16, flexShrink: 0 }} />
                )}

                <span style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  color: textCol,
                  fontWeight: isSuccess ? 'bold' : 'normal',
                }}>
                  {step.label}
                </span>
              </div>

              {/* Success confetti */}
              {isSuccess && confettiAge > 0 && confettiAge < 40 && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
                  pointerEvents: 'none', overflow: 'hidden',
                }}>
                  {CONFETTI_PARTICLES.map((p, pi) => {
                    const t = confettiAge / fps
                    const gravity = 9
                    const py = p.vy * t + 0.5 * gravity * t * t
                    const px = p.x * t * 0.6
                    const particleOpacity = interpolate(confettiAge, [0, 10, 30, 40], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
                    return (
                      <div key={pi} style={{
                        position: 'absolute', left: '50%', bottom: 15,
                        width: p.size, height: p.size, borderRadius: '50%',
                        backgroundColor: `hsl(${p.hue}, 70%, 55%)`,
                        transform: `translate(${px}px, ${py}px)`,
                        opacity: particleOpacity,
                      }} />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Email preview area — appears after subject step */}
      {subjectCharsVisible > 0 && (
        <div style={{
          marginTop: 10,
          flex: 1,
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: '10px 12px',
          overflow: 'hidden',
          opacity: interpolate(frame, [subjectFrame, subjectFrame + 8], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {/* Subject line */}
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4,
          }}>
            subject
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            color: COLORS.accent,
            fontWeight: 'bold',
            marginBottom: 10,
            borderBottom: `1px solid ${COLORS.border}`,
            paddingBottom: 8,
          }}>
            {subjectText.slice(0, subjectCharsVisible)}
            {subjectCharsVisible < subjectText.length && (
              <span style={{
                opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                color: COLORS.accent,
              }}>|</span>
            )}
          </div>

          {/* Body text */}
          {bodyCharsVisible > 0 && (
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: COLORS.textSecondary,
              lineHeight: '16px',
              whiteSpace: 'pre-wrap',
            }}>
              {bodyLines.join('\n').slice(0, bodyCharsVisible)}
              {bodyCharsVisible < bodyCharsTotal && (
                <span style={{
                  opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  color: COLORS.accent,
                }}>|</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
