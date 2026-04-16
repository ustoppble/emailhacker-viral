import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const ROUNDS = [
  { tag: 'R1', name: 'Baseline', result: 'promo', icon: '📧' },
  { tag: 'R2', name: 'Subject', result: 'promo', icon: '✉️' },
  { tag: 'R3', name: 'Conteudo', result: 'inbox', icon: '💬' },
  { tag: 'R4', name: 'Links', result: 'spam', icon: '🔗' },
  { tag: 'R5', name: 'Completo', result: 'inbox', icon: '🧠' },
]

const RESULT_COLORS: Record<string, string> = {
  inbox: '#22c55e',
  promo: '#f59e0b',
  spam: '#ef4444',
  waiting: '#6b7ea8',
}

const RESULT_LABELS: Record<string, string> = {
  inbox: 'INBOX',
  promo: 'PROMO',
  spam: 'SPAM',
  waiting: '...',
}

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

export const InboxTester: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Each round reveals at different times (staggered dispatch + monitoring)
  const revealFrames = [18, 36, 72, 54, 90]
  const winnerIndex = 2 // R3 = first inbox

  const totalRevealed = revealFrames.filter(f => frame >= f + 12).length
  const progressPct = Math.round((totalRevealed / ROUNDS.length) * 100)

  // Winner confetti
  const winnerFrame = revealFrames[winnerIndex] + 12
  const confettiAge = frame >= winnerFrame ? frame - winnerFrame : 0

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
        <span>monitorando gmail...</span>
        <span style={{
          color: COLORS.textMuted,
          fontSize: 10,
          fontWeight: 'normal',
          letterSpacing: 0,
        }}>
          {progressPct}%
        </span>
      </div>

      {/* Round results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {ROUNDS.map((round, i) => {
          const delay = revealFrames[i]
          const stepSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: MOTION.snappy,
          })
          const stepScale = interpolate(stepSpring, [0, 1], [0.6, 1])
          const stepOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' })
          const stepY = interpolate(stepSpring, [0, 1], [10, 0])

          // Result reveal (spinner → result badge)
          const resultDelay = delay + 12
          const isRevealed = frame >= resultDelay
          const isWinner = i === winnerIndex
          const result = isRevealed ? round.result : 'waiting'
          const resultColor = RESULT_COLORS[result]

          // Spinner for waiting
          const spinAngle = !isRevealed && frame >= delay ? (frame - delay) * 12 : 0

          // Winner glow
          const isInbox = isRevealed && round.result === 'inbox'
          const borderCol = isInbox ? '#22c55e' : COLORS.border
          const bgColor = isInbox ? 'rgba(34, 197, 94, 0.08)' : COLORS.surface

          // Result badge spring
          const badgeSpring = isRevealed
            ? spring({ frame: Math.max(0, frame - resultDelay), fps, config: MOTION.impact })
            : 0

          return (
            <div key={i} style={{ position: 'relative', overflow: 'visible' }}>
              <div style={{
                transform: `scale(${stepScale}) translateY(${stepY}px)`,
                opacity: stepOpacity,
                backgroundColor: bgColor,
                border: `1px solid ${borderCol}`,
                borderLeft: `3px solid ${resultColor}`,
                borderRadius: 6,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isInbox ? `0 0 15px rgba(34, 197, 94, 0.2)` : 'none',
              }}>
                {/* Status indicator */}
                {isRevealed ? (
                  <span style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: resultColor,
                    transform: `scale(${badgeSpring})`,
                    flexShrink: 0,
                    width: 16,
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                    {round.result === 'inbox' ? '\u2713' : round.result === 'spam' ? '\u2717' : '\u25CF'}
                  </span>
                ) : frame >= delay ? (
                  <div style={{
                    width: 12, height: 12, flexShrink: 0,
                    border: `2px solid ${COLORS.accent}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    transform: `rotate(${spinAngle}deg)`,
                    marginLeft: 2,
                  }} />
                ) : (
                  <div style={{ width: 16, flexShrink: 0 }} />
                )}

                {/* Round info */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: isInbox ? '#22c55e' : COLORS.text,
                    fontWeight: isInbox ? 'bold' : 'normal',
                  }}>
                    <span style={{
                      fontSize: 9,
                      color: COLORS.textMuted,
                      marginRight: 6,
                    }}>{round.tag}</span>
                    {round.name}
                  </span>
                </div>

                {/* Result badge */}
                {isRevealed && (
                  <div style={{
                    transform: `scale(${badgeSpring})`,
                    fontFamily: FONTS.mono,
                    fontSize: 9,
                    fontWeight: 'bold',
                    color: resultColor,
                    backgroundColor: `${resultColor}15`,
                    border: `1px solid ${resultColor}40`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    letterSpacing: 1,
                    textShadow: isInbox ? `0 0 6px rgba(34, 197, 94, 0.4)` : 'none',
                  }}>
                    {RESULT_LABELS[round.result]}
                  </div>
                )}

                {/* Winner tag */}
                {isWinner && isRevealed && (
                  <div style={{
                    transform: `scale(${spring({ frame: Math.max(0, frame - resultDelay - 6), fps, config: MOTION.impact })})`,
                    opacity: interpolate(frame, [resultDelay + 6, resultDelay + 10], [0, 1], { extrapolateRight: 'clamp' }),
                    fontFamily: FONTS.mono,
                    fontSize: 8,
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: '#22c55e',
                    borderRadius: 3,
                    padding: '2px 5px',
                    letterSpacing: 1,
                    textShadow: '0 0 4px rgba(0,0,0,0.3)',
                  }}>
                    VENCEDOR
                  </div>
                )}
              </div>

              {/* Winner confetti */}
              {isWinner && confettiAge > 0 && confettiAge < 40 && (
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

      {/* Gmail inbox preview — appears after winner */}
      {frame >= winnerFrame + 10 && (
        <div style={{
          marginTop: 10,
          flex: 1,
          backgroundColor: COLORS.surface,
          border: `1px solid rgba(34, 197, 94, 0.3)`,
          borderRadius: 8,
          padding: '10px 12px',
          overflow: 'hidden',
          opacity: interpolate(frame, [winnerFrame + 10, winnerFrame + 18], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6,
          }}>
            gmail — caixa de entrada
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: '#22c55e',
            fontWeight: 'bold',
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>{'📥'}</span>
            R3 chegou na inbox
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: COLORS.textSecondary,
            lineHeight: '14px',
          }}>
            subject otimizado aplicado automaticamente ao disparo final
          </div>

          {/* Applied badge */}
          {frame >= winnerFrame + 25 && (
            <div style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: FONTS.mono,
              fontSize: 9,
              color: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 4,
              padding: '3px 8px',
              letterSpacing: 1,
              fontWeight: 'bold',
              opacity: interpolate(frame, [winnerFrame + 25, winnerFrame + 33], [0, 1], { extrapolateRight: 'clamp' }),
              transform: `scale(${spring({ frame: Math.max(0, frame - winnerFrame - 25), fps, config: MOTION.bouncy })})`,
            }}>
              {'\u2713'} APLICADO
            </div>
          )}
        </div>
      )}
    </div>
  )
}
