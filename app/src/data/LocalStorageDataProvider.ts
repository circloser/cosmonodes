import type {
  Consent,
  EdgeRecord,
  GraphData,
  GraphLink,
  GraphNode,
  Group,
  IntroRequest,
  LinkStrength,
  MatchRecord,
  NodePatch,
  NodeRecord,
  Profile,
} from '../domain/types'
import type { AddNodeInput, DataProvider } from './DataProvider'
import { inviteToken, uid } from '../lib/id'
import { CONTACT_DEFAULTS, ME, SELF_NODE, makeMatchedUserNetwork, makeSeed, type Dataset } from './seed'

const STORAGE_KEY = 'cosmonodes:v1'

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

/**
 * Credential-free DataProvider backed by localStorage (falls back to in-memory).
 * Holds a multi-user dataset so that matching can reveal a matched contact's
 * 1st-degree network as faint 2-hop stars — without ever exposing their notes.
 */
export class LocalStorageDataProvider implements DataProvider {
  private data: Dataset

  constructor(initial?: Dataset) {
    this.data = initial ?? this.load()
  }

  private load(): Dataset {
    if (hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Dataset
          // migrate datasets persisted before groups / relationship fields existed
          if (!parsed.groups) parsed.groups = makeSeed().groups
          for (const n of parsed.nodes) {
            if (n.groupId === undefined) n.groupId = null
            if (n.closeness === undefined) n.closeness = 3
            if (n.tier === undefined) n.tier = 0
            if (n.age === undefined) n.age = null
            if (n.relation === undefined) n.relation = ''
            if (n.job === undefined) n.job = ''
            if (n.location === undefined) n.location = ''
            if (n.phone === undefined) n.phone = ''
            if (n.email === undefined) n.email = ''
            if (n.howWeMet === undefined) n.howWeMet = ''
            if (n.lastContactAt === undefined) n.lastContactAt = null
            if (n.nextReminderAt === undefined) n.nextReminderAt = null
            if (n.birthday === undefined) n.birthday = null
            if (n.interests === undefined) n.interests = ''
          }
          const p = parsed.profile as Partial<Profile>
          if (p.job === undefined) p.job = ''
          if (p.location === undefined) p.location = ''
          if (p.birthday === undefined) p.birthday = ''
          if (p.interests === undefined) p.interests = ''
          if (p.website === undefined) p.website = ''
          return parsed
        } catch {
          /* fall through to fresh seed */
        }
      }
    }
    const seed = makeSeed()
    this.persist(seed)
    return seed
  }

  private persist(data: Dataset = this.data): void {
    this.data = data
    if (hasLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }

  // ---- profile ----
  async getProfile(): Promise<Profile> {
    return { ...this.data.profile }
  }

  async saveProfile(patch: Partial<Omit<Profile, 'userId'>>): Promise<Profile> {
    this.data.profile = { ...this.data.profile, ...patch, userId: ME }
    this.persist()
    return { ...this.data.profile }
  }

  // ---- groups ----
  async listGroups(): Promise<Group[]> {
    return this.data.groups.map((g) => ({ ...g }))
  }

  async addGroup(name: string, color: string): Promise<Group> {
    const group: Group = { id: uid('group'), name: name.trim() || '새 그룹', color }
    this.data.groups.push(group)
    this.persist()
    return { ...group }
  }

  async updateGroup(id: string, patch: Partial<Pick<Group, 'name' | 'color'>>): Promise<Group> {
    const group = this.data.groups.find((g) => g.id === id)
    if (!group) throw new Error('group not found')
    if (patch.name !== undefined) group.name = patch.name.trim() || group.name
    if (patch.color !== undefined) group.color = patch.color
    this.persist()
    return { ...group }
  }

  async deleteGroup(id: string): Promise<void> {
    this.data.groups = this.data.groups.filter((g) => g.id !== id)
    // nodes that belonged to the group lose their grouping
    for (const n of this.data.nodes) {
      if (n.groupId === id) n.groupId = null
    }
    this.persist()
  }

  // ---- nodes ----
  async listNodes(): Promise<NodeRecord[]> {
    return this.data.nodes.filter((n) => n.ownerId === ME).map((n) => ({ ...n }))
  }

  async addNode(input: AddNodeInput): Promise<NodeRecord> {
    const node: NodeRecord = {
      id: uid('node'),
      ownerId: ME,
      label: input.label.trim() || '이름 없는 별',
      note: input.note.trim(),
      groupId: input.groupId ?? null,
      closeness: 3,
      tier: 0,
      age: null,
      ...CONTACT_DEFAULTS,
      lastContactAt: null,
      nextReminderAt: null,
      birthday: null,
      interests: '',
      matchedUserId: null,
      createdAt: Date.now(),
    }
    this.data.nodes.push(node)
    this.data.edges.push({
      id: uid('edge'),
      ownerId: ME,
      fromNodeId: SELF_NODE,
      toNodeId: node.id,
      strength: 'pending',
    })
    this.persist()
    return { ...node }
  }

  async updateNode(id: string, patch: NodePatch): Promise<NodeRecord> {
    const node = this.data.nodes.find((n) => n.id === id && n.ownerId === ME)
    if (!node) throw new Error('node not found')
    if (patch.label !== undefined) node.label = patch.label
    if (patch.note !== undefined) node.note = patch.note
    if (patch.groupId !== undefined) node.groupId = patch.groupId
    if (patch.closeness !== undefined) node.closeness = patch.closeness
    if (patch.tier !== undefined) node.tier = patch.tier
    if (patch.age !== undefined) node.age = patch.age
    if (patch.relation !== undefined) node.relation = patch.relation
    if (patch.job !== undefined) node.job = patch.job
    if (patch.location !== undefined) node.location = patch.location
    if (patch.phone !== undefined) node.phone = patch.phone
    if (patch.email !== undefined) node.email = patch.email
    if (patch.howWeMet !== undefined) node.howWeMet = patch.howWeMet
    if (patch.lastContactAt !== undefined) node.lastContactAt = patch.lastContactAt
    if (patch.nextReminderAt !== undefined) node.nextReminderAt = patch.nextReminderAt
    if (patch.birthday !== undefined) node.birthday = patch.birthday
    if (patch.interests !== undefined) node.interests = patch.interests
    this.persist()
    return { ...node }
  }

  async deleteNode(id: string): Promise<void> {
    this.data.nodes = this.data.nodes.filter((n) => !(n.id === id && n.ownerId === ME))
    this.data.edges = this.data.edges.filter(
      (e) => e.ownerId !== ME || (e.fromNodeId !== id && e.toNodeId !== id),
    )
    this.persist()
  }

  // ---- edges ----
  async listEdges(): Promise<EdgeRecord[]> {
    return this.data.edges.filter((e) => e.ownerId === ME).map((e) => ({ ...e }))
  }

  async addEdge(fromNodeId: string, toNodeId: string, strength: LinkStrength): Promise<EdgeRecord> {
    const edge: EdgeRecord = { id: uid('edge'), ownerId: ME, fromNodeId, toNodeId, strength }
    this.data.edges.push(edge)
    this.persist()
    return { ...edge }
  }

  async updateEdge(id: string, patch: Partial<Pick<EdgeRecord, 'strength'>>): Promise<EdgeRecord> {
    const edge = this.data.edges.find((e) => e.id === id && e.ownerId === ME)
    if (!edge) throw new Error('edge not found')
    if (patch.strength !== undefined) edge.strength = patch.strength
    this.persist()
    return { ...edge }
  }

  async deleteEdge(id: string): Promise<void> {
    this.data.edges = this.data.edges.filter((e) => !(e.id === id && e.ownerId === ME))
    this.persist()
  }

  // ---- consent ----
  async hasConsent(type: Consent['type']): Promise<boolean> {
    return this.data.consents.some((c) => c.userId === ME && c.type === type)
  }

  async recordConsent(type: Consent['type']): Promise<void> {
    if (!(await this.hasConsent(type))) {
      this.data.consents.push({ id: uid('consent'), userId: ME, type, acceptedAt: Date.now() })
      this.persist()
    }
  }

  // ---- matching ----
  async createInvite(nodeId: string): Promise<MatchRecord> {
    const node = this.data.nodes.find((n) => n.id === nodeId && n.ownerId === ME)
    if (!node) throw new Error('node not found')
    const match: MatchRecord = {
      id: uid('match'),
      inviterUserId: ME,
      inviterNodeId: nodeId,
      inviteeUserId: null,
      inviteToken: inviteToken(),
      status: 'invited',
      createdAt: Date.now(),
      acceptedAt: null,
    }
    this.data.matches.push(match)
    this.persist()
    return { ...match }
  }

  async simulateAccept(token: string): Promise<MatchRecord> {
    const match = this.data.matches.find((m) => m.inviteToken === token)
    if (!match) throw new Error('invite not found')
    if (match.status === 'accepted') return { ...match }

    // The invited person "signs up": create a mock user that owns a small network.
    const otherUserId = uid('user')
    const network = makeMatchedUserNetwork(otherUserId, 4 + Math.floor(Math.random() * 3))
    this.data.nodes.push(...network.nodes)
    this.data.edges.push(...network.edges)

    match.inviteeUserId = otherUserId
    match.status = 'accepted'
    match.acceptedAt = Date.now()

    // Link my node to the now-real matched user, and promote the edge to verified.
    const node = this.data.nodes.find((n) => n.id === match.inviterNodeId)
    if (node) node.matchedUserId = otherUserId
    const edge = this.data.edges.find(
      (e) => e.ownerId === ME && (e.toNodeId === match.inviterNodeId || e.fromNodeId === match.inviterNodeId),
    )
    if (edge) edge.strength = 'verified'

    this.persist()
    return { ...match }
  }

  async listMatches(): Promise<MatchRecord[]> {
    return this.data.matches.map((m) => ({ ...m }))
  }

  // ---- intro requests ----
  async createIntroRequest(targetNodeId: string): Promise<IntroRequest> {
    const req: IntroRequest = {
      id: uid('intro'),
      fromUserId: ME,
      targetNodeId,
      status: 'sent',
      createdAt: Date.now(),
    }
    this.data.intros.push(req)
    this.persist()
    return { ...req }
  }

  async listIntroRequests(): Promise<IntroRequest[]> {
    return this.data.intros.map((r) => ({ ...r }))
  }

  // ---- graph projection (privacy-enforcing) ----
  async getGraph(): Promise<GraphData> {
    const myNodes = this.data.nodes.filter((n) => n.ownerId === ME)
    const myEdges = this.data.edges.filter((e) => e.ownerId === ME)

    const groupColor = new Map(this.data.groups.map((g) => [g.id, g.color]))

    const nodes: GraphNode[] = [
      { id: SELF_NODE, label: this.data.profile.displayName, degree: 0, matched: true },
    ]
    for (const n of myNodes) {
      // degree-1: my own contact — note is allowed (owner only).
      nodes.push({
        id: n.id,
        label: n.label,
        degree: 1,
        matched: n.matchedUserId !== null,
        groupId: n.groupId,
        color: n.groupId ? groupColor.get(n.groupId) : undefined,
        closeness: n.closeness,
        tier: n.tier,
        age: n.age,
        note: n.note,
      })
    }

    const closenessById = new Map(myNodes.map((n) => [n.id, n.closeness]))
    const links: GraphLink[] = myEdges.map((e) => {
      const contactId = e.fromNodeId === SELF_NODE ? e.toNodeId : e.fromNodeId
      return {
        id: e.id,
        source: e.fromNodeId,
        target: e.toNodeId,
        strength: e.strength,
        faint: false,
        closeness: closenessById.get(contactId),
      }
    })

    // degree-2: matched contacts' 1st-degree networks, LABEL ONLY (no note).
    const seenFar = new Set<string>()
    for (const n of myNodes) {
      if (!n.matchedUserId) continue
      const theirNodes = this.data.nodes.filter((x) => x.ownerId === n.matchedUserId)
      for (const far of theirNodes) {
        const farId = `far_${far.id}`
        if (!seenFar.has(farId)) {
          seenFar.add(farId)
          // NOTE INVARIANT (AC17): never copy `far.note` into the graph node.
          nodes.push({ id: farId, label: far.label, degree: 2, matched: false })
        }
        links.push({
          id: `farlink_${n.id}_${far.id}`,
          source: n.id,
          target: farId,
          strength: 'pending',
          faint: true,
        })
      }
    }

    return { nodes, links }
  }

  async reset(): Promise<void> {
    this.persist(makeSeed())
  }
}
