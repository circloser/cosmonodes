import { create } from 'zustand'
import type { GraphData, MatchRecord, NodeRecord, Profile } from '../domain/types'
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
  loading: boolean
  perfMode: boolean
  lastSupernovaAt: number

  load: () => Promise<void>
  refresh: () => Promise<void>
  addStar: (label: string, note: string) => Promise<void>
  editNode: (id: string, label: string, note: string) => Promise<void>
  removeNode: (id: string) => Promise<void>
  connect: (fromNodeId: string, toNodeId: string) => Promise<void>
  invite: (nodeId: string) => Promise<MatchRecord>
  acceptInvite: (token: string) => Promise<void>
  requestIntro: (farNodeId: string) => Promise<void>
  saveProfile: (patch: Partial<Omit<Profile, 'userId'>>) => Promise<void>
  togglePerfMode: () => void
}

const EMPTY: GraphData = { nodes: [], links: [] }

export const useGraphStore = create<GraphStore>((set, get) => ({
  provider,
  profile: null,
  graph: EMPTY,
  nodes: [],
  matches: [],
  loading: true,
  perfMode: false,
  lastSupernovaAt: 0,

  load: async () => {
    set({ loading: true })
    const [profile, graph, nodes, matches] = await Promise.all([
      provider.getProfile(),
      provider.getGraph(),
      provider.listNodes(),
      provider.listMatches(),
    ])
    set({ profile, graph, nodes, matches, loading: false })
  },

  refresh: async () => {
    if (get().perfMode) return
    const [graph, nodes, matches] = await Promise.all([
      provider.getGraph(),
      provider.listNodes(),
      provider.listMatches(),
    ])
    set({ graph, nodes, matches })
  },

  addStar: async (label, note) => {
    await provider.addNode({ label, note })
    set({ lastSupernovaAt: Date.now() })
    await get().refresh()
  },

  editNode: async (id, label, note) => {
    await provider.updateNode(id, { label, note })
    await get().refresh()
  },

  removeNode: async (id) => {
    await provider.deleteNode(id)
    await get().refresh()
  },

  connect: async (fromNodeId, toNodeId) => {
    await provider.addEdge(fromNodeId, toNodeId, 'pending')
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

  togglePerfMode: () => {
    const next = !get().perfMode
    if (next) {
      const ds = makePerfDataset(300)
      const perfProvider = new LocalStorageDataProvider(ds)
      perfProvider.getGraph().then((graph) => set({ perfMode: true, graph }))
    } else {
      set({ perfMode: false })
      get().refresh()
    }
  },
}))
