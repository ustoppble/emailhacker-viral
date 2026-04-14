import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

interface Message {
  from: 'user' | 'ai'
  text: string
  delay: number
}

const MESSAGES: Message[] = [
  { from: 'user', text: 'minhas taxas de abertura despencaram essa semana. acho que to caindo em promocoes 😰', delay: 15 },
  { from: 'ai', text: 'como posso te ajudar?', delay: 70 },
  { from: 'user', text: 'testa meu proximo email e descobre se vai pra inbox ou promocoes', delay: 120 },
]

const TypingDots: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: 'flex', gap: 5, padding: '6px 0' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        backgroundColor: COLORS.textMuted,
        opacity: 0.3 + Math.sin((frame + i * 8) * 0.2) * 0.5,
      }} />
    ))}
  </div>
)

export const ChatTriggerV: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Notification
  const notifSpring = spring({ frame: Math.max(0, frame - 5), fps, config: MOTION.bouncy })
  const notifY = interpolate(notifSpring, [0, 1], [-60, 0])
  const notifOpacity = interpolate(frame, [5, 13], [0, 1], { extrapolateRight: 'clamp' })
  const notifExit = interpolate(frame, [50, 65], [1, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      padding: '80px 40px',
      flexDirection: 'column',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${COLORS.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gridLine} 1px, transparent 1px)`,
        backgroundSize: '50px 50px', opacity: 0.4,
      }} />

      {/* Notification */}
      <div style={{
        transform: `translateY(${notifY}px)`,
        opacity: notifOpacity * notifExit,
        display: 'flex', alignItems: 'center', gap: 12,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14, padding: '14px 24px',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        marginBottom: 60, zIndex: 2,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: COLORS.accent,
          boxShadow: `0 0 8px ${COLORS.accentGlow}`,
        }} />
        <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textSecondary }}>
          alerta: taxa de abertura caiu <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>-30%</span>
        </span>
      </div>

      {/* Chat */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 24, zIndex: 2,
      }}>
        {MESSAGES.map((msg, i) => {
          const elapsed = frame - msg.delay
          if (elapsed < 0) return null

          const msgSpring = spring({ frame: elapsed, fps, config: MOTION.snappy })
          const msgScale = interpolate(msgSpring, [0, 1], [0.92, 1])
          const msgOpacity = interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
          const msgY = interpolate(msgSpring, [0, 1], [15, 0])

          const isUser = msg.from === 'user'
          const charsVisible = Math.min(msg.text.length, Math.floor(elapsed * 1.2))
          const showCursor = charsVisible < msg.text.length

          return (
            <div key={i} style={{
              display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
              transform: `scale(${msgScale}) translateY(${msgY}px)`,
              opacity: msgOpacity,
            }}>
              <div style={{
                maxWidth: '85%',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  backgroundColor: isUser ? COLORS.surfaceLight : COLORS.accent,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  flexShrink: 0,
                  border: `2px solid ${isUser ? COLORS.border : COLORS.accent}`,
                }}>
                  <span style={{
                    fontFamily: FONTS.mono, fontSize: 18,
                    color: isUser ? COLORS.textMuted : '#fff', fontWeight: 'bold',
                  }}>
                    {isUser ? 'G' : 'E'}
                  </span>
                </div>

                {/* Bubble */}
                <div style={{
                  backgroundColor: isUser ? COLORS.surfaceLight : COLORS.surface,
                  border: `1px solid ${isUser ? 'rgba(255,255,255,0.08)' : COLORS.border}`,
                  borderRadius: 16, padding: '16px 22px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                }}>
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: 12,
                    color: isUser ? COLORS.textMuted : COLORS.accent,
                    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8,
                  }}>
                    {isUser ? 'gestor' : 'emailhacker'}
                  </div>
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: 20,
                    color: COLORS.text, lineHeight: '30px',
                  }}>
                    {msg.text.slice(0, charsVisible)}
                    {showCursor && (
                      <span style={{ color: COLORS.accent, opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0 }}>|</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {frame >= 55 && frame < 70 && (
          <div style={{
            display: 'flex', justifyContent: 'flex-start',
            opacity: interpolate(frame, [55, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                backgroundColor: COLORS.accent,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: `2px solid ${COLORS.accent}`,
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 18, color: '#fff', fontWeight: 'bold' }}>E</span>
              </div>
              <div style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: '16px 22px',
              }}>
                <TypingDots frame={frame} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}
