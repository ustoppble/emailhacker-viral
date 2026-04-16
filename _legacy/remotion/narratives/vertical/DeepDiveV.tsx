import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

export const DeepDiveV: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Chat
  const chatOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const chatY = interpolate(spring({ frame, fps, config: MOTION.snappy }), [0, 1], [15, 0])

  // Panels — stacked vertically for mobile
  const topDelay = 40
  const botDelay = 65
  const topSpring = spring({ frame: Math.max(0, frame - topDelay), fps, config: MOTION.snappy })
  const botSpring = spring({ frame: Math.max(0, frame - botDelay), fps, config: MOTION.snappy })

  // Bars
  const barDelay = 90
  const beforeBar = interpolate(frame, [barDelay, barDelay + 25], [0, 12], { extrapolateRight: 'clamp' })
  const afterBar = interpolate(frame, [barDelay + 10, barDelay + 35], [0, 42], { extrapolateRight: 'clamp' })

  // Improvement
  const impDelay = 160
  const impOpacity = interpolate(frame, [impDelay, impDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
  const impSpring = spring({ frame: Math.max(0, frame - impDelay), fps, config: MOTION.impact })

  // AI response
  const aiDelay = 220
  const aiOpacity = interpolate(frame, [aiDelay, aiDelay + 15], [0, 1], { extrapolateRight: 'clamp' })

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
          <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text, lineHeight: '28px' }}>
            mostra a diferenca entre o original e o otimizado
          </div>
        </div>
      </div>

      {/* Stacked comparison cards */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        gap: 24, justifyContent: 'center', zIndex: 2,
      }}>
        {/* BEFORE */}
        <div style={{
          transform: `scale(${interpolate(topSpring, [0, 1], [0.92, 1])})`,
          opacity: interpolate(frame, [topDelay, topDelay + 10], [0, 1], { extrapolateRight: 'clamp' }),
          backgroundColor: COLORS.surface, border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 18, padding: '24px 28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.accent, letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>antes</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>subject</div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 20, color: COLORS.text, marginBottom: 16,
            padding: '12px 16px', backgroundColor: COLORS.surfaceLight, borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
          }}>MEGA OFERTA! 50% OFF HOJE</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: FONTS.mono, fontSize: 14, fontWeight: 'bold', color: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 8, padding: '8px 16px', marginBottom: 14,
          }}>{'\u25CF'} PROMOCOES</div>
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>taxa de abertura</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 5 }}>
                <div style={{ width: `${beforeBar}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: 5 }} />
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 'bold', color: '#f59e0b' }}>{Math.round(beforeBar)}%</span>
            </div>
          </div>
        </div>

        {/* +250% improvement badge */}
        <div style={{
          alignSelf: 'center',
          transform: `scale(${interpolate(impSpring, [0, 1], [0, 1])})`,
          opacity: impOpacity,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 42, fontWeight: 'bold', color: '#22c55e',
            textShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
          }}>+250%</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 2 }}>open rate</div>
        </div>

        {/* AFTER */}
        <div style={{
          transform: `scale(${interpolate(botSpring, [0, 1], [0.92, 1])})`,
          opacity: interpolate(frame, [botDelay, botDelay + 10], [0, 1], { extrapolateRight: 'clamp' }),
          backgroundColor: COLORS.surface, border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 18, padding: '24px 28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: '#22c55e', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>depois</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>subject</div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 20, color: COLORS.text, marginBottom: 16,
            padding: '12px 16px', backgroundColor: COLORS.surfaceLight, borderRadius: 10,
            border: '1px solid rgba(34, 197, 94, 0.15)',
          }}>sobre aquele problema que tu me contou</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: FONTS.mono, fontSize: 14, fontWeight: 'bold', color: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 8, padding: '8px 16px', marginBottom: 14,
          }}>{'\u2713'} CAIXA DE ENTRADA</div>
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>taxa de abertura</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 5 }}>
                <div style={{ width: `${afterBar}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: 5 }} />
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 'bold', color: '#22c55e' }}>{Math.round(afterBar)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI response */}
      <div style={{
        opacity: aiOpacity, display: 'flex', justifyContent: 'flex-start',
        marginTop: 30, flexShrink: 0, zIndex: 2,
      }}>
        <div style={{
          backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 14, padding: '14px 22px', maxWidth: '90%',
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.accent, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>emailhacker</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text, lineHeight: '28px' }}>
            subject conversacional venceu por 3.5x. quer aplicar?
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
