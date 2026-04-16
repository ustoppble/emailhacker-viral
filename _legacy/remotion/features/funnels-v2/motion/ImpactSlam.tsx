import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MOTION } from '../../../styles'

interface ImpactSlamProps {
  children: React.ReactNode
  delay?: number
}

export const ImpactSlam: React.FC<ImpactSlamProps> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  // Using spring's native delay parameter (Remotion best practice)
  const s = spring({
    frame,
    fps,
    config: MOTION.impact,
    delay,
  })
  const scale = 2 - s
  const opacity = Math.min(1, s * 3)

  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  )
}
