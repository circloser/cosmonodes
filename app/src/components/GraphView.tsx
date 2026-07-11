import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { GraphData, GraphLink, GraphNode } from '../domain/types'
import { COLORS, nodeStyle } from '../lib/colors'
import {
  HIER_BAND,
  RING_RADIUS,
  clusterForce,
  linkDistance,
  radialRingForce,
  rankValue,
  verticalForce,
  type HierSort,
} from '../lib/forces'
import { tierLabel } from '../lib/kinds'

type FGNode = GraphNode & { x?: number; y?: number; fx?: number; fy?: number }
type FGLink = Omit<GraphLink, 'source' | 'target'> & {
  source: string | FGNode
  target: string | FGNode
}

interface ForceGraphHandle {
  d3Force: (
    name: string,
    force?: unknown,
  ) =>
    | {
        distance?: (d: number | ((link: FGLink) => number)) => unknown
        strength?: (s: number | ((link: FGLink) => number)) => unknown
      }
    | undefined
  zoomToFit: (ms?: number, padding?: number) => void
  graph2ScreenCoords: (x: number, y: number) => { x: number; y: number }
  d3ReheatSimulation: () => void
}

interface Props {
  graph: GraphData
  onSelect: (node: GraphNode, screenPos?: { x: number; y: number } | null) => void
  /** When set (search active), nodes not in this set are dimmed; matches get a ring. */
  highlightIds?: Set<string> | null
  /** Nodes needing attention (reminder due) get an amber dot. */
  attentionIds?: Set<string> | null
  layoutMode: 'cosmos' | 'hierarchy'
  hierarchySort: HierSort
}

/** Signature so we only rebuild (and restart the simulation) on real changes. */
function signature(g: GraphData): string {
  return (
    g.nodes.map((n) => `${n.id}:${n.degree}:${n.matched ? 1 : 0}`).join(',') +
    '|' +
    g.links.map((l) => l.id).join(',')
  )
}

const GUIDE_TEXT = 'rgba(196,199,200,0.45)'
const GUIDE_FONT = '600 5px "Plus Jakarta Sans", sans-serif'

function endId(end: string | FGNode): string {
  return typeof end === 'string' ? end : end.id
}

export default function GraphView({ graph, onSelect, highlightIds, attentionIds, layoutMode, hierarchySort }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraphHandle | null>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })
  // hover state lives in a ref: paint accessors run every frame, no re-render needed
  const hoverRef = useRef<{ id: string | null; links: Set<string> }>({ id: null, links: new Set() })

  const sig = signature(graph)
  // link particles are pure delight — keep them off when the graph is perf-heavy
  const particlesOn = graph.nodes.length <= 120
  // Clone into mutable objects the force engine can annotate with x/y/vx/vy.
  const data = useMemo(() => {
    const nodes = graph.nodes.map((n) => ({ ...n })) as FGNode[]
    // pin the center (self) at the origin so closeness rings stay centered on me
    const self = nodes.find((n) => n.degree === 0)
    if (self) {
      self.fx = 0
      self.fy = 0
    }
    return { nodes, links: graph.links.map((l) => ({ ...l })) as FGLink[] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

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
    const self = data.nodes.find((n) => n.degree === 0)
    fg.d3Force('link')?.distance?.(linkDistance)

    if (layoutMode === 'hierarchy') {
      // vertical layered layout: rank governs y, charge spreads x
      if (self) {
        self.fx = 0
        self.fy = undefined // let the vertical force place me by my rank
      }
      fg.d3Force('radial', null)
      fg.d3Force('cluster', null)
      fg.d3Force('link')?.strength?.(0.04)
      fg.d3Force('charge')?.strength?.(-120)
      fg.d3Force('vertical', verticalForce(hierarchySort, 0.3))
    } else {
      // cosmos: closeness rings as a soft *preference* — dragged stars are free
      // to live where they were dropped instead of being pulled back
      if (self) {
        self.fx = 0
        self.fy = 0
      }
      fg.d3Force('vertical', null)
      fg.d3Force('link')?.strength?.(0.06)
      fg.d3Force('charge')?.strength?.(-60)
      fg.d3Force('radial', radialRingForce(0.14))
      fg.d3Force('cluster', clusterForce(0.02))
    }

    fg.d3ReheatSimulation()
    const t = setTimeout(() => fg.zoomToFit(600, 80), 500)
    return () => clearTimeout(t)
  }, [sig, layoutMode, hierarchySort, data])

  /** Faint guides behind the stars: closeness rings (cosmos) or level lines (hierarchy). */
  const drawGuides = (ctx: CanvasRenderingContext2D, scale: number) => {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.7 / scale
    if (layoutMode === 'cosmos') {
      for (const r of Object.values(RING_RADIUS)) {
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
      return
    }
    const ranks = data.nodes
      .filter((n) => n.degree !== 2)
      .map((n) => rankValue(n, hierarchySort))
      .filter((r): r is number => r != null)
    if (ranks.length) {
      const min = Math.min(...ranks)
      const max = Math.max(...ranks)
      const range = max - min || 1
      const half = HIER_BAND / 2 + 30
      ctx.fillStyle = GUIDE_TEXT
      ctx.font = GUIDE_FONT
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      if (hierarchySort === 'tier') {
        for (let t = Math.floor(min); t <= Math.ceil(max); t++) {
          const y = (0.5 - (t - min) / range) * HIER_BAND
          ctx.beginPath()
          ctx.moveTo(-half, y)
          ctx.lineTo(half, y)
          ctx.stroke()
          ctx.fillText(tierLabel(t), -half + 4, y - 2)
        }
      } else {
        for (let i = 0; i <= 4; i++) {
          const y = (0.5 - i / 4) * HIER_BAND
          ctx.beginPath()
          ctx.moveTo(-half, y)
          ctx.lineTo(half, y)
          ctx.stroke()
        }
        ctx.fillText(hierarchySort === 'age' ? '많음 ↑' : '가까움 ↑', -half + 4, -HIER_BAND / 2 - 4)
        ctx.fillText(hierarchySort === 'age' ? '적음 ↓' : '덜함 ↓', -half + 4, HIER_BAND / 2 + 12)
      }
    }
    ctx.restore()
  }

  const paintNode = (n: object, ctx: CanvasRenderingContext2D, scale: number) => {
    const node = n as FGNode
    if (node.x === undefined || node.y === undefined) return
    const s = nodeStyle(node.degree, node.matched, node.color)
    const dim = highlightIds ? !(node.degree === 0 || highlightIds.has(node.id)) : false
    const isMatch = highlightIds ? node.degree !== 0 && highlightIds.has(node.id) : false
    const hovered = hoverRef.current.id === node.id
    const radius = hovered ? s.radius * 1.18 : s.radius
    ctx.save()
    ctx.globalAlpha = s.alpha * (dim ? 0.12 : 1)
    ctx.shadowColor = s.glow
    ctx.shadowBlur = dim ? 0 : hovered ? s.glowBlur * 2 : s.glowBlur
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = s.fill
    ctx.fill()
    if (hovered) {
      // soft halo ring around the hovered star
      ctx.shadowBlur = 0
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 1
      ctx.strokeStyle = s.glow
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = s.alpha
    }
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
  }

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
        cooldownTicks={300}
        warmupTicks={20}
        d3VelocityDecay={0.55}
        d3AlphaDecay={0.01}
        nodeLabel={(n: object) => {
          const node = n as FGNode
          return node.degree === 2 ? '한 다리 건너 ✦' : node.label
        }}
        onNodeClick={(n: object) => {
          const node = n as FGNode
          let pos: { x: number; y: number } | null = null
          try {
            const fg = fgRef.current
            if (fg && node.x !== undefined && node.y !== undefined) {
              pos = fg.graph2ScreenCoords(node.x, node.y)
            }
          } catch {
            pos = null // positioning is best-effort; the card still opens
          }
          onSelect(node, pos)
        }}
        onNodeDragEnd={(n: object) => {
          const node = n as FGNode
          // keep the center pinned at origin; pin other stars where dropped
          if (node.degree === 0) {
            node.fx = 0
            node.fy = 0
            return
          }
          node.fx = node.x
          node.fy = node.y
        }}
        onNodeHover={(n: object | null) => {
          const node = n as FGNode | null
          if (!node) {
            hoverRef.current = { id: null, links: new Set() }
          } else {
            const links = new Set<string>()
            for (const l of data.links) {
              if (endId(l.source) === node.id || endId(l.target) === node.id) links.add(l.id)
            }
            hoverRef.current = { id: node.id, links }
          }
          if (containerRef.current) containerRef.current.style.cursor = node ? 'pointer' : ''
        }}
        onRenderFramePre={drawGuides}
        linkColor={(l: object) => {
          const link = l as FGLink
          if (hoverRef.current.links.has(link.id)) {
            return link.faint ? 'rgba(129,140,248,0.5)' : 'rgba(56,189,248,0.95)'
          }
          return link.faint
            ? 'rgba(129,140,248,0.18)'
            : link.strength === 'verified'
              ? 'rgba(56,189,248,0.65)'
              : 'rgba(129,140,248,0.4)'
        }}
        linkWidth={(l: object) => {
          const link = l as FGLink
          const boost = hoverRef.current.links.has(link.id) ? 1.6 : 1
          if (link.faint) return 0.5 * boost
          const c = link.closeness ?? 3
          return (0.6 + c * 0.45) * boost // closeness 1→1.05, 5→2.85
        }}
        linkLineDash={(l: object) => ((l as FGLink).faint || (l as FGLink).strength === 'pending' ? [3, 4] : null)}
        linkDirectionalParticles={(l: object) => {
          const link = l as FGLink
          // flowing light on living (verified) links; off in perf-heavy graphs
          if (!particlesOn || link.faint) return 0
          return link.strength === 'verified' ? 2 : 0
        }}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={1.7}
        linkDirectionalParticleColor={() => 'rgba(125,211,252,0.9)'}
        nodeCanvasObject={paintNode}
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
