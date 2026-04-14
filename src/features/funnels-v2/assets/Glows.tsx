import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface GlowProps {
  delay?: number
}

export const AmberGlow: React.FC<GlowProps> = ({ delay = 0 }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame - delay, [0, 30], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 60%)',
        opacity,
        zIndex: 0,
      }}
    />
  )
}

export const GreenGlow: React.FC<GlowProps> = ({ delay = 0 }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame - delay, [0, 20], [0, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.25) 0%, transparent 55%)',
        opacity,
        zIndex: 0,
      }}
    />
  )
}
