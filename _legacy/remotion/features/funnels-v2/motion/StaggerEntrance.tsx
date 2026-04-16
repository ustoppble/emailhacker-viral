import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { MOTION } from '../../../styles'

interface StaggerEntranceProps {
  children: React.ReactNode[]
  staggerDelay?: number
  baseDelay?: number
  config?: typeof MOTION.snappy
}

export const StaggerEntrance: React.FC<StaggerEntranceProps> = ({
  children,
  staggerDelay = 4,
  baseDelay = 0,
  config = MOTION.snappy,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <>
      {children.map((child, i) => {
        const itemDelay = baseDelay + i * staggerDelay
        // Using spring's native delay parameter (Remotion best practice)
        const s = spring({
          frame,
          fps,
          config,
          delay: itemDelay,
        })
        const scale = 0.8 + s * 0.2
        const opacity = Math.min(1, s * 2)
        const y = (1 - s) * 15

        return (
          <div key={i} style={{ transform: `translateY(${y}px) scale(${scale})`, opacity }}>
            {child}
          </div>
        )
      })}
    </>
  )
}
