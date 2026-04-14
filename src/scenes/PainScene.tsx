import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, SIZES, MOTION, VIDEO } from '../styles'

interface Props {
  text: string
  keyword: string
}

// Deterministic seed
const seed = (i: number, salt: number) => ((i * 7919 + salt * 6271 + 1) % 10000) / 10000

// Danger icons — scattered warning triangles and X marks
interface DangerIcon {
  x: number
  y: number
  type: 'triangle' | 'x'
  phase: number
  size: number
}

const DANGER_ICONS: DangerIcon[] = Array.from({ length: 18 }).map((_, i) => ({
  x: seed(i, 0) * VIDEO.width,
  y: seed(i, 1) * VIDEO.height,
  type: seed(i, 2) > 0.5 ? 'triangle' : 'x',
  phase: seed(i, 3) * Math.PI * 2,
  size: 12 + seed(i, 4) * 16,
}))

// Declining graph SVG path points (top-left area)
const GRAPH_POINTS: [number, number][] = [
  [0, 40], [30, 35], [60, 50], [90, 45], [120, 65],
  [150, 60], [180, 80], [210, 75], [240, 95], [270, 110],
  [300, 105], [330, 130], [360, 145], [390, 160], [420, 180],
]

export const PainScene: React.FC<Props> = ({ text, keyword }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Continuous zoom across scene duration
  const sceneZoom = interpolate(frame, [0, 150], [0.98, 1.02], { extrapolateRight: 'clamp' })

  // --- RED PULSE: heartbeat background glow (~1.5s = 45 frames cycle) ---
  // Double-beat like a heartbeat: quick pulse, slight dip, second pulse
  const heartbeatCycle = (frame % 45) / 45
  const heartbeat =
    heartbeatCycle < 0.12
      ? interpolate(heartbeatCycle, [0, 0.12], [0.15, 0.50])     // first beat up
      : heartbeatCycle < 0.22
        ? interpolate(heartbeatCycle, [0.12, 0.22], [0.50, 0.25]) // dip
        : heartbeatCycle < 0.35
          ? interpolate(heartbeatCycle, [0.22, 0.35], [0.25, 0.42]) // second beat
          : interpolate(heartbeatCycle, [0.35, 1.0], [0.42, 0.15])  // slow fade back

  // --- ENTER: fade in ---
  const enterOpacity = interpolate(frame, [0, MOTION.fadeIn], [0, 1], { extrapolateRight: 'clamp' })

  // --- WORD-BY-WORD TEXT ANIMATION ---
  const words = text.split(' ')
  const wordStartFrame = 6 // start after micro-pause
  const wordStagger = 3    // 3 frames between words = ~0.1s (fast burst)
  // After all words land, breathe for ~0.5s before anything else
  const allWordsLandFrame = wordStartFrame + words.length * wordStagger

  // Find which word index the keyword starts at
  let keywordWordIndex = -1
  const rebuilt: string[] = []
  for (let i = 0; i < words.length; i++) {
    rebuilt.push(words[i])
    if (rebuilt.join(' ').includes(keyword) && keywordWordIndex === -1) {
      // keyword might span multiple words — find the start
      const joined = rebuilt.join(' ')
      const kwStart = joined.indexOf(keyword)
      // Count words before kwStart
      const beforeKw = joined.slice(0, kwStart).trim().split(/\s+/).filter(Boolean).length
      keywordWordIndex = beforeKw
    }
  }
  // Fallback: find single-word keyword
  if (keywordWordIndex === -1) {
    keywordWordIndex = words.findIndex(w => w.toLowerCase().includes(keyword.toLowerCase()))
  }

  // Keyword shake oscillation (16 frames of translateX +/-4px)
  const keywordLandFrame = wordStartFrame + (keywordWordIndex >= 0 ? keywordWordIndex : 0) * wordStagger
  const keywordShakeElapsed = frame - keywordLandFrame - 8 // starts 8 frames after landing
  const keywordShake =
    keywordShakeElapsed >= 0 && keywordShakeElapsed < 16
      ? Math.sin(keywordShakeElapsed * 2.5) * 4
      : 0

  // --- NUMBER FLASH: "R$ 0" subliminal impact ---
  const flashStart = allWordsLandFrame + 10
  const flashOpacity = interpolate(frame, [flashStart, flashStart + 3, flashStart + 6, flashStart + 10], [0, 0.6, 0.4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const flashScale = interpolate(frame, [flashStart, flashStart + 3, flashStart + 10], [0.8, 1.1, 1.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // --- DECLINING GRAPH: draws left to right ---
  const graphDrawProgress = interpolate(frame, [15, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const graphPointCount = Math.floor(graphDrawProgress * GRAPH_POINTS.length)
  const graphPath = GRAPH_POINTS.slice(0, Math.max(2, graphPointCount))
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')

  // --- DANGER ICONS: fade in/out at random positions ---

  // --- EXIT: keyword zoom + shatter ---
  // Pain text stays fully visible for 40+ frames after all words land
  const exitStart = Math.max(allWordsLandFrame + 40, 125)
  const exitProgress = interpolate(frame, [exitStart, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const exitScale = interpolate(exitProgress, [0, 0.3, 1], [1, 1.05, 0.7])
  const exitOpacity = interpolate(exitProgress, [0, 0.4, 1], [1, 0.9, 0])

  // Each word shatters in different direction on exit
  const getWordShatter = (wordIdx: number) => {
    if (exitProgress <= 0) return { x: 0, y: 0, rot: 0, opacity: 1 }
    const angle = seed(wordIdx, 10) * Math.PI * 2
    const distance = exitProgress * (80 + seed(wordIdx, 11) * 120)
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rot: (seed(wordIdx, 12) - 0.5) * 30 * exitProgress,
      opacity: 1 - exitProgress,
    }
  }

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      opacity: Math.min(enterOpacity, exitOpacity),
      transform: `scale(${sceneZoom * exitScale})`,
      overflow: 'hidden',
    }}>

      {/* LAYER 1: Red pulsing background glow — heartbeat feel */}
      <div style={{
        position: 'absolute',
        width: 900,
        height: 900,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accent} 0%, rgba(239,68,68,0.15) 40%, transparent 65%)`,
        opacity: heartbeat,
        filter: 'blur(30px)',
      }} />

      {/* Secondary glow — offset for depth */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 50%)`,
        opacity: heartbeat * 0.6,
        transform: `translate(${Math.sin(frame * 0.04) * 30}px, ${Math.cos(frame * 0.03) * 20}px)`,
        filter: 'blur(20px)',
      }} />

      {/* LAYER 2: Declining graph — top-left area (parallax 0.3x) */}
      <svg
        width={450}
        height={200}
        style={{
          position: 'absolute',
          top: 80,
          left: 100,
          opacity: 0.15,
          transform: `translate(${Math.sin(frame * 0.01) * 5}px, ${Math.cos(frame * 0.01) * 3}px)`,
        }}
      >
        <path d={graphPath} fill="none" stroke={COLORS.accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {/* Area fill under curve */}
        {graphPointCount >= 2 && (
          <path
            d={`${graphPath} L ${GRAPH_POINTS[Math.max(1, graphPointCount - 1)][0]} 200 L 0 200 Z`}
            fill={COLORS.accent}
            opacity={0.15}
          />
        )}
      </svg>

      {/* LAYER 3: Danger icons scattered — fading in/out */}
      {DANGER_ICONS.map((icon, i) => {
        // Each icon has its own fade cycle
        const iconCycle = Math.sin(frame * 0.04 + icon.phase)
        const iconOpacity = interpolate(iconCycle, [-1, -0.3, 0.3, 1], [0, 0, 0.08, 0.12])
        // Only show after a delay
        const iconEnter = interpolate(frame, [10 + i * 3, 20 + i * 3], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        // Parallax drift
        const driftX = Math.sin(frame * 0.015 + icon.phase) * 10 * 0.3
        const driftY = Math.cos(frame * 0.012 + icon.phase * 1.3) * 8 * 0.3

        return (
          <div key={`danger${i}`} style={{
            position: 'absolute',
            left: icon.x + driftX,
            top: icon.y + driftY,
            opacity: iconOpacity * iconEnter,
            color: COLORS.accent,
            fontFamily: FONTS.mono,
            fontSize: icon.size,
            fontWeight: 'bold',
            userSelect: 'none',
            lineHeight: 1,
          }}>
            {icon.type === 'triangle' ? '\u25B2' : '\u2717'}
          </div>
        )
      })}

      {/* LAYER 4: Word-by-word text with keyword highlight and shatter exit */}
      <div style={{
        padding: '0 140px',
        textAlign: 'center',
        maxWidth: 1400,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        lineHeight: 1.5,
        zIndex: 10,
      }}>
        {words.map((word, i) => {
          const wordFrame = wordStartFrame + i * wordStagger
          const elapsed = Math.max(0, frame - wordFrame)

          // Entry: overshoot spring (scale 1.3 → 0.95 → 1.0) + slide up
          const wordSpring = spring({ frame: elapsed, fps, config: { damping: 10, stiffness: 180, mass: 0.8 } })
          const wordOpacity = interpolate(elapsed, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
          const wordY = interpolate(wordSpring, [0, 1], [18, 0])
          const wordScale = interpolate(wordSpring, [0, 1], [1.3, 1.0])

          // Is this word part of the keyword?
          const isKeyword = keywordWordIndex >= 0 && i === keywordWordIndex
          // Multi-word keyword check
          const keywordWords = keyword.split(' ')
          const isPartOfKeyword = keywordWords.length > 1
            ? keywordWords.includes(word) || word.toLowerCase().includes(keyword.toLowerCase())
            : word.toLowerCase().includes(keyword.toLowerCase())

          // Keyword special treatment
          const kwScale = isPartOfKeyword
            ? interpolate(elapsed, [0, 6, 12], [1, 1.35, 1.15], { extrapolateRight: 'clamp' })
            : 1
          const kwShake = isPartOfKeyword ? keywordShake : 0

          // Shatter on exit
          const shatter = getWordShatter(i)

          return (
            <span key={i} style={{
              fontFamily: FONTS.mono,
              fontSize: isPartOfKeyword ? SIZES.title + 8 : SIZES.title,
              fontWeight: isPartOfKeyword ? 'bold' : 'normal',
              color: isPartOfKeyword ? COLORS.accent : COLORS.text,
              textShadow: isPartOfKeyword
                ? `0 0 20px ${COLORS.accentGlow}, 0 0 40px ${COLORS.accentGlowSoft}, 0 0 80px rgba(239,68,68,0.1)`
                : `0 0 30px rgba(0,0,0,0.5)`,
              opacity: wordOpacity * shatter.opacity,
              transform: `translateY(${wordY + shatter.y}px) translateX(${kwShake + shatter.x}px) scale(${kwScale * wordScale}) rotate(${shatter.rot}deg)`,
              display: 'inline-block',
              marginRight: 14,
            }}>
              {word}
            </span>
          )
        })}
      </div>

      {/* LAYER 5: Number flash — subliminal "R$ 0" */}
      <div style={{
        position: 'absolute',
        fontFamily: FONTS.mono,
        fontSize: 200,
        fontWeight: 'bold',
        color: COLORS.accent,
        opacity: flashOpacity,
        transform: `scale(${flashScale})`,
        textShadow: `0 0 60px ${COLORS.accentGlow}, 0 0 120px ${COLORS.accentGlow}`,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 5,
        letterSpacing: -5,
      }}>
        R$ 0
      </div>

      {/* LAYER 6: Accent line — grows from center, pulses with heartbeat */}
      {(() => {
        const lineSpring = spring({ frame: Math.max(0, frame - 5), fps, config: MOTION.snappy })
        const lineWidth = interpolate(lineSpring, [0, 1], [0, 400])
        const linePulse = 1 + (heartbeat - 0.2) * 0.3
        return (
          <div style={{
            position: 'absolute',
            top: '35%',
            width: lineWidth * linePulse,
            height: 2,
            backgroundColor: COLORS.accent,
            borderRadius: 1,
            boxShadow: `0 0 20px ${COLORS.accentGlow}, 0 0 40px ${COLORS.accentGlowSoft}`,
            opacity: 0.6,
          }} />
        )
      })()}

      {/* Bottom accent line — thinner, offset */}
      {(() => {
        const lineSpring = spring({ frame: Math.max(0, frame - 12), fps, config: MOTION.smooth })
        const lineWidth = interpolate(lineSpring, [0, 1], [0, 250])
        return (
          <div style={{
            position: 'absolute',
            top: '66%',
            width: lineWidth,
            height: 1,
            backgroundColor: COLORS.accent,
            borderRadius: 1,
            boxShadow: `0 0 10px ${COLORS.accentGlowSoft}`,
            opacity: 0.3,
          }} />
        )
      })()}

      {/* Edge vignette — extra dark for danger mood */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  )
}
