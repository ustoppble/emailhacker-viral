import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const STEPS = [
  { label: 'Subject vencedor aplicado', delay: 30 },
  { label: 'Segmento: Ativos (3.418)', delay: 55 },
  { label: 'Campanha criada no AC', delay: 80 },
  { label: 'Disparo agendado', delay: 105 },
]

export const FinalDeliveryV: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const chatOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const chatY = interpolate(spring({ frame, fps, config: MOTION.snappy }), [0, 1], [15, 0])

  const panelDelay = 20
  const panelSpring = spring({ frame: Math.max(0, frame - panelDelay), fps, config: MOTION.snappy })
  const progressWidth = interpolate(frame, [30, 130], [0, 100], { extrapolateRight: 'clamp' })

  const statsDelay = 140
  const statsOpacity = interpolate(frame, [statsDelay, statsDelay + 15], [0, 1], { extrapolateRight: 'clamp' })
  const statsSpring = spring({ frame: Math.max(0, frame - statsDelay), fps, config: MOTION.bouncy })

  const aiDelay = 180
  const aiOpacity = interpolate(frame, [aiDelay, aiDelay + 15], [0, 1], { extrapolateRight: 'clamp' })

  const flashOpacity = frame >= 120
    ? interpolate(frame, [120, 123, 128], [0, 0.08, 0], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      padding: '80px 40px',
      flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${COLORS.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gridLine} 1px, transparent 1px)`,
        backgroundSize: '50px 50px', opacity: 0.4,
      }} />

      {/* User chat */}
      <div style={{
        opacity: chatOpacity, transform: `translateY(${chatY}px)`,
        display: 'flex', justifyContent: 'flex-end', marginBottom: 40,
        flexShrink: 0, zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surfaceLight, border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '14px 22px', maxWidth: '85%',
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>gestor</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text }}>
            aplica e agenda o disparo pra lista ativa
          </div>
        </div>
      </div>

      {/* Dispatch panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 30, zIndex: 2,
      }}>
        <div style={{
          width: '100%',
          transform: `scale(${interpolate(panelSpring, [0, 1], [0.96, 1])})`,
          opacity: interpolate(frame, [panelDelay, panelDelay + 12], [0, 1], { extrapolateRight: 'clamp' }),
          backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: '32px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
          }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.accent, letterSpacing: 3, textTransform: 'uppercase' }}>preparando disparo</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textMuted }}>{Math.round(progressWidth)}%</span>
          </div>

          {/* Progress */}
          <div style={{ width: '100%', height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, marginBottom: 32, overflow: 'hidden' }}>
            <div style={{
              width: `${progressWidth}%`, height: '100%',
              backgroundColor: progressWidth >= 100 ? '#22c55e' : COLORS.accent,
              borderRadius: 3,
            }} />
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((step, i) => {
              const elapsed = frame - step.delay
              const isDone = elapsed >= 15
              const isActive = elapsed >= 0 && !isDone

              const stepOpacity = elapsed >= 0 ? interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' }) : 0
              const checkSpring = isDone ? spring({ frame: Math.max(0, elapsed - 15), fps, config: MOTION.impact }) : 0

              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, opacity: stepOpacity,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: isDone ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    border: `2px solid ${isDone ? '#22c55e' : COLORS.border}`,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                  }}>
                    {isDone ? (
                      <span style={{
                        fontFamily: FONTS.mono, fontSize: 14, color: '#22c55e',
                        transform: `scale(${checkSpring})`, fontWeight: 'bold',
                      }}>{'\u2713'}</span>
                    ) : isActive ? (
                      <div style={{
                        width: 12, height: 12,
                        border: `2px solid ${COLORS.accent}`, borderTopColor: 'transparent',
                        borderRadius: '50%', transform: `rotate(${elapsed * 12}deg)`,
                      }} />
                    ) : null}
                  </div>
                  <span style={{
                    fontFamily: FONTS.mono, fontSize: 17, color: isDone ? COLORS.text : COLORS.textMuted,
                    fontWeight: isDone && i === STEPS.length - 1 ? 'bold' : 'normal',
                  }}>{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats card */}
        <div style={{
          alignSelf: 'center',
          transform: `scale(${interpolate(statsSpring, [0, 1], [0.85, 1])})`,
          opacity: statsOpacity,
          backgroundColor: COLORS.surface, border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 16, padding: '24px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 52, fontWeight: 'bold', color: '#22c55e',
            textShadow: '0 0 15px rgba(34, 197, 94, 0.3)',
          }}>89%</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 2, textTransform: 'uppercase' }}>taxa de inbox estimada</div>
        </div>
      </div>

      {/* AI response */}
      <div style={{
        opacity: aiOpacity, display: 'flex', justifyContent: 'flex-start',
        marginTop: 20, flexShrink: 0, zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 14, padding: '14px 22px', maxWidth: '95%',
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.accent, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>emailhacker</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 17, color: COLORS.text, lineHeight: '26px' }}>
            pronto. subject vencedor aplicado, disparo agendado pra <span style={{ color: '#22c55e', fontWeight: 'bold' }}>3.418 contatos</span>.
          </div>
        </div>
      </div>

      {flashOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#22c55e', opacity: flashOpacity, pointerEvents: 'none' }} />
      )}
    </AbsoluteFill>
  )
}
