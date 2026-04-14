import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

/** Ease-out curve: starts fast, decelerates */
const easeOut = (t: number): number => Math.pow(t, 0.7)

/** Ease-in-out curve: smooth acceleration and deceleration */
const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

interface Props {
  children: React.ReactNode
  /** Zoom range: [start, end]. Ex: [1.05, 1.15] = starts zoomed, zooms more */
  zoom?: [number, number]
  /** Pan X range in px: [start, end]. Negative = start left */
  panX?: [number, number]
  /** Pan Y range in px: [start, end]. Negative = start up */
  panY?: [number, number]
  /** Rotation range in degrees (subtle tilt) */
  rotate?: [number, number]
  /** Duration in frames */
  durationFrames: number
  /** Handheld shake intensity (0 = none, 1 = subtle, 3 = aggressive) */
  shake?: number
  /** Breathing speed multiplier (slow drift oscillation) */
  breathe?: number
  /** Depth multiplier for parallax (0.3 = background, 1 = foreground). Default 1 */
  depthFactor?: number
}

export const CameraRig: React.FC<Props> = ({
  children,
  zoom = [1.3, 1.5],
  panX = [0, 0],
  panY = [-60, 60],
  rotate = [0, 0],
  durationFrames,
  shake = 1,
  breathe = 1,
  depthFactor = 1,
}) => {
  const frame = useCurrentFrame()
  const progress = Math.min(frame / durationFrames, 1)

  // Eased progress curves for cinematic feel
  const zoomProgress = easeOut(progress)
  const panProgress = easeInOut(progress)

  // Base camera movement — eased interpolation over scene duration
  const z = interpolate(zoomProgress, [0, 1], zoom, { extrapolateRight: 'clamp' })
  const px = interpolate(panProgress, [0, 1], panX, { extrapolateRight: 'clamp' })
  const py = interpolate(panProgress, [0, 1], panY, { extrapolateRight: 'clamp' })
  const rot = interpolate(panProgress, [0, 1], rotate, { extrapolateRight: 'clamp' })

  // Handheld shake — high frequency, low amplitude micro-jitter (user-controlled)
  const shakeX = shake * (Math.sin(frame * 0.7) * 0.8 + Math.sin(frame * 1.3) * 0.5)
  const shakeY = shake * (Math.cos(frame * 0.9) * 0.6 + Math.cos(frame * 1.1) * 0.4)
  const shakeRot = shake * Math.sin(frame * 0.5) * 0.08

  // Organic wiggle — nearly imperceptible micro-drift
  const wiggleX = Math.sin(frame * 0.037) * 0.15 + Math.sin(frame * 0.083) * 0.08  // max +-0.23px
  const wiggleY = Math.cos(frame * 0.029) * 0.12 + Math.cos(frame * 0.071) * 0.06  // max +-0.18px
  const wiggleRot = Math.sin(frame * 0.019) * 0.008                                 // max +-0.008deg

  // Breathing — very slow, very subtle drift
  const breatheX = breathe * Math.sin(frame * 0.015) * 1.5
  const breatheY = breathe * Math.cos(frame * 0.012) * 1.0

  // Apply depthFactor to all movement (not to base zoom which keeps framing correct)
  const df = depthFactor
  const totalX = (px + shakeX + breatheX + wiggleX) * df
  const totalY = (py + shakeY + breatheY + wiggleY) * df
  const totalRot = (rot + shakeRot + wiggleRot) * df

  // Scale depth factor into zoom range: at df=1 full zoom, at df<1 reduced zoom travel
  const zDepth = zoom[0] + (z - zoom[0]) * df

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        // Oversize content so aggressive zoom/pan doesn't show edges
        top: '-30%',
        left: '-30%',
        width: '160%',
        height: '160%',
        transform: `scale(${zDepth}) translate(${totalX}px, ${totalY}px) rotate(${totalRot}deg)`,
        transformOrigin: 'center center',
      }}>
        {children}
      </div>
    </AbsoluteFill>
  )
}
