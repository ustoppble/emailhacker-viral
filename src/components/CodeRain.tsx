import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLORS, FONTS, VIDEO } from '../styles'

// Characters for the code rain
const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

interface Column {
  x: number
  speed: number
  chars: string[]
  phase: number
  brightness: number
}

// Deterministic columns
const COLUMN_COUNT = 45
const COLUMNS: Column[] = Array.from({ length: COLUMN_COUNT }).map((_, i) => {
  const seed = (n: number) => ((i * 7919 + n * 6271 + 1) % 10000) / 10000
  const charCount = 8 + Math.floor(seed(0) * 15)
  const chars = Array.from({ length: charCount }).map((_, j) => {
    const idx = Math.floor(((i * 31 + j * 17) % CHARS.length))
    return CHARS[idx]
  })

  return {
    x: (i / COLUMN_COUNT) * VIDEO.width + seed(1) * 30,
    speed: 1.5 + seed(2) * 3,
    chars,
    phase: seed(3) * 600,
    brightness: 0.3 + seed(4) * 0.7,
  }
})

export const CodeRain: React.FC = () => {
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {COLUMNS.map((col, ci) => {
        const totalHeight = col.chars.length * 22
        const y = ((frame * col.speed + col.phase) % (VIDEO.height + totalHeight)) - totalHeight
        const opacity = 0.04 * col.brightness

        return (
          <div key={ci} style={{
            position: 'absolute',
            left: col.x,
            top: y,
            fontFamily: FONTS.mono,
            fontSize: 14,
            lineHeight: '22px',
            color: COLORS.accent,
            opacity,
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            letterSpacing: 4,
            userSelect: 'none',
          }}>
            {col.chars.map((char, j) => {
              // Head char (bottom) is brightest
              const isHead = j === col.chars.length - 1
              const charOpacity = isHead ? 3 : (j / col.chars.length)
              // Flicker some chars
              const flicker = Math.sin(frame * 0.3 + ci * 7 + j * 3) > 0.7 ? 0.5 : 1

              return (
                <span key={j} style={{
                  opacity: charOpacity * flicker,
                  color: isHead ? '#ffffff' : COLORS.accent,
                  textShadow: isHead ? `0 0 8px ${COLORS.accent}` : 'none',
                  display: 'block',
                }}>
                  {/* Change char occasionally for animation */}
                  {Math.sin(frame * 0.1 + j * ci) > 0.9
                    ? CHARS[Math.floor(((frame + j * ci) % CHARS.length))]
                    : char}
                </span>
              )
            })}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}
