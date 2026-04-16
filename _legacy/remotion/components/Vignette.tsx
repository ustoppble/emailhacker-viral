import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { VIDEO } from '../styles'

export const Vignette: React.FC = () => {
  const frame = useCurrentFrame()

  // Subtle pulsing vignette intensity (period ~5s = 150 frames)
  const pulse = Math.sin(frame * 0.042)
  const vignetteTransparentStop = interpolate(pulse, [-1, 1], [28, 32])
  const vignetteBlackStop = interpolate(pulse, [-1, 1], [88, 92])

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Main vignette with red tint at edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent ${vignetteTransparentStop}%, rgba(239, 68, 68, 0.05) ${(vignetteTransparentStop + vignetteBlackStop) / 2}%, rgba(0, 0, 0, ${interpolate(pulse, [-1, 1], [0.88, 0.92])}) ${vignetteBlackStop}%)`,
        }}
      />

      {/* Top letterbox bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: VIDEO.width,
          height: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      />

      {/* Bottom letterbox bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: VIDEO.width,
          height: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      />
    </AbsoluteFill>
  )
}
