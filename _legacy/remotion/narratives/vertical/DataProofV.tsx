import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const ROUNDS = [
  { tag: 'R1', name: 'Baseline', result: 'promo' as const, delay: 30 },
  { tag: 'R2', name: 'Subject', result: 'promo' as const, delay: 55 },
  { tag: 'R3', name: 'Conteudo', result: 'inbox' as const, delay: 90 },
  { tag: 'R4', name: 'Links', result: 'spam' as const, delay: 120 },
  { tag: 'R5', name: 'Completo', result: 'inbox' as const, delay: 150 },
]

const CFG: Record<string, { color: string; label: string; icon: string }> = {
  inbox: { color: '#22c55e', label: 'INBOX', icon: '\u2713' },
  promo: { color: '#f59e0b', label: 'PROMO', icon: '\u25CF' },
  spam: { color: '#ef4444', label: 'SPAM', icon: '\u2717' },
}

export const DataProofV: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const panelSpring = spring({ frame: Math.max(0, frame - 8), fps, config: MOTION.snappy })
  const panelScale = interpolate(panelSpring, [0, 1], [0.96, 1])

  const winnerFrame = 115
  const winnerOpacity = interpolate(frame, [winnerFrame, winnerFrame + 15], [0, 1], { extrapolateRight: 'clamp' })
  const winnerSpring = spring({ frame: Math.max(0, frame - winnerFrame), fps, config: MOTION.bouncy })

  const flashOpacity = frame >= winnerFrame
    ? interpolate(frame, [winnerFrame, winnerFrame + 3, winnerFrame + 8], [0, 0.12, 0], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      padding: '100px 40px 80px',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${COLORS.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gridLine} 1px, transparent 1px)`,
        backgroundSize: '50px 50px', opacity: 0.4,
      }} />

      {/* Title */}
      <div style={{
        opacity: titleOpacity, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8, marginBottom: 50, zIndex: 2, flexShrink: 0,
      }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 18, color: COLORS.accent,
          textTransform: 'uppercase', letterSpacing: 8,
        }}>email azul</div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 24, color: COLORS.textSecondary, letterSpacing: 3,
        }}>teste de entregabilidade</div>
      </div>

      {/* Panel — full width */}
      <div style={{
        width: '100%', transform: `scale(${panelScale})`,
        opacity: interpolate(frame, [8, 20], [0, 1], { extrapolateRight: 'clamp' }),
        backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 20, padding: '32px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)', zIndex: 2,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 28, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 18,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.textMuted, letterSpacing: 2, textTransform: 'uppercase' }}>
            monitorando gmail
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.accent, opacity: 0.5 + Math.sin(frame * 0.15) * 0.3 }}>
            {'\u25CF'} ao vivo
          </span>
        </div>

        {/* Rounds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ROUNDS.map((round, i) => {
            const elapsed = frame - round.delay
            const isVisible = elapsed >= 0
            const revealed = elapsed >= 18
            const cfg = revealed ? CFG[round.result] : null
            const isWinner = round.result === 'inbox' && i === 2

            const rowSpring = isVisible ? spring({ frame: elapsed, fps, config: MOTION.snappy }) : 0
            const rowOpacity = isVisible ? interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' }) : 0
            const badgeSpring = revealed ? spring({ frame: Math.max(0, elapsed - 18), fps, config: MOTION.impact }) : 0

            const barWidth = revealed
              ? interpolate(elapsed, [18, 30], [0, round.result === 'inbox' ? 85 : round.result === 'promo' ? 45 : 15], { extrapolateRight: 'clamp' })
              : interpolate(Math.max(0, elapsed), [0, 18], [0, 60], { extrapolateRight: 'clamp' })

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                transform: `scale(${interpolate(rowSpring, [0, 1], [0.95, 1])})`,
                opacity: rowOpacity,
                padding: '12px 18px',
                backgroundColor: isWinner && revealed ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
                border: `1px solid ${isWinner && revealed ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}`,
                borderRadius: 12,
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textMuted, width: 30, flexShrink: 0 }}>{round.tag}</span>
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 18, width: 120, flexShrink: 0,
                  color: isWinner && revealed ? '#22c55e' : COLORS.text,
                  fontWeight: isWinner && revealed ? 'bold' : 'normal',
                }}>{round.name}</span>

                {/* Bar */}
                <div style={{ flex: 1, height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4 }}>
                  <div style={{
                    width: `${barWidth}%`, height: '100%',
                    backgroundColor: revealed && cfg ? cfg.color : COLORS.accent,
                    borderRadius: 4,
                  }} />
                </div>

                {/* Badge */}
                <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}>
                  {revealed && cfg ? (
                    <span style={{
                      fontFamily: FONTS.mono, fontSize: 13, fontWeight: 'bold',
                      color: cfg.color, backgroundColor: `${cfg.color}15`,
                      border: `1px solid ${cfg.color}40`, borderRadius: 6,
                      padding: '4px 12px', letterSpacing: 1,
                      transform: `scale(${badgeSpring})`, display: 'inline-block',
                    }}>{cfg.icon} {cfg.label}</span>
                  ) : isVisible ? (
                    <div style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: `2px solid ${COLORS.accent}`, borderTopColor: 'transparent',
                      borderRadius: '50%', transform: `rotate(${elapsed * 12}deg)`,
                    }} />
                  ) : null}
                </div>

                {isWinner && revealed && (
                  <span style={{
                    fontFamily: FONTS.mono, fontSize: 11, fontWeight: 'bold', color: '#fff',
                    backgroundColor: '#22c55e', borderRadius: 5, padding: '4px 10px', letterSpacing: 1,
                    opacity: interpolate(frame, [round.delay + 25, round.delay + 32], [0, 1], { extrapolateRight: 'clamp' }),
                    transform: `scale(${spring({ frame: Math.max(0, frame - round.delay - 25), fps, config: MOTION.impact })})`,
                  }}>VENCEDOR</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Winner announcement */}
      <div style={{
        marginTop: 40, transform: `scale(${interpolate(winnerSpring, [0, 1], [0.8, 1])})`,
        opacity: winnerOpacity, backgroundColor: COLORS.surface,
        border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 14,
        padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 2,
      }}>
        <span style={{ fontSize: 24 }}>{'📥'}</span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text }}>
          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>R3</span> chegou na inbox
        </span>
      </div>

      {flashOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#22c55e', opacity: flashOpacity, pointerEvents: 'none' }} />
      )}
    </AbsoluteFill>
  )
}
