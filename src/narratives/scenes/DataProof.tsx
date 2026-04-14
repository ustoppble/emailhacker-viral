import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

interface Round {
  tag: string
  name: string
  result: 'inbox' | 'promo' | 'spam' | 'waiting'
  delay: number
}

const ROUNDS: Round[] = [
  { tag: 'R1', name: 'Baseline', result: 'promo', delay: 30 },
  { tag: 'R2', name: 'Subject', result: 'promo', delay: 55 },
  { tag: 'R3', name: 'Conteudo', result: 'inbox', delay: 90 },
  { tag: 'R4', name: 'Links', result: 'spam', delay: 120 },
  { tag: 'R5', name: 'Completo', result: 'inbox', delay: 150 },
]

const RESULT_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  inbox: { color: '#22c55e', label: 'INBOX', icon: '\u2713' },
  promo: { color: '#f59e0b', label: 'PROMO', icon: '\u25CF' },
  spam: { color: '#ef4444', label: 'SPAM', icon: '\u2717' },
  waiting: { color: '#6b7ea8', label: '...', icon: '' },
}

export const DataProof: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Title
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })

  // Dashboard panel entry
  const panelSpring = spring({ frame: Math.max(0, frame - 8), fps, config: MOTION.snappy })
  const panelScale = interpolate(panelSpring, [0, 1], [0.95, 1])
  const panelOpacity = interpolate(frame, [8, 20], [0, 1], { extrapolateRight: 'clamp' })

  // Winner announcement
  const winnerFrame = 115
  const winnerOpacity = interpolate(frame, [winnerFrame, winnerFrame + 15], [0, 1], { extrapolateRight: 'clamp' })
  const winnerSpring = spring({ frame: Math.max(0, frame - winnerFrame), fps, config: MOTION.bouncy })
  const winnerScale = interpolate(winnerSpring, [0, 1], [0.8, 1])

  // Green flash on winner
  const flashOpacity = frame >= winnerFrame
    ? interpolate(frame, [winnerFrame, winnerFrame + 3, winnerFrame + 8], [0, 0.15, 0], { extrapolateRight: 'clamp' })
    : 0

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

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: titleOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.accent,
          textTransform: 'uppercase',
          letterSpacing: 6,
        }}>
          email azul
        </div>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 20,
          color: COLORS.textSecondary,
          letterSpacing: 3,
        }}>
          teste de entregabilidade
        </div>
      </div>

      {/* Dashboard panel */}
      <div style={{
        width: 900,
        transform: `scale(${panelScale})`,
        opacity: panelOpacity,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: '30px 40px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          borderBottom: `1px solid ${COLORS.border}`,
          paddingBottom: 16,
        }}>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 13,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            monitorando gmail — 5 variantes
          </div>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: COLORS.accent,
            opacity: 0.5 + Math.sin(frame * 0.15) * 0.3,
          }}>
            {'\u25CF'} ao vivo
          </div>
        </div>

        {/* Rounds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROUNDS.map((round, i) => {
            const elapsed = frame - round.delay
            const isVisible = elapsed >= 0
            const resultRevealed = elapsed >= 18
            const cfg = resultRevealed ? RESULT_CONFIG[round.result] : RESULT_CONFIG.waiting
            const isWinner = round.result === 'inbox' && i === 2 // R3 first inbox

            const rowSpring = isVisible
              ? spring({ frame: elapsed, fps, config: MOTION.snappy })
              : 0
            const rowScale = interpolate(rowSpring, [0, 1], [0.9, 1])
            const rowOpacity = isVisible
              ? interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
              : 0

            const badgeSpring = resultRevealed
              ? spring({ frame: Math.max(0, elapsed - 18), fps, config: MOTION.impact })
              : 0

            // Progress bar fill
            const barWidth = resultRevealed
              ? interpolate(elapsed, [18, 30], [0, round.result === 'inbox' ? 85 : round.result === 'promo' ? 45 : 15], { extrapolateRight: 'clamp' })
              : interpolate(elapsed, [0, 18], [0, 60], { extrapolateRight: 'clamp' })

            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transform: `scale(${rowScale})`,
                opacity: rowOpacity,
                padding: '10px 16px',
                backgroundColor: isWinner && resultRevealed ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
                border: `1px solid ${isWinner && resultRevealed ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}`,
                borderRadius: 10,
              }}>
                {/* Tag */}
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  color: COLORS.textMuted,
                  width: 30,
                  flexShrink: 0,
                }}>
                  {round.tag}
                </div>

                {/* Name */}
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: 15,
                  color: isWinner && resultRevealed ? '#22c55e' : COLORS.text,
                  fontWeight: isWinner && resultRevealed ? 'bold' : 'normal',
                  width: 100,
                  flexShrink: 0,
                }}>
                  {round.name}
                </div>

                {/* Progress bar */}
                <div style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: COLORS.surfaceLight,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: resultRevealed ? cfg.color : COLORS.accent,
                    borderRadius: 3,
                    boxShadow: resultRevealed ? `0 0 8px ${cfg.color}40` : 'none',
                  }} />
                </div>

                {/* Spinner or result badge */}
                <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
                  {resultRevealed ? (
                    <span style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: cfg.color,
                      backgroundColor: `${cfg.color}15`,
                      border: `1px solid ${cfg.color}40`,
                      borderRadius: 4,
                      padding: '3px 10px',
                      letterSpacing: 1,
                      transform: `scale(${badgeSpring})`,
                      display: 'inline-block',
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  ) : isVisible ? (
                    <div style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      border: `2px solid ${COLORS.accent}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      transform: `rotate(${elapsed * 12}deg)`,
                    }} />
                  ) : null}
                </div>

                {/* Winner tag */}
                {isWinner && resultRevealed && (
                  <span style={{
                    fontFamily: FONTS.mono,
                    fontSize: 9,
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: '#22c55e',
                    borderRadius: 4,
                    padding: '3px 8px',
                    letterSpacing: 1,
                    opacity: interpolate(frame, [round.delay + 25, round.delay + 32], [0, 1], { extrapolateRight: 'clamp' }),
                    transform: `scale(${spring({ frame: Math.max(0, frame - round.delay - 25), fps, config: MOTION.impact })})`,
                  }}>
                    VENCEDOR
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Winner announcement card */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: `translateX(-50%) scale(${winnerScale})`,
        opacity: winnerOpacity,
        backgroundColor: COLORS.surface,
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: 12,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <span style={{ fontSize: 18 }}>{'📥'}</span>
        <span style={{
          fontFamily: FONTS.mono,
          fontSize: 15,
          color: COLORS.text,
        }}>
          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>R3</span> chegou na inbox.
          subject conversacional venceu.
        </span>
      </div>

      {/* Green flash */}
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
