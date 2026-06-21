import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageDataProvider } from './LocalStorageDataProvider'
import { makeSeed } from './seed'
import { filterGraphByGroups } from '../lib/graphFilter'

function freshProvider(): LocalStorageDataProvider {
  // isolated in-memory dataset (no shared localStorage between tests)
  return new LocalStorageDataProvider(makeSeed())
}

describe('LocalStorageDataProvider — privacy invariant (AC17)', () => {
  let provider: LocalStorageDataProvider

  beforeEach(() => {
    provider = freshProvider()
  })

  it('self node is centered at degree 0', async () => {
    const graph = await provider.getGraph()
    const self = graph.nodes.find((n) => n.degree === 0)
    expect(self).toBeDefined()
  })

  it('degree-1 (my own) nodes may include note', async () => {
    const graph = await provider.getGraph()
    const mine = graph.nodes.filter((n) => n.degree === 1)
    expect(mine.length).toBeGreaterThan(0)
    expect(mine.some((n) => typeof n.note === 'string')).toBe(true)
  })

  it('after matching, the matched user network appears as faint degree-2 stars WITHOUT note', async () => {
    const nodes = await provider.listNodes()
    const target = nodes[0]
    const match = await provider.createInvite(target.id)
    await provider.simulateAccept(match.inviteToken)

    const graph = await provider.getGraph()
    const farStars = graph.nodes.filter((n) => n.degree === 2)

    expect(farStars.length).toBeGreaterThan(0)
    // The core invariant: NO degree-2 node may carry a note field.
    for (const far of farStars) {
      expect(far.note).toBeUndefined()
    }
    // And there must be at least one faint link reaching them.
    expect(graph.links.some((l) => l.faint)).toBe(true)
  })

  it('no other user\'s note is ever present anywhere in the graph projection', async () => {
    const nodes = await provider.listNodes()
    const match = await provider.createInvite(nodes[1].id)
    await provider.simulateAccept(match.inviteToken)

    const graph = await provider.getGraph()
    // serialize the whole projection and assert the private marker never leaks
    const serialized = JSON.stringify(graph)
    expect(serialized).not.toContain('비공개 — 타인의 우주')
  })

  it('consent gate: note save is allowed only after consent recorded', async () => {
    expect(await provider.hasConsent('third_party_info')).toBe(false)
    await provider.recordConsent('third_party_info')
    expect(await provider.hasConsent('third_party_info')).toBe(true)
  })
})

describe('groups', () => {
  let provider: LocalStorageDataProvider

  beforeEach(() => {
    provider = freshProvider()
  })

  it('seed ships with default groups and colors them on degree-1 nodes', async () => {
    const groups = await provider.listGroups()
    expect(groups.length).toBeGreaterThan(0)
    const graph = await provider.getGraph()
    const colored = graph.nodes.filter((n) => n.degree === 1 && typeof n.color === 'string')
    expect(colored.length).toBeGreaterThan(0)
  })

  it('a new node inherits its group color in the graph projection', async () => {
    const g = await provider.addGroup('동호회', '#34D399')
    await provider.addNode({ label: '러닝메이트', note: '', groupId: g.id })
    const graph = await provider.getGraph()
    const node = graph.nodes.find((n) => n.label === '러닝메이트')
    expect(node?.groupId).toBe(g.id)
    expect(node?.color).toBe('#34D399')
  })

  it('filterGraphByGroups hides nodes of toggled-off groups (self always kept)', async () => {
    const groups = await provider.listGroups()
    const graph = await provider.getGraph()
    const targetGroup = groups[0]
    const before = graph.nodes.filter((n) => n.degree === 1 && n.groupId === targetGroup.id).length
    expect(before).toBeGreaterThan(0)

    const filtered = filterGraphByGroups(graph, [targetGroup.id])
    const after = filtered.nodes.filter((n) => n.degree === 1 && n.groupId === targetGroup.id).length
    expect(after).toBe(0)
    // self node (degree 0) is never removed
    expect(filtered.nodes.some((n) => n.degree === 0)).toBe(true)
  })
})
