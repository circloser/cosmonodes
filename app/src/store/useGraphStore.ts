import { create } from 'zustand'
import type { GraphData, Group, GroupKind, MatchRecord, NodePatch, NodeRecord, Profile } from '../domain/types'
import type { DataProvider } from '../data/DataProvider'
import { LocalStorageDataProvider } from '../data/LocalStorageDataProvider'
import { makePerfDataset } from '../data/seed'

const provider: DataProvider = new LocalStorageDataProvider()

interface GraphStore {
  provider: DataProvider
  profile: Profile | null
  graph: GraphData
  nodes: NodeRecord[]
  matches: MatchRecord[]
  groups: Group[]
  hiddenGroupIds: string[]
  searchQuery: string
  layoutMode: 'cosmos' | 'hierarchy'
  hierarchySort: 'tier' | 'age' | 'closeness'
  loading: boolean
  perfMode: boolean
  lastSupernovaAt: number

  load: () => Promise<void>
  refresh: () => Promise<void>
  setSearch: (q: string) => void
  setLayoutMode: (mode: 'cosmos' | 'hierarchy') => void
  setHierarchySort: (sort: 'tier' | 'age' | 'closeness') => void
  addStar: (label: string, note: string, groupId: string | null) => Promise<void>
  addStarsBulk: (labels: string[], groupId: string | null) => Promise<number>
  updateNode: (id: string, patch: NodePatch) => Promise<void>
  removeNode: (id: string) => Promise<void>
  connect: (fromNodeId: string, toNodeId: string) => Promise<void>
  disconnect: (edgeId: string) => Promise<void>
  invite: (nodeId: string) => Promise<MatchRecord>
  acceptInvite: (token: string) => Promise<void>
  requestIntro: (farNodeId: string) => Promise<void>
  saveProfile: (patch: Partial<Omit<Profile, 'userId'>>) => Promise<void>
  addGroup: (name: string, color: string, kind: GroupKind) => Promise<Group>
  updateGroup: (id: string, patch: Partial<Pick<Group, 'name' | 'color' | 'kind'>>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  toggleGroup: (id: string) => void
  togglePerfMode: () => void
}

const EMPTY: GraphData = { nodes: [], links: [] }

export const useGraphStore = create<GraphStore>((set, get) => ({
  provider,
  profile: null,
  graph: EMPTY,
  nodes: [],
  matches: [],
  groups: [],
  hiddenGroupIds: [],
  searchQuery: '',
  layoutMode: 'cosmos',
  hierarchySort: 'tier',
  loading: true,
  perfMode: false,
  lastSupernovaAt: 0,

  load: async () => {
    set({ loading: true })
    const [profile, graph, nodes, matches, groups] = await Promise.all([
      provider.getProfile(),
      provider.getGraph(),
      provider.listNodes(),
      provider.listMatches(),
      provider.listGroups(),
    ])
    set({ profile, graph, nodes, matches, groups, loading: false })
  },

  refresh: async () => {
    if (get().perfMode) return
    const [graph, nodes, matches, groups] = await Promise.all([
      provider.getGraph(),
      provider.listNodes(),
      provider.listMatches(),
      provider.listGroups(),
    ])
    set({ graph, nodes, matches, groups })
  },

  setSearch: (q) => set({ searchQuery: q }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setHierarchySort: (sort) => set({ hierarchySort: sort }),

  addStar: async (label, note, groupId) => {
    await provider.addNode({ label, note, groupId })
    set({ lastSupernovaAt: Date.now() })
    await get().refresh()
  },

  addStarsBulk: async (labels, groupId) => {
    const clean = labels.map((l) => l.trim()).filter(Boolean)
    for (const label of clean) {
      await provider.addNode({ label, note: '', groupId })
    }
    if (clean.length > 0) set({ lastSupernovaAt: Date.now() })
    await get().refresh()
    return clean.length
  },

  updateNode: async (id, patch) => {
    await provider.updateNode(id, patch)
    await get().refresh()
  },

  removeNode: async (id) => {
    await provider.deleteNode(id)
    await get().refresh()
  },

  connect: async (fromNodeId, toNodeId) => {
    await provider.addEdge(fromNodeId, toNodeId, 'verified')
    await get().refresh()
  },

  disconnect: async (edgeId) => {
    await provider.deleteEdge(edgeId)
    await get().refresh()
  },

  invite: async (nodeId) => {
    const match = await provider.createInvite(nodeId)
    await get().refresh()
    return match
  },

  acceptInvite: async (token) => {
    await provider.simulateAccept(token)
    set({ lastSupernovaAt: Date.now() })
    await get().refresh()
  },

  requestIntro: async (farNodeId) => {
    // farNodeId is prefixed `far_<realId>` in the graph projection
    const realId = farNodeId.startsWith('far_') ? farNodeId.slice(4) : farNodeId
    await provider.createIntroRequest(realId)
  },

  saveProfile: async (patch) => {
    const profile = await provider.saveProfile(patch)
    set({ profile })
    await get().refresh()
  },

  addGroup: async (name, color, kind) => {
    const group = await provider.addGroup(name, color, kind)
    set({ groups: [...get().groups, group] })
    return group
  },

  updateGroup: async (id, patch) => {
    await provider.updateGroup(id, patch)
    await get().refresh()
  },

  deleteGroup: async (id) => {
    await provider.deleteGroup(id)
    set({ hiddenGroupIds: get().hiddenGroupIds.filter((g) => g !== id) })
    await get().refresh()
  },

  toggleGroup: (id) => {
    const hidden = get().hiddenGroupIds
    set({ hiddenGroupIds: hidden.includes(id) ? hidden.filter((g) => g !== id) : [...hidden, id] })
  },

  togglePerfMode: () => {
    const next = !get().perfMode
    if (next) {
      const perfProvider = new LocalStorageDataProvider(makePerfDataset(300))
      Promise.all([perfProvider.getGraph(), perfProvider.listGroups()]).then(([graph, groups]) =>
        set({ perfMode: true, graph, groups, hiddenGroupIds: [] }),
      )
    } else {
      set({ perfMode: false, hiddenGroupIds: [] })
      get().refresh()
    }
  },
}))
