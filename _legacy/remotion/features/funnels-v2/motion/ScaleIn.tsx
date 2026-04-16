import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MOTION } from '../../../styles'

interface ScaleInProps {
  children: React.ReactNode
  delay?: number
  config?: typeof MOTION.snappy
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  config = MOTION.snappy,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  // Using spring's native delay parameter (Remotion best practice)
  const s = spring({
    frame,
    fps,
    config,
    delay,
  })
  const scale = 0.8 + s * 0.2
  const opacity = Math.min(1, s * 2)

  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  )
}
