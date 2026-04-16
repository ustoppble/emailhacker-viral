import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface FadeSlideInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  slideY?: number
}

export const FadeSlideIn: React.FC<FadeSlideInProps> = ({
  children,
  delay = 0,
  duration = 8,
  slideY = 10,
}) => {
  const frame = useCurrentFrame()
  const f = frame - delay
  const opacity = interpolate(f, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const y = interpolate(f, [0, duration], [slideY, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      {children}
    </div>
  )
}
