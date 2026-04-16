import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

export const DeepDive: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Chat message at top
  const chatOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const chatY = interpolate(spring({ frame, fps, config: MOTION.snappy }), [0, 1], [15, 0])

  // Comparison panels entry
  const panelDelay = 40
  const leftSpring = spring({ frame: Math.max(0, frame - panelDelay), fps, config: MOTION.snappy })
  const rightSpring = spring({ frame: Math.max(0, frame - panelDelay - 12), fps, config: MOTION.snappy })

  const leftScale = interpolate(leftSpring, [0, 1], [0.9, 1])
  const rightScale = interpolate(rightSpring, [0, 1], [0.9, 1])
  const leftOpacity = interpolate(frame, [panelDelay, panelDelay + 10], [0, 1], { extrapolateRight: 'clamp' })
  const rightOpacity = interpolate(frame, [panelDelay + 12, panelDelay + 22], [0, 1], { extrapolateRight: 'clamp' })

  // Bar chart animation
  const barDelay = 80
  const beforeBarWidth = interpolate(frame, [barDelay, barDelay + 25], [0, 12], { extrapolateRight: 'clamp' })
  const afterBarWidth = interpolate(frame, [barDelay + 10, barDelay + 35], [0, 42], { extrapolateRight: 'clamp' })

  // "VS" badge
  const vsDelay = panelDelay + 20
  const vsSpring = spring({ frame: Math.max(0, frame - vsDelay), fps, config: MOTION.impact })
  const vsScale = interpolate(vsSpring, [0, 1], [0, 1])

  // Arrow / improvement callout
  const arrowDelay = 140
  const arrowOpacity = interpolate(frame, [arrowDelay, arrowDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
  const arrowSpring = spring({ frame: Math.max(0, frame - arrowDelay), fps, config: MOTION.bouncy })
  const arrowScale = interpolate(arrowSpring, [0, 1], [0.7, 1])

  // Bottom chat (AI response)
  const aiDelay = 200
  const aiOpacity = interpolate(frame, [aiDelay, aiDelay + 15], [0, 1], { extrapolateRight: 'clamp' })
  const aiY = interpolate(spring({ frame: Math.max(0, frame - aiDelay), fps, config: MOTION.snappy }), [0, 1], [15, 0])

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

      {/* User chat at top */}
      <div style={{
        opacity: chatOpacity,
        transform: `translateY(${chatY}px)`,
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 30,
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surfaceLight,
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 12,
          padding: '12px 20px',
          maxWidth: 600,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>gestor</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.text, lineHeight: '22px' }}>
            mostra a diferenca entre o subject original e o otimizado
          </div>
        </div>
      </div>

      {/* Comparison panels */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* BEFORE panel */}
        <div style={{
          width: 380,
          transform: `scale(${leftScale})`,
          opacity: leftOpacity,
          backgroundColor: COLORS.surface,
          border: `1px solid rgba(239, 68, 68, 0.2)`,
          borderRadius: 16,
          padding: '28px 32px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: COLORS.accent,
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 16,
          }}>
            antes
          </div>

          {/* Subject */}
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: COLORS.textMuted,
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>subject</div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 16,
            color: COLORS.text,
            marginBottom: 20,
            padding: '10px 14px',
            backgroundColor: COLORS.surfaceLight,
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
          }}>
            MEGA OFERTA! 50% OFF HOJE
          </div>

          {/* Result badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: FONTS.mono,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 6,
            padding: '6px 14px',
            marginBottom: 16,
          }}>
            {'\u25CF'} PROMOCOES
          </div>

          {/* Bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, marginBottom: 6 }}>taxa de abertura</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4 }}>
                <div style={{
                  width: `${beforeBarWidth}%`,
                  height: '100%',
                  backgroundColor: '#f59e0b',
                  borderRadius: 4,
                  boxShadow: '0 0 6px rgba(245, 158, 11, 0.3)',
                }} />
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 'bold', color: '#f59e0b', width: 50 }}>
                {Math.round(beforeBarWidth)}%
              </span>
            </div>
          </div>
        </div>

        {/* VS badge */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${vsScale})`,
          zIndex: 5,
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: COLORS.bg,
          border: `2px solid ${COLORS.accent}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: `0 0 20px ${COLORS.accentGlow}`,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 'bold', color: COLORS.accent }}>VS</span>
        </div>

        {/* AFTER panel */}
        <div style={{
          width: 380,
          transform: `scale(${rightScale})`,
          opacity: rightOpacity,
          backgroundColor: COLORS.surface,
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 16,
          padding: '28px 32px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: '#22c55e',
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 16,
          }}>
            depois
          </div>

          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: COLORS.textMuted,
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>subject</div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 16,
            color: COLORS.text,
            marginBottom: 20,
            padding: '10px 14px',
            backgroundColor: COLORS.surfaceLight,
            borderRadius: 8,
            border: '1px solid rgba(34, 197, 94, 0.15)',
          }}>
            sobre aquele problema que tu me contou
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: FONTS.mono,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 6,
            padding: '6px 14px',
            marginBottom: 16,
          }}>
            {'\u2713'} CAIXA DE ENTRADA
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, marginBottom: 6 }}>taxa de abertura</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4 }}>
                <div style={{
                  width: `${afterBarWidth}%`,
                  height: '100%',
                  backgroundColor: '#22c55e',
                  borderRadius: 4,
                  boxShadow: '0 0 6px rgba(34, 197, 94, 0.3)',
                }} />
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 'bold', color: '#22c55e', width: 50 }}>
                {Math.round(afterBarWidth)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement callout */}
      <div style={{
        position: 'absolute',
        top: '38%',
        right: 140,
        transform: `scale(${arrowScale})`,
        opacity: arrowOpacity,
        zIndex: 5,
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 28,
          fontWeight: 'bold',
          color: '#22c55e',
          textShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
        }}>
          +250%
        </div>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 11,
          color: COLORS.textMuted,
          letterSpacing: 1,
        }}>
          open rate
        </div>
      </div>

      {/* AI response at bottom */}
      <div style={{
        opacity: aiOpacity,
        transform: `translateY(${aiY}px)`,
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: 20,
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: '12px 20px',
          maxWidth: 650,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.accent, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>emailhacker</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.text, lineHeight: '22px' }}>
            aqui a comparacao. subject conversacional venceu por 3.5x. quer aplicar o vencedor no disparo?
          </div>
        </div>
      </div>

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
