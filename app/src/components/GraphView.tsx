import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { GraphData, GraphLink, GraphNode } from '../domain/types'
import { COLORS, nodeStyle } from '../lib/colors'
import { clusterForce } from '../lib/clusterForce'

type FGNode = GraphNode & { x?: number; y?: number }
type FGLink = Omit<GraphLink, 'source' | 'target'> & {
  source: string | FGNode
  target: string | FGNode
}

interface ForceGraphHandle {
  d3Force: (
    name: string,
    force?: unknown,
  ) => { distance?: (d: number) => unknown; strength?: (s: number) => unknown } | undefined
  zoomToFit: (ms?: number, padding?: number) => void
}

interface Props {
  graph: GraphData
  onSelect: (node: GraphNode) => void
  /** When set (search active), nodes not in this set are dimmed; matches get a ring. */
  highlightIds?: Set<string> | null
  /** Nodes needing attention (reminder due) get an amber dot. */
  attentionIds?: Set<string> | null
}

/** Signature so we only rebuild (and restart the simulation) on real changes. */
function signature(g: GraphData): string {
  return (
    g.nodes.map((n) => `${n.id}:${n.degree}:${n.matched ? 1 : 0}`).join(',') +
    '|' +
    g.links.map((l) => l.id).join(',')
  )
}

export default function GraphView({ graph, onSelect, highlightIds, attentionIds }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraphHandle | null>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  const sig = signature(graph)
  // Clone into mutable objects the force engine can annotate with x/y/vx/vy.
  const data = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({ ...n })) as FGNode[],
      links: graph.links.map((l) => ({ ...l })) as FGLink[],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sig],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setSize({ w: Math.max(320, r.width), h: Math.max(320, r.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Tune forces for an elastic, springy constellation feel.
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force('link')?.distance?.(70)
    fg.d3Force('charge')?.strength?.(-120)
    // group clustering — pull same-group stars together
    fg.d3Force('cluster', clusterForce(0.14))
    const t = setTimeout(() => fg.zoomToFit(600, 80), 400)
    return () => clearTimeout(t)
  }, [sig])

  return (
    <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <ForceGraph2D
        ref={fgRef as never}
        width={size.w}
        height={size.h}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        nodeId="id"
        nodeRelSize={1}
        enableNodeDrag
        cooldownTicks={120}
        d3VelocityDecay={0.28}
        nodeLabel={(n: object) => {
          const node = n as FGNode
          return node.degree === 2 ? '한 다리 건너 ✦' : node.label
        }}
        onNodeClick={(n: object) => onSelect(n as GraphNode)}
        linkColor={(l: object) =>
          (l as FGLink).faint
            ? 'rgba(129,140,248,0.18)'
            : (l as FGLink).strength === 'verified'
              ? 'rgba(56,189,248,0.65)'
              : 'rgba(129,140,248,0.4)'
        }
        linkWidth={(l: object) => {
          const link = l as FGLink
          if (link.faint) return 0.5
          const c = link.closeness ?? 3
          return 0.6 + c * 0.45 // closeness 1→1.05, 5→2.85
        }}
        linkLineDash={(l: object) => ((l as FGLink).faint || (l as FGLink).strength === 'pending' ? [3, 4] : null)}
        nodeCanvasObject={(n: object, ctx: CanvasRenderingContext2D, scale: number) => {
          const node = n as FGNode
          if (node.x === undefined || node.y === undefined) return
          const s = nodeStyle(node.degree, node.matched, node.color)
          const dim = highlightIds ? !(node.degree === 0 || highlightIds.has(node.id)) : false
          const isMatch = highlightIds ? node.degree !== 0 && highlightIds.has(node.id) : false
          ctx.save()
          ctx.globalAlpha = s.alpha * (dim ? 0.12 : 1)
          ctx.shadowColor = s.glow
          ctx.shadowBlur = dim ? 0 : s.glowBlur
          ctx.beginPath()
          ctx.arc(node.x, node.y, s.radius, 0, Math.PI * 2)
          ctx.fillStyle = s.fill
          ctx.fill()
          if (node.degree === 0) {
            ctx.shadowBlur = 0
            ctx.lineWidth = 1.5
            ctx.strokeStyle = COLORS.deepVoid
            ctx.stroke()
          }
          if (isMatch) {
            ctx.shadowBlur = 0
            ctx.globalAlpha = 1
            ctx.lineWidth = 1.5
            ctx.strokeStyle = COLORS.starlight
            ctx.beginPath()
            ctx.arc(node.x, node.y, s.radius + 3, 0, Math.PI * 2)
            ctx.stroke()
          }
          ctx.restore()

          // attention marker (reminder due) — amber dot
          if (attentionIds && !dim && node.degree !== 0 && attentionIds.has(node.id)) {
            ctx.save()
            ctx.fillStyle = '#FBBF24'
            ctx.shadowColor = '#FBBF24'
            ctx.shadowBlur = 6
            ctx.beginPath()
            ctx.arc(node.x + s.radius * 0.8, node.y - s.radius * 0.8, Math.max(1.6, s.radius * 0.45), 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }

          if (s.showLabel && scale > 0.6) {
            ctx.save()
            ctx.globalAlpha = (dim ? 0.15 : 1) * (node.degree === 0 ? 1 : 0.85)
            ctx.font = `${node.degree === 0 ? 700 : 500} ${node.degree === 0 ? 5.5 : 4}px "Plus Jakarta Sans", sans-serif`
            ctx.fillStyle = node.degree === 0 ? COLORS.starlight : COLORS.onSurfaceVariant
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(node.label, node.x, node.y + s.radius + 2)
            ctx.restore()
          }
        }}
        nodePointerAreaPaint={(n: object, color: string, ctx: CanvasRenderingContext2D) => {
          const node = n as FGNode
          if (node.x === undefined || node.y === undefined) return
          const s = nodeStyle(node.degree, node.matched)
          ctx.beginPath()
          ctx.arc(node.x, node.y, s.radius + 3, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
        }}
      />
    </div>
  )
}
