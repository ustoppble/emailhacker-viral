import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

interface Message {
  from: 'user' | 'ai'
  text: string
  delay: number // frame when message appears
}

const MESSAGES: Message[] = [
  {
    from: 'user',
    text: 'minhas taxas de abertura despencaram essa semana. acho que to caindo em promocoes 😰',
    delay: 15,
  },
  {
    from: 'ai',
    text: 'como posso te ajudar?',
    delay: 70,
  },
  {
    from: 'user',
    text: 'testa meu proximo email e descobre se vai pra inbox ou promocoes',
    delay: 120,
  },
]

// Typing indicator (three dots)
const TypingDots: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: COLORS.textMuted,
        opacity: 0.3 + Math.sin((frame + i * 8) * 0.2) * 0.5,
      }} />
    ))}
  </div>
)

export const ChatTrigger: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Notification slide-in from top
  const notifDelay = 5
  const notifSpring = spring({ frame: Math.max(0, frame - notifDelay), fps, config: MOTION.bouncy })
  const notifY = interpolate(notifSpring, [0, 1], [-80, 0])
  const notifOpacity = interpolate(frame, [notifDelay, notifDelay + 8], [0, 1], { extrapolateRight: 'clamp' })
  // Notification exits
  const notifExit = interpolate(frame, [50, 65], [1, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(${COLORS.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gridLine} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.5,
      }} />

      {/* Notification banner */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: `translateX(-50%) translateY(${notifY}px)`,
        opacity: notifOpacity * notifExit,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: '12px 24px',
        boxShadow: `0 4px 30px rgba(0,0,0,0.4)`,
        zIndex: 10,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: COLORS.accent,
          boxShadow: `0 0 8px ${COLORS.accentGlow}`,
        }} />
        <span style={{
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.textSecondary,
        }}>
          alerta: taxa de abertura caiu <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>-30%</span> essa semana
        </span>
      </div>

      {/* Chat container */}
      <div style={{
        width: 800,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '0 40px',
      }}>
        {MESSAGES.map((msg, i) => {
          const elapsed = frame - msg.delay
          if (elapsed < 0) return null

          const msgSpring = spring({ frame: elapsed, fps, config: MOTION.snappy })
          const msgScale = interpolate(msgSpring, [0, 1], [0.9, 1])
          const msgOpacity = interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
          const msgY = interpolate(msgSpring, [0, 1], [15, 0])

          const isUser = msg.from === 'user'

          // Typewriter for message text
          const charsVisible = Math.min(msg.text.length, Math.floor(elapsed * 1.2))
          const displayText = msg.text.slice(0, charsVisible)
          const showCursor = charsVisible < msg.text.length

          return (
            <div key={i} style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              transform: `scale(${msgScale}) translateY(${msgY}px)`,
              opacity: msgOpacity,
            }}>
              <div style={{
                maxWidth: 550,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: isUser ? COLORS.surfaceLight : COLORS.accent,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0,
                  border: `1.5px solid ${isUser ? COLORS.border : COLORS.accent}`,
                }}>
                  <span style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    color: isUser ? COLORS.textMuted : '#fff',
                    fontWeight: 'bold',
                  }}>
                    {isUser ? 'G' : 'E'}
                  </span>
                </div>

                {/* Bubble */}
                <div style={{
                  backgroundColor: isUser ? COLORS.surfaceLight : COLORS.surface,
                  border: `1px solid ${isUser ? 'rgba(255,255,255,0.08)' : COLORS.border}`,
                  borderRadius: 12,
                  padding: '14px 18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}>
                  {/* Label */}
                  <div style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    color: isUser ? COLORS.textMuted : COLORS.accent,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    marginBottom: 6,
                  }}>
                    {isUser ? 'gestor' : 'emailhacker'}
                  </div>
                  <div style={{
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    color: COLORS.text,
                    lineHeight: '24px',
                  }}>
                    {displayText}
                    {showCursor && (
                      <span style={{
                        color: COLORS.accent,
                        opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                      }}>|</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator before AI response */}
        {frame >= 55 && frame < 70 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            opacity: interpolate(frame, [55, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: COLORS.accent,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: `1.5px solid ${COLORS.accent}`,
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: '#fff', fontWeight: 'bold' }}>E</span>
              </div>
              <div style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: '14px 18px',
              }}>
                <TypingDots frame={frame} />
              </div>
            </div>
          </div>
        )}
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
