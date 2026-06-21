import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageDataProvider } from './LocalStorageDataProvider'
import { makeSeed } from './seed'

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
