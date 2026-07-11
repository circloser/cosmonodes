/* Custom d3-force helpers powering the two graph layouts (cosmos / hierarchy). */

export type HierSort = 'tier' | 'age' | 'closeness'

interface SimNode {
  degree: number
  groupId?: string | null
  closeness?: number
  tier?: number
  age?: number | null
  x?: number
  y?: number
  vx?: number
  vy?: number
}

/** Deterministic 0..1 hash of a string (stable per-link variation, no jitter). */
export function hash01(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

/** Link rest length — short & varied; the radial force governs distance-from-center. */
export function linkDistance(link: { id: string; faint: boolean }): number {
  if (link.faint) return 60 // 2-hop far stars sit just outside their matched parent
  return 36 + hash01(link.id) * 26 // 36-62, organic variation
}

/**
 * 5 closeness tiers → concentric distance rings from the center (자기 노드).
 * Closeness 5 = innermost (closest), 1 = outermost. Applies across all groups.
 */
export const RING_RADIUS: Record<number, number> = { 5: 70, 4: 120, 3: 175, 2: 235, 1: 300 }

function ringRadius(node: SimNode): number {
  const c = Math.min(5, Math.max(1, Math.round(node.closeness ?? 3)))
  return RING_RADIUS[c]
}

/** Custom d3 force pulling each degree-1 star onto its closeness ring around self. */
export function radialRingForce(strength: number) {
  let nodes: SimNode[] = []
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
  force.initialize = (n: SimNode[]) => {
    nodes = n
  }
  return force
}

/**
 * Gentle group affinity: nudge each star toward its group centroid so groups
 * cluster without segregating. Self (degree 0) is left alone.
 */
export function clusterForce(strength: number) {
  let nodes: SimNode[] = []
  function force(alpha: number) {
    const cx: Record<string, number> = {}
    const cy: Record<string, number> = {}
    const cn: Record<string, number> = {}
    for (const n of nodes) {
      if (n.degree === 0 || n.x === undefined || n.y === undefined) continue
      const key = n.groupId ?? '__none'
      cx[key] = (cx[key] ?? 0) + n.x
      cy[key] = (cy[key] ?? 0) + n.y
      cn[key] = (cn[key] ?? 0) + 1
    }
    for (const n of nodes) {
      if (n.degree === 0 || n.x === undefined || n.y === undefined) continue
      const key = n.groupId ?? '__none'
      if (!cn[key]) continue
      n.vx = (n.vx ?? 0) + (cx[key] / cn[key] - n.x) * strength * alpha
      n.vy = (n.vy ?? 0) + (cy[key] / cn[key] - n.y) * strength * alpha
    }
  }
  force.initialize = (n: SimNode[]) => {
    nodes = n
  }
  return force
}

/** Vertical span of the hierarchy layout (graph units). */
export const HIER_BAND = 440

/** Rank value used to order stars top→bottom in hierarchy view (higher = top). */
export function rankValue(n: SimNode, sort: HierSort): number | null {
  if (sort === 'tier') return n.tier ?? 0
  if (sort === 'closeness') return n.closeness ?? 3
  return n.age == null ? null : n.age
}

/** Custom d3 force: pull each star to a vertical band position by its rank. */
export function verticalForce(sort: HierSort, strength: number) {
  let nodes: SimNode[] = []
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
  force.initialize = (n: SimNode[]) => {
    nodes = n
  }
  return force
}
