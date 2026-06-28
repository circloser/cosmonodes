import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { GraphData, GraphLink, GraphNode } from '../domain/types'
import { COLORS, nodeStyle } from '../lib/colors'
import { clusterForce } from '../lib/clusterForce'

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

/** Deterministic 0..1 hash of a string (stable per-link variation, no jitter). */
function hash01(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

/** Link rest length — short & varied; the radial force governs distance-from-center. */
function linkDistance(link: FGLink): number {
  if (link.faint) return 60 // 2-hop far stars sit just outside their matched parent
  return 36 + hash01(link.id) * 26 // 36-62, organic variation
}

/**
 * 5 closeness tiers → concentric distance rings from the center (자기 노드).
 * Closeness 5 = innermost (closest), 1 = outermost. Applies across all groups.
 */
type RadialNode = { degree: number; closeness?: number; x?: number; y?: number; vx?: number; vy?: number }
const RING_RADIUS: Record<number, number> = { 5: 70, 4: 120, 3: 175, 2: 235, 1: 300 }

function ringRadius(node: RadialNode): number {
  const c = Math.min(5, Math.max(1, Math.round(node.closeness ?? 3)))
  return RING_RADIUS[c]
}

/** Custom d3 force pulling each degree-1 star onto its closeness ring around self. */
function radialRingForce(strength: number) {
  let nodes: RadialNode[] = []
  function force(alpha: number) {
    const self = nodes.find((n) => n.degree === 0)
    const cx = self?.x ?? 0
    const cy = self?.y ?? 0
    for (const n of nodes) {
      if (n.degree !== 1 || n.x === undefined || n.y === undefined) continue
      const dx = n.x - cx
      const dy = n.y - cy
      const dist = Math.hypot(dx, dy) || 1e-6
      const k = ((ringRadius(n) - dist) / dist) * strength * alpha
      n.vx = (n.vx ?? 0) + dx * k
      n.vy = (n.vy ?? 0) + dy * k
    }
  }
  force.initialize = (n: RadialNode[]) => {
    nodes = n
  }
  return force
}

/** Vertical span of the hierarchy layout (graph units). */
const HIER_BAND = 440

type HierNode = { degree: number; tier?: number; age?: number | null; closeness?: number; y?: number; vy?: number }
type HierSort = 'tier' | 'age' | 'closeness'

/** Rank value used to order stars top→bottom in hierarchy view (higher = top). */
function rankValue(n: HierNode, sort: HierSort): number | null {
  if (sort === 'tier') return n.tier ?? 0
  if (sort === 'closeness') return n.closeness ?? 3
  return n.age == null ? null : n.age
}

/** Custom d3 force: pull each star to a vertical band position by its rank. */
function verticalForce(sort: HierSort, strength: number) {
  let nodes: HierNode[] = []
  function force(alpha: number) {
    let min = Infinity
    let max = -Infinity
    for (const n of nodes) {
      if (n.degree === 2) continue
      const r = rankValue(n, sort)
      if (r == null) continue
      if (r < min) min = r
      if (r > max) max = r
    }
    if (!Number.isFinite(min)) return
    const range = max - min || 1
    for (const n of nodes) {
      if (n.degree === 2 || n.y === undefined) continue
      const r = rankValue(n, sort)
      if (r == null) continue
      const norm = (r - min) / range // 0..1
      const targetY = (0.5 - norm) * HIER_BAND // high rank → top (negative y)
      n.vy = (n.vy ?? 0) + (targetY - n.y) * strength * alpha
    }
  }
  force.initialize = (n: HierNode[]) => {
    nodes = n
  }
  return force
}

const TIER_LABEL = (t: number): string =>
  t >= 2 ? '조부모' : t === 1 ? '부모' : t === 0 ? '나·동년배' : t === -1 ? '자녀' : '손주'

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

export default function GraphView({ graph, onSelect, highlightIds, attentionIds, layoutMode, hierarchySort }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<ForceGraphHandle | null>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  const sig = signature(graph)
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
      fg.d3Force('link')?.strength?.(0.05)
      fg.d3Force('charge')?.strength?.(-150)
      fg.d3Force('vertical', verticalForce(hierarchySort, 0.5))
    } else {
      // cosmos: closeness rings + gentle group affinity
      if (self) {
        self.fx = 0
        self.fy = 0
      }
      fg.d3Force('vertical', null)
      fg.d3Force('link')?.strength?.(0.12)
      fg.d3Force('charge')?.strength?.(-80)
      fg.d3Force('radial', radialRingForce(0.55))
      fg.d3Force('cluster', clusterForce(0.03))
    }

    fg.d3ReheatSimulation()
    const t = setTimeout(() => fg.zoomToFit(600, 80), 500)
    return () => clearTimeout(t)
  }, [sig, layoutMode, hierarchySort, data])

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
        cooldownTicks={220}
        warmupTicks={20}
        d3VelocityDecay={0.2}
        d3AlphaDecay={0.0145}
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
        onRenderFramePre={(ctx: CanvasRenderingContext2D, scale: number) => {
          ctx.save()
          ctx.strokeStyle = 'rgba(255,255,255,0.05)'
          ctx.lineWidth = 0.7 / scale
          if (layoutMode === 'cosmos') {
            // concentric guides for the 5 closeness tiers
            for (const r of Object.values(RING_RADIUS)) {
              ctx.beginPath()
              ctx.arc(0, 0, r, 0, Math.PI * 2)
              ctx.stroke()
            }
          } else {
            // horizontal level guides for the hierarchy
            const ranks = data.nodes
              .filter((n) => n.degree !== 2)
              .map((n) => rankValue(n, hierarchySort))
              .filter((r): r is number => r != null)
            if (ranks.length) {
              const min = Math.min(...ranks)
              const max = Math.max(...ranks)
              const range = max - min || 1
              const half = HIER_BAND / 2 + 30
              if (hierarchySort === 'tier') {
                for (let t = Math.floor(min); t <= Math.ceil(max); t++) {
                  const y = (0.5 - (t - min) / range) * HIER_BAND
                  ctx.beginPath()
                  ctx.moveTo(-half, y)
                  ctx.lineTo(half, y)
                  ctx.stroke()
                  ctx.fillStyle = 'rgba(196,199,200,0.45)'
                  ctx.font = `600 5px "Plus Jakarta Sans", sans-serif`
                  ctx.textAlign = 'left'
                  ctx.textBaseline = 'bottom'
                  ctx.fillText(TIER_LABEL(t), -half + 4, y - 2)
                }
              } else {
                for (let i = 0; i <= 4; i++) {
                  const y = (0.5 - i / 4) * HIER_BAND
                  ctx.beginPath()
                  ctx.moveTo(-half, y)
                  ctx.lineTo(half, y)
                  ctx.stroke()
                }
                ctx.fillStyle = 'rgba(196,199,200,0.45)'
                ctx.font = `600 5px "Plus Jakarta Sans", sans-serif`
                ctx.textAlign = 'left'
                ctx.textBaseline = 'bottom'
                ctx.fillText(hierarchySort === 'age' ? '많음 ↑' : '가까움 ↑', -half + 4, -HIER_BAND / 2 - 4)
                ctx.fillText(hierarchySort === 'age' ? '적음 ↓' : '덜함 ↓', -half + 4, HIER_BAND / 2 + 12)
              }
            }
          }
          ctx.restore()
        }}
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
