import { useCurrentFrame } from 'remotion'
import { COLORS, FONTS, MOTION } from '../styles'

interface Props {
  text: string
  keyword?: string
  fontSize?: number
  startFrame?: number
  style?: React.CSSProperties
}

export const TypewriterFast: React.FC<Props> = ({
  text,
  keyword,
  fontSize = 36,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame()
  const elapsed = Math.max(0, frame - startFrame)
  const charsVisible = Math.min(Math.floor(elapsed / MOTION.typewriterChar), text.length)
  const visibleText = text.slice(0, charsVisible)
  const showCursor = elapsed % 12 < 6 && charsVisible < text.length

  // Renderizar com keyword highlight
  const renderText = () => {
    if (!keyword || !visibleText.includes(keyword)) {
      return <>{visibleText}</>
    }
    const idx = visibleText.indexOf(keyword)
    const before = visibleText.slice(0, idx)
    const kw = visibleText.slice(idx, idx + keyword.length)
    const after = visibleText.slice(idx + keyword.length)
    return (
      <>
        {before}
        <span style={{
          color: COLORS.accent,
          fontWeight: 'bold',
          textShadow: `0 0 20px ${COLORS.accentGlow}, 0 0 40px ${COLORS.accentGlowSoft}`,
        }}>
          {kw}
        </span>
        {after}
      </>
    )
  }

  return (
    <span style={{
      fontFamily: FONTS.mono,
      fontSize,
      color: COLORS.text,
      lineHeight: 1.4,
      ...style,
    }}>
      {renderText()}
      {showCursor && (
        <span style={{
          color: COLORS.accent,
          fontWeight: 'bold',
          textShadow: `0 0 10px ${COLORS.accentGlow}`,
        }}>|</span>
      )}
    </span>
  )
}
