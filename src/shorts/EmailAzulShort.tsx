import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from 'remotion'
import { Audio } from '@remotion/media'
import { uiSwitch, ding, whoosh, whip, shutterModern } from '@remotion/sfx'
import { InsectLogo } from '../components/InsectLogo'
import { COLORS, FONTS, MOTION } from '../styles'

// 27s @ 30fps = 810 frames
// 1080x1920 (9:16)
const FPS = 30

// === SCENE 1: HOOK (0-2.5s = 75 frames) ===
const Hook: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // "teus emails" fades in fast
  const line1Opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
  const line1Y = interpolate(spring({ frame, fps, config: MOTION.snappy }), [0, 1], [40, 0])

  // "tao caindo em" appears after
  const line2Delay = 12
  const line2Opacity = interpolate(frame, [line2Delay, line2Delay + 8], [0, 1], { extrapolateRight: 'clamp' })

  // "PROMOCOES" slams in big
  const kwDelay = 28
  const kwSpring = spring({ frame: Math.max(0, frame - kwDelay), fps, config: MOTION.impact })
  const kwScale = interpolate(kwSpring, [0, 1], [2.5, 1])
  const kwOpacity = interpolate(frame, [kwDelay, kwDelay + 4], [0, 1], { extrapolateRight: 'clamp' })

  // Red flash on keyword
  const flashOpacity = frame >= kwDelay
    ? interpolate(frame, [kwDelay, kwDelay + 2, kwDelay + 6], [0, 0.2, 0], { extrapolateRight: 'clamp' })
    : 0

  // Shake on impact
  const shakeX = frame >= kwDelay && frame < kwDelay + 6
    ? Math.sin(frame * 15) * 4
    : 0

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
      transform: `translateX(${shakeX}px)`,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 0, padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 42, color: COLORS.textSecondary,
          opacity: line1Opacity, transform: `translateY(${line1Y}px)`,
          textAlign: 'center', lineHeight: '52px',
        }}>
          teus emails
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 42, color: COLORS.textSecondary,
          opacity: line2Opacity, textAlign: 'center', lineHeight: '52px',
          marginBottom: 16,
        }}>
          tao caindo em
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 80, fontWeight: 'bold',
          color: COLORS.accent, opacity: kwOpacity,
          transform: `scale(${kwScale})`,
          textShadow: `0 0 40px ${COLORS.accentGlow}, 0 0 80px ${COLORS.accentGlowSoft}`,
          letterSpacing: 4, textAlign: 'center',
        }}>
          PROMOCOES
        </div>
      </div>

      {flashOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: COLORS.accent, opacity: flashOpacity }} />
      )}
    </AbsoluteFill>
  )
}

// === SCENE 2: PROBLEMA — numbers dropping (2.5-6s = 105 frames) ===
const Problema: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Big number counting down
  const pctValue = interpolate(frame, [0, 50], [38, 12], { extrapolateRight: 'clamp' })
  const pctColor = pctValue < 20 ? COLORS.accent : '#f59e0b'

  // Label
  const labelOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' })

  // Bar shrinking
  const barWidth = interpolate(frame, [0, 50], [38, 12], { extrapolateRight: 'clamp' })

  // "ninguem ta lendo" text slam
  const textDelay = 60
  const textSpring = spring({ frame: Math.max(0, frame - textDelay), fps, config: MOTION.impact })
  const textScale = interpolate(textSpring, [0, 1], [1.8, 1])
  const textOpacity = interpolate(frame, [textDelay, textDelay + 5], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20, padding: '0 60px', width: '100%',
      }}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textMuted,
          letterSpacing: 4, textTransform: 'uppercase', opacity: labelOpacity,
        }}>taxa de abertura</div>

        <div style={{
          fontFamily: FONTS.mono, fontSize: 140, fontWeight: 'bold',
          color: pctColor, lineHeight: 1,
          textShadow: pctValue < 20 ? `0 0 30px ${COLORS.accentGlow}` : 'none',
        }}>
          {Math.round(pctValue)}%
        </div>

        {/* Bar */}
        <div style={{
          width: '80%', height: 12, backgroundColor: COLORS.surfaceLight,
          borderRadius: 6, overflow: 'hidden',
        }}>
          <div style={{
            width: `${barWidth}%`, height: '100%',
            backgroundColor: pctColor, borderRadius: 6,
            boxShadow: pctValue < 20 ? `0 0 12px ${COLORS.accentGlow}` : 'none',
          }} />
        </div>

        {/* Slam text */}
        <div style={{
          fontFamily: FONTS.mono, fontSize: 48, fontWeight: 'bold',
          color: COLORS.text, opacity: textOpacity,
          transform: `scale(${textScale})`,
          textAlign: 'center', marginTop: 40, lineHeight: '58px',
        }}>
          ninguem ta<br/>lendo teus emails
        </div>
      </div>
    </AbsoluteFill>
  )
}

// === SCENE 3: SOLUCAO — 5 rounds fast (6-12s = 180 frames) ===
const Solucao: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Title
  const titleSpring = spring({ frame, fps, config: MOTION.snappy })
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  const rounds = [
    { tag: 'R1', label: 'original', result: 'PROMO', color: '#f59e0b', delay: 25 },
    { tag: 'R2', label: 'subject', result: 'PROMO', color: '#f59e0b', delay: 50 },
    { tag: 'R3', label: 'conteudo', result: 'INBOX', color: '#22c55e', delay: 80 },
    { tag: 'R4', label: 'links', result: 'SPAM', color: '#ef4444', delay: 105 },
    { tag: 'R5', label: 'completo', result: 'INBOX', color: '#22c55e', delay: 130 },
  ]

  // Winner highlight
  const winnerDelay = 100
  const winnerFlash = frame >= winnerDelay
    ? interpolate(frame, [winnerDelay, winnerDelay + 3, winnerDelay + 8], [0, 0.12, 0], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 50px',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 12, width: '100%',
      }}>
        {/* Title */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
          fontFamily: FONTS.mono, fontSize: 32, fontWeight: 'bold',
          color: COLORS.accent, letterSpacing: 4,
          textTransform: 'uppercase', marginBottom: 30,
          textShadow: `0 0 20px ${COLORS.accentGlow}`,
        }}>
          5 variantes enviadas
        </div>

        {/* Rounds */}
        {rounds.map((r, i) => {
          const elapsed = frame - r.delay
          const isVisible = elapsed >= 0
          const revealed = elapsed >= 12

          const rowSpring = isVisible ? spring({ frame: elapsed, fps, config: MOTION.snappy }) : 0
          const rowOpacity = isVisible ? interpolate(elapsed, [0, 6], [0, 1], { extrapolateRight: 'clamp' }) : 0

          const isWinner = i === 2
          const badgeSpring = revealed ? spring({ frame: Math.max(0, elapsed - 12), fps, config: MOTION.impact }) : 0

          return (
            <div key={i} style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 16,
              opacity: rowOpacity,
              transform: `scale(${interpolate(rowSpring, [0, 1], [0.9, 1])}) translateX(${interpolate(rowSpring, [0, 1], [30, 0])}px)`,
              padding: '14px 20px',
              backgroundColor: isWinner && revealed ? 'rgba(34, 197, 94, 0.08)' : COLORS.surface,
              border: `1.5px solid ${isWinner && revealed ? 'rgba(34, 197, 94, 0.3)' : COLORS.border}`,
              borderRadius: 14,
              boxShadow: isWinner && revealed ? '0 0 20px rgba(34, 197, 94, 0.15)' : 'none',
            }}>
              <span style={{
                fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textMuted, width: 36,
              }}>{r.tag}</span>
              <span style={{
                fontFamily: FONTS.mono, fontSize: 22, flex: 1,
                color: isWinner && revealed ? '#22c55e' : COLORS.text,
                fontWeight: isWinner && revealed ? 'bold' : 'normal',
              }}>{r.label}</span>

              {revealed ? (
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 16, fontWeight: 'bold',
                  color: r.color, backgroundColor: `${r.color}18`,
                  border: `1px solid ${r.color}40`,
                  borderRadius: 8, padding: '6px 16px', letterSpacing: 2,
                  transform: `scale(${badgeSpring})`, display: 'inline-block',
                }}>{r.result}</span>
              ) : isVisible ? (
                <div style={{
                  width: 18, height: 18,
                  border: `2px solid ${COLORS.accent}`, borderTopColor: 'transparent',
                  borderRadius: '50%', transform: `rotate(${elapsed * 12}deg)`,
                }} />
              ) : null}

              {isWinner && revealed && (
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 12, fontWeight: 'bold',
                  color: '#fff', backgroundColor: '#22c55e',
                  borderRadius: 6, padding: '5px 12px', letterSpacing: 1,
                  transform: `scale(${spring({ frame: Math.max(0, elapsed - 18), fps, config: MOTION.impact })})`,
                }}>{'\u2713'}</span>
              )}
            </div>
          )
        })}
      </div>

      {winnerFlash > 0 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#22c55e', opacity: winnerFlash }} />
      )}
    </AbsoluteFill>
  )
}

// === SCENE 4: RESULTADO — big before/after (12-18s = 180 frames) ===
const Resultado: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Before number
  const beforeSpring = spring({ frame: Math.max(0, frame - 5), fps, config: MOTION.snappy })
  const beforeOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' })

  // Arrow
  const arrowDelay = 45
  const arrowSpring = spring({ frame: Math.max(0, frame - arrowDelay), fps, config: MOTION.impact })
  const arrowOpacity = interpolate(frame, [arrowDelay, arrowDelay + 8], [0, 1], { extrapolateRight: 'clamp' })

  // After number
  const afterDelay = 65
  const afterSpring = spring({ frame: Math.max(0, frame - afterDelay), fps, config: MOTION.impact })
  const afterScale = interpolate(afterSpring, [0, 1], [2, 1])
  const afterOpacity = interpolate(frame, [afterDelay, afterDelay + 5], [0, 1], { extrapolateRight: 'clamp' })

  // +250% badge
  const badgeDelay = 100
  const badgeSpring = spring({ frame: Math.max(0, frame - badgeDelay), fps, config: MOTION.bouncy })
  const badgeOpacity = interpolate(frame, [badgeDelay, badgeDelay + 10], [0, 1], { extrapolateRight: 'clamp' })

  // Flash
  const flashOpacity = frame >= afterDelay
    ? interpolate(frame, [afterDelay, afterDelay + 2, afterDelay + 6], [0, 0.15, 0], { extrapolateRight: 'clamp' })
    : 0

  // Shake
  const shakeX = frame >= afterDelay && frame < afterDelay + 5
    ? Math.sin(frame * 15) * 3 : 0

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center', alignItems: 'center',
      transform: `translateX(${shakeX}px)`,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 24, padding: '0 60px',
      }}>
        {/* BEFORE */}
        <div style={{
          opacity: beforeOpacity,
          transform: `scale(${interpolate(beforeSpring, [0, 1], [0.8, 1])})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 14, color: '#f59e0b',
            letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8,
          }}>antes — promocoes</span>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 100, fontWeight: 'bold',
            color: '#f59e0b', lineHeight: 1, opacity: 0.6,
          }}>12%</span>
        </div>

        {/* Arrow */}
        <div style={{
          opacity: arrowOpacity,
          transform: `scale(${interpolate(arrowSpring, [0, 1], [0, 1])}) rotate(90deg)`,
          fontFamily: FONTS.mono, fontSize: 48, color: COLORS.textMuted,
        }}>{'→'}</div>

        {/* AFTER */}
        <div style={{
          opacity: afterOpacity,
          transform: `scale(${afterScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 14, color: '#22c55e',
            letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8,
          }}>depois — inbox</span>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 140, fontWeight: 'bold',
            color: '#22c55e', lineHeight: 1,
            textShadow: '0 0 40px rgba(34, 197, 94, 0.4)',
          }}>42%</span>
        </div>

        {/* +250% */}
        <div style={{
          opacity: badgeOpacity,
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0.5, 1])})`,
          fontFamily: FONTS.mono, fontSize: 36, fontWeight: 'bold',
          color: '#22c55e', marginTop: 20,
          textShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
          letterSpacing: 2,
        }}>+250% open rate</div>
      </div>

      {flashOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#22c55e', opacity: flashOpacity }} />
      )}
    </AbsoluteFill>
  )
}

// === SCENE 5: BENEFICIO slam (18-22s = 120 frames) ===
const Beneficio: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const lines = ['1 clique.', '5 testes.', 'inbox garantida.']

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center', alignItems: 'center',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accentGlowSoft} 0%, transparent 70%)`,
        opacity: 0.3,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8, padding: '0 50px',
      }}>
        {lines.map((line, i) => {
          const delay = 8 + i * 18
          const lineSpring = spring({ frame: Math.max(0, frame - delay), fps, config: MOTION.impact })
          const lineScale = interpolate(lineSpring, [0, 1], [2.2, 1])
          const lineOpacity = interpolate(frame, [delay, delay + 4], [0, 1], { extrapolateRight: 'clamp' })
          const isLast = i === lines.length - 1

          return (
            <div key={i} style={{
              fontFamily: FONTS.mono,
              fontSize: isLast ? 56 : 48,
              fontWeight: 'bold',
              color: isLast ? COLORS.accent : COLORS.text,
              opacity: lineOpacity,
              transform: `scale(${lineScale})`,
              textAlign: 'center',
              textShadow: isLast ? `0 0 30px ${COLORS.accentGlow}` : 'none',
              letterSpacing: isLast ? 2 : 0,
            }}>
              {line}
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// === SCENE 6: CTA (22-27s = 150 frames) ===
const CTA: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoSpring = spring({ frame: Math.max(0, frame - 5), fps, config: MOTION.bouncy })
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1])
  const logoOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' })

  const textDelay = 25
  const textOpacity = interpolate(frame, [textDelay, textDelay + 12], [0, 1], { extrapolateRight: 'clamp' })

  const dotOpacity = 0.4 + Math.sin(frame * 0.15) * 0.4

  const exitOpacity = interpolate(frame, [130, 150], [1, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center', alignItems: 'center',
      opacity: exitOpacity,
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accentGlowSoft} 0%, transparent 70%)`,
        opacity: 0.25,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 30,
        transform: `scale(${logoScale})`, opacity: logoOpacity,
      }}>
        <InsectLogo width={100} height={100} glowIntensity={0.9} />
        <div style={{
          fontFamily: FONTS.mono, fontSize: 36, fontWeight: 'bold',
          color: COLORS.text, letterSpacing: 4, textTransform: 'uppercase',
          opacity: textOpacity, textAlign: 'center',
        }}>
          EMAILHACKER<span style={{ color: COLORS.accent }}>.AI</span>
        </div>
      </div>

      {/* Red dot */}
      <div style={{
        position: 'absolute', top: '44%', right: '30%',
        width: 8, height: 8, borderRadius: '50%',
        backgroundColor: COLORS.accent, opacity: dotOpacity,
        boxShadow: `0 0 12px ${COLORS.accentGlow}`,
      }} />
    </AbsoluteFill>
  )
}

// === MAIN COMPOSITION ===
const SCENE_FRAMES = {
  hook: 75,        // 2.5s
  problema: 105,   // 3.5s
  solucao: 180,    // 6s
  resultado: 180,  // 6s
  beneficio: 120,  // 4s
  cta: 150,        // 5s
}

export const SHORT_TOTAL = Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0) // 810 = 27s

export const EmailAzulShort: React.FC = () => {
  const CF = 6 // tight crossfade for shorts
  const offsets = {
    hook: 0,
    problema: SCENE_FRAMES.hook - CF,
    solucao: SCENE_FRAMES.hook + SCENE_FRAMES.problema - CF * 2,
    resultado: SCENE_FRAMES.hook + SCENE_FRAMES.problema + SCENE_FRAMES.solucao - CF * 3,
    beneficio: SCENE_FRAMES.hook + SCENE_FRAMES.problema + SCENE_FRAMES.solucao + SCENE_FRAMES.resultado - CF * 4,
    cta: SCENE_FRAMES.hook + SCENE_FRAMES.problema + SCENE_FRAMES.solucao + SCENE_FRAMES.resultado + SCENE_FRAMES.beneficio - CF * 5,
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={offsets.hook} durationInFrames={SCENE_FRAMES.hook}>
        <Hook />
      </Sequence>
      <Sequence from={offsets.problema} durationInFrames={SCENE_FRAMES.problema}>
        <Problema />
      </Sequence>
      <Sequence from={offsets.solucao} durationInFrames={SCENE_FRAMES.solucao}>
        <Solucao />
      </Sequence>
      <Sequence from={offsets.resultado} durationInFrames={SCENE_FRAMES.resultado}>
        <Resultado />
      </Sequence>
      <Sequence from={offsets.beneficio} durationInFrames={SCENE_FRAMES.beneficio}>
        <Beneficio />
      </Sequence>
      <Sequence from={offsets.cta} durationInFrames={SCENE_FRAMES.cta}>
        <CTA />
      </Sequence>

      {/* Music */}
      <Audio
        src={staticFile('bg-music.mp3')}
        volume={(f) =>
          interpolate(f, [0, 30, SHORT_TOTAL - 45, SHORT_TOTAL], [0, 0.15, 0.15, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          })
        }
        loop
      />

      {/* SFX */}
      <Sequence from={offsets.hook + 28}><Audio src={whip} volume={0.5} /></Sequence>
      <Sequence from={offsets.problema + 60}><Audio src={whoosh} volume={0.3} /></Sequence>
      <Sequence from={offsets.solucao + 80}><Audio src={shutterModern} volume={0.4} /></Sequence>
      <Sequence from={offsets.solucao + 10}><Audio src={uiSwitch} volume={0.25} /></Sequence>
      <Sequence from={offsets.resultado + 65}><Audio src={whip} volume={0.45} /></Sequence>
      <Sequence from={offsets.resultado + 100}><Audio src={ding} volume={0.35} /></Sequence>
      <Sequence from={offsets.beneficio + 8}><Audio src={whoosh} volume={0.3} /></Sequence>
      <Sequence from={offsets.beneficio + 44}><Audio src={shutterModern} volume={0.4} /></Sequence>
      <Sequence from={offsets.cta + 5}><Audio src={uiSwitch} volume={0.4} /></Sequence>
    </AbsoluteFill>
  )
}
