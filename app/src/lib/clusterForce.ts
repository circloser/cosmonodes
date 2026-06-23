interface ClusterNode {
  groupId?: string | null
  degree: number
  x?: number
  y?: number
  vx?: number
  vy?: number
}

/**
 * A small d3-style force that nudges each node toward the centroid of its group,
 * so groups visually cluster ("그룹 = 클러스터"). Self (degree 0) is left alone.
 */
export function clusterForce(strength: number) {
  let nodes: ClusterNode[] = []

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
      const tx = cx[key] / cn[key]
      const ty = cy[key] / cn[key]
      n.vx = (n.vx ?? 0) + (tx - n.x) * strength * alpha
      n.vy = (n.vy ?? 0) + (ty - n.y) * strength * alpha
    }
  }

  force.initialize = (n: ClusterNode[]) => {
    nodes = n
  }

  return force
}
