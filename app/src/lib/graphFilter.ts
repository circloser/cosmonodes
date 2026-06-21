import type { GraphData, GraphLink } from '../domain/types'

function endId(end: GraphLink['source']): string {
  return typeof end === 'string' ? end : (end as { id: string }).id
}

/**
 * Hide degree-1 nodes whose group is toggled off, plus any links and orphaned
 * degree-2 far stars that depend on them. Self (degree 0) is always kept.
 */
export function filterGraphByGroups(graph: GraphData, hiddenGroupIds: string[]): GraphData {
  if (hiddenGroupIds.length === 0) return graph
  const hidden = new Set(hiddenGroupIds)

  const keptNodes = graph.nodes.filter(
    (n) => !(n.degree === 1 && n.groupId != null && hidden.has(n.groupId)),
  )
  const keptIds = new Set(keptNodes.map((n) => n.id))

  const links = graph.links.filter((l) => keptIds.has(endId(l.source)) && keptIds.has(endId(l.target)))

  // drop degree-2 stars that lost their only connection
  const linked = new Set<string>()
  for (const l of links) {
    linked.add(endId(l.source))
    linked.add(endId(l.target))
  }
  const nodes = keptNodes.filter((n) => n.degree !== 2 || linked.has(n.id))

  return { nodes, links }
}
