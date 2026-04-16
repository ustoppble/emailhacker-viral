import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Series,
  AbsoluteFill,
  registerRoot,
  Composition,
  spring,
  interpolate,
} from 'remotion'
import { SceneBackground } from './components/SceneBackground'
import { AppWindow } from './components/AppWindow'
import { PromptInput } from './components/PromptInput'
import { ToolCalls } from './components/ToolCalls'
import { DiffView } from './components/DiffView'
import { Terminal } from './components/Terminal'
import { DataTable } from './components/DataTable'
import { Captions } from './components/Captions'
import { StatusBar } from './components/StatusBar'
import { COLORS, FONTS, SIZES, SPRINGS } from './components/tokens'
import type { ClipData, Scene } from './components/SceneData'

/**
 * ClipTemplate — composição fixa que renderiza clips a partir de SceneData (JSON).
 *
 * Segue remotion-best-practices:
 * - Series pra sequenciar cenas (rules/sequencing.md)
 * - useCurrentFrame() + interpolate() pra animações (rules/animations.md)
 * - spring() com configs do design system (rules/timing.md)
 * - premountFor em Sequences (rules/sequencing.md)
 * - Tempos em segundos * fps (rules/animations.md)
 * - ZERO CSS transitions (rules/animations.md)
 */

/** Calcula duração proporcional de cada cena em frames */
function getSceneDuration(scene: Scene, fps: number): number {
  const durations: Record<Scene['type'], number> = {
    prompt: 3,     // 3 segundos
    response: 5,   // 5 segundos
    diff: 5,       // 5 segundos
    terminal: 4,   // 4 segundos
    table: 4,      // 4 segundos
    text: 3,       // 3 segundos
  }
  return Math.floor((durations[scene.type] || 3) * fps)
}

/** Renderiza o conteúdo interno de uma cena */
const SceneContent: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case 'prompt':
      return <PromptInput text={scene.text || ''} charFrames={scene.speed ? Math.round(1 / scene.speed) : 2} />

    case 'response':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {scene.text && <ResponseText text={scene.text} />}
          {scene.toolCalls && scene.toolCalls.length > 0 && (
            <ToolCalls items={scene.toolCalls} startFrame={15} />
          )}
        </div>
      )

    case 'diff':
      return (
        <DiffView
          file={scene.file || 'unknown'}
          branch={scene.branch}
          lines={scene.lines || []}
          added={scene.added}
          removed={scene.removed}
        />
      )

    case 'terminal':
      return <Terminal lines={scene.lines || []} title={scene.title} />

    case 'table':
      return <DataTable headers={scene.headers || []} rows={scene.rows || []} />

    case 'text':
      return <HeroText title={scene.title || ''} subtitle={scene.subtitle} align={scene.align} />

    default:
      return null
  }
}

/** Texto de resposta com typewriter — rules/text-animations.md */
const ResponseText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ~1.5 chars por frame a 30fps = ~45 chars/s
  const charsVisible = Math.min(text.length, Math.floor(frame * 1.5))

  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: SIZES.label,
        color: COLORS.textSecondary,
        lineHeight: 1.5,
      }}
    >
      {text.slice(0, charsVisible)}
    </div>
  )
}

/** Texto hero com spring impact — rules/timing.md */
const HeroText: React.FC<{ title: string; subtitle?: string; align?: 'center' | 'left' }> = ({
  title,
  subtitle,
  align = 'center',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enter = spring({ frame, fps, config: SPRINGS.impact })
  const scale = interpolate(enter, [0, 1], [1.8, 1])
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  const subtitleOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        padding: 40,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: SIZES.title,
          fontWeight: 'bold',
          color: COLORS.text,
          transform: `scale(${scale})`,
          opacity,
          textAlign: align,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: SIZES.body,
            color: COLORS.textSecondary,
            opacity: subtitleOpacity,
            marginTop: 12,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  )
}

/** Composição principal — usa Series pra sequenciar cenas */
const ClipOverlay: React.FC<ClipData> = (props) => {
  const {
    windowTitle = 'emailhacker-ai',
    branch,
    scenes,
    captions,
    statusItems = ['Local', 'main'],
    model = 'Opus 4.6',
  } = props

  const { fps } = useVideoConfig()

  return (
    <SceneBackground>
      <AbsoluteFill>
        {/* Cenas sequenciadas via Series (rules/sequencing.md) */}
        <AbsoluteFill>
          <Series>
            {scenes.map((scene, i) => {
              const duration = getSceneDuration(scene, fps)

              return (
                <Series.Sequence key={i} durationInFrames={duration}>
                  {scene.type === 'text' ? (
                    <SceneContent scene={scene} />
                  ) : (
                    <AppWindow title={windowTitle} branch={branch} enterDelay={0}>
                      <SceneContent scene={scene} />
                    </AppWindow>
                  )}
                </Series.Sequence>
              )
            })}
          </Series>
        </AbsoluteFill>

        {/* Status bar fixa no bottom */}
        <AbsoluteFill style={{ justifyContent: 'flex-end' }}>
          <StatusBar items={statusItems} model={model} startFrame={10} />
        </AbsoluteFill>

        {/* Captions por cima de tudo */}
        {captions && captions.length > 0 && (
          <AbsoluteFill style={{ zIndex: 50 }}>
            <Captions pages={captions} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </SceneBackground>
  )
}

// Remotion root — registerRoot com Composition (rules/compositions.md)
registerRoot(() => {
  const defaultData: ClipData = {
    windowTitle: 'emailhacker-ai',
    scenes: [
      { type: 'text', title: 'EmailHacker.ai', subtitle: 'Overlay Template' },
    ],
  }

  return (
    <Composition
      id="Overlay"
      component={ClipOverlay as unknown as React.FC}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={960}
      defaultProps={defaultData as unknown as Record<string, unknown>}
    />
  )
})

export default ClipOverlay
