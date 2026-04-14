import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { COLORS, FONTS } from '../styles'

/**
 * Persistent corner decorations — fill empty edges with subtle hacker UI elements.
 * Brackets, data readouts, scan indicators, crosshairs.
 */
export const CornerElements: React.FC = () => {
  const frame = useCurrentFrame()

  // Blinking cursor
  const blink = frame % 30 < 15

  // Scrolling data values
  const dataVal1 = (1337 + frame * 7) % 9999
  const dataVal2 = ((frame * 3 + 42) % 100).toFixed(1)
  const dataVal3 = (frame * 13 + 777) % 99999

  // Fade in
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    opacity: opacity * 0.35,
    letterSpacing: 1,
    pointerEvents: 'none',
  }

  // Bracket line style
  const bracketColor = `rgba(239, 68, 68, 0.15)`

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 5 }}>

      {/* TOP-LEFT: brackets + system readout */}
      <div style={{ ...cornerStyle, top: 24, left: 28 }}>
        <div style={{ color: bracketColor, fontSize: 18, marginBottom: 4 }}>&#x250C;&#x2500;&#x2500;</div>
        <div>SYS.{blink ? '█' : '_'}</div>
        <div style={{ marginTop: 2 }}>REV: R${dataVal1}</div>
        <div>RATE: {dataVal2}%</div>
      </div>

      {/* TOP-RIGHT: status indicators */}
      <div style={{ ...cornerStyle, top: 24, right: 28, textAlign: 'right' }}>
        <div style={{ color: bracketColor, fontSize: 18, marginBottom: 4, textAlign: 'right' }}>&#x2500;&#x2500;&#x2510;</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: COLORS.accent, display: 'inline-block', opacity: blink ? 1 : 0.3 }} />
          <span>LIVE</span>
        </div>
        <div style={{ marginTop: 2 }}>ID:{dataVal3.toString(16).toUpperCase()}</div>
        <div>FRM:{String(frame).padStart(4, '0')}</div>
      </div>

      {/* BOTTOM-LEFT: version + timestamp */}
      <div style={{ ...cornerStyle, bottom: 24, left: 28 }}>
        <div>EMAILHACKER.AI</div>
        <div style={{ marginTop: 2 }}>v2.7.0 // BUILD {frame}</div>
        <div style={{ color: bracketColor, fontSize: 18, marginTop: 4 }}>&#x2514;&#x2500;&#x2500;</div>
      </div>

      {/* BOTTOM-RIGHT: metric ticker */}
      <div style={{ ...cornerStyle, bottom: 24, right: 28, textAlign: 'right' }}>
        <div>CTR: {((frame * 0.03 + 8.2) % 12).toFixed(1)}%</div>
        <div style={{ marginTop: 2 }}>OPEN: {((frame * 0.05 + 38.7) % 55).toFixed(1)}%</div>
        <div style={{ color: bracketColor, fontSize: 18, marginTop: 4, textAlign: 'right' }}>&#x2500;&#x2500;&#x2518;</div>
      </div>

      {/* CENTER crosshair — very subtle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: opacity * 0.06,
        pointerEvents: 'none',
      }}>
        {/* Horizontal line */}
        <div style={{ position: 'absolute', width: 60, height: 1, backgroundColor: COLORS.accent, top: 0, left: -30 }} />
        {/* Vertical line */}
        <div style={{ position: 'absolute', width: 1, height: 60, backgroundColor: COLORS.accent, top: -30, left: 0 }} />
      </div>

      {/* Edge accent lines — thin red lines at mid-edges */}
      {/* Left edge */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: '30%',
        width: 2,
        height: '40%',
        background: `linear-gradient(to bottom, transparent, ${COLORS.accent}22, transparent)`,
      }} />
      {/* Right edge */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: '25%',
        width: 2,
        height: '50%',
        background: `linear-gradient(to bottom, transparent, ${COLORS.accent}22, transparent)`,
      }} />
    </AbsoluteFill>
  )
}
