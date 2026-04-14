import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface ConfettiProps {
  count?: number
  delay?: number
  colors?: string[]
}

const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const Confetti: React.FC<ConfettiProps> = ({
  count = 40,
  delay = 0,
  colors = ['#ef4444', '#16a34a', '#f59e0b', '#e5e5e5'],
}) => {
  const frame = useCurrentFrame()
  const f = frame - delay
  if (f < 0) return null

  const particles = Array.from({ length: count }, (_, i) => {
    const x = seeded(i) * 100 - 50 // -50 to 50 vw offset
    const startY = -20
    const gravity = 0.15
    const vx = (seeded(i + 100) - 0.5) * 8
    const vy = seeded(i + 200) * -6 - 2
    const currentY = startY + vy * f + 0.5 * gravity * f * f
    const currentX = x + vx * f
    const rotation = f * (seeded(i + 300) * 12 - 6)
    const opacity = interpolate(f, [0, 5, 40, 60], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    const size = 4 + seeded(i + 400) * 6
    const color = colors[Math.floor(seeded(i + 500) * colors.length)]

    return { currentX, currentY, rotation, opacity, size, color, i }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <div
          key={p.i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${p.currentX}px)`,
            top: `calc(50% + ${p.currentY}px)`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 1,
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}
