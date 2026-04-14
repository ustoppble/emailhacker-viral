import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const STEPS = [
  { label: 'Subject vencedor aplicado', icon: '\u2713', delay: 30 },
  { label: 'Segmento: Ativos (3.418 contatos)', icon: '\u2713', delay: 55 },
  { label: 'Campanha criada no AC', icon: '\u2713', delay: 80 },
  { label: 'Disparo agendado', icon: '\u2713', delay: 105 },
]

export const FinalDelivery: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Chat entry
  const chatOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const chatY = interpolate(spring({ frame, fps, config: MOTION.snappy }), [0, 1], [15, 0])

  // Panel entry
  const panelDelay = 20
  const panelSpring = spring({ frame: Math.max(0, frame - panelDelay), fps, config: MOTION.snappy })
  const panelScale = interpolate(panelSpring, [0, 1], [0.95, 1])
  const panelOpacity = interpolate(frame, [panelDelay, panelDelay + 12], [0, 1], { extrapolateRight: 'clamp' })

  // Progress bar
  const progressWidth = interpolate(frame, [30, 130], [0, 100], { extrapolateRight: 'clamp' })

  // Stats card
  const statsDelay = 140
  const statsOpacity = interpolate(frame, [statsDelay, statsDelay + 15], [0, 1], { extrapolateRight: 'clamp' })
  const statsSpring = spring({ frame: Math.max(0, frame - statsDelay), fps, config: MOTION.bouncy })
  const statsScale = interpolate(statsSpring, [0, 1], [0.85, 1])

  // AI final response
  const aiDelay = 180
  const aiOpacity = interpolate(frame, [aiDelay, aiDelay + 15], [0, 1], { extrapolateRight: 'clamp' })
  const aiY = interpolate(spring({ frame: Math.max(0, frame - aiDelay), fps, config: MOTION.snappy }), [0, 1], [15, 0])

  // Success flash
  const allDone = frame >= 120
  const flashOpacity = allDone
    ? interpolate(frame, [120, 123, 128], [0, 0.1, 0], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      padding: '50px 80px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(${COLORS.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gridLine} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.5,
      }} />

      {/* User chat */}
      <div style={{
        opacity: chatOpacity,
        transform: `translateY(${chatY}px)`,
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 24,
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surfaceLight,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '12px 20px',
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>gestor</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.text }}>
            sim, aplica e agenda o disparo pra lista ativa
          </div>
        </div>
      </div>

      {/* Dispatch panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
      }}>
        <div style={{
          width: 700,
          transform: `scale(${panelScale})`,
          opacity: panelOpacity,
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: '30px 40px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.accent,
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}>
              preparando disparo
            </div>
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              color: COLORS.textMuted,
            }}>
              {Math.round(progressWidth)}%
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: 4,
            backgroundColor: COLORS.surfaceLight,
            borderRadius: 2,
            marginBottom: 28,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressWidth}%`,
              height: '100%',
              backgroundColor: progressWidth >= 100 ? '#22c55e' : COLORS.accent,
              borderRadius: 2,
              boxShadow: progressWidth >= 100 ? '0 0 8px rgba(34, 197, 94, 0.4)' : `0 0 8px ${COLORS.accentGlow}`,
            }} />
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map((step, i) => {
              const elapsed = frame - step.delay
              const isDone = elapsed >= 15
              const isActive = elapsed >= 0 && !isDone

              const stepSpring = elapsed >= 0
                ? spring({ frame: elapsed, fps, config: MOTION.snappy })
                : 0
              const stepOpacity = elapsed >= 0
                ? interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
                : 0

              const checkSpring = isDone
                ? spring({ frame: Math.max(0, elapsed - 15), fps, config: MOTION.impact })
                : 0

              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  opacity: stepOpacity,
                  transform: `translateX(${interpolate(stepSpring, [0, 1], [20, 0])}px)`,
                }}>
                  {/* Status */}
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: isDone ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    border: `1.5px solid ${isDone ? '#22c55e' : COLORS.border}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}>
                    {isDone ? (
                      <span style={{
                        fontFamily: FONTS.mono,
                        fontSize: 12,
                        color: '#22c55e',
                        transform: `scale(${checkSpring})`,
                        fontWeight: 'bold',
                      }}>{step.icon}</span>
                    ) : isActive ? (
                      <div style={{
                        width: 10,
                        height: 10,
                        border: `2px solid ${COLORS.accent}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        transform: `rotate(${elapsed * 12}deg)`,
                      }} />
                    ) : null}
                  </div>

                  <span style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    color: isDone ? COLORS.text : COLORS.textMuted,
                    fontWeight: isDone && i === STEPS.length - 1 ? 'bold' : 'normal',
                  }}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats card (right side) */}
        <div style={{
          position: 'absolute',
          right: 100,
          transform: `scale(${statsScale})`,
          opacity: statsOpacity,
          backgroundColor: COLORS.surface,
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 12,
          padding: '20px 28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 36,
            fontWeight: 'bold',
            color: '#22c55e',
            textShadow: '0 0 12px rgba(34, 197, 94, 0.3)',
          }}>
            89%
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            taxa de inbox
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 10,
            color: COLORS.textMuted,
            letterSpacing: 1,
            marginTop: 4,
          }}>
            estimada
          </div>
        </div>
      </div>

      {/* AI final response */}
      <div style={{
        opacity: aiOpacity,
        transform: `translateY(${aiY}px)`,
        display: 'flex',
        justifyContent: 'flex-start',
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: '12px 20px',
          maxWidth: 700,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.accent, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>emailhacker</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.text, lineHeight: '22px' }}>
            pronto. subject vencedor aplicado, disparo agendado pra <span style={{ color: '#22c55e', fontWeight: 'bold' }}>3.418 contatos</span>. taxa de inbox estimada: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>89%</span>.
          </div>
        </div>
      </div>

      {/* Success flash */}
      {flashOpacity > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#22c55e',
          opacity: flashOpacity,
          pointerEvents: 'none',
        }} />
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
