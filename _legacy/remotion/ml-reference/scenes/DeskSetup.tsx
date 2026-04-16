import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

/**
 * DeskSetup — Wraps scene content inside a curved monitor mockup on a desk.
 * Simulates a phone camera pointing at a real desk setup.
 * Frame: 1080x1920 (vertical/portrait)
 */
export const DeskSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Subtle ambient breathing — monitor glow pulses gently
  const glowPulse = interpolate(
    frame % (fps * 4),
    [0, fps * 2, fps * 4],
    [0.3, 0.5, 0.3],
    { extrapolateRight: 'clamp' },
  )

  // Very subtle camera sway (handheld feel)
  const swayX = interpolate(
    frame % (fps * 6),
    [0, fps * 1.5, fps * 3, fps * 4.5, fps * 6],
    [0, 1.2, 0, -1.2, 0],
    { extrapolateRight: 'clamp' },
  )
  const swayY = interpolate(
    frame % (fps * 8),
    [0, fps * 2, fps * 4, fps * 6, fps * 8],
    [0, 0.8, 0, -0.8, 0],
    { extrapolateRight: 'clamp' },
  )

  // Monitor screen dimensions inside the 1080x1920 frame
  const SCREEN_W = 920
  const SCREEN_H = 520
  const BEZEL = 10
  const MONITOR_W = SCREEN_W + BEZEL * 2
  const MONITOR_H = SCREEN_H + BEZEL * 2 + 16 // extra for chin bezel

  // Monitor position — upper-center, ~32-60% vertical
  const MONITOR_TOP = 380
  const MONITOR_LEFT = (1080 - MONITOR_W) / 2

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0D0D0D',
        transform: `translate(${swayX}px, ${swayY}px)`,
      }}
    >
      {/* Dark room ambient — very subtle warm gradient at top (ceiling light spill) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(40, 30, 15, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Second monitor — right side, background, angled */}
      <div
        style={{
          position: 'absolute',
          top: 420,
          right: -60,
          width: 220,
          height: 140,
          background: '#111111',
          borderRadius: '6px 6px 2px 2px',
          transform: 'perspective(800px) rotateY(-25deg) rotateX(2deg)',
          boxShadow: '0 0 30px rgba(26, 35, 126, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Second monitor screen content — dark blue glow */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            right: 6,
            bottom: 12,
            background: 'linear-gradient(135deg, #0d1b4a 0%, #1a237e 50%, #0d1b4a 100%)',
            borderRadius: 3,
            opacity: 0.35,
          }}
        />
        {/* Fake code lines on second monitor */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 14,
            right: 14,
            bottom: 20,
            opacity: 0.15,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: 3,
                marginBottom: 5,
                background: '#4fc3f7',
                borderRadius: 1,
                width: `${50 + (i * 17) % 40}%`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main curved monitor */}
      <div
        style={{
          position: 'absolute',
          top: MONITOR_TOP,
          left: MONITOR_LEFT,
          width: MONITOR_W,
          height: MONITOR_H,
          transform: 'perspective(900px) rotateY(-6deg) rotateX(2deg)',
          transformOrigin: '50% 50%',
        }}
      >
        {/* Monitor body (outer bezel) */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#1a1a1a',
            borderRadius: '20px 20px 4px 4px',
            boxShadow: `
              0 0 60px rgba(255, 255, 255, ${glowPulse * 0.08}),
              0 4px 40px rgba(0, 0, 0, 0.8),
              0 0 100px rgba(200, 200, 200, ${glowPulse * 0.04})
            `,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Screen area */}
          <div
            style={{
              position: 'absolute',
              top: BEZEL,
              left: BEZEL,
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: '12px 12px 2px 2px',
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            {/* Scene content — scaled to fill screen area */}
            <div
              style={{
                width: 1080,
                height: 1920,
                transform: `scale(${SCREEN_W / 1080})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              {/* Inner wrapper to show only the relevant portion of scene content */}
              <div
                style={{
                  width: 1080,
                  height: Math.ceil(SCREEN_H / (SCREEN_W / 1080)),
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {children}
              </div>
            </div>

            {/* Screen inner reflection — faint white gradient at top */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Screen curve highlight — left edge reflection */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 30,
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Chin bezel — slightly thicker bottom with subtle logo dot */}
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          />
        </div>
      </div>

      {/* Monitor stand — thin neck */}
      <div
        style={{
          position: 'absolute',
          top: MONITOR_TOP + MONITOR_H - 2,
          left: '50%',
          transform: 'translateX(-50%) perspective(900px) rotateY(-6deg)',
          width: 60,
          height: 30,
          background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
          borderRadius: '0 0 4px 4px',
        }}
      />

      {/* Monitor stand base — flat oval */}
      <div
        style={{
          position: 'absolute',
          top: MONITOR_TOP + MONITOR_H + 24,
          left: '50%',
          transform: 'translateX(-50%) perspective(900px) rotateX(60deg) rotateY(-6deg)',
          width: 160,
          height: 80,
          background: 'radial-gradient(ellipse, #1a1a1a 40%, #111111 100%)',
          borderRadius: '50%',
        }}
      />

      {/* Desk surface */}
      <div
        style={{
          position: 'absolute',
          top: MONITOR_TOP + MONITOR_H + 50,
          left: 0,
          width: '100%',
          height: 1920 - (MONITOR_TOP + MONITOR_H + 50),
          background: 'linear-gradient(180deg, #1c1208 0%, #2a1a0e 15%, #1a0f06 60%, #120a04 100%)',
        }}
      >
        {/* Desk edge highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 2,
            background: 'linear-gradient(90deg, transparent 5%, rgba(80, 55, 30, 0.4) 30%, rgba(80, 55, 30, 0.5) 50%, rgba(80, 55, 30, 0.4) 70%, transparent 95%)',
          }}
        />

        {/* Monitor light spill on desk */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            width: '70%',
            height: '60%',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(200, 200, 200, 0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Keyboard — dark mechanical keyboard */}
      <div
        style={{
          position: 'absolute',
          top: MONITOR_TOP + MONITOR_H + 110,
          left: '50%',
          transform: 'translateX(-50%) perspective(800px) rotateX(15deg) rotateY(-2deg)',
          width: 340,
          height: 110,
          background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Keyboard key rows */}
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            style={{
              position: 'absolute',
              top: 12 + row * 28,
              left: 16,
              right: 16,
              height: 22,
              display: 'flex',
              gap: 3,
            }}
          >
            {Array.from({ length: row === 3 ? 8 : 14 }).map((_, col) => (
              <div
                key={col}
                style={{
                  flex: row === 3 && col === 4 ? 4 : 1,
                  height: '100%',
                  background: 'rgba(40, 40, 40, 0.8)',
                  borderRadius: 3,
                  border: '1px solid rgba(60, 60, 60, 0.3)',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Yellow notebook / post-it — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          right: 50,
          width: 130,
          height: 170,
          background: 'linear-gradient(135deg, #FFE082 0%, #FFD54F 40%, #FFCA28 100%)',
          borderRadius: '3px 3px 2px 8px',
          transform: 'rotate(-5deg)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Handwritten-style lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 20 + i * 26,
              left: 14,
              width: `${60 + (i * 23) % 35}%`,
              height: 2,
              background: 'rgba(100, 70, 20, 0.25)',
              borderRadius: 1,
              transform: `rotate(${(i % 2 === 0 ? 0.5 : -0.3)}deg)`,
            }}
          />
        ))}
      </div>

      {/* Camera grain / noise overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.04,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignette — darker corners (camera lens effect) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
